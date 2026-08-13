// Supabase Edge Function (Deno) — plan de préparation par étapes via l'API Claude.
// Déployer avec : supabase functions deploy ai-recommendations
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const usageLabels: Record<string, string> = {
  daily: "usage quotidien (route)",
  piste: "piste / circuit",
  drift: "drift",
  show: "show / esthétique (peu roulant)",
  rallye: "rallye",
};

const reliabilityLabels: Record<string, string> = {
  fiabilite: "priorité à la fiabilité, éviter les modifications risquées",
  equilibre: "équilibre entre performance et fiabilité",
  performance_max: "performance maximale acceptée, fiabilité secondaire",
};

interface RequestBody {
  vehicleId: string;
  objective: string;
  budget: number;
  usage: string;
  reliability: string;
}

interface Recommendation {
  title: string;
  category: "esthetique" | "performance" | "confort";
  estimated_price: number;
  difficulty: "facile" | "moyen" | "difficile";
  explanation: string;
  expected_gain: string;
  reliability_risk: string;
}

interface Stage {
  title: string;
  recommendations: Recommendation[];
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

    const { vehicleId, objective, budget, usage, reliability } = (await req.json()) as RequestBody;
    if (!vehicleId || !objective) {
      return new Response(JSON.stringify({ error: "vehicleId et objective sont requis." }), {
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
      // NB : "claude-opus-5" est utilisé par défaut. Pour réduire les coûts sur ce
      // cas d'usage (recommandations courtes, non critiques), "claude-sonnet-5" ou
      // "claude-haiku-4-5" sont des alternatives raisonnables.
      model: "claude-opus-5",
      max_tokens: 4096,
      system:
        "Tu es un expert en préparation automobile et moto qui conseille des passionnés en France. " +
        "Tu réponds UNIQUEMENT avec un objet JSON valide respectant le schéma fourni, sans texte autour. " +
        "Les explications doivent être simples, concrètes et adaptées à un non-expert. " +
        "Principe important : si l'objectif concerne un temps au tour, une tenue de route ou un usage piste, " +
        "priorise toujours pneus, freinage et châssis AVANT la puissance moteur — le meilleur gain par euro " +
        "dépend rarement de la puissance seule. Structure toujours la réponse en étapes progressives " +
        "(Stage 1, Stage 2, ...), chaque étape regroupant des modifications cohérentes entre elles " +
        "(ex. Stage 1 = admission/échappement/reprog, Stage 2 = freinage/suspension, Stage 3 = internes moteur). " +
        "Pour chaque modification, indique un gain attendu concret et un niveau de risque pour la fiabilité, " +
        "en tenant compte de la préférence de fiabilité exprimée par l'utilisateur.",
      messages: [
        {
          role: "user",
          content:
            `Véhicule : ${vehicle.type_vehicule === "moto" ? "moto" : "voiture"} ` +
            `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}` +
            `${vehicle.horsepower ? `, ${vehicle.horsepower} ch actuellement` : ""}.\n` +
            `Objectif du propriétaire : ${objective}.\n` +
            `Budget total approximatif : ${budget ? `${budget} €` : "non précisé"}.\n` +
            `Usage prévu : ${usageLabels[usage] ?? usage}.\n` +
            `Préférence fiabilité : ${reliabilityLabels[reliability] ?? reliability}.\n\n` +
            "Propose un plan de préparation en 2 à 4 étapes (stages) progressives et réalistes pour ce " +
            "budget. Pour chaque modification au sein d'une étape, précise : un titre court, une catégorie " +
            "(esthetique | performance | confort), un prix estimé en euros, une difficulté d'installation " +
            "(facile | moyen | difficile), une explication simple de l'intérêt, un gain attendu concret " +
            "(ex. '+25 ch', 'meilleure adhérence en virage', 'distance de freinage réduite'), et un niveau " +
            "de risque pour la fiabilité en une courte phrase (ex. 'faible', 'modéré si mal réglé', 'élevé sans renfort interne').",
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              stages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    recommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          category: {
                            type: "string",
                            enum: ["esthetique", "performance", "confort"],
                          },
                          estimated_price: { type: "number" },
                          difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] },
                          explanation: { type: "string" },
                          expected_gain: { type: "string" },
                          reliability_risk: { type: "string" },
                        },
                        required: [
                          "title",
                          "category",
                          "estimated_price",
                          "difficulty",
                          "explanation",
                          "expected_gain",
                          "reliability_risk",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["title", "recommendations"],
                  additionalProperties: false,
                },
              },
            },
            required: ["stages"],
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
    const parsed = textBlock && "text" in textBlock ? JSON.parse(textBlock.text) : { stages: [] };
    const stages: Stage[] = parsed.stages ?? [];

    return new Response(JSON.stringify({ stages }), {
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
