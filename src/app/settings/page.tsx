"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  isGuestMode,
  getGuestProfile,
  updateGuestProfile,
  clearGuestData,
  setGuestMode,
  getGuestData,
} from "@/lib/guest-storage";
import { Profile, UnitPreference } from "@/types";
import { displayValue, toMl, unitLabel } from "@/lib/units";
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

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [unit, setUnit] = useState<UnitPreference>("ml");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState("2");
  const [activeStart, setActiveStart] = useState("07:00");
  const [activeEnd, setActiveEnd] = useState("23:00");

  useEffect(() => {
    const loadProfile = async () => {
      const guest = isGuestMode();
      setIsGuest(guest);

      if (guest) {
        const p = getGuestProfile();
        setProfile(p as Partial<Profile>);
        setName(p.name);
        setWeightKg(String(p.weight_kg));
        setUnit(p.preferred_unit);
        setDailyGoal(String(displayValue(p.daily_goal_ml, p.preferred_unit)));
        setReminderEnabled(p.reminder_enabled);
        setReminderInterval(String(p.reminder_interval_hours));
        setActiveStart(p.active_hours_start);
        setActiveEnd(p.active_hours_end);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setName(data.name);
        setWeightKg(String(data.weight_kg));
        setUnit(data.preferred_unit);
        setDailyGoal(String(displayValue(data.daily_goal_ml, data.preferred_unit)));
        setReminderEnabled(data.reminder_enabled);
        setReminderInterval(String(data.reminder_interval_hours));
        setActiveStart(data.active_hours_start);
        setActiveEnd(data.active_hours_end);
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const dailyGoalMl = toMl(parseInt(dailyGoal) || 0, unit);

    const updates = {
      name,
      weight_kg: parseFloat(weightKg) || 70,
      daily_goal_ml: dailyGoalMl,
      preferred_unit: unit,
      reminder_enabled: reminderEnabled,
      reminder_interval_hours: parseInt(reminderInterval) || 2,
      active_hours_start: activeStart,
      active_hours_end: activeEnd,
    };

    if (isGuest) {
      updateGuestProfile(updates);
      setSaving(false);
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update(updates).eq("id", user.id);
    }
    setSaving(false);
    router.push("/dashboard");
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

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpgradeFromGuest = async () => {
    const guestData = getGuestData();
    localStorage.setItem("hydration_guest_migration", JSON.stringify(guestData));

    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?migrate=true`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="link"
            className="text-blue-500 font-medium p-0"
            render={<Link href="/dashboard" />}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8 pb-24">
        {/* Profile Section */}
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
                    }}
                    className={`h-12 rounded-xl font-medium ${
                      unit === u
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
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

        {/* Reminders Section */}
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

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-xl text-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        {/* Account Section */}
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

        {/* Bottom nav spacer */}
        <div className="h-4" />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
        <div className="max-w-lg mx-auto flex">
          <Link href="/dashboard" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/history" className="flex-1 py-3 flex flex-col items-center text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link href="/settings" className="flex-1 py-3 flex flex-col items-center text-blue-500" aria-current="page">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
