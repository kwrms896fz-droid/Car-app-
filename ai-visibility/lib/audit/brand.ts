import type { Brand } from "@/lib/types";

/** Ajoute https:// si l'utilisateur a saisi « monsite.fr » tout court. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Vérifie qu'on a bien un domaine exploitable (utilisé côté form et côté API). */
export function isValidUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(normalizeUrl(raw));
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1] ?? "";
    return parts.length >= 2 && parts.every(Boolean) && tld.length >= 2;
  } catch {
    return false;
  }
}

/**
 * Déduit un nom de marque lisible depuis le domaine.
 * « garage-dupont.fr » → « Garage Dupont ».
 *
 * Quand on branchera les vraies API, ce nom devra plutôt venir du <title>
 * ou du JSON-LD Organization de la page d'accueil — voir TODO ci-dessous.
 */
export function buildBrand(rawUrl: string): Brand {
  const url = normalizeUrl(rawUrl);
  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    /* on garde la saisie telle quelle */
  }

  const domain = hostname.replace(/^www\./i, "");
  // TODO (API réelle) : récupérer le vrai nom via le <title> / schema.org
  // de la page d'accueil plutôt que de le deviner depuis le domaine.
  const name = domain
    .split(".")[0]!
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { name: name || domain, domain, url: `https://${domain}` };
}
