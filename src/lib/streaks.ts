import { WaterLog } from "@/types";

interface StreakResult {
  current: number;
  longest: number;
}

export function calculateStreaks(logs: WaterLog[], dailyGoalMl: number): StreakResult {
  if (logs.length === 0 || dailyGoalMl <= 0) {
    return { current: 0, longest: 0 };
  }

  // Group logs by date
  const dailyTotals = new Map<string, number>();
  for (const log of logs) {
    const date = new Date(log.logged_at).toISOString().split("T")[0];
    dailyTotals.set(date, (dailyTotals.get(date) || 0) + log.amount_ml);
  }

  // Sort dates descending
  const dates = Array.from(dailyTotals.keys()).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return { current: 0, longest: 0 };

  // Calculate current streak (must start from today or yesterday)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let current = 0;
  let longest = 0;
  let streak = 0;

  // Walk all dates to find longest streak
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const total = dailyTotals.get(date) || 0;

    if (total >= dailyGoalMl) {
      // Check if consecutive with previous
      if (i === 0) {
        streak = 1;
      } else {
        const prevDate = dates[i - 1];
        const diff = daysDiff(date, prevDate);
        if (diff === 1) {
          streak++;
        } else {
          streak = 1;
        }
      }
    } else {
      streak = 0;
    }

    longest = Math.max(longest, streak);
  }

  // Calculate current streak starting from today or yesterday
  const startDate = dailyTotals.has(today) && (dailyTotals.get(today) || 0) >= dailyGoalMl
    ? today
    : dailyTotals.has(yesterday) && (dailyTotals.get(yesterday) || 0) >= dailyGoalMl
    ? yesterday
    : null;

  if (startDate) {
    current = 1;
    let checkDate = new Date(startDate);
    while (true) {
      checkDate = new Date(checkDate.getTime() - 86400000);
      const dateStr = checkDate.toISOString().split("T")[0];
      const total = dailyTotals.get(dateStr) || 0;
      if (total >= dailyGoalMl) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, longest };
}

function daysDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(b - a) / 86400000);
}
