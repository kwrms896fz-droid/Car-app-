import { PROVIDERS } from "@/lib/providers";
import type { AuditInput, AuditReport, ProviderResult } from "@/lib/types";
import { buildBrand } from "./brand";
import { buildQuestions } from "./questions";
import { buildRecommendations } from "./recommendations";
import { analyzeAnswer, scoreGlobal, scoreProvider } from "./scoring";
import { getSector } from "./sectors";

/**
 * Point d'entrée de l'audit : entrée du formulaire → rapport complet.
 *
 * Toute la logique est ici, aucune dépendance à Next.js — la fonction est
 * appelée par la page de résultats (composant serveur) comme par la route
 * API /api/analyze, et pourra l'être par un job planifié.
 */
export async function runAudit(input: AuditInput): Promise<AuditReport> {
  const brand = buildBrand(input.url);
  const questions = buildQuestions(input);

  const providers: ProviderResult[] = await Promise.all(
    PROVIDERS.map(async (provider) => {
      // Les questions d'un même fournisseur partent en parallèle : avec de
      // vraies API, penser à limiter la concurrence / gérer le rate limiting.
      const answers = await Promise.all(
        questions.map((question, questionIndex) =>
          provider.ask(question, { input, brand, questionIndex }),
        ),
      );

      const probes = questions.map((question, index) =>
        analyzeAnswer(question, answers[index]!, brand),
      );

      const cited = probes.filter((probe) => probe.cited);
      const positions = cited.map((probe) => probe.position).filter((p): p is number => p !== null);

      const recommendations = buildRecommendations({
        provider,
        brand,
        sectorId: input.sector,
        city: input.city.trim() || "votre ville",
        probes,
        citationCount: cited.length,
        linkCount: probes.filter((probe) => probe.linked).length,
        bestPosition: positions.length > 0 ? Math.min(...positions) : null,
        competitors: [...new Set(probes.flatMap((probe) => probe.competitors))],
      });

      return {
        providerId: provider.id,
        providerName: provider.name,
        vendor: provider.vendor,
        cited: cited.length > 0,
        score: scoreProvider(probes),
        citationCount: cited.length,
        probes,
        recommendations,
        live: answers.some((answer) => answer.live),
      };
    }),
  );

  const mentions = new Map<string, number>();
  for (const provider of providers) {
    for (const probe of provider.probes) {
      for (const competitor of probe.competitors) {
        mentions.set(competitor, (mentions.get(competitor) ?? 0) + 1);
      }
    }
  }

  return {
    input,
    brand,
    sectorLabel: getSector(input.sector).label,
    globalScore: scoreGlobal(providers.map((p) => ({ providerId: p.providerId, score: p.score }))),
    topCompetitors: [...mentions.entries()]
      .map(([name, count]) => ({ name, mentions: count }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 4),
    providers,
    generatedAt: new Date().toISOString(),
  };
}
