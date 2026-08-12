import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

import { supabase } from "@/lib/supabase";

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}

// Sélection de plusieurs photos d'un coup, utilisée pour composer une
// séquence de rotation (vue 360°). L'ordre de sélection donne l'ordre des
// images dans le visualiseur.
export async function pickMultipleImages(): Promise<ImagePicker.ImagePickerAsset[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.6,
    base64: true,
    allowsMultipleSelection: true,
    orderedSelection: true,
    selectionLimit: 24,
  });

  if (result.canceled) return [];
  return result.assets;
}

export async function uploadVehiclePhoto(
  userId: string,
  asset: ImagePicker.ImagePickerAsset
): Promise<string> {
  // Mode démo : pas de backend Supabase — on affiche directement le fichier
  // choisi localement plutôt que de l'envoyer (et de perdre l'URL) en storage.
  if (process.env.EXPO_PUBLIC_PREVIEW === "1") {
    return asset.uri;
  }

  if (!asset.base64) {
    throw new Error("Image sans données base64 — réessayez la sélection.");
  }

  const extension = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("vehicle-photos")
    .upload(path, decode(asset.base64), {
      contentType: asset.mimeType ?? `image/${extension}`,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadVehiclePhotos(
  userId: string,
  assets: ImagePicker.ImagePickerAsset[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const asset of assets) {
    urls.push(await uploadVehiclePhoto(userId, asset));
  }
  return urls;
}
