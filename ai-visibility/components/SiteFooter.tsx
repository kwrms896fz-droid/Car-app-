export function SiteFooter() {
  return (
    <footer className="border-t border-line/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Visibl — Visibilité IA pour les entreprises locales.</p>
        <p className="text-xs">
          Version démo : les réponses des IA sont simulées, aucune requête n&apos;est envoyée à
          OpenAI, Perplexity ou Google.
        </p>
      </div>
    </footer>
  );
}
