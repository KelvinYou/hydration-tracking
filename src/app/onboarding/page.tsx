"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  isGuestMode,
  updateGuestProfile,
  setGuestOnboarded,
} from "@/lib/guest-storage";
import { UnitPreference } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [unit, setUnit] = useState<UnitPreference>("ml");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weight = parseFloat(weightKg) || 0;
  const dailyGoalMl = Math.round(weight * 35);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || weight <= 0) return;
    setSaving(true);

    const guest = isGuestMode();

    if (guest) {
      updateGuestProfile({
        name: name || "Guest",
        weight_kg: weight,
        daily_goal_ml: dailyGoalMl,
        preferred_unit: unit,
      });
      setGuestOnboarded();
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      name: name || user.user_metadata?.full_name || "User",
      weight_kg: weight,
      daily_goal_ml: dailyGoalMl,
      preferred_unit: unit,
    });

    if (upsertError) {
      setError("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set Up Your Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ll calculate your daily hydration goal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g., 70"
              required
              min="20"
              max="300"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Unit Preference */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["ml", "oz"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    unit === u
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {u === "ml" ? "Milliliters (ml)" : "Ounces (oz)"}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Goal */}
          {weight > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your recommended daily goal:
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {unit === "oz"
                  ? `${Math.round(dailyGoalMl / 29.5735)} oz`
                  : `${dailyGoalMl.toLocaleString()} ml`}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Based on {weight} kg &times; 35 ml/kg
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!weight || weight <= 0 || saving}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white font-semibold rounded-xl text-lg transition-colors"
          >
            {saving ? "Saving..." : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
