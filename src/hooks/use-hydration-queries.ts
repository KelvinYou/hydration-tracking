"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WaterLog, Profile } from "@/types";
import {
  fetchProfile,
  fetchTodayLogs,
  fetchAllLogs,
  insertLog,
  updateLog as apiUpdateLog,
  deleteLog as apiDeleteLog,
  updateProfile as apiUpdateProfile,
} from "@/lib/api";
import {
  getTodayGuestLogs,
  addGuestLog,
  deleteGuestLog,
  updateGuestLog,
  getGuestProfile,
  getGuestLogs,
} from "@/lib/guest-storage";
import { toast } from "sonner";

function getLocalDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getLocalDayBoundary() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

const todayLogsPrefix = ["water-logs", "today"] as const;

export const queryKeys = {
  profile: ["profile"] as const,
  todayLogs: (date: string) => ["water-logs", "today", date] as const,
  allLogs: ["water-logs", "all"] as const,
};

export function useProfile(isGuest: boolean) {
  return useQuery<Partial<Profile> | null>({
    queryKey: queryKeys.profile,
    queryFn: isGuest
      ? () => getGuestProfile() as Partial<Profile>
      : fetchProfile,
  });
}

export function useTodayLogs(isGuest: boolean) {
  const dateKey = getLocalDateKey();
  const startOfDay = getLocalDayBoundary();

  return useQuery<WaterLog[]>({
    queryKey: queryKeys.todayLogs(dateKey),
    queryFn: isGuest ? () => getTodayGuestLogs() : () => fetchTodayLogs(startOfDay),
  });
}

export function useAllLogs(isGuest: boolean) {
  return useQuery<WaterLog[]>({
    queryKey: queryKeys.allLogs,
    queryFn: isGuest ? () => getGuestLogs() : fetchAllLogs,
  });
}

export function useAddLog(isGuest: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountMl: number) => {
      if (isGuest) {
        return addGuestLog(amountMl);
      }
      return insertLog(amountMl);
    },
    onMutate: async (amountMl: number) => {
      await queryClient.cancelQueries({ queryKey: todayLogsPrefix });
      await queryClient.cancelQueries({ queryKey: queryKeys.allLogs });

      const todayKey = queryKeys.todayLogs(getLocalDateKey());
      const previousTodayLogs = queryClient.getQueryData<WaterLog[]>(todayKey);
      const previousAllLogs = queryClient.getQueryData<WaterLog[]>(queryKeys.allLogs);

      const tempLog: WaterLog = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        user_id: "optimistic",
        amount_ml: amountMl,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<WaterLog[]>(todayKey, (old = []) => [
        ...old,
        tempLog,
      ]);
      queryClient.setQueryData<WaterLog[]>(queryKeys.allLogs, (old = []) => [
        ...old,
        tempLog,
      ]);

      return { previousTodayLogs, previousAllLogs, todayKey, tempLog };
    },
    onError: (_err, _amountMl, context) => {
      if (context) {
        queryClient.setQueryData(context.todayKey, context.previousTodayLogs);
        queryClient.setQueryData(queryKeys.allLogs, context.previousAllLogs);
      }
      toast.error("Failed to log water. Please try again.");
    },
    onSuccess: (data, _amountMl, context) => {
      if (context?.tempLog && data) {
        queryClient.setQueryData<WaterLog[]>(context.todayKey, (old = []) =>
          old.map((l) => (l.id === context.tempLog.id ? data : l))
        );
        queryClient.setQueryData<WaterLog[]>(queryKeys.allLogs, (old = []) =>
          old.map((l) => (l.id === context.tempLog.id ? data : l))
        );
      }
    },
  });
}

export function useRemoveLog(isGuest: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        deleteGuestLog(id);
        return;
      }
      return apiDeleteLog(id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: todayLogsPrefix });
      await queryClient.cancelQueries({ queryKey: queryKeys.allLogs });

      const todayKey = queryKeys.todayLogs(getLocalDateKey());
      const previousTodayLogs = queryClient.getQueryData<WaterLog[]>(todayKey);
      const previousAllLogs = queryClient.getQueryData<WaterLog[]>(queryKeys.allLogs);

      queryClient.setQueryData<WaterLog[]>(todayKey, (old = []) =>
        old.filter((l) => l.id !== id)
      );
      queryClient.setQueryData<WaterLog[]>(queryKeys.allLogs, (old = []) =>
        old.filter((l) => l.id !== id)
      );

      return { previousTodayLogs, previousAllLogs, todayKey };
    },
    onError: (_err, _id, context) => {
      if (context) {
        queryClient.setQueryData(context.todayKey, context.previousTodayLogs);
        queryClient.setQueryData(queryKeys.allLogs, context.previousAllLogs);
      }
      toast.error("Failed to delete log. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todayLogsPrefix });
      queryClient.invalidateQueries({ queryKey: queryKeys.allLogs });
    },
  });
}

export function useEditLog(isGuest: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amountMl,
      loggedAt,
    }: {
      id: string;
      amountMl: number;
      loggedAt?: string;
    }) => {
      if (isGuest) {
        updateGuestLog(id, amountMl, loggedAt);
        return;
      }
      return apiUpdateLog(id, amountMl, loggedAt);
    },
    onMutate: async ({ id, amountMl, loggedAt }) => {
      await queryClient.cancelQueries({ queryKey: todayLogsPrefix });
      await queryClient.cancelQueries({ queryKey: queryKeys.allLogs });

      const todayKey = queryKeys.todayLogs(getLocalDateKey());
      const previousTodayLogs = queryClient.getQueryData<WaterLog[]>(todayKey);
      const previousAllLogs = queryClient.getQueryData<WaterLog[]>(queryKeys.allLogs);

      const updater = (old: WaterLog[] = []) =>
        old.map((l) =>
          l.id === id
            ? { ...l, amount_ml: amountMl, ...(loggedAt ? { logged_at: loggedAt } : {}) }
            : l
        );

      queryClient.setQueryData<WaterLog[]>(todayKey, updater);
      queryClient.setQueryData<WaterLog[]>(queryKeys.allLogs, updater);

      return { previousTodayLogs, previousAllLogs, todayKey };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(context.todayKey, context.previousTodayLogs);
        queryClient.setQueryData(queryKeys.allLogs, context.previousAllLogs);
      }
      toast.error("Failed to update log. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todayLogsPrefix });
      queryClient.invalidateQueries({ queryKey: queryKeys.allLogs });
    },
  });
}

export function useUpdateProfile(isGuest: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (isGuest) {
        const { updateGuestProfile: updateGuest } = await import("@/lib/guest-storage");
        updateGuest(updates);
        return;
      }
      return apiUpdateProfile(updates);
    },
    onMutate: async (updates: Partial<Profile>) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile });

      const previousProfile = queryClient.getQueryData<Partial<Profile> | null>(queryKeys.profile);

      queryClient.setQueryData<Partial<Profile> | null>(queryKeys.profile, (old) =>
        old ? { ...old, ...updates } : updates
      );

      return { previousProfile };
    },
    onError: (_err, _updates, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.profile, context.previousProfile);
      }
      toast.error("Failed to save settings.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
