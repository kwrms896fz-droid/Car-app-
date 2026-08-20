import { CitationBadge } from "./CitationBadge";
import { RecommendationList } from "./RecommendationList";
import { ScoreDial } from "./ScoreDial";
import { scoreLabel } from "@/lib/audit/scoring";
import type { ProviderResult } from "@/lib/types";

export function ProviderResultCard({ result }: { result: ProviderResult }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface/70">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-line/70 p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{result.providerName}</h3>
            <CitationBadge cited={result.cited} />
            {!result.live ? (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">
                données simulées
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs tracking-wide text-ink-muted uppercase">{result.vendor}</p>
          <p className="mt-3 text-sm text-ink-muted">
            {result.citationCount === 0 ? (
              <>
                Aucune citation sur les {result.probes.length} questions testées — {scoreLabel(result.score)}.
              </>
            ) : (
              <>
                Cité sur <span className="font-semibold text-ink">{result.citationCount}</span>{" "}
                question{result.citationCount > 1 ? "s" : ""} sur {result.probes.length} —{" "}
                {scoreLabel(result.score)}.
              </>
            )}
          </p>
        </div>
        <ScoreDial score={result.score} size={96} />
      </header>

      <section className="border-b border-line/70 p-6">
        <h4 className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
          Questions posées
        </h4>
        <ul className="mt-4 space-y-2.5">
          {result.probes.map((probe) => (
            <li key={probe.question} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${probe.cited ? "bg-positive" : "bg-negative/70"}`}
              />
              <div className="min-w-0">
                <p className="text-ink">{probe.question}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {probe.cited
                    ? `Cité${probe.position ? ` en position ${probe.position}` : ""}${
                        probe.linked ? ", avec un lien vers votre site" : ", sans lien vers votre site"
                      }`
                    : `Non cité — ${probe.competitors.slice(0, 2).join(", ") || "aucun concurrent identifié"} apparaît à votre place`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="p-6">
        <h4 className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
          Recommandations
        </h4>
        <div className="mt-4">
          <RecommendationList recommendations={result.recommendations} />
        </div>
      </section>
    </article>
  );
}
