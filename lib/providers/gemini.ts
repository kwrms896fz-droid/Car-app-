import type { AiAnswer } from "@/lib/types";
import { mockAsk } from "./mock-engine";
import type { AiProvider, AskContext } from "./types";

/**
 * Gemini (Google).
 *
 * === BRANCHEMENT DE LA VRAIE API ===
 * 1. Renseigner GEMINI_API_KEY dans .env.local et AI_VISIBILITY_MODE=live.
 * 2. Remplacer le corps de `askLive` par un appel à generateContent avec
 *    l'ancrage Google Search activé :
 *
 *      const res = await fetch(
 *        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
 *        {
 *          method: "POST",
 *          headers: {
 *            "Content-Type": "application/json",
 *            "x-goog-api-key": process.env.GEMINI_API_KEY!,
 *          },
 *          body: JSON.stringify({
 *            contents: [{ parts: [{ text: question }] }],
 *            tools: [{ google_search: {} }],
 *          }),
 *        },
 *      );
 *
 * 3. Mapper vers `AiAnswer` : `text` = candidates[0].content.parts[0].text,
 *    `sources` = groundingMetadata.groundingChunks[].web, `live: true`.
 */
async function askLive(question: string, context: AskContext): Promise<AiAnswer> {
  // TODO : appel réel à l'API Gemini (voir le mode d'emploi ci-dessus).
  return mockAsk("gemini", question, context);
}

export const geminiProvider: AiProvider = {
  id: "gemini",
  name: "Gemini",
  vendor: "Google",
  tagline: "Adossé à Google Search, il pèse lourd sur le référencement local.",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  async ask(question, context) {
    if (process.env.AI_VISIBILITY_MODE === "live" && this.isConfigured()) {
      return askLive(question, context);
    }
    return mockAsk("gemini", question, context);
  },
};
