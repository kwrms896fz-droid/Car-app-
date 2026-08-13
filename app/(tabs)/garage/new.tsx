import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import type { ImagePickerAsset } from "expo-image-picker";
import { pickImage, uploadVehiclePhoto } from "@/lib/storage";
import { colors, fonts, glow, radius, spacing } from "@/lib/theme";
import { createVehicle } from "@/lib/vehicles";
import type { VehicleType } from "@/lib/database.types";

export default function NewVehicleScreen() {
  const { session } = useAuth();
  const [type, setType] = useState<VehicleType>("voiture");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [horsepower, setHorsepower] = useState("");
  const [mileage, setMileage] = useState("");
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
      let cover_photo_url: string | undefined;
      if (photo) {
        cover_photo_url = await uploadVehiclePhoto(session.user.id, photo);
      }
      const vehicle = await createVehicle({
        owner_id: session.user.id,
        type_vehicule: type,
        brand: brand.trim(),
        model: model.trim(),
        year: year ? Number(year) : undefined,
        horsepower: horsepower ? Number(horsepower) : undefined,
        mileage: mileage ? Number(mileage) : undefined,
        cover_photo_url,
      });
      router.replace(`/(tabs)/garage/${vehicle.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le véhicule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.typeToggle}>
        {(["voiture", "moto"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeOption, type === t && [styles.typeOptionActive, glow(colors.primary, 0.4, 20)]]}
          >
            <Ionicons
              name={t === "moto" ? "bicycle" : "car-sport"}
              size={20}
              color={type === t ? colors.onNeon : colors.textMuted}
            />
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {t === "moto" ? "Moto" : "Voiture"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onPickPhoto} style={styles.photoPicker}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} contentFit="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={28} color={colors.textMuted} />
            <Text style={styles.photoLabel}>Photo de couverture</Text>
          </View>
        )}
      </Pressable>

      <TextField label="Marque" placeholder="Ex. Peugeot" value={brand} onChangeText={setBrand} />
      <TextField label="Modèle" placeholder="Ex. 205 GTI" value={model} onChangeText={setModel} />
      <TextField
        label="Année"
        placeholder="Ex. 1998"
        keyboardType="number-pad"
        value={year}
        onChangeText={setYear}
      />
      <TextField
        label="Puissance (ch)"
        placeholder="Ex. 130"
        keyboardType="number-pad"
        value={horsepower}
        onChangeText={setHorsepower}
      />
      <TextField
        label="Kilométrage — optionnel"
        placeholder="Ex. 85000"
        keyboardType="number-pad"
        value={mileage}
        onChangeText={setMileage}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Créer le véhicule" onPress={onSubmit} loading={loading} disabled={!brand || !model} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeToggle: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textMuted,
  },
  typeLabelActive: {
    color: colors.onNeon,
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
    height: 160,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  photoLabel: {
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
  },
});
