export interface Profile {
  id: string;
  email: string;
  name: string;
  weight_kg: number;
  daily_goal_ml: number;
  preferred_unit: "ml" | "oz";
  reminder_enabled: boolean;
  reminder_interval_hours: number;
  active_hours_start: string;
  active_hours_end: string;
  quick_add_presets_ml: number[];
  created_at: string;
  updated_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface GuestData {
  profile: Omit<Profile, "id" | "email" | "created_at" | "updated_at">;
  logs: WaterLog[];
}

export type UnitPreference = "ml" | "oz";

export interface HydrationScore {
  total: number;
  volumeScore: number;
  distributionScore: number;
  label: string;
  level: "excellent" | "good" | "fair" | "poor";
}

export interface HydrationSlot {
  /** Slot index (0-7) */
  index: number;
  /** Start hour label, e.g. "7 AM" */
  label: string;
  /** Actual intake in ml for this slot */
  intakeMl: number;
  /** Expected intake in ml for this slot */
  expectedMl: number;
  /** Ratio of intake to expected (capped at 1.0) */
  ratio: number;
  /** Whether the current time falls within this slot */
  isCurrent: boolean;
  /** Whether the slot is in the past */
  isPast: boolean;
}
