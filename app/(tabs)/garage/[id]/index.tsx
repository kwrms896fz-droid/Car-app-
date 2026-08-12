import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ModEntryCard } from "@/components/ModEntryCard";
import { useAuth } from "@/context/AuthContext";
import type { ModEntry, Vehicle } from "@/lib/database.types";
import { colors, radius, spacing } from "@/lib/theme";
import { computeBudgetTotal, fetchModEntries, fetchVehicle } from "@/lib/vehicles";
import { publicVehicleUrl } from "@/lib/links";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const navigation = useNavigation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [entries, setEntries] = useState<ModEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const v = await fetchVehicle(id);
    setVehicle(v);
    if (v) setEntries(await fetchModEntries(v.id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  useLayoutEffect(() => {
    if (vehicle) {
      navigation.setOptions({ title: `${vehicle.brand} ${vehicle.model}` });
    }
  }, [navigation, vehicle]);

  if (!vehicle && !loading) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Véhicule introuvable.</Text>
      </Screen>
    );
  }

  const isOwner = vehicle && session && vehicle.owner_id === session.user.id;
  const budgetTotal = computeBudgetTotal(entries);

  const onShare = async () => {
    if (!vehicle) return;
    await Share.share({
      message: `Découvrez ${vehicle.brand} ${vehicle.model} sur Carnet Garage : ${publicVehicleUrl(vehicle.id)}`,
      url: publicVehicleUrl(vehicle.id),
    });
  };

  return (
    <Screen scroll style={{ padding: 0 }}>
      {vehicle?.cover_photo_url ? (
        <Image source={{ uri: vehicle.cover_photo_url }} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons
            name={vehicle?.type_vehicule === "moto" ? "bicycle" : "car-sport"}
            size={56}
            color={colors.textMuted}
          />
        </View>
      )}

      <View style={styles.content}>
        {!vehicle?.hide_budget ? (
          <GlassCard radiusSize={radius.md} style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Budget total investi</Text>
            <Text style={styles.budgetValue}>{budgetTotal.toLocaleString("fr-FR")} €</Text>
          </GlassCard>
        ) : null}

        <View style={styles.actionsRow}>
          {isOwner ? (
            <ActionButton
              icon="add-circle"
              accent={colors.pink}
              label="Ajouter une modif"
              onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/add-entry`)}
            />
          ) : null}
          <ActionButton
            icon="sparkles"
            accent={colors.primary}
            label="Recommandations IA"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/recommendations`)}
          />
          <ActionButton
            icon="sync"
            accent={colors.cyan}
            label="Vue 360°"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/360`)}
          />
          <ActionButton icon="share-social" accent={colors.text} label="Partager" onPress={onShare} />
        </View>

        <Text style={styles.sectionTitle}>Historique des modifications</Text>

        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: spacing.md }}
          renderItem={({ item }) => <ModEntryCard entry={item} />}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                Aucune entrée pour l'instant. {isOwner ? "Ajoutez votre première modification !" : ""}
              </Text>
            ) : null
          }
        />
      </View>
    </Screen>
  );
}

function ActionButton({
  icon,
  label,
  accent = colors.primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accent?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, { borderColor: `${accent}40` }]}>
      <Ionicons name={icon} size={20} color={accent} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    height: 220,
  },
  coverPlaceholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  budgetCard: {
    padding: spacing.md,
  },
  budgetLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  budgetValue: {
    color: colors.cyan,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flexBasis: "47%",
    flexGrow: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
