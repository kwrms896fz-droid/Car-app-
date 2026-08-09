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

export async function uploadVehiclePhoto(
  userId: string,
  asset: ImagePicker.ImagePickerAsset
): Promise<string> {
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
