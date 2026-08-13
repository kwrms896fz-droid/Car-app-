import { supabase } from "@/lib/supabase";

export async function generateVehicleVisualization(
  vehicleId: string,
  modifications: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{
    imageUrl?: string;
    error?: string;
  }>("visualize-mods", {
    body: { vehicleId, modifications },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.imageUrl) throw new Error("Aucune image reçue.");
  return data.imageUrl;
}
