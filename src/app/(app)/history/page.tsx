"use client";

import { useState, useMemo } from "react";
import { HydrationScore } from "@/types";
import { useHydrationContext } from "@/contexts/hydration-context";
import { formatAmount } from "@/lib/units";
import { calculateHydrationScore } from "@/lib/hydration-score";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const SCORE_TEXT: Record<HydrationScore["level"], string> = {
  excellent: "text-green-600 dark:text-green-300",
  good: "text-blue-600 dark:text-blue-300",
  fair: "text-yellow-600 dark:text-yellow-300",
  poor: "text-red-600 dark:text-red-300",
};

export default function HistoryPage() {
  const { allLogs, profile, loading, unit, dailyGoalMl } = useHydrationContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dailyData = useMemo(() => {
    const grouped = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
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
  }, [allLogs, dailyGoalMl, profile]);

  if (loading) return null;

  const selectedDay = selectedDate ? dailyData.find((d) => d.date === selectedDate) : null;

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-center md:justify-start">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">History</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-4 pb-24 md:pb-8">
        {dailyData.length > 0 && !selectedDate && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Last 7 Days
            </h2>
            <div className="flex items-end gap-1.5 md:gap-3 h-28 md:h-36 px-2">
              {(() => {
                const last7 = dailyData.slice(0, 7).reverse();
                const maxVal = Math.max(dailyGoalMl, ...last7.map((d) => d.total));
                return last7.map((day) => {
                  const height = Math.max((day.total / maxVal) * 100, 4);
                  const goalHeight = (dailyGoalMl / maxVal) * 100;
                  const metGoal = day.total >= dailyGoalMl;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative" style={{ height: "80px" }}>
                        <div
                          className="absolute left-0 right-0 border-t border-dashed border-gray-300 dark:border-gray-600"
                          style={{ bottom: `${goalHeight * 0.8}px` }}
                        />
                        <div
                          className={`absolute bottom-0 left-1 right-1 rounded-t-sm transition-all duration-300 ${
                            metGoal
                              ? "bg-sky-500 dark:bg-sky-400"
                              : "bg-sky-300 dark:bg-sky-700"
                          }`}
                          style={{ height: `${height * 0.8}px` }}
                        />
                      </div>
                      <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                        {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex items-center gap-4 justify-center text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-sky-500 dark:bg-sky-400 inline-block" /> Goal met
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm bg-sky-300 dark:bg-sky-700 inline-block" /> Below goal
              </span>
            </div>
          </div>
        )}

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
                  className="text-sky-500 font-medium p-0 h-11 gap-1"
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
                      className="w-full flex items-center justify-between py-4 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
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
                          <p className={`text-lg font-bold tabular-nums ${SCORE_TEXT[day.score.level]}`}>
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
    </>
  );
}
