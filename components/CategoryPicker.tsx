import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { categoryColors, categoryIcons, categoryLabels, colors, fonts, glow, radius, spacing } from "@/lib/theme";
import type { ModCategory } from "@/lib/database.types";

const categories = Object.keys(categoryLabels) as ModCategory[];

interface CategoryPickerProps {
  value: ModCategory;
  onChange: (category: ModCategory) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <View style={styles.row}>
      {categories.map((c) => (
        <CategoryTile key={c} category={c} selected={value === c} onPress={() => onChange(c)} />
      ))}
    </View>
  );
}

function CategoryTile({
  category,
  selected,
  onPress,
}: {
  category: ModCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const accent = categoryColors[category] ?? colors.primary;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selected, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.05)", `${accent}26`],
  });
  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, accent],
  });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Pressable onPress={onPress} style={styles.tileWrap}>
      <Animated.View
        style={[
          styles.tile,
          { backgroundColor, borderColor, transform: [{ scale }] },
          selected && glow(accent, 0.4, 20),
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: selected ? accent : "rgba(255,255,255,0.08)" }]}>
          <Ionicons
            name={(categoryIcons[category] as any) ?? "pricetag"}
            size={22}
            color={selected ? colors.onNeon : colors.textMuted}
          />
        </View>
        <Text style={[styles.label, { color: selected ? colors.text : colors.textMuted }]}>
          {categoryLabels[category]}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tileWrap: {
    flex: 1,
  },
  tile: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
