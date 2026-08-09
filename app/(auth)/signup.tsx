import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing } from "@/lib/theme";

export default function SignupScreen() {
  const { signUpWithPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password, username.trim());
      router.replace("/(tabs)/garage");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez la communauté et créez votre garage.</Text>

      <TextField label="Pseudo" autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextField
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label="S'inscrire"
        onPress={onSubmit}
        loading={loading}
        disabled={!email || !password || !username}
      />

      <Link href="/(auth)/login" style={styles.link}>
        <Text style={styles.linkText}>Déjà un compte ? Connectez-vous</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
  },
  link: {
    marginTop: spacing.md,
    alignSelf: "center",
  },
  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
