import { StyleSheet, Text, View } from "react-native";

import type { PowerTimelinePoint } from "@/lib/buildPlanner";
import { colors, fonts, spacing } from "@/lib/theme";

interface PowerTimelineProps {
  points: PowerTimelinePoint[];
}

const monthLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

export function PowerTimeline({ points }: PowerTimelineProps) {
  if (points.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Renseigne la puissance obtenue sur une modification pour voir la progression ici.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {points.map((point, i) => {
        const prev = points[i - 1];
        const delta = prev ? point.horsepower - prev.horsepower : null;
        const isLast = i === points.length - 1;
        return (
          <View key={`${point.date}-${i}`} style={styles.row}>
            <View style={styles.markerCol}>
              <View style={[styles.dot, isLast && styles.dotActive]} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.content}>
              <Text style={styles.date}>{monthLabel(point.date)}</Text>
              <View style={styles.hpRow}>
                <Text style={styles.hp}>{point.horsepower} ch</Text>
                {delta !== null && delta !== 0 ? (
                  <Text style={[styles.delta, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
                    {delta > 0 ? "+" : ""}
                    {delta} ch
                  </Text>
                ) : null}
              </View>
              <Text style={styles.label}>{point.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
  },
  markerCol: {
    width: 20,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textDim,
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: colors.cyan,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
    gap: 1,
  },
  date: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textDim,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  hpRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  hp: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 20,
  },
  delta: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  deltaUp: {
    color: colors.success,
  },
  deltaDown: {
    color: colors.danger,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  empty: {
    padding: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
