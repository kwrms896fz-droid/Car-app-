import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import {
  checkCompatibility,
  type CompatibilityResult,
  type CompatibilityStatus,
} from "@/lib/compatibility";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const statusConfig: Record<
  CompatibilityStatus,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  compatible: { icon: "checkmark-circle", color: colors.success, label: "Compatible" },
  attention: { icon: "warning", color: colors.categoryTertiary, label: "Nécessite une modification" },
  incompatible: { icon: "close-circle", color: colors.danger, label: "Incompatible" },
  manquant: { icon: "add-circle-outline", color: colors.danger, label: "Pièce manquante" },
};

export default function CompatibilityScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const [engine, setEngine] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await checkCompatibility(vehicleId, question.trim(), engine.trim() || undefined);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'obtenir un avis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Vérificateur de compatibilité" />

      <View style={styles.disclaimerBanner}>
        <Ionicons name="alert-circle" size={20} color={colors.categoryTertiary} />
        <Text style={styles.disclaimerText}>
          Avis généré par IA, pas une base de données technique vérifiée. À confirmer
          systématiquement auprès d'un professionnel ou d'un préparateur spécialisé avant tout
          achat ou montage.
        </Text>
      </View>

      <GlassCard radiusSize={radius.lg} style={styles.section}>
        <TextField
          label="Moteur — optionnel"
          placeholder="Ex. N54, 2.0 TSI EA888..."
          value={engine}
          onChangeText={setEngine}
        />
        <TextField
          label="Pièces à vérifier, ou question libre"
          placeholder="Ex. Turbo GTX2867R + injecteurs 1000cc + intercooler frontal, compatibles ensemble ? Ou : Golf GTI 2018, 60 000 km, je veux 350 ch avec 4000€, par où commencer ?"
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
          value={question}
          onChangeText={setQuestion}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Analyser" onPress={onSubmit} loading={loading} disabled={!question.trim()} />
      </GlassCard>

      {result ? (
        <>
          <GlassCard radiusSize={radius.lg} style={styles.section}>
            <Text style={styles.summaryText}>{result.summary}</Text>
          </GlassCard>

          {result.verdicts.length > 0 ? (
            <View style={styles.verdictsList}>
              {result.verdicts.map((v, i) => {
                const cfg = statusConfig[v.status];
                return (
                  <View key={i} style={[styles.verdictCard, { borderColor: `${cfg.color}55` }]}>
                    <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                    <View style={styles.verdictContent}>
                      <View style={styles.verdictHeader}>
                        <Text style={styles.verdictPart}>{v.part}</Text>
                        <Text style={[styles.verdictStatus, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Text style={styles.verdictExplanation}>{v.explanation}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  disclaimerBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.categoryTertiarySoft,
    borderWidth: 1,
    borderColor: `${colors.categoryTertiary}55`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  disclaimerText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    padding: spacing.md,
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  verdictsList: {
    gap: spacing.sm,
  },
  verdictCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  verdictContent: {
    flex: 1,
    gap: 2,
  },
  verdictHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  verdictPart: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
  },
  verdictStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    textAlign: "right",
  },
  verdictExplanation: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
