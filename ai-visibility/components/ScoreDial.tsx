/**
 * Jauge circulaire de score. Rendue en SVG pur : pas de librairie, pas de
 * JavaScript côté client, et elle reste nette à toutes les tailles.
 */
export function ScoreDial({
  score,
  size = 116,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = size >= 100 ? 10 : 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;

  const color = score >= 70 ? "var(--color-positive)" : score >= 35 ? "var(--color-warning)" : "var(--color-negative)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score : ${score} sur 100`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">/ 100</span>
        </div>
      </div>
      {label ? <span className="text-xs text-ink-muted">{label}</span> : null}
    </div>
  );
}
