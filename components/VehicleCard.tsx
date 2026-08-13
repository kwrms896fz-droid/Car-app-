import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { Vehicle } from "@/lib/database.types";
import { colors, glow, radius, spacing } from "@/lib/theme";

interface VehicleCardProps {
  vehicle: Vehicle;
  budgetTotal?: number;
  onPress: () => void;
}

// Carte "showroom" : le véhicule flotte sur un fond dégradé avec halo néon,
// façon présentation premium — remplace le rendu 3D IA (non réalisable
// techniquement) par un traitement visuel de mise en scène équivalent.
export function VehicleCard({ vehicle, budgetTotal, onPress }: VehicleCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }),
      Animated.timing(lift, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const animateOutAndNavigate = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.015, useNativeDriver: true, speed: 30, bounciness: 6 }),
      Animated.timing(lift, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
      onPress();
    });
  };

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <Pressable onPressIn={animateIn} onPress={animateOutAndNavigate}>
      <Animated.View style={[styles.wrap, glow(colors.primary, 0.28, 22), { transform: [{ scale }, { translateY }] }]}>
        <LinearGradient
          colors={["#1B1030", "#0E0A1D", "#0A0713"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.stage}
        >
          <View style={styles.spotlight} pointerEvents="none" />

          {vehicle.cover_photo_url ? (
            <Image source={{ uri: vehicle.cover_photo_url }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons
                name={vehicle.type_vehicule === "moto" ? "bicycle" : "car-sport"}
                size={44}
                color={colors.textDim}
              />
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(10,7,19,0.55)", "rgba(10,7,19,0.94)"]}
            style={styles.vignette}
            pointerEvents="none"
          />

          {vehicle.horsepower ? (
            <View style={styles.hpBadge}>
              <Text style={styles.hpValue}>{vehicle.horsepower}</Text>
              <Text style={styles.hpUnit}>ch</Text>
            </View>
          ) : null}

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.subtitle}>
                {vehicle.type_vehicule === "moto" ? "Moto" : "Voiture"}
                {vehicle.year ? ` · ${vehicle.year}` : ""}
              </Text>
              {budgetTotal !== undefined && !vehicle.hide_budget ? (
                <Text style={styles.budget}>{budgetTotal.toLocaleString("fr-FR")} €</Text>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
  },
  stage: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 210,
  },
  spotlight: {
    position: "absolute",
    top: -60,
    left: "50%",
    marginLeft: -140,
    width: 280,
    height: 220,
    borderRadius: 140,
    backgroundColor: colors.primarySoft,
    opacity: 0.7,
  },
  cover: {
    width: "100%",
    height: 210,
  },
  coverPlaceholder: {
    width: "100%",
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  vignette: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  hpBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    backgroundColor: "rgba(10,7,19,0.65)",
    borderWidth: 1,
    borderColor: colors.cyanSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  hpValue: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "800",
  },
  hpUnit: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.85,
  },
  info: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  budget: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.cyan,
  },
});
