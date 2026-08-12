import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { MaintenanceItemCard } from "@/components/MaintenanceItemCard";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import type { MaintenanceItem, Vehicle } from "@/lib/database.types";
import { fetchMaintenanceForVehicles, markMaintenanceDone } from "@/lib/maintenance";
import { colors, spacing } from "@/lib/theme";
import { fetchMyVehicles } from "@/lib/vehicles";

export default function MaintenanceScreen() {
  const { session, profile } = useAuth();
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const myVehicles = await fetchMyVehicles(session.user.id);
    setVehicles(myVehicles);
    setItems(await fetchMaintenanceForVehicles(myVehicles.map((v) => v.id)));
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onMarkDone = async (id: string) => {
    await markMaintenanceDone(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entretien</Text>
        <Pressable
          onPress={() => (vehicles.length > 0 ? router.push("/(tabs)/maintenance/new") : router.push("/(tabs)/garage/new"))}
          style={styles.addButton}
        >
          <Ionicons name="add" size={26} color={colors.onNeon} />
        </Pressable>
      </View>

      {!profile?.is_premium ? (
        <Text style={styles.limitNotice}>
          Le suivi d'entretien fait partie de l'abonnement Carnet Garage.
        </Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MaintenanceItemCard
            item={item}
            vehicle={vehicles.find((v) => v.id === item.vehicle_id)}
            onMarkDone={() => onMarkDone(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="build-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                Ajoutez une vidange, un contrôle technique ou un changement de pneus à suivre.
              </Text>
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
    paddingVertical: spacing.md,
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
