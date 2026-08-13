// Supabase Edge Function (Deno) — génère un aperçu photoréaliste du véhicule
// avec les modifications décrites, via l'API Replicate.
// Déployer avec : supabase functions deploy visualize-mods
// Secrets requis :
//   supabase secrets set REPLICATE_API_TOKEN=r8_...
//   supabase secrets set REPLICATE_MODEL_VERSION=<version-id d'un modèle img2img, ex. SDXL>
// (Replicate est un choix parmi d'autres — n'importe quel fournisseur d'image-to-image
// peut être branché ici tant qu'il expose un endpoint de prédiction synchrone/pollable.)

import { createClient } from "npm:@supabase/supabase-js@2";

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
const REPLICATE_MODEL_VERSION = Deno.env.get("REPLICATE_MODEL_VERSION");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  vehicleId: string;
  modifications: string;
}

const STYLE_DIRECTIVE =
  "professional automotive photography, photorealistic, premium high-end customization garage " +
  "inspired by a modern Los Santos Customs-style workshop but realistic, dramatic studio lighting, " +
  "car lift in the background, polished concrete floor, clean high-end tools, showroom spotlight " +
  "highlighting the car, dark premium ambiance, sharp focus, ultra detailed, 8k";

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

    const { vehicleId, modifications } = (await req.json()) as RequestBody;
    if (!vehicleId || !modifications) {
      return new Response(JSON.stringify({ error: "vehicleId et modifications sont requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, owner_id, brand, model, year, cover_photo_url")
      .eq("id", vehicleId)
      .eq("owner_id", userData.user.id)
      .single();

    if (vehicleError || !vehicle) {
      return new Response(JSON.stringify({ error: "Véhicule introuvable." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!REPLICATE_API_TOKEN || !REPLICATE_MODEL_VERSION) {
      return new Response(
        JSON.stringify({
          error:
            "Génération d'image non configurée côté serveur (REPLICATE_API_TOKEN / REPLICATE_MODEL_VERSION manquants).",
        }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt =
      `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}, ` +
      `with the following modifications applied: ${modifications}. ${STYLE_DIRECTIVE}`;

    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL_VERSION,
        input: {
          prompt,
          image: vehicle.cover_photo_url || undefined,
          negative_prompt: "cartoon, drawing, low quality, blurry, distorted proportions, watermark, text",
        },
      }),
    });

    if (!createRes.ok) {
      const detail = await createRes.text();
      console.error("Replicate create error:", detail);
      return new Response(JSON.stringify({ error: "Échec du lancement de la génération d'image." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let prediction = await createRes.json();
    const pollUrl = prediction.urls?.get as string;

    for (let attempt = 0; attempt < 40; attempt++) {
      if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
        break;
      }
      await new Promise((r) => setTimeout(r, 1500));
      const pollRes = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      });
      prediction = await pollRes.json();
    }

    if (prediction.status !== "succeeded") {
      console.error("Replicate prediction did not succeed:", prediction);
      return new Response(JSON.stringify({ error: "La génération d'image a échoué." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const output = prediction.output;
    const imageUrl = Array.isArray(output) ? output[output.length - 1] : output;

    return new Response(JSON.stringify({ imageUrl }), {
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
