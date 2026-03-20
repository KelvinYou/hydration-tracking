import { GuestData, WaterLog } from "@/types";
import { v4Fallback as generateId } from "./utils";

const GUEST_KEY = "hydration_guest_data";

const defaultProfile: GuestData["profile"] = {
  name: "Guest",
  weight_kg: 70,
  daily_goal_ml: 2450,
  preferred_unit: "ml",
  reminder_enabled: true,
  reminder_interval_hours: 2,
  active_hours_start: "07:00",
  active_hours_end: "23:00",
  quick_add_presets_ml: [100, 250, 500],
};

export function getGuestData(): GuestData {
  if (typeof window === "undefined") {
    return { profile: { ...defaultProfile }, logs: [] };
  }
  const stored = localStorage.getItem(GUEST_KEY);
  if (!stored) {
    const data: GuestData = { profile: { ...defaultProfile }, logs: [] };
    localStorage.setItem(GUEST_KEY, JSON.stringify(data));
    return data;
  }
  const parsed: GuestData = JSON.parse(stored);
  parsed.profile = { ...defaultProfile, ...parsed.profile };
  return parsed;
}

export function setGuestData(data: GuestData): void {
  localStorage.setItem(GUEST_KEY, JSON.stringify(data));
}

export function getGuestProfile(): GuestData["profile"] {
  return getGuestData().profile;
}

export function updateGuestProfile(updates: Partial<GuestData["profile"]>): GuestData["profile"] {
  const data = getGuestData();
  data.profile = { ...data.profile, ...updates };
  setGuestData(data);
  return data.profile;
}

export function getGuestLogs(): WaterLog[] {
  return getGuestData().logs;
}

export function getTodayGuestLogs(): WaterLog[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  return getGuestLogs().filter((log) => {
    const t = new Date(log.logged_at).getTime();
    return t >= startOfDay && t < endOfDay;
  });
}

export function addGuestLog(amountMl: number): WaterLog {
  const data = getGuestData();
  const log: WaterLog = {
    id: generateId(),
    user_id: "guest",
    amount_ml: amountMl,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  data.logs.push(log);
  setGuestData(data);
  return log;
}

export function deleteGuestLog(id: string): void {
  const data = getGuestData();
  data.logs = data.logs.filter((log) => log.id !== id);
  setGuestData(data);
}

export function updateGuestLog(id: string, amountMl: number, loggedAt?: string): void {
  const data = getGuestData();
  const log = data.logs.find((l) => l.id === id);
  if (log) {
    log.amount_ml = amountMl;
    if (loggedAt) log.logged_at = loggedAt;
    setGuestData(data);
  }
}

export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hydration_guest_mode") === "true";
}

export function setGuestMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem("hydration_guest_mode", "true");
  } else {
    localStorage.removeItem("hydration_guest_mode");
  }
}

export function clearGuestData(): void {
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem("hydration_guest_mode");
}

export function hasCompletedGuestOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hydration_guest_onboarded") === "true";
}

export function setGuestOnboarded(): void {
  localStorage.setItem("hydration_guest_onboarded", "true");
}
