import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { Vehicle360Viewer } from "@/components/Vehicle360Viewer";
import { useAuth } from "@/context/AuthContext";
import type { Vehicle } from "@/lib/database.types";
import { publicVehicleUrl } from "@/lib/links";
import { pickMultipleImages, uploadVehiclePhotos } from "@/lib/storage";
import { colors, glow, radius, spacing } from "@/lib/theme";
import { fetchVehicle, markPreparationCompleted, updateVehicle360Photos } from "@/lib/vehicles";

type Tab = "before" | "after";

export default function Vehicle360Screen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState<Tab>("before");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const v = await fetchVehicle(vehicleId);
    setVehicle(v);
    if (v) setTab(v.is_completed ? "after" : "before");
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const isOwner = !!vehicle && !!session && vehicle.owner_id === session.user.id;
  const photos = vehicle ? (tab === "before" ? vehicle.photos_360_before : vehicle.photos_360_after) : [];

  const onUploadPhotos = async () => {
    if (!vehicle || !session) return;
    const assets = await pickMultipleImages();
    if (assets.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadVehiclePhotos(session.user.id, assets);
      await updateVehicle360Photos(vehicle.id, tab, urls);
      setVehicle({ ...vehicle, [tab === "before" ? "photos_360_before" : "photos_360_after"]: urls });
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Impossible d'envoyer les photos.");
    } finally {
      setUploading(false);
    }
  };

  const onMarkCompleted = () => {
    if (!vehicle) return;
    Alert.alert(
      "Préparation terminée ?",
      "Vous pourrez ajouter la séquence de rotation \"après\" pour montrer le résultat final.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            await markPreparationCompleted(vehicle.id);
            setVehicle({ ...vehicle, is_completed: true });
            setTab("after");
          },
        },
      ]
    );
  };

  const onShare = async () => {
    if (!vehicle) return;
    const summary =
      `${vehicle.brand} ${vehicle.model}` +
      (vehicle.year ? ` (${vehicle.year})` : "") +
      (vehicle.horsepower ? ` — ${vehicle.horsepower} ch` : "") +
      ` — vue ${tab === "before" ? "avant préparation" : "après préparation"}`;
    await Share.share({
      message: `${summary}\n${publicVehicleUrl(vehicle.id)}`,
      url: photos[0] ?? publicVehicleUrl(vehicle.id),
    });
  };

  if (!loading && !vehicle) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Véhicule introuvable.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Vue 360°</Text>

      <View style={styles.tabs}>
        <TabButton label="Avant" active={tab === "before"} onPress={() => setTab("before")} />
        <TabButton
          label="Après"
          active={tab === "after"}
          disabled={!vehicle?.is_completed}
          onPress={() => vehicle?.is_completed && setTab("after")}
        />
      </View>

      {tab === "after" && !vehicle?.is_completed ? (
        <GlassCard radiusSize={radius.lg} style={styles.lockedCard}>
          <Ionicons name="lock-closed" size={22} color={colors.textMuted} />
          <Text style={styles.lockedText}>
            La vue "après" apparaîtra une fois la préparation marquée comme terminée.
          </Text>
        </GlassCard>
      ) : (
        <Vehicle360Viewer photos={photos} />
      )}

      <GlassCard radiusSize={radius.lg} style={styles.summary}>
        <Text style={styles.summaryTitle}>
          {vehicle?.brand} {vehicle?.model}
        </Text>
        <View style={styles.summaryRow}>
          <SummaryStat label="Année" value={vehicle?.year ? String(vehicle.year) : "—"} />
          <SummaryStat label="Puissance" value={vehicle?.horsepower ? `${vehicle.horsepower} ch` : "—"} />
          <SummaryStat label="État" value={vehicle?.is_completed ? "Terminé" : "En cours"} />
        </View>
      </GlassCard>

      {isOwner ? (
        <View style={styles.ownerActions}>
          <Button
            label={photos.length > 0 ? "Remplacer les photos" : "Ajouter des photos (rotation)"}
            onPress={onUploadPhotos}
            loading={uploading}
            variant="secondary"
            disabled={tab === "after" && !vehicle?.is_completed}
          />
          {tab === "before" && !vehicle?.is_completed ? (
            <Button label="Marquer la préparation comme terminée" onPress={onMarkCompleted} variant="ghost" />
          ) : null}
        </View>
      ) : null}

      <Pressable onPress={onShare} style={[styles.shareButton, glow(colors.cyan, 0.35, 10)]}>
        <Ionicons name="share-social" size={18} color={colors.cyan} />
        <Text style={styles.shareText}>Partager cette vue</Text>
      </Pressable>
    </Screen>
  );
}

function TabButton({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.tabButton,
        active && styles.tabButtonActive,
        active && glow(colors.primary, 0.4, 10),
        disabled && styles.tabButtonDisabled,
      ]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {disabled ? <Ionicons name="lock-closed" size={12} color={colors.textDim} /> : null}
    </Pressable>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabButtonDisabled: {
    opacity: 0.5,
  },
  tabLabel: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 14,
  },
  tabLabelActive: {
    color: colors.text,
  },
  lockedCard: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  lockedText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 13,
  },
  summary: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    color: colors.cyan,
    fontWeight: "800",
    fontSize: 16,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  ownerActions: {
    gap: spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.cyan}66`,
    backgroundColor: colors.cyanSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  shareText: {
    color: colors.cyan,
    fontWeight: "700",
  },
});
