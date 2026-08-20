import { SiteHeader } from "@/components/SiteHeader";

const PROVIDER_NAMES = ["ChatGPT", "Perplexity", "Gemini"];

/**
 * Écran affiché pendant que `runAudit` tourne côté serveur.
 * Next.js le monte automatiquement grâce au streaming du segment /results.
 */
export default function ResultsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analyse de votre visibilité en cours…
          </h1>
          <p className="mt-3 text-ink-muted">
            On interroge chaque IA sur les questions de votre métier.
          </p>
        </div>

        <ul className="mx-auto mt-12 max-w-md space-y-3">
          {PROVIDER_NAMES.map((name, index) => (
            <li
              key={name}
              className="animate-scan flex items-center justify-between rounded-xl border border-line bg-surface/60 px-5 py-4"
              style={{ animationDelay: `${index * 0.18}s` }}
            >
              <span className="font-medium">{name}</span>
              <span className="text-sm text-ink-muted">interrogation…</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 h-1 w-full max-w-md overflow-hidden rounded-full bg-line">
          <div className="animate-scan h-full w-1/2 rounded-full bg-brand" />
        </div>
      </main>
    </>
  );
}
