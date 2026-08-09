import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { colors, radius, spacing } from "@/lib/theme";

const features = [
  "Véhicules et journal de modifications illimités",
  "Suivi et rappels d'entretien classique",
  "Recommandations IA illimitées",
  "Communauté et page publique personnalisable",
  "Statistiques avancées sur votre garage",
];

export default function PaywallScreen() {
  const onSubscribe = (plan: "monthly" | "yearly") => {
    Alert.alert(
      "Abonnement non configuré",
      "Le paiement via RevenueCat n'est pas encore connecté dans cette version de démonstration. " +
        "Configurez RevenueCat (voir README) pour activer l'abonnement " +
        (plan === "monthly" ? "mensuel" : "annuel") +
        "."
    );
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Carnet Garage Premium</Text>
      <Text style={styles.subtitle}>Le compagnon permanent de votre véhicule.</Text>

      <View style={styles.featureList}>
        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Annuel</Text>
        <Text style={styles.planPrice}>Tarif réduit à l'engagement annuel</Text>
        <Button label="S'abonner à l'année" onPress={() => onSubscribe("yearly")} />
      </View>

      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Mensuel</Text>
        <Text style={styles.planPrice}>Sans engagement</Text>
        <Button label="S'abonner au mois" onPress={() => onSubscribe("monthly")} variant="secondary" />
      </View>

      <Text style={styles.note}>
        En cas de désabonnement, votre historique reste consultable en lecture seule : l'ajout de
        nouvelles entrées, l'IA et la communauté active redeviennent payants.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  planTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  planPrice: {
    color: colors.textMuted,
    fontSize: 13,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
  },
});
