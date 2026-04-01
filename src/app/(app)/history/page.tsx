"use client";

import { useState, useMemo } from "react";
import { HydrationScore } from "@/types";
import { useHydrationContext } from "@/contexts/hydration-context";
import { formatAmount } from "@/lib/units";
import { calculateHydrationScore } from "@/lib/hydration-score";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogTimeline } from "@/components/log-timeline";

const SCORE_TEXT: Record<HydrationScore["level"], string> = {
  excellent: "text-green-600 dark:text-green-300",
  good: "text-blue-600 dark:text-blue-300",
  fair: "text-yellow-600 dark:text-yellow-300",
  poor: "text-red-600 dark:text-red-300",
};

const SCORE_BG: Record<HydrationScore["level"], string> = {
  excellent: "bg-green-500 dark:bg-green-400",
  good: "bg-sky-500 dark:bg-sky-400",
  fair: "bg-yellow-500 dark:bg-yellow-400",
  poor: "bg-red-500 dark:bg-red-400",
};

export default function HistoryPage() {
  const { allLogs, profile, loading, unit, dailyGoalMl, editLog, removeLog, addLog } = useHydrationContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dailyData = useMemo(() => {
    const grouped = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const d = new Date(log.logged_at);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  }, [allLogs, dailyGoalMl, profile]);

  if (loading) return null;

  const selectedDay = selectedDate ? dailyData.find((d) => d.date === selectedDate) : null;

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-center md:justify-start">
          <h1 className="text-lg md:text-xl font-bold text-foreground">History</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-24 md:pb-8">

        {/* 7-day chart */}
        {dailyData.length > 0 && !selectedDate && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Last 7 days
            </h2>
            <div className="flex items-end gap-2 h-32">
              {(() => {
                const last7 = dailyData.slice(0, 7).reverse();
                const maxVal = Math.max(dailyGoalMl * 1.2, ...last7.map((d) => d.total));
                return last7.map((day) => {
                  const heightPct = Math.max((day.total / maxVal) * 100, 3);
                  const goalHeightPct = (dailyGoalMl / maxVal) * 100;
                  const metGoal = day.total >= dailyGoalMl;
                  const dayLabel = new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" });
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                      aria-label={`View ${day.date}`}
                    >
                      <div className="w-full relative flex-1" style={{ minHeight: "88px" }}>
                        {/* Goal line */}
                        <div
                          className="absolute left-0 right-0 border-t border-dashed border-border"
                          style={{ bottom: `${goalHeightPct * 0.88}px` }}
                          aria-hidden="true"
                        />
                        {/* Bar */}
                        <div
                          className={`absolute bottom-0 left-0.5 right-0.5 rounded-t-md transition-all duration-200 group-hover:opacity-80 ${
                            metGoal
                              ? "bg-sky-500 dark:bg-sky-400"
                              : "bg-sky-200 dark:bg-sky-800"
                          }`}
                          style={{ height: `${heightPct * 0.88}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        {dayLabel}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-border pt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-sky-500 dark:bg-sky-400 inline-block" /> Goal met
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-sky-200 dark:bg-sky-800 inline-block" /> Below goal
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {dailyData.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <div className="text-4xl mb-3" aria-hidden="true">💧</div>
            <p className="text-base font-semibold text-foreground">No history yet</p>
            <p className="text-sm text-muted-foreground">Start logging water to see your history here.</p>
          </div>
        ) : (
          <>
            {selectedDay ? (
              <div className="space-y-5">
                <Button
                  variant="link"
                  onClick={() => setSelectedDate(null)}
                  className="text-sky-500 font-semibold p-0 h-auto gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Days
                </Button>

                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <h2 className="text-lg font-bold text-foreground">
                    {new Date(selectedDay.date + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      {formatAmount(selectedDay.total, unit)} / {formatAmount(dailyGoalMl, unit)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`w-2 h-2 rounded-full ${SCORE_BG[selectedDay.score.level]}`} aria-hidden="true" />
                      <span className={`font-semibold ${SCORE_TEXT[selectedDay.score.level]}`}>
                        {selectedDay.score.total} — {selectedDay.score.label}
                      </span>
                    </span>
                    {selectedDay.goalMet && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full border border-green-200/60 dark:border-green-800/40">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Goal met
                      </span>
                    )}
                  </div>
                </div>

                <LogTimeline
                  logs={selectedDay.logs}
                  unit={unit}
                  onDelete={removeLog}
                  onEdit={editLog}
                  onAdd={addLog}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {dailyData.map((day) => {
                  const progressPct = Math.min((day.total / dailyGoalMl) * 100, 100);
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className="w-full flex items-center justify-between py-4 px-4 bg-card border border-border/60 rounded-xl hover:bg-muted/40 hover:border-border transition-all duration-150 text-left cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-semibold text-foreground text-sm">
                          {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatAmount(day.total, unit)} / {formatAmount(dailyGoalMl, unit)}
                        </p>
                        <Progress
                          value={progressPct}
                          className="mt-2 **:data-[slot=progress-track]:h-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className={`text-lg font-black tabular-nums leading-none ${SCORE_TEXT[day.score.level]}`}>
                            {day.score.total}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{day.score.label}</p>
                        </div>
                        {day.goalMet ? (
                          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Goal met">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-7 h-7" />
                        )}
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
