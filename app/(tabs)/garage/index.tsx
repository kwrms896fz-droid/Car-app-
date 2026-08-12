import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { VehicleCard } from "@/components/VehicleCard";
import { useAuth } from "@/context/AuthContext";
import type { Vehicle } from "@/lib/database.types";
import { colors, spacing } from "@/lib/theme";
import { computeBudgetTotal, fetchModEntries, fetchMyVehicles } from "@/lib/vehicles";

const FREE_VEHICLE_LIMIT = 1;

export default function GarageScreen() {
  const { session, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const list = await fetchMyVehicles(session.user.id);
    setVehicles(list);

    const entries = await Promise.all(list.map((v) => fetchModEntries(v.id)));
    const nextBudgets: Record<string, number> = {};
    list.forEach((v, i) => {
      nextBudgets[v.id] = computeBudgetTotal(entries[i]);
    });
    setBudgets(nextBudgets);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const canAddVehicle = profile?.is_premium || vehicles.length < FREE_VEHICLE_LIMIT;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon garage</Text>
        <Pressable
          onPress={() =>
            canAddVehicle
              ? router.push("/(tabs)/garage/new")
              : router.push("/(tabs)/profile")
          }
          style={styles.addButton}
        >
          <Ionicons name="add" size={26} color={colors.onNeon} />
        </Pressable>
      </View>

      {!canAddVehicle ? (
        <Text style={styles.limitNotice}>
          Version gratuite limitée à {FREE_VEHICLE_LIMIT} véhicule. Passez à l'abonnement pour un garage
          illimité.
        </Text>
      ) : null}

      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            budgetTotal={budgets[item.id]}
            onPress={() => router.push(`/(tabs)/garage/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="car-sport-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Ajoutez votre premier véhicule pour démarrer votre carnet.</Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  limitNotice: {
    color: colors.textMuted,
    fontSize: 13,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: 10,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
