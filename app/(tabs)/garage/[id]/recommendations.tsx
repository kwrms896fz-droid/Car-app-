import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { categoryLabels, colors, radius, spacing } from "@/lib/theme";
import { fetchRecommendations, type Recommendation } from "@/lib/recommendations";

const difficultyColor: Record<Recommendation["difficulty"], string> = {
  facile: colors.success,
  moyen: colors.primary,
  difficile: colors.danger,
};

export default function RecommendationsScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const recs = await fetchRecommendations(vehicleId, objective.trim(), Number(budget) || 0);
      setResults(recs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de récupérer des recommandations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Recommandations IA</Text>
      <Text style={styles.subtitle}>
        Décrivez votre objectif, l'IA vous propose des pistes de modifications adaptées.
      </Text>

      <TextField
        label="Objectif"
        placeholder="Ex. plus sportif, look plus agressif, plus de confort..."
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: "top" }}
        value={objective}
        onChangeText={setObjective}
      />
      <TextField
        label="Budget approximatif (€)"
        keyboardType="number-pad"
        placeholder="Ex. 1500"
        value={budget}
        onChangeText={setBudget}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Obtenir des recommandations" onPress={onSubmit} loading={loading} disabled={!objective} />

      {results ? (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {results.map((rec, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.category}>{categoryLabels[rec.category] ?? rec.category}</Text>
                <Text style={[styles.difficulty, { color: difficultyColor[rec.difficulty] }]}>
                  {rec.difficulty}
                </Text>
              </View>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.explanation}>{rec.explanation}</Text>
              <Text style={styles.price}>~ {rec.estimated_price.toLocaleString("fr-FR")} €</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  difficulty: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  recTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  explanation: {
    color: colors.textMuted,
    fontSize: 14,
  },
  price: {
    color: colors.text,
    fontWeight: "600",
    marginTop: 4,
  },
});
