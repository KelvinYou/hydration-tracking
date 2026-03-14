"use client";

import { HydrationScore } from "@/types";

interface HydrationScoreDisplayProps {
  score: HydrationScore;
}

export function HydrationScoreDisplay({ score }: HydrationScoreDisplayProps) {
  const getBgColor = () => {
    if (score.total >= 80) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (score.total >= 60) return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    if (score.total >= 40) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  return (
    <div className={`rounded-2xl border p-4 ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Hydration Score
          </p>
          <p className={`text-4xl font-bold ${score.color}`}>{score.total}</p>
          <p className={`text-sm font-semibold ${score.color}`}>{score.label}</p>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Volume: {score.volumeScore}%</p>
          <p>Distribution: {score.distributionScore}%</p>
        </div>
      </div>
    </div>
  );
}
