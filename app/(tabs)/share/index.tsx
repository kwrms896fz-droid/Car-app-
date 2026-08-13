import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import type { ModEntry, Vehicle } from "@/lib/database.types";
import { publicVehicleUrl } from "@/lib/links";
import { colors, radius, spacing } from "@/lib/theme";
import { fetchModEntries, fetchMyVehicles } from "@/lib/vehicles";

interface VehicleWithLatest {
  vehicle: Vehicle;
  latestEntry: ModEntry | null;
}

export default function ShareScreen() {
  const { session } = useAuth();
  const [items, setItems] = useState<VehicleWithLatest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const vehicles = await fetchMyVehicles(session.user.id);
    const withEntries = await Promise.all(
      vehicles.map(async (vehicle) => {
        const entries = await fetchModEntries(vehicle.id);
        return { vehicle, latestEntry: entries[0] ?? null };
      })
    );
    setItems(withEntries);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const shareLink = async (vehicle: Vehicle) => {
    await Share.share({
      message: `Découvrez ${vehicle.brand} ${vehicle.model} sur Carnet Garage : ${publicVehicleUrl(vehicle.id)}`,
      url: publicVehicleUrl(vehicle.id),
    });
  };

  const share360 = async (vehicle: Vehicle) => {
    if (vehicle.photos_360_before.length === 0) {
      Alert.alert("Pas encore de vue 360°", "Ajoutez des photos de rotation depuis la fiche du véhicule.");
      return;
    }
    const photo = vehicle.is_completed ? vehicle.photos_360_after[0] : vehicle.photos_360_before[0];
    await Share.share({
      message: `${vehicle.brand} ${vehicle.model} — vue 360° sur Carnet Garage : ${publicVehicleUrl(vehicle.id)}`,
      url: photo ?? publicVehicleUrl(vehicle.id),
    });
  };

  const shareLatest = async (vehicle: Vehicle, entry: ModEntry | null) => {
    if (!entry) {
      Alert.alert("Aucune modification", "Ajoutez une entrée au journal pour pouvoir la partager.");
      return;
    }
    await Share.share({
      message:
        `${entry.title} sur ${vehicle.brand} ${vehicle.model}` +
        (entry.price ? ` (${entry.price.toLocaleString("fr-FR")} €)` : "") +
        ` — ${publicVehicleUrl(vehicle.id)}`,
      url: entry.photos[0] ?? publicVehicleUrl(vehicle.id),
    });
  };

  return (
    <Screen>
      <Text style={styles.title}>Partager</Text>
      <Text style={styles.subtitle}>Montrez votre garage : lien public, vue 360° ou dernière modification.</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.vehicle.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard radiusSize={radius.lg} style={styles.card}>
            <View style={styles.cardHeader}>
              {item.vehicle.cover_photo_url ? (
                <Image source={{ uri: item.vehicle.cover_photo_url }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Ionicons
                    name={item.vehicle.type_vehicule === "moto" ? "bicycle" : "car-sport"}
                    size={22}
                    color={colors.textMuted}
                  />
                </View>
              )}
              <Text style={styles.cardTitle}>
                {item.vehicle.brand} {item.vehicle.model}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <ShareAction icon="link" label="Lien" accent={colors.cyan} onPress={() => shareLink(item.vehicle)} />
              <ShareAction icon="sync" label="Vue 360°" accent={colors.primary} onPress={() => share360(item.vehicle)} />
              <ShareAction
                icon="sparkles"
                label="Dernière modif"
                accent={colors.pink}
                onPress={() => shareLatest(item.vehicle, item.latestEntry)}
              />
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="share-social-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Ajoutez un véhicule dans votre garage pour pouvoir le partager.</Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function ShareAction({
  icon,
  label,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.action, { borderColor: `${accent}55` }]}>
      <Ionicons name={icon} size={18} color={accent} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  thumbPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  actionLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
  },
});
