import type { AiAnswer } from "@/lib/types";
import { mockAsk } from "./mock-engine";
import type { AiProvider, AskContext } from "./types";

/**
 * Perplexity.
 *
 * === BRANCHEMENT DE LA VRAIE API ===
 * 1. Renseigner PERPLEXITY_API_KEY dans .env.local et AI_VISIBILITY_MODE=live.
 * 2. Remplacer le corps de `askLive` par un appel à l'API chat completions :
 *
 *      const res = await fetch("https://api.perplexity.ai/chat/completions", {
 *        method: "POST",
 *        headers: {
 *          "Content-Type": "application/json",
 *          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
 *        },
 *        body: JSON.stringify({
 *          model: "sonar",
 *          messages: [{ role: "user", content: question }],
 *        }),
 *      });
 *
 * 3. Mapper vers `AiAnswer` : `text` = choices[0].message.content,
 *    `sources` = tableau `citations` renvoyé par l'API, `live: true`.
 *    Perplexity cite ses sources nativement, c'est le fournisseur le plus
 *    riche en liens — d'où son poids plus élevé dans le score global.
 */
async function askLive(question: string, context: AskContext): Promise<AiAnswer> {
  // TODO : appel réel à l'API Perplexity (voir le mode d'emploi ci-dessus).
  return mockAsk("perplexity", question, context);
}

export const perplexityProvider: AiProvider = {
  id: "perplexity",
  name: "Perplexity",
  vendor: "Perplexity AI",
  tagline: "Moteur de réponse branché sur le web, il cite ses sources.",
  isConfigured: () => Boolean(process.env.PERPLEXITY_API_KEY),
  async ask(question, context) {
    if (process.env.AI_VISIBILITY_MODE === "live" && this.isConfigured()) {
      return askLive(question, context);
    }
    return mockAsk("perplexity", question, context);
  },
};
