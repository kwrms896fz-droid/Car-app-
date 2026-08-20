import type { AiAnswer, Brand, Probe, ProviderId } from "@/lib/types";
import { PROVIDER_WEIGHTS } from "@/lib/providers";

/** Normalise un texte pour comparer sans accents ni casse. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Les mots trop courts ou trop génériques ne prouvent pas une citation. */
const STOPWORDS = new Set(["le", "la", "les", "de", "du", "des", "et", "chez", "sarl", "sas"]);

function brandTokens(brand: Brand): string[] {
  return normalize(brand.name)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

/**
 * Détecte si l'entreprise est citée dans une réponse, et à quel rang.
 *
 * On considère la marque citée si son nom complet apparaît, ou si tous ses
 * mots significatifs apparaissent (« Garage Dupont » ↔ « le garage Dupont »).
 * Cette heuristique reste valable avec de vraies réponses d'API.
 */
export function analyzeAnswer(question: string, answer: AiAnswer, brand: Brand): Probe {
  const haystack = normalize(answer.text);
  const tokens = brandTokens(brand);
  const domainRoot = normalize(brand.domain.split(".")[0] ?? "");

  const cited =
    tokens.length > 0
      ? tokens.every((token) => haystack.includes(token))
      : haystack.includes(domainRoot);

  // Rang : on repère les entrées numérotées « 1. Nom » de la réponse.
  const listed = [...answer.text.matchAll(/^\s*(\d+)\.\s*(.+)$/gm)].map((match) => ({
    rank: Number(match[1]),
    label: (match[2] ?? "").trim(),
  }));
  const matchesBrand = (candidate: string) => {
    const normalized = normalize(candidate);
    return tokens.length > 0
      ? tokens.every((token) => normalized.includes(token))
      : normalized.includes(domainRoot);
  };

  const own = listed.find((entry) => matchesBrand(entry.label));
  const competitors = listed.filter((entry) => !matchesBrand(entry.label)).map((entry) => entry.label);

  const linked = answer.sources.some((source) => normalize(source.url).includes(normalize(brand.domain)));

  return {
    question,
    cited,
    position: own?.rank ?? null,
    competitors,
    linked,
    answer,
  };
}

/**
 * Score de visibilité d'une IA, sur 100.
 *
 * Trois signaux, du plus au moins important :
 *  - être cité (60 pts max, au prorata des questions couvertes) ;
 *  - être cité HAUT dans la réponse (25 pts max) ;
 *  - obtenir un lien vers son site (15 pts max) — c'est ce qui amène du trafic.
 */
export function scoreProvider(probes: Probe[]): number {
  if (probes.length === 0) return 0;

  const citedCount = probes.filter((probe) => probe.cited).length;
  const coverage = citedCount / probes.length;

  const positioned = probes.filter((probe) => probe.cited && probe.position !== null);
  const positionQuality =
    positioned.length === 0
      ? 0
      : positioned.reduce((sum, probe) => sum + 1 / (probe.position ?? 1), 0) / positioned.length;

  const linkRate = probes.filter((probe) => probe.linked).length / probes.length;

  const score = coverage * 60 + positionQuality * coverage * 25 + linkRate * 15;
  return Math.round(Math.min(100, score));
}

/** Moyenne pondérée des scores fournisseurs (voir PROVIDER_WEIGHTS). */
export function scoreGlobal(scores: { providerId: ProviderId; score: number }[]): number {
  if (scores.length === 0) return 0;
  const totalWeight = scores.reduce((sum, entry) => sum + PROVIDER_WEIGHTS[entry.providerId], 0);
  const weighted = scores.reduce(
    (sum, entry) => sum + entry.score * PROVIDER_WEIGHTS[entry.providerId],
    0,
  );
  return Math.round(weighted / totalWeight);
}

/** Libellé qualitatif associé à un score, réutilisé dans toute l'UI. */
export function scoreLabel(score: number): string {
  if (score >= 70) return "Très bonne visibilité";
  if (score >= 45) return "Visibilité correcte";
  if (score >= 20) return "Visibilité faible";
  return "Quasi invisible";
}
