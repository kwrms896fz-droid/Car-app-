import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { fetchRecommendations, type Recommendation } from "@/lib/recommendations";
import { categoryColors, categoryLabels, colors, fonts, radius, spacing } from "@/lib/theme";

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
      <ScreenHeader title="Recommandation IA" />
      <Text style={styles.subtitle}>
        Décrivez votre objectif, l'IA propose des pistes de modifications adaptées à votre
        véhicule et à votre budget.
      </Text>

      <GlassCard radiusSize={radius.lg} style={styles.section}>
        <SectionHeader icon="bulb" accent={colors.primary} title="Pistes de modifications" />
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
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {results.map((rec, i) => (
              <View key={i} style={styles.recCard}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.category, { color: categoryColors[rec.category] ?? colors.primary }]}>
                    {categoryLabels[rec.category] ?? rec.category}
                  </Text>
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
      </GlassCard>
    </Screen>
  );
}

function SectionHeader({
  icon,
  title,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  accent: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  section: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  error: {
    color: colors.danger,
  },
  recCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
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
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  difficulty: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  recTitle: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  explanation: {
    color: colors.textMuted,
    fontSize: 14,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    marginTop: 4,
  },
});
