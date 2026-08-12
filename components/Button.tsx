import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, glow, gradients, radius, spacing } from "@/lib/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = "primary", loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        variant === "primary" && !isDisabled && glow(colors.primary, 0.45, 14),
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={gradients.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          <ButtonContent label={label} loading={loading} variant={variant} />
        </LinearGradient>
      ) : (
        <View style={[styles.base, variant === "secondary" && styles.secondary, variant === "ghost" && styles.ghost]}>
          <ButtonContent label={label} loading={loading} variant={variant} />
        </View>
      )}
    </Pressable>
  );
}

function ButtonContent({
  label,
  loading,
  variant,
}: {
  label: string;
  loading?: boolean;
  variant: "primary" | "secondary" | "ghost";
}) {
  if (loading) {
    return <ActivityIndicator color={variant === "primary" ? colors.onNeon : colors.text} />;
  }
  return (
    <Text
      style={[
        styles.label,
        variant === "primary" && styles.labelPrimary,
        variant === "ghost" && styles.labelGhost,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  labelPrimary: {
    color: colors.onNeon,
  },
  labelGhost: {
    color: colors.primary,
  },
});
