"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UnitPreference } from "@/types";
import { getQuickAddAmounts, toMl, unitLabel } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const customAmountSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
});

type CustomAmountFormValues = z.infer<typeof customAmountSchema>;

interface QuickAddButtonsProps {
  unit: UnitPreference;
  presetsMl?: number[];
  onAdd: (amountMl: number) => void;
}

export function QuickAddButtons({ unit, presetsMl, onAdd }: QuickAddButtonsProps) {
  const [showCustom, setShowCustom] = useState(false);
  const amounts = getQuickAddAmounts(unit, presetsMl);

  const { register, handleSubmit, reset } = useForm<CustomAmountFormValues>({
    resolver: zodResolver(customAmountSchema),
    defaultValues: { amount: undefined as unknown as number },
  });

  const onSubmit = (data: CustomAmountFormValues) => {
    onAdd(toMl(data.amount, unit));
    reset();
    setShowCustom(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {amounts.map((amount) => (
          <button
            key={amount.ml}
            onClick={() => onAdd(amount.ml)}
            aria-label={`Add ${amount.label}`}
            className="group relative h-16 rounded-2xl font-semibold text-white text-base transition-all duration-200 touch-manipulation active:scale-95 overflow-hidden"
            style={{
              background: "linear-gradient(160deg, oklch(0.60 0.17 230) 0%, oklch(0.52 0.17 240) 100%)",
              boxShadow: "0 4px 16px oklch(0.55 0.15 235 / 0.30), inset 0 1px 0 oklch(1 0 0 / 0.15)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px oklch(0.55 0.15 235 / 0.40), inset 0 1px 0 oklch(1 0 0 / 0.15)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px oklch(0.55 0.15 235 / 0.30), inset 0 1px 0 oklch(1 0 0 / 0.15)";
              (e.currentTarget as HTMLButtonElement).style.transform = "";
            }}
          >
            {/* Shimmer highlight */}
            <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 40%, oklch(1 0 0 / 0.08) 50%, transparent 60%)" }}
            />
            <span className="relative flex flex-col items-center justify-center gap-0.5">
              {/* Water drop icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="opacity-75">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span>{amount.label}</span>
            </span>
          </button>
        ))}
      </div>

      {showCustom ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <Input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            placeholder={`Amount in ${unitLabel(unit)}`}
            className="flex-1 h-12 px-4 rounded-2xl text-base bg-card/60 backdrop-blur-sm border-border/50"
            autoFocus
            min={1}
            aria-label={`Custom amount in ${unitLabel(unit)}`}
          />
          <Button
            type="submit"
            className="h-12 px-5 rounded-2xl font-semibold"
            style={{
              background: "linear-gradient(160deg, oklch(0.65 0.18 145), oklch(0.55 0.18 150))",
              color: "white",
              border: "none",
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => { setShowCustom(false); reset(); }}
            className="h-12 px-4 rounded-2xl bg-card/60 backdrop-blur-sm border-border/50"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full h-11 rounded-2xl text-sm font-medium text-muted-foreground border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:text-foreground transition-all duration-200"
        >
          + Custom amount
        </button>
      )}
    </div>
  );
}
