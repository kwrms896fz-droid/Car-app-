import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, fonts, glow, gradients, radius, spacing } from "@/lib/theme";

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
      <Text style={styles.title}>Profil</Text>

      <View style={styles.avatarRow}>
        <View style={[styles.avatarRing, glow(colors.primary, 0.4, 20)]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.textMuted} />
          </View>
        </View>
        <View>
          <Text style={styles.username}>@{profile?.username}</Text>
          <View style={styles.planPill}>
            <View style={[styles.planDot, profile?.is_premium && styles.planDotActive]} />
            <Text style={styles.plan}>{profile?.is_premium ? "Abonné" : "Compte gratuit"}</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => router.push("/(tabs)/profile/paywall")} style={({ pressed }) => pressed && styles.pressed}>
        <LinearGradient colors={gradients.cardGlow} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.upsell}>
          <View style={styles.upsellIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.upsellTitle}>
              {profile?.is_premium ? "Gérer mon abonnement" : "Passer à l'abonnement"}
            </Text>
            <Text style={styles.upsellSubtitle}>
              Véhicules illimités, entretien, IA et communauté sans limite.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </LinearGradient>
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
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
  },
  pressed: {
    opacity: 0.9,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 20,
  },
  planPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textDim,
  },
  planDotActive: {
    backgroundColor: colors.success,
  },
  plan: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textMuted,
    fontSize: 13,
  },
  upsell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}55`,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  upsellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  upsellTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  upsellSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
});
