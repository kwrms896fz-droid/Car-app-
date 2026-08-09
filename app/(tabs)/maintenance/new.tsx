import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import type { MaintenanceKind, Vehicle } from "@/lib/database.types";
import { createMaintenanceItem } from "@/lib/maintenance";
import { colors, maintenanceLabels, radius, spacing } from "@/lib/theme";
import { fetchMyVehicles } from "@/lib/vehicles";

const kinds = Object.keys(maintenanceLabels) as MaintenanceKind[];

export default function NewMaintenanceScreen() {
  const { session } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [kind, setKind] = useState<MaintenanceKind>("vidange");
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueMileage, setDueMileage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchMyVehicles(session.user.id).then((list) => {
      setVehicles(list);
      if (list.length > 0) setVehicleId(list[0].id);
    });
  }, [session]);

  const onSubmit = async () => {
    if (!vehicleId) return;
    setError(null);
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      setError("La date doit être au format AAAA-MM-JJ.");
      return;
    }
    setLoading(true);
    try {
      await createMaintenanceItem({
        vehicle_id: vehicleId,
        kind,
        label: label.trim(),
        due_date: dueDate || undefined,
        due_mileage: dueMileage ? Number(dueMileage) : undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer cet entretien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.sectionLabel}>Véhicule</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {vehicles.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => setVehicleId(v.id)}
            style={[styles.chip, vehicleId === v.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, vehicleId === v.id && styles.chipTextActive]}>
              {v.brand} {v.model}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Type d'entretien</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {kinds.map((k) => (
          <Pressable key={k} onPress={() => setKind(k)} style={[styles.chip, kind === k && styles.chipActive]}>
            <Text style={[styles.chipText, kind === k && styles.chipTextActive]}>{maintenanceLabels[k]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextField label="Description" placeholder="Ex. Vidange + filtre à huile" value={label} onChangeText={setLabel} />
      <TextField label="Date d'échéance (AAAA-MM-JJ)" placeholder="2026-12-01" value={dueDate} onChangeText={setDueDate} />
      <TextField
        label="Kilométrage d'échéance"
        keyboardType="number-pad"
        placeholder="Ex. 60000"
        value={dueMileage}
        onChangeText={setDueMileage}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Enregistrer" onPress={onSubmit} loading={loading} disabled={!vehicleId || !label} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#151515",
  },
  error: {
    color: colors.danger,
  },
});
