import { supabase } from "@/lib/supabase";
import type { ModEntry, Profile, Vehicle } from "@/lib/database.types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

export async function fetchFollowerCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  return count ?? 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

export async function follow(followerId: string, followingId: string) {
  const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollow(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw error;
}

export async function fetchLikeCount(modEntryId: string): Promise<number> {
  const { count } = await supabase
    .from("mod_entry_likes")
    .select("*", { count: "exact", head: true })
    .eq("mod_entry_id", modEntryId);
  return count ?? 0;
}

export async function hasLiked(modEntryId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("mod_entry_likes")
    .select("mod_entry_id")
    .eq("mod_entry_id", modEntryId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function like(modEntryId: string, userId: string) {
  const { error } = await supabase.from("mod_entry_likes").insert({ mod_entry_id: modEntryId, user_id: userId });
  if (error) throw error;
}

export async function unlike(modEntryId: string, userId: string) {
  const { error } = await supabase
    .from("mod_entry_likes")
    .delete()
    .eq("mod_entry_id", modEntryId)
    .eq("user_id", userId);
  if (error) throw error;
}

export interface FeedItem {
  entry: ModEntry;
  vehicle: Vehicle;
  owner: Profile;
}

export async function fetchFeed(followerId: string): Promise<FeedItem[]> {
  const { data: followed } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId);

  const followingIds = (followed ?? []).map((f) => f.following_id);
  if (followingIds.length === 0) return [];

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .in("owner_id", followingIds)
    .eq("is_public", true);
  if (!vehicles || vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);
  const { data: entries } = await supabase
    .from("mod_entries")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!entries) return [];

  const { data: owners } = await supabase.from("profiles").select("*").in("id", followingIds);
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const ownerById = new Map((owners ?? []).map((o) => [o.id, o]));

  return entries
    .map((entry) => {
      const vehicle = vehicleById.get(entry.vehicle_id);
      if (!vehicle) return null;
      const owner = ownerById.get(vehicle.owner_id);
      if (!owner) return null;
      return { entry, vehicle, owner };
    })
    .filter((item): item is FeedItem => item !== null);
}

export async function fetchDiscoverVehicles(excludeOwnerId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("is_public", true)
    .neq("owner_id", excludeOwnerId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}
