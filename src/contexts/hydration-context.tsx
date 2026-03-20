"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WaterLog, Profile, HydrationScore } from "@/types";
import { isGuestMode } from "@/lib/guest-storage";
import { calculateHydrationScore } from "@/lib/hydration-score";
import { calculateStreaks } from "@/lib/streaks";
import {
  useProfile,
  useTodayLogs,
  useAllLogs,
  useAddLog,
  useRemoveLog,
  useEditLog,
  queryKeys,
} from "@/hooks/use-hydration-queries";

interface HydrationContextValue {
  logs: WaterLog[];
  allLogs: WaterLog[];
  profile: Partial<Profile> | null;
  loading: boolean;
  isGuest: boolean;
  totalIntake: number;
  dailyGoalMl: number;
  unit: "ml" | "oz";
  progress: number;
  score: HydrationScore;
  streaks: { current: number; longest: number };
  addLog: (amountMl: number) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  editLog: (id: string, amountMl: number, loggedAt?: string) => Promise<void>;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const HydrationContext = createContext<HydrationContextValue | null>(null);

export function useHydrationContext() {
  const ctx = useContext(HydrationContext);
  if (!ctx) {
    throw new Error("useHydrationContext must be used within a HydrationProvider");
  }
  return ctx;
}

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [guestChecked, setGuestChecked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsGuest(isGuestMode());
    setGuestChecked(true);
  }, []);

  const profileQuery = useProfile(isGuest);
  const todayLogsQuery = useTodayLogs(isGuest);
  const allLogsQuery = useAllLogs(isGuest);
  const addLogMutation = useAddLog(isGuest);
  const removeLogMutation = useRemoveLog(isGuest);
  const editLogMutation = useEditLog(isGuest);

  const logs = todayLogsQuery.data ?? [];
  const allLogs = allLogsQuery.data ?? [];
  const profile = profileQuery.data ?? null;
  const loading =
    !guestChecked || profileQuery.isLoading || todayLogsQuery.isLoading || allLogsQuery.isLoading;

  const totalIntake = logs.reduce((sum, log) => sum + log.amount_ml, 0);
  const dailyGoalMl = profile?.daily_goal_ml || 2450;
  const unit = profile?.preferred_unit || "ml";
  const progress = Math.min((totalIntake / dailyGoalMl) * 100, 100);

  const score = useMemo(
    () =>
      calculateHydrationScore(
        logs,
        dailyGoalMl,
        profile?.active_hours_start || "07:00",
        profile?.active_hours_end || "23:00"
      ),
    [logs, dailyGoalMl, profile?.active_hours_start, profile?.active_hours_end]
  );

  const streaks = useMemo(
    () => calculateStreaks(allLogs, dailyGoalMl),
    [allLogs, dailyGoalMl]
  );

  const addLog = async (amountMl: number) => {
    await addLogMutation.mutateAsync(amountMl);
  };

  const removeLog = async (id: string) => {
    await removeLogMutation.mutateAsync(id);
  };

  const editLog = async (id: string, amountMl: number, loggedAt?: string) => {
    await editLogMutation.mutateAsync({ id, amountMl, loggedAt });
  };

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    await queryClient.invalidateQueries({ queryKey: queryKeys.todayLogs });
    await queryClient.invalidateQueries({ queryKey: queryKeys.allLogs });
  };

  const updateProfile = (updates: Partial<Profile>) => {
    queryClient.setQueryData<Partial<Profile> | null>(queryKeys.profile, (old) =>
      old ? { ...old, ...updates } : updates
    );
  };

  return (
    <HydrationContext.Provider
      value={{
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
        refetch,
        updateProfile,
      }}
    >
      {children}
    </HydrationContext.Provider>
  );
}
