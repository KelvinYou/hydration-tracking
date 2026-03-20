"use client";

import { useState } from "react";
import { UnitPreference } from "@/types";
import { getQuickAddAmounts, toMl, unitLabel } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickAddButtonsProps {
  unit: UnitPreference;
  presetsMl?: number[];
  onAdd: (amountMl: number) => void;
}

export function QuickAddButtons({ unit, presetsMl, onAdd }: QuickAddButtonsProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const amounts = getQuickAddAmounts(unit, presetsMl);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(customValue);
    if (value > 0) {
      onAdd(toMl(value, unit));
      setCustomValue("");
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {amounts.map((amount) => (
          <Button
            key={amount.ml}
            onClick={() => onAdd(amount.ml)}
            className="h-14 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 active:scale-95 text-white font-semibold rounded-xl text-lg transition-all touch-manipulation shadow-sm hover:shadow-md hover:shadow-sky-500/20"
            aria-label={`Add ${amount.label}`}
          >
            {amount.label}
          </Button>
        ))}
      </div>

      {showCustom ? (
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Amount in ${unitLabel(unit)}`}
            className="flex-1 h-12 px-4 rounded-xl text-lg"
            autoFocus
            min={1}
            aria-label={`Custom amount in ${unitLabel(unit)}`}
          />
          <Button
            type="submit"
            className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCustom(false)}
            className="h-12 px-4 rounded-xl"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setShowCustom(true)}
          className="w-full h-12 rounded-xl font-medium"
        >
          Custom Amount
        </Button>
      )}
    </div>
  );
}
