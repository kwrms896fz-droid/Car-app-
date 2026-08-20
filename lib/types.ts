/**
 * Types partagés entre la couche « fournisseurs IA » (lib/providers) et la
 * couche « audit » (lib/audit). Rien ici ne dépend de React ou de Next.js :
 * ce module reste utilisable tel quel depuis un worker, un cron, un test.
 */

export type ProviderId = "chatgpt" | "perplexity" | "gemini";

/** Ce que l'utilisateur saisit dans le formulaire. */
export interface AuditInput {
  /** URL du site, telle que saisie (peut être sans protocole). */
  url: string;
  /** Secteur d'activité, identifiant issu de lib/audit/sectors.ts. */
  sector: string;
  /** Ville ciblée, texte libre. */
  city: string;
}

/** L'entreprise auditée, dérivée de l'URL saisie. */
export interface Brand {
  /** Nom lisible, deviné depuis le domaine. Ex. « Garage Dupont ». */
  name: string;
  /** Domaine normalisé, sans protocole ni www. Ex. « garage-dupont.fr ». */
  domain: string;
  /** URL complète et normalisée. Ex. « https://garage-dupont.fr ». */
  url: string;
}

/** Une source citée par une IA dans sa réponse. */
export interface AnswerSource {
  title: string;
  url: string;
}

/**
 * Réponse brute d'une IA à une question. C'est le seul objet qu'un
 * fournisseur doit savoir produire — tout le reste (détection de citation,
 * score, recommandations) est calculé à partir de là.
 */
export interface AiAnswer {
  /** Texte de la réponse générée par l'IA. */
  text: string;
  /** Sources / liens que l'IA associe à sa réponse. */
  sources: AnswerSource[];
  /** true si la réponse vient d'une vraie API, false si elle est simulée. */
  live: boolean;
}

/** Résultat de l'analyse d'une question pour un fournisseur donné. */
export interface Probe {
  question: string;
  /** L'entreprise est-elle mentionnée dans la réponse ? */
  cited: boolean;
  /** Rang de la mention parmi les entreprises citées (1 = première). */
  position: number | null;
  /** Autres entreprises citées sur cette question. */
  competitors: string[];
  /** L'IA a-t-elle lié le site de l'entreprise dans ses sources ? */
  linked: boolean;
  answer: AiAnswer;
}

export type RecommendationImpact = "high" | "medium" | "low";
export type RecommendationEffort = "quick" | "moyen" | "long";

export interface Recommendation {
  title: string;
  description: string;
  impact: RecommendationImpact;
  effort: RecommendationEffort;
}

/** Résultat complet pour un fournisseur (ChatGPT, Perplexity ou Gemini). */
export interface ProviderResult {
  providerId: ProviderId;
  providerName: string;
  vendor: string;
  /** true dès qu'au moins une question mentionne l'entreprise. */
  cited: boolean;
  /** Score de visibilité sur 100. */
  score: number;
  /** Nombre de questions où l'entreprise est citée. */
  citationCount: number;
  probes: Probe[];
  recommendations: Recommendation[];
  /** false quand la réponse provient des données factices. */
  live: boolean;
}

/** Le rapport rendu par la page /results. */
export interface AuditReport {
  input: AuditInput;
  brand: Brand;
  sectorLabel: string;
  /** Moyenne pondérée des scores fournisseurs, sur 100. */
  globalScore: number;
  /** Concurrents les plus cités, toutes IA confondues. */
  topCompetitors: { name: string; mentions: number }[];
  providers: ProviderResult[];
  generatedAt: string;
}
