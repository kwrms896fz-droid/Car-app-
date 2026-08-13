import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import type { MaintenanceItem, Vehicle } from "@/lib/database.types";
import { maintenanceUrgency } from "@/lib/maintenance";
import { colors, fonts, maintenanceLabels, radius, spacing } from "@/lib/theme";

const urgencyColor = {
  overdue: colors.danger,
  soon: colors.primary,
  ok: colors.success,
  none: colors.textMuted,
};

const urgencyLabel = {
  overdue: "En retard",
  soon: "Bientôt",
  ok: "À jour",
  none: "Sans échéance",
};

interface MaintenanceItemCardProps {
  item: MaintenanceItem;
  vehicle?: Vehicle;
  onMarkDone: () => void;
}

export function MaintenanceItemCard({ item, vehicle, onMarkDone }: MaintenanceItemCardProps) {
  const urgency = maintenanceUrgency(item);

  return (
    <GlassCard radiusSize={radius.md} style={styles.card}>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.badge, { color: urgencyColor[urgency], borderColor: `${urgencyColor[urgency]}66` }]}>
            {urgencyLabel[urgency]}
          </Text>
          <Text style={styles.kind}>{maintenanceLabels[item.kind] ?? item.kind}</Text>
        </View>
        <Text style={styles.label}>{item.label}</Text>
        {vehicle ? (
          <Text style={styles.vehicle}>
            {vehicle.brand} {vehicle.model}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {item.due_date ? (
            <Text style={styles.meta}>Échéance : {new Date(item.due_date).toLocaleDateString("fr-FR")}</Text>
          ) : null}
          {item.due_mileage ? <Text style={styles.meta}>{item.due_mileage.toLocaleString("fr-FR")} km</Text> : null}
        </View>
      </View>
      <Pressable onPress={onMarkDone} style={styles.doneButton} hitSlop={8}>
        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} />
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kind: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
  },
  label: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  vehicle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  doneButton: {
    padding: spacing.xs,
  },
});
