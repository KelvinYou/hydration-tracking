"use client";

import { useState } from "react";
import { UnitPreference } from "@/types";
import { getQuickAddAmounts, toMl, unitLabel } from "@/lib/units";

interface QuickAddButtonsProps {
  unit: UnitPreference;
  onAdd: (amountMl: number) => void;
}

export function QuickAddButtons({ unit, onAdd }: QuickAddButtonsProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const amounts = getQuickAddAmounts(unit);

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
          <button
            key={amount.ml}
            onClick={() => onAdd(amount.ml)}
            className="py-4 px-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors min-h-[56px] touch-manipulation"
            aria-label={`Add ${amount.label}`}
          >
            {amount.label}
          </button>
        ))}
      </div>

      {showCustom ? (
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Amount in ${unitLabel(unit)}`}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            min="1"
            aria-label={`Custom amount in ${unitLabel(unit)}`}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCustom(false)}
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
        >
          Custom Amount
        </button>
      )}
    </div>
  );
}
