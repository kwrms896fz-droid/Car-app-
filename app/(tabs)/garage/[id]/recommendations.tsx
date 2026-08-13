import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import type { Vehicle } from "@/lib/database.types";
import { generateVehicleVisualization } from "@/lib/imageGeneration";
import { fetchRecommendations, type Recommendation } from "@/lib/recommendations";
import { categoryColors, categoryLabels, colors, radius, spacing } from "@/lib/theme";
import { fetchVehicle } from "@/lib/vehicles";

const difficultyColor: Record<Recommendation["difficulty"], string> = {
  facile: colors.success,
  moyen: colors.primary,
  difficile: colors.danger,
};

export default function RecommendationsScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const [mods, setMods] = useState("");
  const [visualizing, setVisualizing] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicle(vehicleId).then(setVehicle);
  }, [vehicleId]);

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

  const onVisualize = async () => {
    setVisualError(null);
    setVisualizing(true);
    setPreviewUrl(null);
    try {
      const url = await generateVehicleVisualization(vehicleId, mods.trim());
      setPreviewUrl(url);
    } catch (e) {
      setVisualError(e instanceof Error ? e.message : "Impossible de générer l'aperçu.");
    } finally {
      setVisualizing(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Recommandation IA</Text>
      <Text style={styles.subtitle}>
        Décrivez votre objectif : l'IA propose des pistes de modifications, puis génère un aperçu
        visuel réaliste du résultat avant de vous lancer.
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

      <GlassCard radiusSize={radius.lg} style={styles.section}>
        <SectionHeader icon="sparkles" accent={colors.cyan} title="Aperçu visuel" />
        <Text style={styles.sectionHint}>
          Jantes, rabaissement, changement de couleur, kit carrosserie, aileron, échappement...
          décrivez les modifications à visualiser.
        </Text>
        <TextField
          label="Modifications souhaitées"
          placeholder="Ex. jantes noires 19', rabaissement 30mm, peinture bleu mat"
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: "top" }}
          value={mods}
          onChangeText={setMods}
        />
        {visualError ? <Text style={styles.error}>{visualError}</Text> : null}
        <Button
          label="Générer l'aperçu"
          variant="secondary"
          onPress={onVisualize}
          loading={visualizing}
          disabled={!mods}
        />

        {visualizing ? (
          <View style={styles.previewLoading}>
            <ActivityIndicator color={colors.cyan} />
            <Text style={styles.previewLoadingText}>Mise en scène dans le garage premium...</Text>
          </View>
        ) : null}

        {previewUrl && vehicle ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: previewUrl }} style={styles.previewImage} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(10,7,19,0.55)", "rgba(10,7,19,0.92)"]}
              style={styles.previewVignette}
              pointerEvents="none"
            />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewObjective}>OBJECTIF</Text>
              <Text style={styles.previewModel}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <View style={styles.previewMetaRow}>
                {vehicle.year ? <Text style={styles.previewMeta}>{vehicle.year}</Text> : null}
                {vehicle.horsepower ? (
                  <>
                    <View style={styles.previewDot} />
                    <Text style={styles.previewMeta}>{vehicle.horsepower} ch</Text>
                  </>
                ) : null}
              </View>
            </View>
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
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
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -spacing.sm,
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
  previewLoading: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  previewLoadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  previewWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cyanSoft,
    minHeight: 260,
  },
  previewImage: {
    width: "100%",
    height: 260,
  },
  previewVignette: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  previewOverlay: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 2,
  },
  previewObjective: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  previewModel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  previewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  previewDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textDim,
  },
});
