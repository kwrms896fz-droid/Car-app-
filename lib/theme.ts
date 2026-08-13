import type { ViewStyle } from "react-native";

// Direction artistique : glassmorphism premium sur fond quasi-noir, deux
// accents néon seulement (violet principal, cyan en complément — utilisé avec
// parcimonie), coins généreux et cohérents, typographie Space Grotesk (titres)
// + Inter (texte courant).

export const colors = {
  background: "#0A0A0F",
  backgroundAlt: "#100B1A",
  surface: "rgba(255,255,255,0.05)",
  surfaceSolid: "#151520",
  surfaceAlt: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.1)",
  borderStrong: "rgba(255,255,255,0.18)",

  text: "#F5F5F7",
  textMuted: "#8B8B95",
  textDim: "#5C5C66",

  // Les deux seuls accents de marque de l'app — violet principal, cyan en
  // complément (highlights, icônes actives). Aucune autre couleur saturée ne
  // doit être introduite pour du chrome UI (boutons, glow, états actifs).
  primary: "#8B5CF6",
  primarySoft: "rgba(139,92,246,0.16)",
  cyan: "#06B6D4",
  cyanSoft: "rgba(6,182,212,0.16)",

  // Utilisée uniquement pour différencier la 3e catégorie de modification
  // (Confort) dans les badges — jamais pour du chrome UI (boutons, glow).
  categoryTertiary: "#F59E0B",
  categoryTertiarySoft: "rgba(245,158,11,0.16)",

  success: "#22C55E",
  successSoft: "rgba(34,197,94,0.16)",
  danger: "#F43F5E",
  dangerSoft: "rgba(244,63,94,0.16)",

  onNeon: "#0A0A0F", // texte sur fond néon plein
};

export const gradients = {
  background: ["#120C1F", "#0A0A0F", "#0A0A0F"] as const,
  primaryButton: ["#A78BFA", "#7C3AED"] as const,
  cardGlow: ["rgba(139,92,246,0.10)", "rgba(6,182,212,0.03)"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Cartes : 20-24px. Boutons / éléments interactifs : 16px.
export const radius = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const fonts = {
  display: "SpaceGrotesk_700Bold",
  displaySemiBold: "SpaceGrotesk_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

// Halo néon réutilisable — passer une couleur, obtenir un style d'ombre colorée.
export function glow(color: string, opacity = 0.4, radiusPx = 20): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radiusPx,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  };
}

// Glow "actif" standard — cohérent partout où un élément sélectionné/actif a
// besoin d'un halo néon violet (spec : 0 0 20px rgba(139,92,246,0.4)).
export const glowPrimary = glow(colors.primary, 0.4, 20);

export const categoryLabels: Record<string, string> = {
  esthetique: "Esthétique",
  performance: "Performance",
  confort: "Confort",
};

export const categoryColors: Record<string, string> = {
  esthetique: colors.cyan,
  performance: colors.primary,
  confort: colors.categoryTertiary,
};

export const categoryIcons: Record<string, string> = {
  esthetique: "color-palette",
  performance: "flash",
  confort: "sparkles",
};

export const maintenanceLabels: Record<string, string> = {
  vidange: "Vidange",
  pneus: "Pneus",
  controle_technique: "Contrôle technique",
  freins: "Freins",
  autre: "Autre",
};
