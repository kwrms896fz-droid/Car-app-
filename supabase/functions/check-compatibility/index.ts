// Supabase Edge Function (Deno) — avis IA de compatibilité de pièces / question libre.
// Déployer avec : supabase functions deploy check-compatibility
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// IMPORTANT : ceci n'est PAS une vérification contre une base de données technique
// réelle (specs constructeur, retours d'expérience vérifiés). C'est un avis généré
// par IA, à prendre comme point de départ — jamais comme un verdict garanti. Le
// disclaimer est renvoyé dans chaque réponse et doit rester visible côté client.

import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  vehicleId: string;
  engine?: string;
  question: string;
}

interface Verdict {
  part: string;
  status: "compatible" | "attention" | "incompatible" | "manquant";
  explanation: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Non authentifié." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { vehicleId, engine, question } = (await req.json()) as RequestBody;
    if (!vehicleId || !question) {
      return new Response(JSON.stringify({ error: "vehicleId et question sont requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, owner_id, type_vehicule, brand, model, year, horsepower")
      .eq("id", vehicleId)
      .eq("owner_id", userData.user.id)
      .single();

    if (vehicleError || !vehicle) {
      return new Response(JSON.stringify({ error: "Véhicule introuvable." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 3072,
      system:
        "Tu es un assistant de préparation automobile/moto qui aide des passionnés en France. " +
        "Tu réponds UNIQUEMENT avec un objet JSON valide respectant le schéma fourni, sans texte autour. " +
        "RÈGLE ABSOLUE : tu n'as PAS accès à une base de données technique vérifiée (fiches constructeur " +
        "exactes, retours d'expérience réels). Tes réponses sont des estimations générales basées sur des " +
        "principes mécaniques connus, PAS des vérifications garanties. Ne prétends jamais avoir une certitude " +
        "absolue sur une compatibilité précise pièce-à-pièce — reste prudent, nuance, et invite systématiquement " +
        "à vérifier auprès d'un professionnel, d'un préparateur spécialisé ou d'un forum dédié avant tout achat " +
        "ou montage. Si la question est ambiguë ou manque d'informations essentielles, dis-le clairement.",
      messages: [
        {
          role: "user",
          content:
            `Véhicule : ${vehicle.type_vehicule === "moto" ? "moto" : "voiture"} ` +
            `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}` +
            `${vehicle.horsepower ? `, ${vehicle.horsepower} ch actuellement` : ""}` +
            `${engine ? `. Moteur précisé par l'utilisateur : ${engine}` : ""}.\n\n` +
            `Question / pièces à analyser : ${question}\n\n` +
            "Si la question mentionne des pièces précises à combiner, identifie chaque pièce et donne un " +
            "statut (compatible | attention | incompatible | manquant) avec une explication courte pour " +
            "chacune. Fournis aussi un résumé général en 2-4 phrases répondant à la question dans son " +
            "ensemble, avec un rappel explicite qu'il s'agit d'un avis général à vérifier.",
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              verdicts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    part: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["compatible", "attention", "incompatible", "manquant"],
                    },
                    explanation: { type: "string" },
                  },
                  required: ["part", "status", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["summary", "verdicts"],
            additionalProperties: false,
          },
        },
      },
    });

    if (message.stop_reason === "refusal") {
      return new Response(
        JSON.stringify({ error: "La demande n'a pas pu être traitée par l'IA." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const textBlock = message.content.find((b) => b.type === "text");
    const parsed =
      textBlock && "text" in textBlock ? JSON.parse(textBlock.text) : { summary: "", verdicts: [] };
    const summary: string = parsed.summary ?? "";
    const verdicts: Verdict[] = parsed.verdicts ?? [];

    return new Response(JSON.stringify({ summary, verdicts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erreur interne." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
