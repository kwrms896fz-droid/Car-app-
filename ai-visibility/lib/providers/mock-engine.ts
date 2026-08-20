import type { AiAnswer, ProviderId } from "@/lib/types";
import { getSector } from "@/lib/audit/sectors";
import type { AskContext } from "./types";

/**
 * Moteur de données factices.
 *
 * Objectif : produire des réponses crédibles et STABLES — le même site audité
 * deux fois donne le même rapport, sinon la démo paraît cassée. On dérive donc
 * tout d'un hash du domaine, du fournisseur et de l'index de la question.
 *
 * Ce fichier disparaîtra le jour où les trois fournisseurs appelleront de
 * vraies API ; il n'est référencé que depuis lib/providers/*.ts.
 */

/** Hash déterministe (FNV-1a 32 bits) → entier positif. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Pseudo-aléatoire déterministe dans [0, 1[. */
function seeded(seed: string): number {
  return hash(seed) / 0x100000000;
}

/**
 * Probabilité qu'une IA cite l'entreprise. Volontairement basse et différente
 * d'une IA à l'autre : Perplexity s'appuie beaucoup sur le web et cite plus
 * facilement les sites locaux, ChatGPT reste plus généraliste.
 */
const CITATION_RATE: Record<ProviderId, number> = {
  chatgpt: 0.28,
  perplexity: 0.52,
  gemini: 0.36,
};

/** Latence simulée, pour que l'écran de scan ne soit pas instantané. */
const LATENCY_MS: Record<ProviderId, number> = {
  chatgpt: 320,
  perplexity: 420,
  gemini: 260,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function competitorsFor(context: AskContext, seed: string): string[] {
  const sector = getSector(context.input.sector);
  const city = context.input.city.trim() || "votre ville";
  const pool = sector.sampleCompetitors.map((name) => name.replaceAll("{city}", city));
  const offset = hash(seed) % pool.length;
  const count = 2 + (hash(`${seed}:count`) % 2);
  return Array.from({ length: count }, (_, i) => pool[(offset + i) % pool.length]!);
}

/**
 * Fabrique une réponse simulée pour un fournisseur donné.
 * La signature est identique à `AiProvider.ask`, ce qui permet de basculer
 * mock ↔ réel sans rien changer en amont.
 */
export async function mockAsk(
  providerId: ProviderId,
  question: string,
  context: AskContext,
): Promise<AiAnswer> {
  await delay(LATENCY_MS[providerId]);

  const seed = `${providerId}|${context.brand.domain}|${context.input.sector}|${context.input.city}|${question}`;
  const cited = seeded(seed) < CITATION_RATE[providerId];
  const competitors = competitorsFor(context, seed);
  const city = context.input.city.trim() || "votre ville";

  // L'entreprise, quand elle est citée, apparaît rarement en première place.
  const insertAt = cited ? (hash(`${seed}:rank`) % (competitors.length + 1) === 0 ? 0 : 1) : -1;
  const named = [...competitors];
  if (cited) named.splice(insertAt, 0, context.brand.name);

  const listing = named
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");

  const text = [
    `Voici quelques options à ${city} :`,
    "",
    listing,
    "",
    cited
      ? `${context.brand.name} revient régulièrement dans les avis locaux pour ce type de demande.`
      : `Ces établissements sont ceux qui ressortent le plus souvent dans les avis et annuaires locaux.`,
  ].join("\n");

  const sources: AiAnswer["sources"] = named.slice(0, 3).map((name) => ({
    title: name,
    url:
      name === context.brand.name
        ? context.brand.url
        : `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`,
  }));

  // Une citation sans lien vers le site est un cas fréquent et instructif :
  // l'IA connaît le nom mais n'envoie aucun trafic.
  if (cited && seeded(`${seed}:link`) < 0.45) {
    const own = sources.findIndex((s) => s.url === context.brand.url);
    if (own >= 0) sources.splice(own, 1);
  }

  return { text, sources, live: false };
}
