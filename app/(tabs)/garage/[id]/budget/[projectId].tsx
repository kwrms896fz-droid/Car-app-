import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import {
  computeProjectTotal,
  createBuildProjectItem,
  deleteBuildProjectItem,
  fetchBuildProjectItems,
  fetchBuildProjects,
  toggleBuildProjectItemDone,
  updateBuildProjectStatus,
} from "@/lib/buildPlanner";
import type { BuildItemCategory, BuildProject, BuildProjectItem, Difficulty } from "@/lib/database.types";
import { categoryColors, categoryLabels, colors, fonts, radius, spacing } from "@/lib/theme";

const itemCategories: BuildItemCategory[] = ["performance", "esthetique", "confort", "main_oeuvre", "autre"];
const itemCategoryLabels: Record<BuildItemCategory, string> = {
  esthetique: categoryLabels.esthetique,
  performance: categoryLabels.performance,
  confort: categoryLabels.confort,
  main_oeuvre: "Main-d'œuvre",
  autre: "Autre",
};
const itemCategoryColors: Record<BuildItemCategory, string> = {
  esthetique: categoryColors.esthetique,
  performance: categoryColors.performance,
  confort: categoryColors.confort,
  main_oeuvre: colors.textMuted,
  autre: colors.textMuted,
};

const difficulties: Difficulty[] = ["facile", "moyen", "difficile"];

export default function BuildProjectDetailScreen() {
  const { id: vehicleId, projectId } = useLocalSearchParams<{ id: string; projectId: string }>();
  const [project, setProject] = useState<BuildProject | null>(null);
  const [items, setItems] = useState<BuildProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<BuildItemCategory>("performance");
  const [price, setPrice] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [projects, projectItems] = await Promise.all([
      fetchBuildProjects(vehicleId),
      fetchBuildProjectItems(projectId),
    ]);
    setProject(projects.find((p) => p.id === projectId) ?? null);
    setItems(projectItems);
  }, [vehicleId, projectId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const total = computeProjectTotal(items);

  const onAddItem = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      const item = await createBuildProjectItem({
        project_id: projectId,
        label: label.trim(),
        category,
        estimated_price: price ? Number(price) : undefined,
        difficulty: difficulty ?? undefined,
      });
      setItems((prev) => [...prev, item]);
      setLabel("");
      setPrice("");
      setDifficulty(null);
      setAdding(false);
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Impossible d'ajouter cette ligne.");
    } finally {
      setSaving(false);
    }
  };

  const onToggleDone = async (item: BuildProjectItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i)));
    await toggleBuildProjectItemDone(item.id, !item.is_done);
  };

  const onDeleteItem = async (item: BuildProjectItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await deleteBuildProjectItem(item.id);
  };

  const onMarkDone = async () => {
    if (!project) return;
    await updateBuildProjectStatus(project.id, "done");
    setProject({ ...project, status: "done" });
  };

  if (!loading && !project) {
    return (
      <Screen>
        <ScreenHeader title="Projet" />
        <Text style={{ color: colors.textMuted }}>Projet introuvable.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={project?.title ?? "Projet"} />

      <GlassCard radiusSize={radius.lg} style={styles.summary}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total estimé</Text>
            <Text style={styles.summaryValue}>{total.toLocaleString("fr-FR")} €</Text>
          </View>
          {project?.target_horsepower ? (
            <View>
              <Text style={styles.summaryLabel}>Objectif</Text>
              <Text style={styles.summaryValueSecondary}>{project.target_horsepower} ch</Text>
            </View>
          ) : null}
        </View>
        {project?.status !== "done" ? (
          <Button label="Marquer le projet comme terminé" variant="ghost" onPress={onMarkDone} />
        ) : null}
      </GlassCard>

      <View style={styles.itemsList}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Pressable onPress={() => onToggleDone(item)} hitSlop={8}>
              <Ionicons
                name={item.is_done ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.is_done ? colors.success : colors.textMuted}
              />
            </Pressable>
            <View style={styles.itemInfo}>
              <View style={styles.itemTopRow}>
                <Text
                  style={[
                    styles.itemLabel,
                    item.is_done && styles.itemLabelDone,
                    { color: item.is_done ? colors.textMuted : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                {item.estimated_price !== null ? (
                  <Text style={styles.itemPrice}>{item.estimated_price.toLocaleString("fr-FR")} €</Text>
                ) : null}
              </View>
              <View style={styles.itemTagsRow}>
                <View
                  style={[
                    styles.categoryPill,
                    { borderColor: `${itemCategoryColors[item.category]}55` },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: itemCategoryColors[item.category] }]}>
                    {itemCategoryLabels[item.category]}
                  </Text>
                </View>
                {item.difficulty ? <Text style={styles.difficultyText}>{item.difficulty}</Text> : null}
              </View>
            </View>
            <Pressable onPress={() => onDeleteItem(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.textDim} />
            </Pressable>
          </View>
        ))}

        {!loading && items.length === 0 && !adding ? (
          <Text style={styles.emptyText}>Aucune ligne pour l'instant.</Text>
        ) : null}
      </View>

      {adding ? (
        <GlassCard radiusSize={radius.lg} style={styles.form}>
          <TextField label="Pièce / prestation" placeholder="Ex. Turbo hybride" value={label} onChangeText={setLabel} />
          <TextField
            label="Prix estimé (€) — optionnel"
            keyboardType="decimal-pad"
            placeholder="Ex. 1800"
            value={price}
            onChangeText={setPrice}
          />
          <View style={styles.chipRow}>
            {itemCategories.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  category === c && { backgroundColor: itemCategoryColors[c], borderColor: itemCategoryColors[c] },
                ]}
              >
                <Text style={[styles.chipText, category === c && { color: colors.onNeon }]}>
                  {itemCategoryLabels[c]}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipRow}>
            {difficulties.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDifficulty(difficulty === d ? null : d)}
                style={[styles.chip, difficulty === d && styles.chipActive]}
              >
                <Text style={[styles.chipText, difficulty === d && { color: colors.onNeon }]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="Ajouter la ligne" onPress={onAddItem} loading={saving} disabled={!label.trim()} />
        </GlassCard>
      ) : (
        <Button label="Ajouter une ligne" variant="secondary" onPress={() => setAdding(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  summaryValue: {
    fontFamily: fonts.displaySemiBold,
    color: colors.cyan,
    fontSize: 26,
  },
  summaryValueSecondary: {
    fontFamily: fonts.displaySemiBold,
    color: colors.text,
    fontSize: 26,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    flexShrink: 1,
  },
  itemLabelDone: {
    textDecorationLine: "line-through",
  },
  itemPrice: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  itemTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: "uppercase",
  },
  difficultyText: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: "capitalize",
  },
  emptyText: {
    color: colors.textMuted,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
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
    fontSize: 12,
    textTransform: "capitalize",
  },
});
