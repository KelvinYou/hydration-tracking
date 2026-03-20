"use client";

import { HydrationScore } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HydrationScoreDisplayProps {
  score: HydrationScore;
}

const LEVEL_STYLES: Record<HydrationScore["level"], { bg: string; text: string; badge: string; icon: React.ReactNode }> = {
  excellent: {
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    text: "text-green-600 dark:text-green-300",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  good: {
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-300",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  fair: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-600 dark:text-yellow-300",
    badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  poor: {
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    text: "text-red-600 dark:text-red-300",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
};

export function HydrationScoreDisplay({ score }: HydrationScoreDisplayProps) {
  const styles = LEVEL_STYLES[score.level];

  return (
    <Card className={`ring-0 transition-colors duration-300 ${styles.bg}`}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Hydration Score
            </p>
            <div className={`flex items-center gap-2 mt-0.5 transition-colors duration-300 ${styles.text}`}>
              {styles.icon}
              <p className="text-4xl font-bold leading-none tabular-nums">{score.total}</p>
            </div>
            <Badge className={`mt-1 ${styles.badge} border-0`}>
              {score.label}
            </Badge>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Volume: {score.volumeScore}%</p>
            <p>Distribution: {score.distributionScore}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
