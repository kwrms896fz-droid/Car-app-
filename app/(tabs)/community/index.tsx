import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { FeedEntryCard } from "@/components/FeedEntryCard";
import { Screen } from "@/components/Screen";
import { VehicleCard } from "@/components/VehicleCard";
import { useAuth } from "@/context/AuthContext";
import type { Vehicle } from "@/lib/database.types";
import { fetchDiscoverVehicles, fetchFeed, type FeedItem } from "@/lib/social";
import { colors, radius, spacing } from "@/lib/theme";

type Tab = "feed" | "discover";

export default function CommunityScreen() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [discover, setDiscover] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const [feedItems, discoverVehicles] = await Promise.all([
      fetchFeed(session.user.id),
      fetchDiscoverVehicles(session.user.id),
    ]);
    setFeed(feedItems);
    setDiscover(discoverVehicles);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communauté</Text>
        <Pressable onPress={() => router.push("/(tabs)/community/notifications")} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("feed")} style={[styles.tab, tab === "feed" && styles.tabActive]}>
          <Text style={[styles.tabLabel, tab === "feed" && styles.tabLabelActive]}>Abonnements</Text>
        </Pressable>
        <Pressable onPress={() => setTab("discover")} style={[styles.tab, tab === "discover" && styles.tabActive]}>
          <Text style={[styles.tabLabel, tab === "discover" && styles.tabLabelActive]}>Découvrir</Text>
        </Pressable>
      </View>

      {tab === "feed" ? (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.entry.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FeedEntryCard item={item} onPress={() => router.push(`/vehicle/${item.vehicle.id}`)} />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  Suivez d'autres passionnés dans l'onglet "Découvrir" pour voir leurs publications ici.
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={discover}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <VehicleCard vehicle={item} onPress={() => router.push(`/vehicle/${item.id}`)} />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="compass-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Aucun véhicule public à découvrir pour l'instant.</Text>
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 13,
  },
  tabLabelActive: {
    color: colors.onNeon,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
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
