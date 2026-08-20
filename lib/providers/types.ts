import type { AiAnswer, AuditInput, Brand, ProviderId } from "@/lib/types";

/** Contexte transmis au fournisseur pour chaque question posée. */
export interface AskContext {
  input: AuditInput;
  brand: Brand;
  /** Index de la question dans la série — utile pour un mock déterministe. */
  questionIndex: number;
}

/**
 * Contrat que doit remplir chaque IA testée.
 *
 * C'est le SEUL point d'extension à toucher pour passer des données factices
 * aux vraies API : implémentez `ask()` avec un appel réseau, le reste de
 * l'application (détection de citation, scoring, recommandations, UI) ne
 * change pas d'une ligne.
 */
export interface AiProvider {
  id: ProviderId;
  /** Nom affiché. Ex. « ChatGPT ». */
  name: string;
  /** Éditeur affiché sous le nom. Ex. « OpenAI ». */
  vendor: string;
  /** Phrase courte affichée sur la carte de résultat. */
  tagline: string;
  /** true si la clé d'API nécessaire est présente dans l'environnement. */
  isConfigured(): boolean;
  /** Pose une question à l'IA et renvoie sa réponse brute. */
  ask(question: string, context: AskContext): Promise<AiAnswer>;
}
