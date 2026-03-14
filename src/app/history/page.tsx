"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WaterLog, Profile, HydrationScore } from "@/types";
import { createClient } from "@/lib/supabase-client";
import { isGuestMode, getGuestLogs, getGuestProfile } from "@/lib/guest-storage";
import { formatAmount } from "@/lib/units";
import { calculateHydrationScore } from "@/lib/hydration-score";
import { formatTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const SCORE_TEXT: Record<HydrationScore["level"], string> = {
  excellent: "text-green-600 dark:text-green-400",
  good: "text-blue-600 dark:text-blue-400",
  fair: "text-yellow-600 dark:text-yellow-500",
  poor: "text-red-600 dark:text-red-400",
};

export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const guest = isGuestMode();

      if (guest) {
        setProfile(getGuestProfile() as Partial<Profile>);
        setLogs(getGuestLogs());
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [profileRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const unit = profile?.preferred_unit || "ml";
  const dailyGoalMl = profile?.daily_goal_ml || 2450;

  const dailyData = useMemo(() => {
    const grouped = new Map<string, WaterLog[]>();
    for (const log of logs) {
      const date = new Date(log.logged_at).toISOString().split("T")[0];
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push(log);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayLogs]) => {
        const total = dayLogs.reduce((sum, l) => sum + l.amount_ml, 0);
        const score = calculateHydrationScore(
          dayLogs,
          dailyGoalMl,
          profile?.active_hours_start || "07:00",
          profile?.active_hours_end || "23:00"
        );
        return { date, logs: dayLogs, total, score, goalMet: total >= dailyGoalMl };
      });
  }, [logs, dailyGoalMl, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-2 pb-24">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  const selectedDay = selectedDate ? dailyData.find((d) => d.date === selectedDate) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">History</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
        {dailyData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No history yet</p>
            <p className="text-sm mt-1">Start logging water to see your history</p>
          </div>
        ) : (
          <>
            {selectedDay ? (
              <div className="space-y-4">
                <Button
                  variant="link"
                  onClick={() => setSelectedDate(null)}
                  className="text-blue-500 font-medium p-0 h-11 gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Days
                </Button>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(selectedDay.date + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Total: {formatAmount(selectedDay.total, unit)}</span>
                    <span>
                      Score:{" "}
                      <span className={SCORE_TEXT[selectedDay.score.level]}>
                        {selectedDay.score.total} — {selectedDay.score.label}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {selectedDay.logs
                    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <span className="text-sm text-gray-500 w-20">
                          {formatTime(log.logged_at)}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          +{formatAmount(log.amount_ml, unit)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {dailyData.map((day) => {
                  const progressPct = Math.min((day.total / dailyGoalMl) * 100, 100);
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className="w-full flex items-center justify-between py-4 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatAmount(day.total, unit)} / {formatAmount(dailyGoalMl, unit)}
                        </p>
                        <Progress
                          value={progressPct}
                          className="mt-1.5 **:data-[slot=progress-track]:h-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${SCORE_TEXT[day.score.level]}`}>
                            {day.score.total}
                          </p>
                          <p className="text-xs text-gray-400">{day.score.label}</p>
                        </div>
                        {day.goalMet && (
                          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Goal met">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
        <div className="max-w-lg mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/history" className="flex-1 py-3 flex flex-col items-center text-blue-500" aria-current="page">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link href="/settings" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
