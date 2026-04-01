"use client";

import { useEffect, useId, useState } from "react";

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
  strokeWidth = 14,
  label,
  sublabel,
}: ProgressRingProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 50);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (progress >= 100 && animatedProgress >= 100) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [progress, animatedProgress]);

  const getColor = () => {
    if (progress >= 100) return "#22c55e";
    if (expectedProgress == null || expectedProgress <= 0) {
      if (progress >= 60) return "#0284c7";
      if (progress >= 30) return "#eab308";
      return "#ef4444";
    }
    const paceRatio = progress / expectedProgress;
    if (paceRatio >= 0.9) return "#0284c7";
    if (paceRatio >= 0.6) return "#eab308";
    return "#ef4444";
  };

  const color = getColor();

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        celebrate ? "scale-105" : "scale-100"
      }`}
    >
      {/* Ambient glow aura behind the ring */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out"
        style={{
          inset: "-25%",
          backgroundColor: color,
          opacity: animatedProgress > 5 ? Math.min(animatedProgress / 100 * 0.18 + 0.04, 0.22) : 0,
        }}
      />

      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <filter id={`${uid}glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          </filter>
          <linearGradient id={`${uid}grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50 dark:text-muted/35"
        />

        {/* Blurred glow arc behind main arc */}
        {animatedProgress > 3 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth + 12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={0.28}
            filter={`url(#${uid}glow)`}
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Main progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${uid}grad)`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Tip dot — bright head of the arc */}
        {animatedProgress > 2 && animatedProgress < 100 && (() => {
          const angle = (animatedProgress / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const dotX = cx + radius * Math.cos(rad);
          const dotY = cy + radius * Math.sin(rad);
          return (
            <circle
              cx={dotX}
              cy={dotY}
              r={strokeWidth / 2.8}
              fill={color}
              className="transition-all duration-700 ease-out"
            />
          );
        })()}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-0.5">
        {/* Water drop icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="mb-0.5 transition-colors duration-500"
          style={{ color }}
          aria-hidden="true"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        <span className="text-[2rem] font-black text-foreground tabular-nums leading-none tracking-tight">
          {label}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
          {sublabel}
        </span>
        {animatedProgress > 0 && (
          <span
            className="text-xs font-bold tabular-nums mt-1 transition-colors duration-500"
            style={{ color }}
          >
            {Math.round(Math.min(progress, 100))}%
          </span>
        )}
      </div>
    </div>
  );
}
