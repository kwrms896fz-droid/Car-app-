import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { createBuildProject, createBuildProjectItem } from "@/lib/buildPlanner";
import type { ReliabilityPreference, UsageType } from "@/lib/database.types";
import { fetchPreparationPlan, type Recommendation, type Stage } from "@/lib/recommendations";
import { categoryColors, categoryLabels, colors, fonts, radius, spacing } from "@/lib/theme";

const difficultyColor: Record<Recommendation["difficulty"], string> = {
  facile: colors.success,
  moyen: colors.primary,
  difficile: colors.danger,
};

const usageOptions: { value: UsageType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "piste", label: "Piste" },
  { value: "drift", label: "Drift" },
  { value: "show", label: "Show" },
  { value: "rallye", label: "Rallye" },
];

const reliabilityOptions: { value: ReliabilityPreference; label: string }[] = [
  { value: "fiabilite", label: "Fiabilité avant tout" },
  { value: "equilibre", label: "Équilibré" },
  { value: "performance_max", label: "Performance max" },
];

export default function RecommendationsScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();

  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [usage, setUsage] = useState<UsageType>("daily");
  const [reliability, setReliability] = useState<ReliabilityPreference>("equilibre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[] | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    setStages(null);
    try {
      const plan = await fetchPreparationPlan(vehicleId, objective.trim(), Number(budget) || 0, usage, reliability);
      setStages(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de générer le plan de préparation.");
    } finally {
      setLoading(false);
    }
  };

  const onCreateProject = async () => {
    if (!stages) return;
    setCreatingProject(true);
    try {
      const project = await createBuildProject({
        vehicle_id: vehicleId,
        title: objective.trim() || "Plan de préparation",
      });
      const allRecs = stages.flatMap((s) => s.recommendations);
      for (const rec of allRecs) {
        await createBuildProjectItem({
          project_id: project.id,
          label: rec.title,
          category: rec.category,
          estimated_price: rec.estimated_price,
          difficulty: rec.difficulty,
        });
      }
      router.push(`/(tabs)/garage/${vehicleId}/budget/${project.id}`);
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Impossible de créer le projet.");
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Assistant de préparation" />
      <Text style={styles.subtitle}>
        Décris ton objectif et ton usage, l'IA propose un plan de préparation par étapes adapté à
        ton véhicule et ton budget.
      </Text>

      <GlassCard radiusSize={radius.lg} style={styles.section}>
        <SectionHeader icon="bulb" accent={colors.primary} title="Ton projet" />
        <TextField
          label="Objectif"
          placeholder="Ex. 450 ch, moins de 8 min au Nürburgring, look agressif..."
          multiline
          numberOfLines={2}
          style={{ minHeight: 56, textAlignVertical: "top" }}
          value={objective}
          onChangeText={setObjective}
        />
        <TextField
          label="Budget approximatif (€)"
          keyboardType="number-pad"
          placeholder="Ex. 5000"
          value={budget}
          onChangeText={setBudget}
        />

        <Text style={styles.fieldLabel}>Usage</Text>
        <View style={styles.chipRow}>
          {usageOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setUsage(opt.value)}
              style={[styles.chip, usage === opt.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, usage === opt.value && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Fiabilité souhaitée</Text>
        <View style={styles.chipRow}>
          {reliabilityOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setReliability(opt.value)}
              style={[styles.chip, reliability === opt.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, reliability === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Générer le plan de préparation" onPress={onSubmit} loading={loading} disabled={!objective} />
      </GlassCard>

      {stages && stages.length > 0 ? (
        <>
          {stages.map((stage, si) => (
            <GlassCard key={si} radiusSize={radius.lg} style={styles.section}>
              <SectionHeader icon="layers" accent={colors.cyan} title={`Stage ${si + 1} — ${stage.title}`} />
              <View style={{ gap: spacing.sm }}>
                {stage.recommendations.map((rec, i) => (
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
                    <View style={styles.tagsRow}>
                      <View style={styles.gainPill}>
                        <Ionicons name="trending-up" size={12} color={colors.success} />
                        <Text style={styles.gainText}>{rec.expected_gain}</Text>
                      </View>
                      <Text style={styles.price}>~ {rec.estimated_price.toLocaleString("fr-FR")} €</Text>
                    </View>
                    <View style={styles.riskRow}>
                      <Ionicons name="alert-circle-outline" size={13} color={colors.textDim} />
                      <Text style={styles.riskText}>Fiabilité : {rec.reliability_risk}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </GlassCard>
          ))}

          <Text style={styles.disclaimer}>
            Plan généré par IA à titre indicatif — vérifie toujours les prix, gains et risques
            annoncés auprès d'un professionnel avant d'acheter ou de monter une pièce.
          </Text>

          <Button
            label="Créer un projet budget à partir de ce plan"
            variant="secondary"
            onPress={onCreateProject}
            loading={creatingProject}
          />
        </>
      ) : null}
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
    flexShrink: 1,
  },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: -spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.onNeon,
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
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  gainPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gainText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.success,
    fontSize: 12,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  riskText: {
    color: colors.textDim,
    fontSize: 12,
    flexShrink: 1,
  },
  disclaimer: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
});
