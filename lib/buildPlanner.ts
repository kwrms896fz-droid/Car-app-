import { supabase } from "@/lib/supabase";
import type { BuildProject, BuildProjectItem, ModEntry, PowerLog } from "@/lib/database.types";

export async function fetchPowerLogs(vehicleId: string): Promise<PowerLog[]> {
  const { data, error } = await supabase
    .from("power_logs")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("recorded_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPowerLog(input: {
  vehicle_id: string;
  horsepower: number;
  recorded_date?: string;
  torque_nm?: number;
  source?: PowerLog["source"];
  track_name?: string;
  lap_time_seconds?: number;
  notes?: string;
}): Promise<PowerLog> {
  const { data, error } = await supabase.from("power_logs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export interface PowerTimelinePoint {
  date: string;
  horsepower: number;
  label: string;
  source: "mod" | "log";
}

// Fusionne les entrées du journal (avec puissance renseignée) et les résultats
// banc/piste en une seule timeline chronologique de progression de puissance.
export function buildPowerTimeline(entries: ModEntry[], logs: PowerLog[]): PowerTimelinePoint[] {
  const fromEntries: PowerTimelinePoint[] = entries
    .filter((e) => e.resulting_horsepower !== null)
    .map((e) => ({ date: e.entry_date, horsepower: e.resulting_horsepower!, label: e.title, source: "mod" as const }));

  const fromLogs: PowerTimelinePoint[] = logs.map((l) => ({
    date: l.recorded_date,
    horsepower: l.horsepower,
    label: l.track_name ?? (l.source === "banc" ? "Passage au banc" : "Résultat"),
    source: "log" as const,
  }));

  return [...fromEntries, ...fromLogs].sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchBuildProjects(vehicleId: string): Promise<BuildProject[]> {
  const { data, error } = await supabase
    .from("build_projects")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBuildProject(input: {
  vehicle_id: string;
  title: string;
  target_horsepower?: number;
}): Promise<BuildProject> {
  const { data, error } = await supabase.from("build_projects").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateBuildProjectStatus(
  projectId: string,
  status: BuildProject["status"]
): Promise<void> {
  const { error } = await supabase.from("build_projects").update({ status }).eq("id", projectId);
  if (error) throw error;
}

export async function fetchBuildProjectItems(projectId: string): Promise<BuildProjectItem[]> {
  const { data, error } = await supabase
    .from("build_project_items")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createBuildProjectItem(input: {
  project_id: string;
  label: string;
  category: BuildProjectItem["category"];
  estimated_price?: number;
  difficulty?: BuildProjectItem["difficulty"];
}): Promise<BuildProjectItem> {
  const { data, error } = await supabase.from("build_project_items").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function toggleBuildProjectItemDone(itemId: string, isDone: boolean): Promise<void> {
  const { error } = await supabase.from("build_project_items").update({ is_done: isDone }).eq("id", itemId);
  if (error) throw error;
}

export async function deleteBuildProjectItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("build_project_items").delete().eq("id", itemId);
  if (error) throw error;
}

export function computeProjectTotal(items: BuildProjectItem[]): number {
  return items.reduce((sum, i) => sum + (i.estimated_price ?? 0), 0);
}
