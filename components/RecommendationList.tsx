import type { Recommendation } from "@/lib/types";

const IMPACT_STYLE: Record<Recommendation["impact"], { label: string; className: string }> = {
  high: { label: "Impact fort", className: "bg-positive/12 text-positive ring-positive/25" },
  medium: { label: "Impact moyen", className: "bg-warning/12 text-warning ring-warning/25" },
  low: { label: "Impact faible", className: "bg-ink-muted/10 text-ink-muted ring-line" },
};

const EFFORT_LABEL: Record<Recommendation["effort"], string> = {
  quick: "Rapide",
  moyen: "Effort moyen",
  long: "Chantier de fond",
};

export function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <ol className="space-y-3">
      {recommendations.map((rec, index) => (
        <li key={rec.title} className="rounded-xl border border-line/80 bg-canvas/50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-2 text-xs font-semibold text-ink-muted">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold">{rec.title}</h4>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${IMPACT_STYLE[rec.impact].className}`}
            >
              {IMPACT_STYLE[rec.impact].label}
            </span>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">
              {EFFORT_LABEL[rec.effort]}
            </span>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{rec.description}</p>
        </li>
      ))}
    </ol>
  );
}
