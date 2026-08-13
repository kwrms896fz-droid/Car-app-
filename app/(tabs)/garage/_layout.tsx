import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

export default function GarageLayout() {
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
      <Stack.Screen name="new" options={{ title: "Nouveau véhicule", presentation: "modal" }} />
      <Stack.Screen name="[id]/index" options={{ title: "", animation: "fade_from_bottom" }} />
      <Stack.Screen name="[id]/add-entry" options={{ title: "Ajouter une modif", presentation: "modal" }} />
      <Stack.Screen
        name="[id]/recommendations"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="[id]/360" options={{ headerShown: false }} />
    </Stack>
  );
}
