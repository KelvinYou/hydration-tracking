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

export function getQuickAddAmounts(unit: UnitPreference): { label: string; ml: number }[] {
  if (unit === "oz") {
    return [
      { label: "+4 oz", ml: ozToMl(4) },
      { label: "+8 oz", ml: ozToMl(8) },
      { label: "+16 oz", ml: ozToMl(16) },
    ];
  }
  return [
    { label: "+100 ml", ml: 100 },
    { label: "+250 ml", ml: 250 },
    { label: "+500 ml", ml: 500 },
  ];
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
