"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number;
  expectedProgress?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel: string;
}

export function ProgressRing({
  progress,
  expectedProgress,
  size = 200,
  strokeWidth = 12,
  label,
  sublabel,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 50);
    return () => clearTimeout(timer);
  }, [progress]);

  // Trigger celebration pulse when reaching 100%
  useEffect(() => {
    if (progress >= 100 && animatedProgress >= 100) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [progress, animatedProgress]);

  const getColor = () => {
    if (progress >= 100) return "#22c55e"; // green — goal reached
    if (expectedProgress == null || expectedProgress <= 0) {
      // Before active hours or no expected progress — use simple thresholds
      if (progress >= 60) return "#0284c7";
      if (progress >= 30) return "#eab308";
      return "#ef4444";
    }
    // Compare actual vs expected pace
    const paceRatio = progress / expectedProgress;
    if (paceRatio >= 0.9) return "#0284c7";  // blue — on track (within 90%)
    if (paceRatio >= 0.6) return "#eab308";  // yellow — falling behind
    return "#ef4444";                         // red — significantly behind
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        celebrate ? "scale-105" : "scale-100"
      }`}
    >
      {/* Glow effect when goal reached */}
      {progress >= 100 && (
        <div className="absolute inset-0 rounded-full bg-green-400/20 dark:bg-green-400/10 blur-xl" />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
