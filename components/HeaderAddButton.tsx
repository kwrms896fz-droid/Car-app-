import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";

import { colors, glow, gradients } from "@/lib/theme";

interface HeaderAddButtonProps {
  onPress: () => void;
}

export function HeaderAddButton({ onPress }: HeaderAddButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [glow(colors.primary, 0.4, 20), pressed && styles.pressed]}>
      <LinearGradient colors={gradients.primaryButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <Ionicons name="add" size={26} color={colors.onNeon} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
