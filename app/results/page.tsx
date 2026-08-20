import Link from "next/link";
import { ProviderResultCard } from "@/components/ProviderResultCard";
import { ScoreDial } from "@/components/ScoreDial";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isValidUrl } from "@/lib/audit/brand";
import { runAudit } from "@/lib/audit/run-audit";
import { scoreLabel } from "@/lib/audit/scoring";
import { DEFAULT_SECTOR_ID, getSector } from "@/lib/audit/sectors";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export const metadata = {
  title: "Votre rapport de visibilité IA — Visibl",
};

export default async function ResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const url = first(params.url);
  const city = first(params.city);
  const sector = first(params.sector) || DEFAULT_SECTOR_ID;

  if (!isValidUrl(url) || !city.trim()) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
          <h1 className="text-2xl font-semibold">Il manque des informations</h1>
          <p className="mt-3 text-ink-muted">
            Pour lancer un audit, indiquez une URL valide et la ville que vous ciblez.
          </p>
          <Link
            href="/#tester"
            className="mt-8 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand/90"
          >
            Revenir au formulaire
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const report = await runAudit({ url, sector, city });
  const citedCount = report.providers.filter((provider) => provider.cited).length;
  const simulated = report.providers.every((provider) => !provider.live);
  const missing = report.providers.length - citedCount;
  const summary =
    citedCount === 0
      ? "Aucune des IA testées ne mentionne votre entreprise sur les questions de votre métier. Vos concurrents occupent seuls la réponse."
      : missing === 0
        ? `Les ${report.providers.length} IA vous citent au moins une fois. Objectif suivant : monter dans le classement et récupérer le lien vers votre site.`
        : `${citedCount} IA sur ${report.providers.length} vous cite${citedCount > 1 ? "nt" : ""} au moins une fois. Il reste ${missing} moteur${missing > 1 ? "s" : ""} à conquérir.`;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Synthèse */}
        <section className="hero-glow -mx-6 px-6 pt-14 pb-12">
          <Link href="/#tester" className="text-sm text-ink-muted transition hover:text-ink">
            ← Tester un autre site
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-8">
            <div className="min-w-64 flex-1">
              <h1 className="text-3xl font-semibold tracking-tight break-words sm:text-4xl">
                {report.brand.name}
              </h1>
              <p className="mt-2 text-ink-muted">
                {report.brand.domain} · {report.sectorLabel} · {report.input.city}
              </p>
              <p className="mt-5 max-w-xl leading-relaxed text-ink-muted">
                {summary}
              </p>
            </div>

            <ScoreDial score={report.globalScore} size={132} label={scoreLabel(report.globalScore)} />
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {report.providers.map((provider) => (
              <div
                key={provider.providerId}
                className="rounded-xl border border-line bg-surface/70 px-5 py-4"
              >
                <dt className="text-sm text-ink-muted">{provider.providerName}</dt>
                <dd className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{provider.score}</span>
                  <span
                    className={`text-sm font-medium ${provider.cited ? "text-positive" : "text-negative"}`}
                  >
                    {provider.cited ? "Cité" : "Non cité"}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Concurrents */}
        {report.topCompetitors.length > 0 ? (
          <section className="rounded-2xl border border-line bg-surface/50 p-6">
            <h2 className="text-sm font-semibold tracking-widest text-ink-muted uppercase">
              Cités à votre place
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {report.topCompetitors.map((competitor) => (
                <li
                  key={competitor.name}
                  className="rounded-full border border-line bg-surface-2/60 px-3.5 py-1.5 text-sm"
                >
                  {competitor.name}
                  <span className="ml-2 text-xs text-ink-muted">
                    {competitor.mentions} mention{competitor.mentions > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Détail par IA */}
        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Détail par intelligence artificielle</h2>
          {report.providers.map((provider) => (
            <ProviderResultCard key={provider.providerId} result={provider} />
          ))}
        </section>

        {/* Pied de rapport */}
        <section className="mt-12 rounded-2xl border border-line bg-surface/60 p-8 text-center">
          <h2 className="text-xl font-semibold">Et maintenant ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Traitez d&apos;abord les recommandations « impact fort », puis relancez le test dans un
            mois pour mesurer l&apos;effet sur votre score.
          </p>
          <Link
            href="/#tester"
            className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand/90"
          >
            Lancer un nouveau test
          </Link>
          {simulated ? (
            <p className="mt-6 text-xs text-ink-muted">
              Ce rapport est généré avec des données de démonstration, déterministes pour un même
              site. Branchez les clés d&apos;API dans <code className="text-ink">.env.local</code>{" "}
              pour interroger les vraies IA.
            </p>
          ) : null}
        </section>

        <p className="mt-8 text-center text-xs text-ink-muted">
          Rapport généré le{" "}
          {new Date(report.generatedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {getSector(report.input.sector).questionTemplates.length} questions par IA
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
