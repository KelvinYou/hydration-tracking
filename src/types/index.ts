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
