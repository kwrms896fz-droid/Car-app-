import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing } from "@/lib/theme";

export default function LoginScreen() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
      router.replace("/(tabs)/garage");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Carnet Garage</Text>
      <Text style={styles.subtitle}>Connectez-vous pour retrouver votre garage.</Text>

      <TextField
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Se connecter" onPress={onSubmit} loading={loading} disabled={!email || !password} />

      <Link href="/(auth)/signup" style={styles.link}>
        <Text style={styles.linkText}>Pas encore de compte ? Inscrivez-vous</Text>
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
