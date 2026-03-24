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

  // Find the next slot that hasn't ended
  const nextSlot = slots.find((s) => !s.isPast && !s.isCurrent);
  if (nextSlot && currentSlot.ratio < 0.5) {
    return `Drink up — aim to hydrate before ${nextSlot.label}`;
  }

  if (missedSlots.length >= 2) {
    return "A few gaps today — try smaller, more frequent sips";
  }

  return "Keep sipping steadily through the day";
}

export function HydrationRhythm({ slots, unit }: HydrationRhythmProps) {
  const nudge = useMemo(() => getNudgeMessage(slots), [slots]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Daily Rhythm
      </h3>
      <div className="flex items-end gap-1.5 sm:gap-2 h-20" role="img" aria-label="Hydration distribution across 8 time slots">
        {slots.map((slot) => (
          <SlotBar key={slot.index} slot={slot} unit={unit} />
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {nudge}
      </p>
    </div>
  );
}

function SlotBar({ slot, unit }: { slot: HydrationSlot; unit: UnitPreference }) {
  const heightPercent = Math.max(slot.ratio * 100, 4); // min 4% so empty slots are visible
  const isFilled = slot.ratio >= 0.8;
  const isPartial = slot.ratio > 0 && slot.ratio < 0.8;

  return (
    <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
      <div className="relative w-full h-16 flex items-end">
        <div
          className={cn(
            "w-full rounded-t-md transition-all duration-500 ease-out",
            slot.isCurrent && "ring-2 ring-sky-400/50 ring-offset-1 ring-offset-background",
            isFilled && "bg-green-400 dark:bg-green-500",
            isPartial && !slot.isPast && !slot.isCurrent && "bg-sky-300 dark:bg-sky-600",
            isPartial && slot.isCurrent && "bg-sky-400 dark:bg-sky-500",
            isPartial && slot.isPast && "bg-sky-300/70 dark:bg-sky-700",
            !isPartial && !isFilled && slot.isPast && "bg-gray-200 dark:bg-gray-700",
            !isPartial && !isFilled && !slot.isPast && "bg-gray-100 dark:bg-gray-800"
          )}
          style={{ height: `${heightPercent}%` }}
          title={`${slot.label}: ${formatAmount(slot.intakeMl, unit)} / ${formatAmount(slot.expectedMl, unit)}`}
          aria-hidden="true"
        />
        {slot.isCurrent && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        )}
      </div>
      <span
        className={cn(
          "text-[11px] sm:text-xs leading-tight tabular-nums w-full text-center whitespace-nowrap",
          slot.isCurrent
            ? "font-semibold text-sky-600 dark:text-sky-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      >
        {slot.label.replace(/ (AM|PM)/, (_, p) => p === "AM" ? "A" : "P")}
      </span>
    </div>
  );
}
