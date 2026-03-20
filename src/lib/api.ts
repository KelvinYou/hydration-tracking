import { createClient } from "@/lib/supabase-client";
import { Profile, WaterLog } from "@/types";

function getSupabase() {
  return createClient();
}

async function getUser() {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function fetchProfile(): Promise<Partial<Profile> | null> {
  const user = await getUser();
  if (!user) return null;

  const { data } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function fetchTodayLogs(): Promise<WaterLog[]> {
  const user = await getUser();
  if (!user) return [];

  const now = new Date();
  const startOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const { data } = await getSupabase()
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", startOfLocalDay)
    .order("logged_at", { ascending: true });

  return data ?? [];
}

export async function fetchAllLogs(): Promise<WaterLog[]> {
  const user = await getUser();
  if (!user) return [];

  const { data } = await getSupabase()
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true });

  return data ?? [];
}

export async function insertLog(amountMl: number): Promise<WaterLog> {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await getSupabase()
    .from("water_logs")
    .insert({ user_id: user.id, amount_ml: amountMl })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLog(
  id: string,
  amountMl: number,
  loggedAt?: string
): Promise<WaterLog> {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await getSupabase()
    .from("water_logs")
    .update({ amount_ml: amountMl, ...(loggedAt ? { logged_at: loggedAt } : {}) })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Log not found");
  return data;
}

export async function deleteLog(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("water_logs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function upsertProfile(
  profile: Partial<Profile> & { id: string; email: string }
): Promise<void> {
  const { error } = await getSupabase().from("profiles").upsert(profile);
  if (error) throw error;
}

export async function updateProfile(
  updates: Partial<Profile>
): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await getSupabase()
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;
}

export { getUser };
