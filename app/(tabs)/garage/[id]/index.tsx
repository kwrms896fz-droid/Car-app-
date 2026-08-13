import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { FlatList, Share, StyleSheet, Text, View } from "react-native";

import { ActionRow } from "@/components/ActionRow";
import { GlassCard } from "@/components/GlassCard";
import { PowerTimeline } from "@/components/PowerTimeline";
import { Screen } from "@/components/Screen";
import { ModEntryCard } from "@/components/ModEntryCard";
import { useAuth } from "@/context/AuthContext";
import { buildPowerTimeline, fetchPowerLogs } from "@/lib/buildPlanner";
import type { ModEntry, PowerLog, Vehicle } from "@/lib/database.types";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { computeBudgetTotal, fetchModEntries, fetchVehicle } from "@/lib/vehicles";
import { publicVehicleUrl } from "@/lib/links";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const navigation = useNavigation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [entries, setEntries] = useState<ModEntry[]>([]);
  const [powerLogs, setPowerLogs] = useState<PowerLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const v = await fetchVehicle(id);
    setVehicle(v);
    if (v) {
      const [modEntries, logs] = await Promise.all([fetchModEntries(v.id), fetchPowerLogs(v.id)]);
      setEntries(modEntries);
      setPowerLogs(logs);
    }
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
  const powerTimeline = buildPowerTimeline(entries, powerLogs);

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
        {!vehicle?.hide_budget || vehicle?.mileage ? (
          <View style={styles.statsRow}>
            {!vehicle?.hide_budget ? (
              <GlassCard radiusSize={radius.md} style={styles.statCard}>
                <Text style={styles.statLabel}>Budget investi</Text>
                <Text style={styles.statValue}>{budgetTotal.toLocaleString("fr-FR")} €</Text>
              </GlassCard>
            ) : null}
            {vehicle?.mileage ? (
              <GlassCard radiusSize={radius.md} style={styles.statCard}>
                <Text style={styles.statLabel}>Kilométrage</Text>
                <Text style={styles.statValue}>{vehicle.mileage.toLocaleString("fr-FR")} km</Text>
              </GlassCard>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actionsList}>
          {isOwner ? (
            <ActionRow
              icon="add-circle"
              accent={colors.primary}
              label="Ajouter une modification"
              subtitle="Nouvelle entrée dans le journal"
              onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/add-entry`)}
            />
          ) : null}
          <ActionRow
            icon="sparkles"
            accent={colors.primary}
            label="Assistant de préparation"
            subtitle="Plan par étapes selon usage et budget"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/recommendations`)}
          />
          <ActionRow
            icon="calculator"
            accent={colors.categoryTertiary}
            label="Budget & Projets"
            subtitle="Construis et chiffre ton projet"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/budget`)}
          />
          <ActionRow
            icon="git-compare"
            accent={colors.cyan}
            label="Vérificateur de compatibilité"
            subtitle="Avis IA à vérifier avec un pro"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/compatibility`)}
          />
          <ActionRow
            icon="sync"
            accent={colors.cyan}
            label="Vue 360°"
            subtitle="Avant / après préparation"
            onPress={() => router.push(`/(tabs)/garage/${vehicle!.id}/360`)}
          />
          <ActionRow icon="share-social" accent={colors.text} label="Partager" subtitle="Lien public de la fiche" onPress={onShare} />
        </View>

        {powerTimeline.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Progression de puissance</Text>
            <GlassCard radiusSize={radius.lg} style={styles.timelineCard}>
              <PowerTimeline points={powerTimeline} />
            </GlassCard>
          </>
        ) : null}

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
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statValue: {
    fontFamily: fonts.displaySemiBold,
    color: colors.cyan,
    fontSize: 24,
    marginTop: 2,
  },
  actionsList: {
    gap: spacing.sm,
  },
  timelineCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
