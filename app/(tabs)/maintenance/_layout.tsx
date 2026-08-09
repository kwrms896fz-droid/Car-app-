import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

export default function MaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Entretien" }} />
      <Stack.Screen name="new" options={{ title: "Nouvel entretien", presentation: "modal" }} />
    </Stack>
  );
}
