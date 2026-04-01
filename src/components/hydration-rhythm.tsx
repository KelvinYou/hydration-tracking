"use client";

import { useMemo } from "react";
import { HydrationSlot, UnitPreference } from "@/types";
import { formatAmount } from "@/lib/units";
import { cn } from "@/lib/utils";

interface HydrationRhythmProps {
  slots: HydrationSlot[];
  unit: UnitPreference;
}

function getNudgeMessage(slots: HydrationSlot[]): string {
  const currentSlot = slots.find((s) => s.isCurrent);
  if (!currentSlot) {
    const allPast = slots.every((s) => s.isPast);
    if (allPast) {
      const filledCount = slots.filter((s) => s.ratio >= 0.8).length;
      return filledCount >= 6
        ? "Great distribution today!"
        : "Day's over — try to spread intake more evenly tomorrow";
    }
    return "Your active hours haven't started yet";
  }

  const pastSlots = slots.filter((s) => s.isPast);
  const missedSlots = pastSlots.filter((s) => s.ratio < 0.5);

  if (missedSlots.length === 0 && currentSlot.ratio >= 0.5) {
    return "You're on track — keep it up!";
  }

  const nextSlot = slots.find((s) => !s.isPast && !s.isCurrent);
  if (nextSlot && currentSlot.ratio < 0.5) {
    return `Drink up — aim to hydrate before ${nextSlot.label}`;
  }

  if (missedSlots.length >= 2) {
    return "A few gaps today — try smaller, more frequent sips";
  }

  return "Keep sipping steadily through the day";
}

function getBarGradient(slot: HydrationSlot): string {
  const isFilled = slot.ratio >= 0.8;
  const isPartial = slot.ratio > 0 && slot.ratio < 0.8;

  if (isFilled) {
    return "linear-gradient(to top, oklch(0.58 0.18 145), oklch(0.72 0.20 148))";
  }
  if (isPartial) {
    if (slot.isCurrent) {
      return "linear-gradient(to top, oklch(0.52 0.17 230), oklch(0.68 0.17 225))";
    }
    if (slot.isPast) {
      return "linear-gradient(to top, oklch(0.52 0.14 230 / 0.55), oklch(0.65 0.14 225 / 0.65))";
    }
    return "linear-gradient(to top, oklch(0.52 0.14 230 / 0.40), oklch(0.65 0.14 225 / 0.50))";
  }
  if (slot.isPast) {
    return "linear-gradient(to top, oklch(0.50 0.01 230 / 0.25), oklch(0.60 0.01 230 / 0.35))";
  }
  return "linear-gradient(to top, oklch(0.50 0.01 230 / 0.12), oklch(0.60 0.01 230 / 0.18))";
}

export function HydrationRhythm({ slots, unit }: HydrationRhythmProps) {
  const nudge = useMemo(() => getNudgeMessage(slots), [slots]);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Daily Rhythm
      </h3>
      <div
        className="flex items-end gap-1.5 sm:gap-2 h-20"
        role="img"
        aria-label="Hydration distribution across 8 time slots"
      >
        {slots.map((slot) => (
          <SlotBar key={slot.index} slot={slot} unit={unit} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center leading-snug">{nudge}</p>
    </div>
  );
}

function SlotBar({ slot, unit }: { slot: HydrationSlot; unit: UnitPreference }) {
  const heightPercent = Math.max(slot.ratio * 100, 5);
  const gradient = getBarGradient(slot);

  return (
    <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
      <div className="relative w-full h-16 flex items-end">
        {/* Glow ring for current slot */}
        {slot.isCurrent && (
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-lg pointer-events-none"
            style={{
              height: `${heightPercent}%`,
              background: "oklch(0.62 0.17 228 / 0.20)",
              filter: "blur(4px)",
              transform: "scaleX(1.5)",
            }}
          />
        )}
        <div
          className={cn(
            "w-full rounded-t-lg transition-all duration-500 ease-out relative",
            slot.isCurrent && "ring-1 ring-sky-400/50 ring-offset-1 ring-offset-background"
          )}
          style={{
            height: `${heightPercent}%`,
            background: gradient,
          }}
          title={`${slot.label}: ${formatAmount(slot.intakeMl, unit)} / ${formatAmount(slot.expectedMl, unit)}`}
          aria-hidden="true"
        />
        {/* Pulse dot on current slot */}
        {slot.isCurrent && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        )}
      </div>
      <span
        className={cn(
          "text-[10px] sm:text-[11px] leading-tight tabular-nums w-full text-center whitespace-nowrap",
          slot.isCurrent
            ? "font-semibold text-sky-500 dark:text-sky-400"
            : "text-muted-foreground/60"
        )}
      >
        {slot.label.replace(/ (AM|PM)/, (_, p) => (p === "AM" ? "A" : "P"))}
      </span>
    </div>
  );
}
