import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, spacing } from "@/lib/theme";

interface ActionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  accent?: string;
  onPress: () => void;
}

export function ActionRow({ icon, label, subtitle, accent = colors.primary, onPress }: ActionRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={[styles.iconCircle, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 68,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
