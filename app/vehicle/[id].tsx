import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ModEntryCard } from "@/components/ModEntryCard";
import { useAuth } from "@/context/AuthContext";
import type { ModEntry, Profile, Vehicle } from "@/lib/database.types";
import { publicVehicleUrl } from "@/lib/links";
import { fetchFollowerCount, fetchProfile, follow, isFollowing, unfollow } from "@/lib/social";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { computeBudgetTotal, fetchModEntries, fetchVehicle } from "@/lib/vehicles";

export default function PublicVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<ModEntry[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const v = await fetchVehicle(id);
    setVehicle(v);
    if (!v) return;
    const [ownerProfile, modEntries, count] = await Promise.all([
      fetchProfile(v.owner_id),
      fetchModEntries(v.id),
      fetchFollowerCount(v.owner_id),
    ]);
    setOwner(ownerProfile);
    setEntries(modEntries);
    setFollowerCount(count);
    if (session && session.user.id !== v.owner_id) {
      setFollowing(await isFollowing(session.user.id, v.owner_id));
    }
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onToggleFollow = async () => {
    if (!session || !vehicle) return;
    if (following) {
      await unfollow(session.user.id, vehicle.owner_id);
      setFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await follow(session.user.id, vehicle.owner_id);
      setFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  const onShare = async () => {
    if (!vehicle) return;
    await Share.share({
      message: `Découvrez ${vehicle.brand} ${vehicle.model} sur Carnet Garage : ${publicVehicleUrl(vehicle.id)}`,
      url: publicVehicleUrl(vehicle.id),
    });
  };

  if (!loading && !vehicle) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>
          Ce véhicule n'existe pas ou n'est plus public.
        </Text>
      </Screen>
    );
  }

  const budgetTotal = computeBudgetTotal(entries);
  const isOwnVehicle = session?.user.id === vehicle?.owner_id;

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
        <Pressable onPress={() => router.push("/")} style={styles.backLink}>
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={styles.backText}>Carnet Garage</Text>
        </Pressable>

        <Text style={styles.title}>
          {vehicle?.brand} {vehicle?.model}
        </Text>
        <Text style={styles.subtitle}>
          {vehicle?.type_vehicule === "moto" ? "Moto" : "Voiture"}
          {vehicle?.year ? ` · ${vehicle.year}` : ""} · par @{owner?.username ?? "…"}
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.statText}>{followerCount} abonné{followerCount > 1 ? "s" : ""}</Text>
          {!vehicle?.hide_budget ? (
            <Text style={styles.statText}>{budgetTotal.toLocaleString("fr-FR")} € investis</Text>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          {session && !isOwnVehicle ? (
            <Pressable onPress={onToggleFollow} style={styles.actionButton}>
              <Ionicons name={following ? "person-remove" : "person-add"} size={18} color={colors.primary} />
              <Text style={styles.actionLabel}>{following ? "Suivi" : "Suivre"}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onShare} style={styles.actionButton}>
            <Ionicons name="share-social" size={18} color={colors.primary} />
            <Text style={styles.actionLabel}>Partager</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Historique des modifications</Text>

        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: spacing.md }}
          renderItem={({ item }) => <ModEntryCard entry={item} />}
          ListEmptyComponent={
            !loading ? <Text style={styles.emptyText}>Aucune entrée publiée.</Text> : null
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
    gap: spacing.sm,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  backText: {
    color: colors.primary,
    fontWeight: "700",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  statText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
