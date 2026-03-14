"use client";

import { useState, useEffect, useCallback } from "react";
import { WaterLog, Profile } from "@/types";
import { createClient } from "@/lib/supabase-client";
import {
  isGuestMode,
  getTodayGuestLogs,
  addGuestLog,
  deleteGuestLog,
  updateGuestLog,
  getGuestProfile,
  getGuestLogs,
} from "@/lib/guest-storage";
import { calculateHydrationScore } from "@/lib/hydration-score";
import { calculateStreaks } from "@/lib/streaks";

export function useHydration() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [allLogs, setAllLogs] = useState<WaterLog[]>([]);
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchData = useCallback(async () => {
    const guest = isGuestMode();
    setIsGuest(guest);

    if (guest) {
      setProfile(getGuestProfile() as Partial<Profile>);
      setLogs(getTodayGuestLogs());
      setAllLogs(getGuestLogs());
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [profileRes, todayLogsRes, allLogsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", new Date().toISOString().split("T")[0])
        .order("logged_at", { ascending: true }),
      supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (todayLogsRes.data) setLogs(todayLogsRes.data);
    if (allLogsRes.data) setAllLogs(allLogsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLog = useCallback(
    async (amountMl: number) => {
      if (isGuest) {
        const log = addGuestLog(amountMl);
        setLogs((prev) => [...prev, log]);
        setAllLogs((prev) => [...prev, log]);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic update
      const tempLog: WaterLog = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        user_id: user.id,
        amount_ml: amountMl,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setLogs((prev) => [...prev, tempLog]);
      setAllLogs((prev) => [...prev, tempLog]);

      const { data } = await supabase
        .from("water_logs")
        .insert({ user_id: user.id, amount_ml: amountMl })
        .select()
        .single();

      if (data) {
        setLogs((prev) => prev.map((l) => (l.id === tempLog.id ? data : l)));
        setAllLogs((prev) => prev.map((l) => (l.id === tempLog.id ? data : l)));
      }
    },
    [isGuest]
  );

  const removeLog = useCallback(
    async (id: string) => {
      // Optimistic update
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setAllLogs((prev) => prev.filter((l) => l.id !== id));

      if (isGuest) {
        deleteGuestLog(id);
        return;
      }

      const supabase = createClient();
      await supabase.from("water_logs").delete().eq("id", id);
    },
    [isGuest]
  );

  const editLog = useCallback(
    async (id: string, amountMl: number, loggedAt?: string) => {
      // Optimistic update
      setLogs((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, amount_ml: amountMl, ...(loggedAt ? { logged_at: loggedAt } : {}) } : l
        )
      );
      setAllLogs((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, amount_ml: amountMl, ...(loggedAt ? { logged_at: loggedAt } : {}) } : l
        )
      );

      if (isGuest) {
        updateGuestLog(id, amountMl, loggedAt);
        return;
      }

      const supabase = createClient();
      await supabase
        .from("water_logs")
        .update({ amount_ml: amountMl, ...(loggedAt ? { logged_at: loggedAt } : {}) })
        .eq("id", id);
    },
    [isGuest]
  );

  const totalIntake = logs.reduce((sum, log) => sum + log.amount_ml, 0);
  const dailyGoalMl = profile?.daily_goal_ml || 2450;
  const unit = profile?.preferred_unit || "ml";
  const progress = Math.min((totalIntake / dailyGoalMl) * 100, 100);

  const score = calculateHydrationScore(
    logs,
    dailyGoalMl,
    profile?.active_hours_start || "07:00",
    profile?.active_hours_end || "23:00"
  );

  const streaks = calculateStreaks(allLogs, dailyGoalMl);

  return {
    logs,
    allLogs,
    profile,
    loading,
    isGuest,
    totalIntake,
    dailyGoalMl,
    unit,
    progress,
    score,
    streaks,
    addLog,
    removeLog,
    editLog,
    refetch: fetchData,
  };
}
