"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrationContext } from "@/contexts/hydration-context";
import { useUpdateProfile } from "@/hooks/use-hydration-queries";
import {
  clearGuestData,
  setGuestMode,
  getGuestData,
} from "@/lib/guest-storage";
import { UnitPreference } from "@/types";
import { displayValue, toMl, unitLabel, DEFAULT_PRESETS_ML } from "@/lib/units";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading, isGuest } = useHydrationContext();
  const profileMutation = useUpdateProfile(isGuest);
  const [saving, setSaving] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [unit, setUnit] = useState<UnitPreference>("ml");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState("2");
  const [activeStart, setActiveStart] = useState("07:00");
  const [activeEnd, setActiveEnd] = useState("23:00");
  const [presets, setPresets] = useState<string[]>(
    DEFAULT_PRESETS_ML.map(String)
  );

  // Initialize form from shared profile (only once)
  useEffect(() => {
    if (!loading && profile && !formInitialized) {
      setName(profile.name || "");
      setWeightKg(String(profile.weight_kg || 70));
      setUnit(profile.preferred_unit || "ml");
      setDailyGoal(
        String(displayValue(profile.daily_goal_ml || 2450, profile.preferred_unit || "ml"))
      );
      setReminderEnabled(profile.reminder_enabled ?? true);
      setReminderInterval(String(profile.reminder_interval_hours || 2));
      setActiveStart(profile.active_hours_start || "07:00");
      setActiveEnd(profile.active_hours_end || "23:00");
      const profilePresets = profile.quick_add_presets_ml;
      if (profilePresets && profilePresets.length > 0) {
        setPresets(profilePresets.map((v) => String(displayValue(v, profile.preferred_unit || "ml"))));
      } else {
        setPresets(DEFAULT_PRESETS_ML.map((v) => String(displayValue(v, profile.preferred_unit || "ml"))));
      }
      setFormInitialized(true);
    }
  }, [loading, profile, formInitialized]);

  const handleSave = async () => {
    setSaving(true);
    const dailyGoalMl = toMl(parseInt(dailyGoal) || 0, unit);

    const presetsMl = presets
      .map((v) => toMl(parseInt(v) || 0, unit))
      .filter((v) => v > 0);

    const updates = {
      name,
      weight_kg: parseFloat(weightKg) || 70,
      daily_goal_ml: dailyGoalMl,
      preferred_unit: unit,
      reminder_enabled: reminderEnabled,
      reminder_interval_hours: parseInt(reminderInterval) || 2,
      active_hours_start: activeStart,
      active_hours_end: activeEnd,
      quick_add_presets_ml: presetsMl.length > 0 ? presetsMl : DEFAULT_PRESETS_ML,
    };

    try {
      await profileMutation.mutateAsync(updates);
      toast.success("Settings saved");
      router.push("/dashboard");
    } catch {
      // Error toast handled by mutation's onError
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculateGoal = () => {
    const weight = parseFloat(weightKg) || 0;
    const goalMl = Math.round(weight * 35);
    setDailyGoal(String(displayValue(goalMl, unit)));
  };

  const handleSignOut = async () => {
    if (isGuest) {
      clearGuestData();
      setGuestMode(false);
      router.push("/");
      return;
    }

    const { createClient } = await import("@/lib/supabase-client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpgradeFromGuest = async () => {
    const guestData = getGuestData();
    localStorage.setItem("hydration_guest_migration", JSON.stringify(guestData));

    const { createClient } = await import("@/lib/supabase-client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?migrate=true`,
      },
    });
  };

  if (loading) return null;

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sky-500 font-medium md:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-16 md:hidden" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <div className="md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-8 space-y-8 md:space-y-0">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Profile</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  min={20}
                  max={300}
                  step={0.1}
                  className="h-12 px-4 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="goal" className="text-gray-700 dark:text-gray-300 mb-1">
                  Daily Goal ({unitLabel(unit)})
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="goal"
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    min={1}
                    className="flex-1 h-12 px-4 rounded-xl"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleRecalculateGoal}
                    className="h-12 px-4 rounded-xl"
                  >
                    Recalculate
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300 mb-1">
                  Display Unit
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["ml", "oz"] as const).map((u) => (
                    <Button
                      key={u}
                      variant={unit === u ? "default" : "secondary"}
                      onClick={() => {
                        const currentGoalMl = toMl(parseInt(dailyGoal) || 0, unit);
                        setUnit(u);
                        setDailyGoal(String(displayValue(currentGoalMl, u)));
                        setPresets((prev) =>
                          prev.map((v) => {
                            const ml = toMl(parseInt(v) || 0, unit);
                            return String(displayValue(ml, u));
                          })
                        );
                      }}
                      className={`h-12 rounded-xl font-medium ${
                        unit === u
                          ? "bg-sky-500 hover:bg-sky-600 text-white"
                          : ""
                      }`}
                    >
                      {u === "ml" ? "ml" : "oz"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quick Add Presets</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize the quick-add button amounts on the dashboard.
            </p>
            <div className="space-y-3">
              {presets.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Label htmlFor={`preset-${index}`} className="text-gray-700 dark:text-gray-300 w-20 shrink-0">
                    Button {index + 1}
                  </Label>
                  <Input
                    id={`preset-${index}`}
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const next = [...presets];
                      next[index] = e.target.value;
                      setPresets(next);
                    }}
                    min={1}
                    className="h-12 px-4 rounded-xl flex-1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                    {unitLabel(unit)}
                  </span>
                </div>
              ))}
              {presets.length < 6 && (
                <Button
                  variant="secondary"
                  onClick={() => setPresets([...presets, ""])}
                  className="h-10 rounded-xl text-sm"
                >
                  + Add Preset
                </Button>
              )}
              {presets.length > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setPresets(presets.slice(0, -1))}
                  className="h-10 rounded-xl text-sm ml-2"
                >
                  Remove Last
                </Button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reminders</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <Label className="text-gray-700 dark:text-gray-300">Enable Reminders</Label>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={(checked) => setReminderEnabled(checked)}
                />
              </div>

              {reminderEnabled && (
                <>
                  <div>
                    <Label htmlFor="interval" className="text-gray-700 dark:text-gray-300 mb-1">
                      Reminder Interval
                    </Label>
                    <Select value={reminderInterval} onValueChange={(val) => { if (val) setReminderInterval(val); }}>
                      <SelectTrigger className="w-full h-12 px-4 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 hour</SelectItem>
                        <SelectItem value="2">Every 2 hours</SelectItem>
                        <SelectItem value="3">Every 3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="start" className="text-gray-700 dark:text-gray-300 mb-1">
                        Active From
                      </Label>
                      <Input
                        id="start"
                        type="time"
                        value={activeStart}
                        onChange={(e) => setActiveStart(e.target.value)}
                        className="h-12 px-4 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end" className="text-gray-700 dark:text-gray-300 mb-1">
                        Active Until
                      </Label>
                      <Input
                        id="end"
                        type="time"
                        value={activeEnd}
                        onChange={(e) => setActiveEnd(e.target.value)}
                        className="h-12 px-4 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 space-y-8 max-w-md md:max-w-sm">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-semibold rounded-xl text-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <section className="space-y-4">
            <Separator />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account</h2>

            {isGuest && (
              <Button
                onClick={handleUpgradeFromGuest}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                Upgrade to Google Account
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full h-12 rounded-xl"
            >
              {isGuest ? "Clear Data & Exit" : "Sign Out"}
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}
