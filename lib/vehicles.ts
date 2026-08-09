import { supabase } from "@/lib/supabase";
import type { ModEntry, Vehicle } from "@/lib/database.types";

export async function fetchMyVehicles(ownerId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchVehicle(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createVehicle(input: {
  owner_id: string;
  type_vehicule: Vehicle["type_vehicule"];
  brand: string;
  model: string;
  year?: number;
  cover_photo_url?: string;
}): Promise<Vehicle> {
  const { data, error } = await supabase.from("vehicles").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function fetchModEntries(vehicleId: string): Promise<ModEntry[]> {
  const { data, error } = await supabase
    .from("mod_entries")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("entry_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createModEntry(input: {
  vehicle_id: string;
  category: ModEntry["category"];
  title: string;
  description?: string;
  price?: number;
  photos?: string[];
  entry_date?: string;
}): Promise<ModEntry> {
  const { data, error } = await supabase.from("mod_entries").insert(input).select().single();
  if (error) throw error;
  return data;
}

export function computeBudgetTotal(entries: ModEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.price ?? 0), 0);
}
