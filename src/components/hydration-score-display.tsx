"use client";

import { HydrationScore } from "@/types";

interface HydrationScoreDisplayProps {
  score: HydrationScore;
}

const LEVEL_CONFIG: Record<
  HydrationScore["level"],
  { accent: string; glow: string; badge: string; label: string }
> = {
  excellent: {
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    label: "Excellent",
  },
  good: {
    accent: "#0284c7",
    glow: "rgba(2,132,199,0.15)",
    badge: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
    label: "Good",
  },
  fair: {
    accent: "#eab308",
    glow: "rgba(234,179,8,0.15)",
    badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
    label: "Fair",
  },
  poor: {
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    label: "Poor",
  },
};

export function HydrationScoreDisplay({ score }: HydrationScoreDisplayProps) {
  const isEmpty = score.total === 0 && score.volumeScore === 0 && score.distributionScore === 0;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-sm">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Hydration Score
        </p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-5xl font-black tabular-nums text-muted-foreground/40 leading-none">
              —
            </span>
            <p className="text-xs text-muted-foreground mt-2">Log a drink to start</p>
          </div>
          <div className="text-right space-y-1.5">
            <ScoreBar label="Volume" value={0} />
            <ScoreBar label="Rhythm" value={0} />
          </div>
        </div>
      </div>
    );
  }

  const cfg = LEVEL_CONFIG[score.level];

  return (
    <div
      className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-sm overflow-hidden relative transition-all duration-500"
      style={{ boxShadow: `0 0 0 1px ${cfg.accent}20, 0 4px 24px ${cfg.glow}` }}
    >
      {/* Subtle color accent at top */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl transition-colors duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }}
      />

      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
        Hydration Score
      </p>

      <div className="flex items-end justify-between gap-3">
        <div>
          <span
            className="text-5xl font-black tabular-nums leading-none transition-colors duration-500"
            style={{ color: cfg.accent }}
          >
            {score.total}
          </span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}
            >
              {score.label}
            </span>
          </div>
        </div>

        <div className="space-y-2 pb-0.5 shrink-0">
          <ScoreBar label="Volume" value={score.volumeScore} color={cfg.accent} />
          <ScoreBar label="Rhythm" value={score.distributionScore} color={cfg.accent} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-12 text-right leading-none">
        {label}
      </span>
      <div className="w-16 h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            background: color ?? "currentColor",
            opacity: color ? 1 : 0.3,
          }}
        />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground tabular-nums w-7 leading-none">
        {value}%
      </span>
    </div>
  );
}
