// Supabase Edge Function (Deno) — recommandations de modifications via l'API Claude.
// Déployer avec : supabase functions deploy ai-recommendations
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  vehicleId: string;
  objective: string;
  budget: number;
}

interface Recommendation {
  title: string;
  category: "esthetique" | "mecanique" | "performance" | "confort";
  estimated_price: number;
  difficulty: "facile" | "moyen" | "difficile";
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

    const { vehicleId, objective, budget } = (await req.json()) as RequestBody;
    if (!vehicleId || !objective) {
      return new Response(JSON.stringify({ error: "vehicleId et objective sont requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, owner_id, type_vehicule, brand, model, year")
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
      // NB : "claude-opus-5" est utilisé par défaut. Pour réduire les coûts sur ce
      // cas d'usage (recommandations courtes, non critiques), "claude-sonnet-5" ou
      // "claude-haiku-4-5" sont des alternatives raisonnables.
      model: "claude-opus-5",
      max_tokens: 2048,
      system:
        "Tu es un expert en préparation automobile et moto qui conseille des débutants en France. " +
        "Tu réponds UNIQUEMENT avec un objet JSON valide respectant le schéma fourni, sans texte autour. " +
        "Les explications doivent être simples, concrètes et adaptées à un non-expert.",
      messages: [
        {
          role: "user",
          content:
            `Véhicule : ${vehicle.type_vehicule === "moto" ? "moto" : "voiture"} ` +
            `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}.\n` +
            `Objectif du propriétaire : ${objective}.\n` +
            `Budget approximatif : ${budget ? `${budget} €` : "non précisé"}.\n\n` +
            "Propose 3 à 5 pistes de modifications adaptées, réalistes pour ce budget, " +
            "avec pour chacune : un titre court, une catégorie (esthetique | mecanique | performance | confort), " +
            "un prix estimé en euros, une difficulté (facile | moyen | difficile), " +
            "et une explication simple de l'intérêt de cette modification.",
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["esthetique", "mecanique", "performance", "confort"],
                    },
                    estimated_price: { type: "number" },
                    difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] },
                    explanation: { type: "string" },
                  },
                  required: ["title", "category", "estimated_price", "difficulty", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
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
    const parsed = textBlock && "text" in textBlock ? JSON.parse(textBlock.text) : { recommendations: [] };
    const recommendations: Recommendation[] = parsed.recommendations ?? [];

    return new Response(JSON.stringify({ recommendations }), {
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
