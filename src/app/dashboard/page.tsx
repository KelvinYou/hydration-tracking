"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydration } from "@/hooks/use-hydration";
import { ProgressRing } from "@/components/progress-ring";
import { QuickAddButtons } from "@/components/quick-add-buttons";
import { LogTimeline } from "@/components/log-timeline";
import { HydrationScoreDisplay } from "@/components/hydration-score-display";
import { formatAmount } from "@/lib/units";
import { isGuestMode } from "@/lib/guest-storage";
import { useReminders } from "@/hooks/use-reminders";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const {
    logs,
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
  } = useHydration();

  useReminders(profile, totalIntake, dailyGoalMl);

  useEffect(() => {
    // Check auth on mount (client-side only)
    if (typeof window === "undefined") return;
    const guest = isGuestMode();
    if (!guest) {
      import("@/lib/supabase-client").then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) router.push("/login");
        });
      });
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const remaining = Math.max(dailyGoalMl - totalIntake, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            HydrateTrack
          </h1>
          <div className="flex items-center gap-3">
            {streaks.current > 0 && (
              <span className="text-sm font-medium text-orange-500">
                🔥 {streaks.current} day{streaks.current !== 1 ? "s" : ""}
              </span>
            )}
            <Link
              href="/settings"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Guest Banner */}
        {isGuest && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span>Data stored locally only</span>
            <Link href="/login" className="font-semibold underline">
              Sign in to sync
            </Link>
          </div>
        )}

        {/* Hydration Score */}
        <HydrationScoreDisplay score={score} />

        {/* Progress Ring */}
        <div className="flex flex-col items-center space-y-2">
          <ProgressRing
            progress={progress}
            label={formatAmount(totalIntake, unit)}
            sublabel={`of ${formatAmount(dailyGoalMl, unit)}`}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {remaining > 0
              ? `${formatAmount(remaining, unit)} remaining`
              : "Goal reached! 🎉"}
          </p>
        </div>

        {/* Quick Add Buttons */}
        <QuickAddButtons unit={unit} onAdd={addLog} />

        {/* Log Timeline */}
        <LogTimeline
          logs={logs}
          unit={unit}
          onDelete={removeLog}
          onEdit={editLog}
        />

        {/* Streak Info */}
        {streaks.longest > 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Longest streak: {streaks.longest} day{streaks.longest !== 1 ? "s" : ""}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
        <div className="max-w-lg mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/history" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link href="/settings" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
