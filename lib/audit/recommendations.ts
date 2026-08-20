import type { AiProvider } from "@/lib/providers";
import type { Brand, Probe, Recommendation } from "@/lib/types";
import { getSector } from "./sectors";

/**
 * Génère 2 à 3 recommandations par IA, à partir des signaux constatés.
 *
 * Le moteur est déclaratif : chaque règle décrit une condition et le conseil
 * associé, trié par impact. Ajouter un conseil = ajouter une règle, sans
 * toucher au reste. Ces règles restent pertinentes avec de vraies réponses,
 * puisqu'elles ne lisent que des `Probe`.
 */

interface RuleContext {
  provider: AiProvider;
  brand: Brand;
  sectorId: string;
  city: string;
  probes: Probe[];
  citationCount: number;
  linkCount: number;
  bestPosition: number | null;
  competitors: string[];
}

interface Rule {
  applies: (ctx: RuleContext) => boolean;
  build: (ctx: RuleContext) => Recommendation;
}

const RULES: Rule[] = [
  {
    // Aucune mention nulle part : le problème est l'absence de contenu citable.
    applies: (ctx) => ctx.citationCount === 0,
    build: (ctx) => ({
      title: `Publier une page « ${getSector(ctx.sectorId).noun} à ${ctx.city} »`,
      description: `${ctx.provider.name} ne mentionne jamais ${ctx.brand.name} sur les questions testées. Créez une page dédiée qui répond mot pour mot à ces questions (services, zone d'intervention, tarifs indicatifs) : c'est le type de contenu que les modèles reprennent pour construire leurs réponses locales.`,
      impact: "high",
      effort: "moyen",
    }),
  },
  {
    applies: (ctx) => ctx.citationCount === 0,
    build: (ctx) => ({
      title: "Se faire citer par des sources tierces reconnues",
      description: `Les IA reprennent en priorité les annuaires, la presse locale et les comparatifs. Visez 3 à 5 mentions de ${ctx.brand.name} sur des sites tiers (presse locale, fédération de votre secteur, annuaires spécialisés) : c'est le levier le plus rapide pour apparaître dans les réponses.`,
      impact: "high",
      effort: "long",
    }),
  },
  {
    // Cité mais jamais lié : notoriété sans trafic.
    applies: (ctx) => ctx.citationCount > 0 && ctx.linkCount === 0,
    build: (ctx) => ({
      title: "Récupérer le lien, pas seulement la mention",
      description: `${ctx.provider.name} cite ${ctx.brand.name} mais ne renvoie jamais vers ${ctx.brand.domain}. Ajoutez un balisage schema.org LocalBusiness (nom, adresse, téléphone, horaires, URL) et assurez-vous que votre site est bien la source de référence sur votre nom, sinon la citation ne génère aucun trafic.`,
      impact: "high",
      effort: "quick",
    }),
  },
  {
    // Cité, mais toujours derrière les autres.
    applies: (ctx) => ctx.citationCount > 0 && (ctx.bestPosition ?? 99) > 1,
    build: (ctx) => ({
      title: "Remonter dans le classement des réponses",
      description: `${ctx.brand.name} apparaît en position ${ctx.bestPosition} au mieux, derrière ${ctx.competitors.slice(0, 2).join(" et ") || "vos concurrents"}. Les IA hiérarchisent selon le volume et la fraîcheur des avis : visez 20 avis récents supplémentaires et une fiche Google Business complétée à 100 %.`,
      impact: "medium",
      effort: "moyen",
    }),
  },
  {
    // Couverture partielle : certaines intentions ne sont pas couvertes.
    applies: (ctx) => ctx.citationCount > 0 && ctx.citationCount < ctx.probes.length,
    build: (ctx) => {
      const missed = ctx.probes.find((probe) => !probe.cited);
      return {
        title: "Couvrir les questions où vous êtes absent",
        description: `Sur « ${missed?.question ?? "certaines questions"} », ${ctx.provider.name} ne vous cite pas. Rédigez une page ou une FAQ qui traite précisément ce sujet, avec une réponse courte et factuelle en début de page — c'est le format que les modèles extraient le plus volontiers.`,
        impact: "medium",
        effort: "moyen",
      };
    },
  },
  {
    applies: (ctx) => ctx.provider.id === "perplexity",
    build: (ctx) => ({
      title: "Rendre le site lisible par les robots de Perplexity",
      description: `Perplexity explore le web en direct : vérifiez que votre robots.txt n'interdit pas PerplexityBot, que les pages clés ne dépendent pas du JavaScript pour afficher leur contenu, et que ${ctx.brand.domain} expose un sitemap.xml à jour.`,
      impact: "medium",
      effort: "quick",
    }),
  },
  {
    applies: (ctx) => ctx.provider.id === "gemini",
    build: (ctx) => ({
      title: "Soigner la fiche Google Business Profile",
      description: `Gemini s'appuie sur l'index Google et sur les données Maps. Une fiche complète (catégorie précise, horaires, photos récentes, questions/réponses) pour ${ctx.brand.name} à ${ctx.city} est la condition d'entrée pour être proposé dans ses réponses locales.`,
      impact: "high",
      effort: "quick",
    }),
  },
  {
    applies: (ctx) => ctx.provider.id === "chatgpt",
    build: (ctx) => ({
      title: "Construire une présence hors de votre site",
      description: `ChatGPT s'appuie largement sur ses données d'entraînement : votre seul site ne suffit pas. Multipliez les pages qui parlent de ${ctx.brand.name} ailleurs (Wikipédia sectoriel, annuaires métiers, interviews, communiqués) pour entrer durablement dans son corpus.`,
      impact: "medium",
      effort: "long",
    }),
  },
  {
    // Filet de sécurité : toujours au moins deux conseils.
    applies: () => true,
    build: (ctx) => ({
      title: "Suivre l'évolution mois après mois",
      description: `La visibilité IA bouge à chaque mise à jour de modèle. Relancez ce test tous les mois sur ${ctx.brand.domain} pour mesurer l'effet de vos actions et détecter les concurrents qui vous dépassent.`,
      impact: "low",
      effort: "quick",
    }),
  },
];

const IMPACT_ORDER: Record<Recommendation["impact"], number> = { high: 0, medium: 1, low: 2 };

export function buildRecommendations(ctx: RuleContext): Recommendation[] {
  const matched = RULES.filter((rule) => rule.applies(ctx)).map((rule) => rule.build(ctx));

  const unique = matched.filter(
    (rec, index) => matched.findIndex((other) => other.title === rec.title) === index,
  );

  return unique.sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]).slice(0, 3);
}

export type { RuleContext };
