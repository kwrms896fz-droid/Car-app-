import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/lib/theme";

interface ScreenHeaderProps {
  title: string;
}

// En-tête custom (chevron retour + titre) pour les écrans où le header natif
// est désactivé afin d'éviter le titre en double avec le contenu de l'écran.
export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    flexShrink: 1,
  },
  spacer: {
    width: 36,
  },
});
