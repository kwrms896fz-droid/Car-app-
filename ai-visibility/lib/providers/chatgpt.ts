import type { AiAnswer } from "@/lib/types";
import { mockAsk } from "./mock-engine";
import type { AiProvider, AskContext } from "./types";

/**
 * ChatGPT (OpenAI).
 *
 * === BRANCHEMENT DE LA VRAIE API ===
 * 1. Renseigner OPENAI_API_KEY dans .env.local et AI_VISIBILITY_MODE=live.
 * 2. Remplacer le corps de `askLive` par un appel à l'API Responses avec
 *    l'outil `web_search` activé (sans recherche web, le modèle ne peut pas
 *    citer de commerces locaux) :
 *
 *      const res = await fetch("https://api.openai.com/v1/responses", {
 *        method: "POST",
 *        headers: {
 *          "Content-Type": "application/json",
 *          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
 *        },
 *        body: JSON.stringify({
 *          model: "gpt-5",
 *          input: question,
 *          tools: [{ type: "web_search" }],
 *        }),
 *      });
 *
 * 3. Mapper la réponse vers `AiAnswer` : `text` = texte généré,
 *    `sources` = annotations de type url_citation, `live: true`.
 * Rien d'autre à modifier dans l'application.
 */
async function askLive(question: string, context: AskContext): Promise<AiAnswer> {
  // TODO : appel réel à l'API OpenAI (voir le mode d'emploi ci-dessus).
  return mockAsk("chatgpt", question, context);
}

export const chatgptProvider: AiProvider = {
  id: "chatgpt",
  name: "ChatGPT",
  vendor: "OpenAI",
  tagline: "L'assistant le plus utilisé pour les recommandations généralistes.",
  isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
  async ask(question, context) {
    if (process.env.AI_VISIBILITY_MODE === "live" && this.isConfigured()) {
      return askLive(question, context);
    }
    return mockAsk("chatgpt", question, context);
  },
};
