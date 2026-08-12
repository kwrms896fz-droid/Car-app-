import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/lib/theme";

export default function ProfileScreen() {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
        .eq("id", session.user.id);
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = () => {
    Alert.alert("Se déconnecter", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.textMuted} />
        </View>
        <View>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.plan}>{profile?.is_premium ? "Abonné" : "Compte gratuit"}</Text>
        </View>
      </View>

      <Pressable onPress={() => router.push("/(tabs)/profile/paywall")} style={styles.upsell}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.upsellTitle}>
            {profile?.is_premium ? "Gérer mon abonnement" : "Passer à l'abonnement"}
          </Text>
          <Text style={styles.upsellSubtitle}>
            Véhicules illimités, entretien, IA et communauté sans limite.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <TextField label="Nom affiché" value={displayName} onChangeText={setDisplayName} />
      <TextField
        label="Bio"
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: "top" }}
        value={bio}
        onChangeText={setBio}
      />
      <Button label="Enregistrer" onPress={onSave} loading={saving} variant="secondary" />

      <Button label="Se déconnecter" onPress={onSignOut} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  plan: {
    color: colors.textMuted,
    fontSize: 13,
  },
  upsell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  upsellTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  upsellSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
