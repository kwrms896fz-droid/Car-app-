import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import type { ModEntry } from "@/lib/database.types";
import { categoryColors, categoryIcons, categoryLabels, colors, fonts, radius, spacing } from "@/lib/theme";

export function ModEntryCard({ entry }: { entry: ModEntry }) {
  const accent = categoryColors[entry.category] ?? colors.primary;

  return (
    <GlassCard radiusSize={radius.md}>
      {entry.photos.length > 0 ? (
        <Image source={{ uri: entry.photos[0] }} style={styles.photo} contentFit="cover" />
      ) : null}
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <View style={[styles.categoryPill, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
            <Ionicons name={(categoryIcons[entry.category] as any) ?? "pricetag"} size={12} color={accent} />
            <Text style={[styles.category, { color: accent }]}>{categoryLabels[entry.category] ?? entry.category}</Text>
          </View>
          <Text style={styles.date}>{new Date(entry.entry_date).toLocaleDateString("fr-FR")}</Text>
        </View>
        <Text style={styles.title}>{entry.title}</Text>
        {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
        {entry.price !== null ? (
          <Text style={styles.price}>{entry.price.toLocaleString("fr-FR")} €</Text>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: "100%",
    height: 140,
  },
  body: {
    padding: spacing.md,
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  category: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
  },
  price: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 14,
    marginTop: 2,
  },
});
