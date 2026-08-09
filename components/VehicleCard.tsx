import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Vehicle } from "@/lib/database.types";
import { colors, radius, spacing } from "@/lib/theme";

interface VehicleCardProps {
  vehicle: Vehicle;
  budgetTotal?: number;
  onPress: () => void;
}

export function VehicleCard({ vehicle, budgetTotal, onPress }: VehicleCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {vehicle.cover_photo_url ? (
        <Image source={{ uri: vehicle.cover_photo_url }} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons
            name={vehicle.type_vehicule === "moto" ? "bicycle" : "car-sport"}
            size={36}
            color={colors.textMuted}
          />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={styles.subtitle}>
          {vehicle.type_vehicule === "moto" ? "Moto" : "Voiture"}
          {vehicle.year ? ` · ${vehicle.year}` : ""}
        </Text>
        {budgetTotal !== undefined && !vehicle.hide_budget ? (
          <Text style={styles.budget}>{budgetTotal.toLocaleString("fr-FR")} € investis</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.85,
  },
  cover: {
    width: "100%",
    height: 160,
  },
  coverPlaceholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: spacing.md,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  budget: {
    marginTop: spacing.xs,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
