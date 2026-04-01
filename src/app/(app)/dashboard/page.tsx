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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
      {/* ── Ambient background blobs ─────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-48 -left-32 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.14 230 / 0.12), transparent 70%)",
            animation: "ambient-blob 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-16 -right-24 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.14 195 / 0.10), transparent 70%)",
            animation: "ambient-blob 20s ease-in-out infinite 3s",
          }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.60 0.12 250 / 0.08), transparent 70%)",
            animation: "ambient-blob 24s ease-in-out infinite 8s",
          }}
        />
      </div>

      {/* ── Mobile Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-xl border-b border-border/40 md:hidden">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              style={{ color: "oklch(0.60 0.15 230)" }}>
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <h1 className="text-base font-black tracking-tight text-foreground">HydrateTrack</h1>
          </div>
          <div className="flex items-center gap-1.5">
            {streaks.current > 0 && (
              <Badge
                variant="outline"
                className="gap-1 text-orange-500 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/20 text-xs"
                style={{ animation: "glow-breathe 3s ease-in-out infinite" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
                <span aria-label={`${streaks.current} day streak`}>
                  {streaks.current}d
                </span>
              </Badge>
            )}
            <Link
              href="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Desktop Header ────────────────────────────────────────── */}
      <header className="hidden md:block sticky top-0 z-10 bg-background/75 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-foreground">Dashboard</h2>
          <div className="flex items-center gap-3">
            {streaks.current > 0 && (
              <Badge
                variant="outline"
                className="gap-1.5 text-orange-500 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-32 md:pb-10">
        {/* Guest banner */}
        {isGuest && (
          <div className="db-animate-1 flex items-center justify-between px-4 py-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-800/30 backdrop-blur-sm text-sm text-sky-700 dark:text-sky-300">
            <span>Data stored locally only</span>
            <Link href="/login" className="font-semibold underline text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-200">
              Sign in to sync
            </Link>
          </div>
        )}

        <div className="md:grid md:grid-cols-[1fr_300px] md:gap-10">
          {/* ── Left column ───────────────────────────────────────── */}
          <div className="space-y-7">
            {/* Score — mobile only */}
            <div className="md:hidden db-animate-1">
              <HydrationScoreDisplay score={score} />
            </div>

            {/* Hero: progress ring */}
            <div className="db-animate-2 flex flex-col items-center gap-3 py-4">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                {getGreeting()}
              </p>
              <ProgressRing
                progress={progress}
                expectedProgress={expectedProgress}
                size={260}
                strokeWidth={16}
                label={formatAmount(totalIntake, unit)}
                sublabel={`of ${formatAmount(dailyGoalMl, unit)}`}
              />
              <p className="text-sm text-muted-foreground text-center">
                {remaining > 0 ? (
                  <>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatAmount(remaining, unit)}
                    </span>{" "}
                    remaining to reach your goal
                  </>
                ) : (
                  <span className="font-semibold text-green-500 dark:text-green-400">
                    Goal reached! Keep it up 💧
                  </span>
                )}
              </p>
            </div>

            {/* Rhythm — mobile only */}
            <div className="md:hidden db-animate-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 shadow-sm">
              <HydrationRhythm slots={slots} unit={unit} />
            </div>

            {/* Quick add */}
            <div className="db-animate-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Quick Add
              </p>
              <QuickAddButtons unit={unit} presetsMl={profile?.quick_add_presets_ml} onAdd={handleAddLog} />
            </div>

            {/* Log timeline */}
            <div className="db-animate-5">
              <LogTimeline
                logs={logs}
                unit={unit}
                onDelete={removeLog}
                onEdit={editLog}
                onAdd={addLog}
              />
            </div>
          </div>

          {/* ── Desktop sidebar ───────────────────────────────────── */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-3 db-animate-1">
              {/* Score */}
              <HydrationScoreDisplay score={score} />

              {/* Streaks */}
              {streaks.current > 0 && (
                <div
                  className="rounded-2xl border border-orange-200/40 dark:border-orange-800/25 bg-card/70 backdrop-blur-sm p-4 shadow-sm overflow-hidden relative"
                  style={{ boxShadow: "0 0 0 1px oklch(0.72 0.18 50 / 0.12), 0 4px 20px oklch(0.72 0.18 50 / 0.08)" }}
                >
                  {/* Top gradient line */}
                  <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
                    style={{ background: "linear-gradient(90deg, transparent, oklch(0.72 0.18 50), transparent)" }} />

                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Streaks
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "oklch(0.72 0.18 50 / 0.12)" }}>
                      <svg className="w-5 h-5 text-orange-500 dark:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-foreground tabular-nums leading-none">
                        {streaks.current}
                        <span className="text-sm font-semibold text-muted-foreground ml-1">
                          day{streaks.current !== 1 ? "s" : ""}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Current streak</p>
                    </div>
                  </div>
                  {streaks.longest > streaks.current && (
                    <p className="text-xs text-muted-foreground border-t border-border/40 pt-2.5 mt-3">
                      Longest:{" "}
                      <span className="font-semibold text-foreground">
                        {streaks.longest} day{streaks.longest !== 1 ? "s" : ""}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Rhythm */}
              <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-sm">
                <HydrationRhythm slots={slots} unit={unit} />
              </div>

              {/* Today stats */}
              <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-sm">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Today
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-black text-foreground tabular-nums leading-none">
                      {logs.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Entries</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black tabular-nums leading-none"
                      style={{ color: progress >= 100 ? "#22c55e" : "inherit" }}>
                      {Math.round(progress)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: longest streak footnote */}
        {streaks.longest > 0 && (
          <div className="md:hidden text-center text-xs text-muted-foreground pb-2">
            Longest streak:{" "}
            <span className="font-semibold text-foreground">{streaks.longest} day{streaks.longest !== 1 ? "s" : ""}</span>
          </div>
        )}
      </main>
    </>
  );
}
