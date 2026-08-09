import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import type { ModEntry } from "@/lib/database.types";
import { categoryLabels, colors, radius, spacing } from "@/lib/theme";

export function ModEntryCard({ entry }: { entry: ModEntry }) {
  return (
    <View style={styles.card}>
      {entry.photos.length > 0 ? (
        <Image source={{ uri: entry.photos[0] }} style={styles.photo} contentFit="cover" />
      ) : null}
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.category}>{categoryLabels[entry.category] ?? entry.category}</Text>
          <Text style={styles.date}>
            {new Date(entry.entry_date).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <Text style={styles.title}>{entry.title}</Text>
        {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
        {entry.price !== null ? (
          <Text style={styles.price}>{entry.price.toLocaleString("fr-FR")} €</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 140,
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
  },
  price: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
});
