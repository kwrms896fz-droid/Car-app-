import type { ViewStyle } from "react-native";

// Direction artistique : structure façon iOS moderne (coins généreux, verre
// dépoli, hiérarchie typographique nette) + ambiance nocturne néon inspirée
// de GTA (fond très sombre, accents violet/cyan/rose saturés, forts contrastes).

export const colors = {
  background: "#0A0713",
  backgroundAlt: "#120B24",
  surface: "rgba(255,255,255,0.055)",
  surfaceSolid: "#171029",
  surfaceAlt: "rgba(255,255,255,0.09)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",

  text: "#F6F3FF",
  textMuted: "#A79BC7",
  textDim: "#6F6690",

  // Accents néon
  primary: "#B026FF", // violet néon — accent principal
  primarySoft: "rgba(176,38,255,0.16)",
  cyan: "#22E4E4",
  cyanSoft: "rgba(34,228,228,0.16)",
  pink: "#FF2D9E",
  pinkSoft: "rgba(255,45,158,0.16)",

  success: "#39FF88",
  successSoft: "rgba(57,255,136,0.16)",
  danger: "#FF3B6B",
  dangerSoft: "rgba(255,59,107,0.16)",

  onNeon: "#0A0713", // texte sur fond néon plein
};

export const gradients = {
  background: ["#120B24", "#0A0713", "#0A0713"] as const,
  primaryButton: ["#C042FF", "#8A1FE0"] as const,
  cardGlow: ["rgba(176,38,255,0.10)", "rgba(34,228,228,0.03)"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
};

// Halo néon réutilisable — passer une couleur, obtenir un style d'ombre colorée.
export function glow(color: string, opacity = 0.55, radiusPx = 16): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radiusPx,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  };
}

export const categoryLabels: Record<string, string> = {
  esthetique: "Esthétique",
  performance: "Performance",
  confort: "Confort",
};

export const categoryColors: Record<string, string> = {
  esthetique: colors.pink,
  performance: colors.cyan,
  confort: colors.primary,
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
