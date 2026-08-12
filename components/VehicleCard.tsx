import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import type { Vehicle } from "@/lib/database.types";
import { colors, spacing } from "@/lib/theme";

interface VehicleCardProps {
  vehicle: Vehicle;
  budgetTotal?: number;
  onPress: () => void;
}

export function VehicleCard({ vehicle, budgetTotal, onPress }: VehicleCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <GlassCard>
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
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  cover: {
    width: "100%",
    height: 160,
  },
  coverPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: spacing.md,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  budget: {
    marginTop: spacing.xs,
    fontSize: 14,
    fontWeight: "700",
    color: colors.cyan,
  },
});
