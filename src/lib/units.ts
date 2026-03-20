import { UnitPreference } from "@/types";

const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Math.round(ml / ML_PER_OZ);
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatAmount(ml: number, unit: UnitPreference): string {
  if (unit === "oz") {
    return `${mlToOz(ml)} oz`;
  }
  return `${ml.toLocaleString()} ml`;
}

export const DEFAULT_PRESETS_ML = [100, 250, 500];
export const DEFAULT_PRESETS_OZ = [4, 8, 16];

export function getQuickAddAmounts(
  unit: UnitPreference,
  presetsMl?: number[]
): { label: string; ml: number }[] {
  const presets = presetsMl && presetsMl.length > 0 ? presetsMl : DEFAULT_PRESETS_ML;
  return presets.map((ml) => ({
    label: unit === "oz" ? `+${mlToOz(ml)} oz` : `+${ml} ml`,
    ml,
  }));
}

export function displayValue(ml: number, unit: UnitPreference): number {
  return unit === "oz" ? mlToOz(ml) : ml;
}

export function toMl(value: number, unit: UnitPreference): number {
  return unit === "oz" ? ozToMl(value) : value;
}

export function unitLabel(unit: UnitPreference): string {
  return unit === "oz" ? "oz" : "ml";
}
