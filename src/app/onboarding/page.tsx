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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [unit, setUnit] = useState<UnitPreference>("ml");
  const [saving, setSaving] = useState(false);

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
      toast.error("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-balance">
            Set Up Your Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ll calculate your daily hydration goal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 px-4 rounded-xl"
              autoFocus
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g., 70"
              required
              min={20}
              max={300}
              step={0.1}
              className="h-12 px-4 rounded-xl"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Used to calculate your daily goal (WHO recommends 2-3L/day)
            </p>
          </div>

          {/* Unit Preference */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Preferred Unit
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {(["ml", "oz"] as const).map((u) => (
                <Button
                  key={u}
                  type="button"
                  variant={unit === u ? "default" : "secondary"}
                  onClick={() => setUnit(u)}
                  className={`h-12 rounded-xl font-medium ${
                    unit === u
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : ""
                  }`}
                >
                  {u === "ml" ? "Milliliters (ml)" : "Ounces (oz)"}
                </Button>
              ))}
            </div>
          </div>

          {/* Calculated Goal */}
          {weight > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-0">
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            disabled={!weight || weight <= 0 || saving}
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white font-semibold rounded-xl text-lg"
          >
            {saving ? "Saving..." : "Start Tracking"}
          </Button>
        </form>
      </div>
    </div>
  );
}
