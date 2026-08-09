import { supabase } from "@/lib/supabase";
import type { MaintenanceItem } from "@/lib/database.types";

export async function fetchMaintenanceForVehicle(vehicleId: string): Promise<MaintenanceItem[]> {
  const { data, error } = await supabase
    .from("maintenance_items")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMaintenanceForVehicles(vehicleIds: string[]): Promise<MaintenanceItem[]> {
  if (vehicleIds.length === 0) return [];
  const { data, error } = await supabase
    .from("maintenance_items")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createMaintenanceItem(input: {
  vehicle_id: string;
  kind: MaintenanceItem["kind"];
  label: string;
  due_date?: string;
  due_mileage?: number;
}): Promise<MaintenanceItem> {
  const { data, error } = await supabase.from("maintenance_items").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function markMaintenanceDone(id: string): Promise<void> {
  const { error } = await supabase
    .from("maintenance_items")
    .update({ completed: true, last_done_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw error;
}

export type MaintenanceUrgency = "overdue" | "soon" | "ok" | "none";

export function maintenanceUrgency(item: MaintenanceItem): MaintenanceUrgency {
  if (!item.due_date) return "none";
  const due = new Date(item.due_date);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 30) return "soon";
  return "ok";
}
