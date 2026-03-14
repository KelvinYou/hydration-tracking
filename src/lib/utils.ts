import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function v4Fallback(): string {
  return crypto.randomUUID()
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}
