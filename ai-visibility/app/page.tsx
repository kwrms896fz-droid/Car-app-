import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PROVIDERS } from "@/lib/providers";

const STEPS = [
  {
    step: "1",
    title: "Vous donnez votre site",
    body: "URL, secteur d'activité et ville. Rien d'autre : pas de compte, pas d'installation de balise sur votre site.",
  },
  {
    step: "2",
    title: "On interroge les IA",
    body: "On pose à ChatGPT, Perplexity et Gemini les questions que vos clients leur posent vraiment — « meilleur garage à Lyon », « où faire réviser ma voiture »…",
  },
  {
    step: "3",
    title: "On mesure votre présence",
    body: "Pour chaque IA : êtes-vous cité, à quelle place, avec un lien vers votre site ? Qui est cité à votre place ?",
  },
  {
    step: "4",
    title: "Vous recevez un plan d'action",
    body: "Des recommandations concrètes et priorisées par impact, adaptées à ce que chaque IA regarde réellement.",
  },
];

const CRITERIA = [
  {
    title: "Taux de citation",
    body: "Sur l'ensemble des questions testées, combien de fois votre entreprise est-elle nommée ?",
  },
  {
    title: "Position dans la réponse",
    body: "Être cité en 5ᵉ position n'a pas la même valeur qu'ouvrir la liste. On mesure votre rang.",
  },
  {
    title: "Lien vers votre site",
    body: "Une mention sans lien ne génère aucun trafic. On vérifie si l'IA renvoie bien vers votre domaine.",
  },
  {
    title: "Concurrents cités",
    body: "On identifie qui occupe la place que vous visez, IA par IA.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="hero-glow relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-brand-soft">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-soft" />
                Nouveau canal d&apos;acquisition : la recherche par IA
              </span>

              <h1 className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                Vos clients demandent à une IA. <span className="text-brand-soft">Vous cite-t-elle ?</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                Des millions de recherches passent désormais par ChatGPT, Perplexity et Gemini —
                sans page de résultats, sans liens bleus, sans vous si vous n&apos;êtes pas dans la
                réponse. Visibl teste votre entreprise sur les questions de votre métier et vous dit
                exactement quoi corriger.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="#tester"
                  className="rounded-xl bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand/90"
                >
                  Tester mon site gratuitement
                </Link>
                <Link
                  href="#fonctionnement"
                  className="rounded-xl px-5 py-3.5 text-base font-medium text-ink-muted transition hover:text-ink"
                >
                  Comment ça marche →
                </Link>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-x-4 gap-y-6 border-t border-line/70 pt-8">
                {[
                  ["3", "IA testées à chaque audit"],
                  ["4", "questions réelles par IA"],
                  ["< 1 min", "pour recevoir le rapport"],
                ].map(([value, caption]) => (
                  <div key={caption} className="min-w-0">
                    <dt className="text-2xl font-semibold text-ink">{value}</dt>
                    <dd className="mt-1 text-xs leading-snug text-ink-muted sm:text-sm">{caption}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Aperçu de rapport */}
            <div className="relative">
              <div className="rounded-2xl border border-line bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between border-b border-line/70 pb-4">
                  <div>
                    <p className="text-sm font-medium">garage-dupont.fr</p>
                    <p className="text-xs text-ink-muted">Garage automobile · Lyon</p>
                  </div>
                  <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-ink-muted">
                    Aperçu
                  </span>
                </div>

                <ul className="mt-5 space-y-3">
                  {[
                    { name: "ChatGPT", cited: false, score: 12 },
                    { name: "Perplexity", cited: true, score: 58 },
                    { name: "Gemini", cited: false, score: 24 },
                  ].map((row) => (
                    <li
                      key={row.name}
                      className="flex items-center justify-between rounded-xl bg-surface-2/70 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{row.name}</span>
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            row.cited
                              ? "bg-positive/12 text-positive"
                              : "bg-negative/12 text-negative",
                          ].join(" ")}
                        >
                          {row.cited ? "Cité" : "Non cité"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                          <div
                            className={`h-full rounded-full ${row.score >= 45 ? "bg-positive" : "bg-negative"}`}
                            style={{ width: `${row.score}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm tabular-nums text-ink-muted">
                          {row.score}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 rounded-xl border border-line/80 bg-canvas/60 p-4 text-sm text-ink-muted">
                  <span className="font-medium text-ink">Recommandation prioritaire · </span>
                  Publier une page « garage automobile à Lyon » répondant mot pour mot aux questions
                  testées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Le problème */}
        <section className="border-y border-line/60 bg-surface/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Le référencement ne suffit plus. L&apos;IA répond à votre place.
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Plus de liste, une seule réponse",
                  body: "Là où Google affichait dix résultats, une IA en cite deux ou trois. Les autres n'existent pas.",
                },
                {
                  title: "Vous ne le voyez pas dans vos stats",
                  body: "Un client qui vous écarte sur la base d'une réponse d'IA ne laisse aucune trace dans votre analytics.",
                },
                {
                  title: "Les règles ne sont pas celles du SEO",
                  body: "Les modèles s'appuient sur les sources tierces, les avis et les données structurées, pas sur vos balises title.",
                },
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-line bg-surface/70 p-6">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Fonctionnement */}
        <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <p className="text-sm font-medium tracking-widest text-brand-soft uppercase">
            Comment ça marche
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Quatre étapes, aucune installation sur votre site
          </h2>

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <li key={item.step} className="rounded-2xl border border-line bg-surface/60 p-6">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/15 text-sm font-semibold text-brand-soft">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Les IA testées */}
        <section className="border-y border-line/60 bg-surface/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Les IA que l&apos;on teste</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <article key={provider.id} className="rounded-2xl border border-line bg-surface/70 p-6">
                  <h3 className="text-lg font-semibold">{provider.name}</h3>
                  <p className="mt-0.5 text-xs tracking-wide text-ink-muted uppercase">
                    {provider.vendor}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{provider.tagline}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Critères */}
        <section id="criteres" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <p className="text-sm font-medium tracking-widest text-brand-soft uppercase">
            Ce qu&apos;on analyse
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Un score construit sur quatre signaux mesurables
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {CRITERIA.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-line bg-surface/60 p-6 transition hover:border-brand/40"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Formulaire */}
        <section id="tester" className="scroll-mt-20 px-6 pb-24">
          <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface/80 p-8 shadow-2xl shadow-black/30 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Testez votre visibilité IA
            </h2>
            <p className="mt-3 text-ink-muted">
              Trois informations suffisent. Vous obtenez le détail des questions posées, votre score
              par IA et vos actions prioritaires.
            </p>

            <div className="mt-8">
              <AuditForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
