import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white"
          >
            V
          </span>
          Visibl
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/#fonctionnement" className="hidden transition hover:text-ink sm:block">
            Comment ça marche
          </Link>
          <Link href="/#criteres" className="hidden transition hover:text-ink sm:block">
            Ce qu&apos;on analyse
          </Link>
          <Link
            href="/#tester"
            className="rounded-lg bg-surface-2 px-4 py-2 font-medium text-ink ring-1 ring-line transition hover:ring-brand/60"
          >
            Tester mon site
          </Link>
        </nav>
      </div>
    </header>
  );
}
