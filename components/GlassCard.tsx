import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/lib/theme";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  radiusSize?: number;
}

export function GlassCard({ children, style, radiusSize = radius.lg }: GlassCardProps) {
  return (
    <View style={[styles.wrap, { borderRadius: radiusSize }, style]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSolid,
  },
  tint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
});
