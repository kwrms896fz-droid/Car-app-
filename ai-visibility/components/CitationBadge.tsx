/** Badge « Cité » / « Non cité » affiché sur chaque carte de résultat. */
export function CitationBadge({ cited }: { cited: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        cited
          ? "bg-positive/12 text-positive ring-1 ring-positive/30"
          : "bg-negative/12 text-negative ring-1 ring-negative/30",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${cited ? "bg-positive" : "bg-negative"}`}
      />
      {cited ? "Cité" : "Non cité"}
    </span>
  );
}
