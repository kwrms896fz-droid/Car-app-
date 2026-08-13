import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import {
  createBuildProject,
  fetchBuildProjectItems,
  fetchBuildProjects,
} from "@/lib/buildPlanner";
import type { BuildProject } from "@/lib/database.types";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const statusLabel: Record<BuildProject["status"], string> = {
  draft: "Brouillon",
  in_progress: "En cours",
  done: "Terminé",
};

const statusColor: Record<BuildProject["status"], string> = {
  draft: colors.textMuted,
  in_progress: colors.primary,
  done: colors.success,
};

export default function BudgetProjectsScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const [projects, setProjects] = useState<BuildProject[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [targetHp, setTargetHp] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchBuildProjects(vehicleId);
    setProjects(list);
    const items = await Promise.all(list.map((p) => fetchBuildProjectItems(p.id)));
    const nextTotals: Record<string, number> = {};
    list.forEach((p, i) => {
      nextTotals[p.id] = items[i].reduce((sum, item) => sum + (item.estimated_price ?? 0), 0);
    });
    setTotals(nextTotals);
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const project = await createBuildProject({
        vehicle_id: vehicleId,
        title: title.trim(),
        target_horsepower: targetHp ? Number(targetHp) : undefined,
      });
      setTitle("");
      setTargetHp("");
      setCreating(false);
      router.push(`/(tabs)/garage/${vehicleId}/budget/${project.id}`);
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Impossible de créer le projet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Budget & Projets" />
      <Text style={styles.subtitle}>
        Construis ton projet ligne par ligne — pièces, prix estimés, budget total, comparé à ton
        objectif de puissance.
      </Text>

      {projects.map((project) => (
        <GlassCard
          key={project.id}
          radiusSize={radius.lg}
          style={styles.projectCard}
        >
          <View style={styles.projectCardInner} onTouchEnd={() => router.push(`/(tabs)/garage/${vehicleId}/budget/${project.id}`)}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <View style={[styles.statusPill, { borderColor: `${statusColor[project.status]}55` }]}>
                <Text style={[styles.statusText, { color: statusColor[project.status] }]}>
                  {statusLabel[project.status]}
                </Text>
              </View>
            </View>
            <View style={styles.projectMetaRow}>
              <Text style={styles.projectMeta}>
                {(totals[project.id] ?? 0).toLocaleString("fr-FR")} € estimés
              </Text>
              {project.target_horsepower ? (
                <Text style={styles.projectMeta}>Objectif {project.target_horsepower} ch</Text>
              ) : null}
            </View>
          </View>
        </GlassCard>
      ))}

      {!loading && projects.length === 0 && !creating ? (
        <View style={styles.empty}>
          <Ionicons name="calculator-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aucun projet pour l'instant.</Text>
        </View>
      ) : null}

      {creating ? (
        <GlassCard radiusSize={radius.lg} style={styles.form}>
          <TextField
            label="Nom du projet"
            placeholder="Ex. Objectif 450 ch"
            value={title}
            onChangeText={setTitle}
          />
          <TextField
            label="Puissance cible (ch) — optionnel"
            placeholder="Ex. 450"
            keyboardType="number-pad"
            value={targetHp}
            onChangeText={setTargetHp}
          />
          <Button label="Créer le projet" onPress={onCreate} loading={saving} disabled={!title.trim()} />
        </GlassCard>
      ) : (
        <Button label="Nouveau projet" variant="secondary" onPress={() => setCreating(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  projectCard: {
    padding: 0,
  },
  projectCardInner: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  projectTitle: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 17,
    flexShrink: 1,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  projectMetaRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  projectMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
