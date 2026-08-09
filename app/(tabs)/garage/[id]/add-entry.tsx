import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import type { ImagePickerAsset } from "expo-image-picker";
import { pickImage, uploadVehiclePhoto } from "@/lib/storage";
import { categoryLabels, colors, radius, spacing } from "@/lib/theme";
import { createModEntry } from "@/lib/vehicles";
import type { ModCategory } from "@/lib/database.types";

const categories = Object.keys(categoryLabels) as ModCategory[];

export default function AddEntryScreen() {
  const { id: vehicleId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [category, setCategory] = useState<ModCategory>("esthetique");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickPhoto = async () => {
    const asset = await pickImage();
    if (asset) setPhoto(asset);
  };

  const onSubmit = async () => {
    if (!session) return;
    setError(null);
    setLoading(true);
    try {
      let photos: string[] = [];
      if (photo) {
        photos = [await uploadVehiclePhoto(session.user.id, photo)];
      }
      await createModEntry({
        vehicle_id: vehicleId,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        price: price ? Number(price) : undefined,
        photos,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer cette entrée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>
              {categoryLabels[c]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={onPickPhoto} style={styles.photoPicker}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} contentFit="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoLabel}>Ajouter une photo</Text>
          </View>
        )}
      </Pressable>

      <TextField label="Titre" placeholder="Ex. Jantes 18 pouces" value={title} onChangeText={setTitle} />
      <TextField
        label="Description"
        placeholder="Détails, référence, sensations..."
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" }}
        value={description}
        onChangeText={setDescription}
      />
      <TextField
        label="Prix payé (€)"
        keyboardType="decimal-pad"
        placeholder="Ex. 850"
        value={price}
        onChangeText={setPrice}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Enregistrer" onPress={onSubmit} loading={loading} disabled={!title} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "#151515",
  },
  photoPicker: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 160,
  },
  photoPlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: {
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
  },
});
