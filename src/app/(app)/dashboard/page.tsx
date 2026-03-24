"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useHydrationContext } from "@/contexts/hydration-context";
import { ProgressRing } from "@/components/progress-ring";
import { QuickAddButtons } from "@/components/quick-add-buttons";
import { LogTimeline } from "@/components/log-timeline";
import { HydrationScoreDisplay } from "@/components/hydration-score-display";
import { formatAmount } from "@/lib/units";
import { getExpectedProgress, getHydrationSlots } from "@/lib/hydration-score";
import { HydrationRhythm } from "@/components/hydration-rhythm";
import { useReminders } from "@/hooks/use-reminders";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  } = useHydrationContext();

  useReminders(profile, totalIntake, dailyGoalMl);

  const activeStart = profile?.active_hours_start || "07:00";
  const activeEnd = profile?.active_hours_end || "23:00";

  const [expectedProgress, setExpectedProgress] = useState(() =>
    getExpectedProgress(activeStart, activeEnd)
  );
  const [slots, setSlots] = useState(() =>
    getHydrationSlots(logs, dailyGoalMl, activeStart, activeEnd)
  );

  // Update expected progress and slots every minute so time-based UI stays current
  useEffect(() => {
    const update = () => {
      setExpectedProgress(getExpectedProgress(activeStart, activeEnd));
      setSlots(getHydrationSlots(logs, dailyGoalMl, activeStart, activeEnd));
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [activeStart, activeEnd, logs, dailyGoalMl]);

  const goalReachedRef = useRef(false);
  const prevStreakRef = useRef<number | null>(null);
  const prevScoreLevelRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && progress >= 100 && !goalReachedRef.current) {
      goalReachedRef.current = true;
      toast.success("Daily goal reached!", { description: "Great job staying hydrated!" });
    }
    if (progress < 100) {
      goalReachedRef.current = false;
    }
  }, [progress, loading]);

  useEffect(() => {
    if (loading || !streaks) return;
    const prev = prevStreakRef.current;
    prevStreakRef.current = streaks.current;
    if (prev === null) return;
    const milestones = [3, 7, 14, 30, 60, 100];
    for (const m of milestones) {
      if (streaks.current >= m && prev < m) {
        toast.success(`${m}-day streak!`, { description: "You're on fire! Keep it up!" });
        break;
      }
    }
  }, [streaks, loading]);

  useEffect(() => {
    if (loading || !score) return;
    const prev = prevScoreLevelRef.current;
    prevScoreLevelRef.current = score.level;
    if (prev === null) return;
    const levels = ["poor", "fair", "good", "excellent"];
    const prevIdx = levels.indexOf(prev);
    const currIdx = levels.indexOf(score.level);
    if (currIdx > prevIdx) {
      toast.success(`Level up: ${score.label}!`, { description: "Your hydration score improved!" });
    }
  }, [score, loading]);

  const handleAddLog = useCallback(
    (amountMl: number) => {
      addLog(amountMl);
      toast(`+${formatAmount(amountMl, unit)}`, { description: "Water logged" });
    },
    [addLog, unit]
  );

  useEffect(() => {
    if (!loading && !isGuest && !profile) {
      router.push("/onboarding");
    }
  }, [loading, isGuest, profile, router]);

  if (loading) return null;

  const remaining = Math.max(dailyGoalMl - totalIntake, 0);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 md:hidden">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            HydrateTrack
          </h1>
          <div className="flex items-center gap-1">
            {streaks.current > 0 && (
              <Badge variant="outline" className="gap-1 text-orange-500 border-orange-200 dark:border-orange-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
                <span aria-label={`${streaks.current} day streak`}>
                  {streaks.current} day{streaks.current !== 1 ? "s" : ""}
                </span>
              </Badge>
            )}
            <Link
              href="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <div className="flex items-center gap-3">
            {streaks.current > 0 && (
              <Badge variant="outline" className="gap-1 text-orange-500 border-orange-200 dark:border-orange-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
                <span aria-label={`${streaks.current} day streak`}>
                  {streaks.current} day{streaks.current !== 1 ? "s" : ""}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-32 md:pb-8">
        {isGuest && (
          <Alert className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
            <AlertDescription className="flex items-center justify-between text-sky-700 dark:text-sky-300">
              <span>Data stored locally only</span>
              <Link href="/login" className="font-semibold underline text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200">
                Sign in to sync
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="md:grid md:grid-cols-[1fr_320px] md:gap-10">
          <div className="space-y-6">
            <div className="md:hidden">
              <HydrationScoreDisplay score={score} />
            </div>

            <div className="flex flex-col items-center space-y-2">
              <ProgressRing
                progress={progress}
                expectedProgress={expectedProgress}
                label={formatAmount(totalIntake, unit)}
                sublabel={`of ${formatAmount(dailyGoalMl, unit)}`}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {remaining > 0
                  ? `${formatAmount(remaining, unit)} remaining`
                  : "Goal reached!"}
              </p>
            </div>

            <div className="md:hidden">
              <HydrationRhythm slots={slots} unit={unit} />
            </div>

            <QuickAddButtons unit={unit} presetsMl={profile?.quick_add_presets_ml} onAdd={handleAddLog} />

            <LogTimeline
              logs={logs}
              unit={unit}
              onDelete={removeLog}
              onEdit={editLog}
              onAdd={addLog}
            />
          </div>

          <div className="hidden md:block space-y-4">
            <div className="sticky top-24">
              <div className="space-y-4">
                <HydrationScoreDisplay score={score} />

                {streaks.current > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Streaks
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                          {streaks.current} day{streaks.current !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current streak</p>
                      </div>
                    </div>
                    {streaks.longest > streaks.current && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Longest: {streaks.longest} day{streaks.longest !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <HydrationRhythm slots={slots} unit={unit} />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Today
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {logs.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {Math.round(progress)}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {streaks.longest > 0 && (
          <div className="md:hidden text-center text-sm text-gray-500 dark:text-gray-400">
            Longest streak: {streaks.longest} day{streaks.longest !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}
