/**
 * Catalogue des secteurs proposés dans le formulaire.
 *
 * `questionTemplates` sert à construire les requêtes envoyées aux IA.
 * Placeholders disponibles : {city} et {sector}.
 * Ajouter un secteur = ajouter une entrée ici, rien d'autre à toucher.
 */

export interface Sector {
  id: string;
  label: string;
  /** Terme employé dans les questions. Ex. « garage automobile ». */
  noun: string;
  questionTemplates: string[];
  /** Noms de concurrents fictifs utilisés par le moteur de données factices. */
  sampleCompetitors: string[];
}

export const SECTORS: Sector[] = [
  {
    id: "garage-auto",
    label: "Garage / mécanique auto",
    noun: "garage automobile",
    questionTemplates: [
      "Quel est le meilleur {sector} à {city} ?",
      "Où faire réviser ma voiture à {city} ?",
      "Quels sont les garages les mieux notés à {city} ?",
      "Combien coûte une révision complète à {city} et chez qui la faire ?",
    ],
    sampleCompetitors: ["Garage Central", "AutoService {city}", "Mécanix", "Speedy {city}"],
  },
  {
    id: "restaurant",
    label: "Restaurant / bar",
    noun: "restaurant",
    questionTemplates: [
      "Quels sont les meilleurs restaurants à {city} ?",
      "Où bien manger à {city} ce soir ?",
      "Quel restaurant réserver à {city} pour un dîner d'affaires ?",
      "Quelles bonnes adresses conseiller à un touriste à {city} ?",
    ],
    sampleCompetitors: ["La Table de {city}", "Chez Marcel", "Le Comptoir", "Bistrot du Marché"],
  },
  {
    id: "agence-web",
    label: "Agence web / marketing",
    noun: "agence web",
    questionTemplates: [
      "Quelle agence web choisir à {city} ?",
      "Qui peut refaire le site de mon entreprise à {city} ?",
      "Quelles sont les meilleures agences SEO à {city} ?",
      "Combien coûte la refonte d'un site vitrine à {city} ?",
    ],
    sampleCompetitors: ["Studio Pixel", "{city} Digital", "Agence Kréa", "WebFactory"],
  },
  {
    id: "immobilier",
    label: "Immobilier",
    noun: "agence immobilière",
    questionTemplates: [
      "Quelle agence immobilière est la plus fiable à {city} ?",
      "Comment vendre rapidement un appartement à {city} ?",
      "Quels sont les frais d'agence pratiqués à {city} ?",
      "À qui confier la gestion locative de mon bien à {city} ?",
    ],
    sampleCompetitors: ["Immo Conseil", "{city} Patrimoine", "Orpi {city}", "Agence du Centre"],
  },
  {
    id: "sante",
    label: "Santé / bien-être",
    noun: "cabinet de santé",
    questionTemplates: [
      "Quel praticien consulter à {city} ?",
      "Où trouver un cabinet qui prend de nouveaux patients à {city} ?",
      "Quels sont les cabinets les mieux notés à {city} ?",
      "Comment prendre rendez-vous rapidement à {city} ?",
    ],
    sampleCompetitors: ["Cabinet Saint-Roch", "Centre Médical {city}", "Pôle Santé", "Clinique du Parc"],
  },
  {
    id: "btp",
    label: "BTP / artisanat",
    noun: "artisan du bâtiment",
    questionTemplates: [
      "Quel artisan choisir pour des travaux à {city} ?",
      "Qui contacter pour une rénovation à {city} ?",
      "Quelles entreprises de BTP sont recommandées à {city} ?",
      "Combien coûtent des travaux de rénovation à {city} ?",
    ],
    sampleCompetitors: ["Bâti Pro", "{city} Rénovation", "Artisans Réunis", "Maison & Travaux"],
  },
  {
    id: "commerce",
    label: "Commerce de détail",
    noun: "commerce",
    questionTemplates: [
      "Où acheter à {city} sans passer par internet ?",
      "Quelles sont les meilleures boutiques de {city} ?",
      "Quels commerces indépendants découvrir à {city} ?",
      "Où trouver un bon conseil en boutique à {city} ?",
    ],
    sampleCompetitors: ["La Boutique", "{city} Store", "Maison Lefèvre", "Le Comptoir Local"],
  },
  {
    id: "services-pro",
    label: "Services aux entreprises",
    noun: "prestataire de services",
    questionTemplates: [
      "Quel prestataire choisir à {city} pour accompagner mon entreprise ?",
      "Quels cabinets de conseil sont recommandés à {city} ?",
      "Qui peut m'aider à structurer mon activité à {city} ?",
      "Quels sont les tarifs pratiqués à {city} pour ce type de prestation ?",
    ],
    sampleCompetitors: ["Cabinet Orion", "{city} Consulting", "Groupe Axio", "Partner & Co"],
  },
  {
    id: "autre",
    label: "Autre secteur",
    noun: "entreprise",
    questionTemplates: [
      "Quelles entreprises recommandez-vous à {city} ?",
      "Comment choisir un prestataire fiable à {city} ?",
      "Quels sont les acteurs connus à {city} ?",
      "Qui sont les références locales à {city} ?",
    ],
    sampleCompetitors: ["Groupe Meridien", "{city} Services", "Atelier Nord", "Maison Bertrand"],
  },
];

export const DEFAULT_SECTOR_ID = "garage-auto";

export function getSector(id: string): Sector {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[SECTORS.length - 1];
}
