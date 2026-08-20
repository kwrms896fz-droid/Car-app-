import type { ProviderId } from "@/lib/types";
import { chatgptProvider } from "./chatgpt";
import { geminiProvider } from "./gemini";
import { perplexityProvider } from "./perplexity";
import type { AiProvider } from "./types";

/**
 * Registre des IA testées. Ajouter un fournisseur (Claude, Copilot, Grok…) =
 * créer un fichier sur le modèle de chatgpt.ts et l'ajouter à cette liste.
 * L'interface et la page de résultats s'adaptent automatiquement.
 */
export const PROVIDERS: AiProvider[] = [chatgptProvider, perplexityProvider, geminiProvider];

/**
 * Poids de chaque IA dans le score global. Perplexity et Gemini sont adossés
 * au web en temps réel : y être cité vaut plus qu'une mention chez ChatGPT,
 * dont les réponses dépendent davantage des données d'entraînement.
 */
export const PROVIDER_WEIGHTS: Record<ProviderId, number> = {
  chatgpt: 1,
  perplexity: 1.2,
  gemini: 1.1,
};

export type { AiProvider, AskContext } from "./types";
