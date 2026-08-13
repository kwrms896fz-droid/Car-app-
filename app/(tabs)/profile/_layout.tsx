import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ title: "Abonnement", presentation: "modal" }} />
    </Stack>
  );
}
