"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHydrationContext } from "@/contexts/hydration-context";
import { useUpdateProfile } from "@/hooks/use-hydration-queries";
import {
  clearGuestData,
  setGuestMode,
  getGuestData,
} from "@/lib/guest-storage";
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
import { UnitPreference } from "@/types";

const settingsSchema = z.object({
  name: z.string(),
  weightKg: z.number().min(20).max(300),
  dailyGoal: z.number().min(1),
  unit: z.enum(["ml", "oz"]),
  reminderEnabled: z.boolean(),
  reminderInterval: z.string(),
  activeStart: z.string(),
  activeEnd: z.string(),
  presets: z.array(z.object({ value: z.string() })),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/50">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading, isGuest } = useHydrationContext();
  const profileMutation = useUpdateProfile(isGuest);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      weightKg: 70,
      dailyGoal: 2450,
      unit: "ml",
      reminderEnabled: true,
      reminderInterval: "2",
      activeStart: "07:00",
      activeEnd: "23:00",
      presets: DEFAULT_PRESETS_ML.map((v) => ({ value: String(v) })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "presets",
  });

  const unit = watch("unit");
  const reminderEnabled = watch("reminderEnabled");

  // Initialize form from profile (only once when profile loads)
  useEffect(() => {
    if (!loading && profile) {
      const u = profile.preferred_unit || "ml";
      const profilePresets = profile.quick_add_presets_ml;
      const presetValues =
        profilePresets && profilePresets.length > 0
          ? profilePresets.map((v) => ({ value: String(displayValue(v, u)) }))
          : DEFAULT_PRESETS_ML.map((v) => ({ value: String(displayValue(v, u)) }));

      reset({
        name: profile.name || "",
        weightKg: profile.weight_kg || 70,
        dailyGoal: displayValue(profile.daily_goal_ml || 2450, u),
        unit: u,
        reminderEnabled: profile.reminder_enabled ?? true,
        reminderInterval: String(profile.reminder_interval_hours || 2),
        activeStart: profile.active_hours_start || "07:00",
        activeEnd: profile.active_hours_end || "23:00",
        presets: presetValues,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile]);

  const onSubmit = async (data: SettingsFormValues) => {
    const dailyGoalMl = toMl(data.dailyGoal, data.unit);

    const presetsMl = data.presets
      .map((p) => toMl(parseInt(p.value) || 0, data.unit))
      .filter((v) => v > 0);

    const updates = {
      name: data.name,
      weight_kg: data.weightKg,
      daily_goal_ml: dailyGoalMl,
      preferred_unit: data.unit,
      reminder_enabled: data.reminderEnabled,
      reminder_interval_hours: parseInt(data.reminderInterval) || 2,
      active_hours_start: data.activeStart,
      active_hours_end: data.activeEnd,
      quick_add_presets_ml: presetsMl.length > 0 ? presetsMl : DEFAULT_PRESETS_ML,
    };

    try {
      await profileMutation.mutateAsync(updates);
      toast.success("Settings saved");
      router.push("/dashboard");
    } catch {
      // Error toast handled by mutation's onError
    }
  };

  const handleRecalculateGoal = () => {
    const weight = watch("weightKg") || 0;
    const goalMl = Math.round(weight * 35);
    setValue("dailyGoal", displayValue(goalMl, unit));
  };

  const handleUnitChange = (newUnit: UnitPreference) => {
    const currentGoalMl = toMl(watch("dailyGoal") || 0, unit);
    const currentPresets = watch("presets");

    setValue("unit", newUnit);
    setValue("dailyGoal", displayValue(currentGoalMl, newUnit));

    currentPresets.forEach((preset, index) => {
      const ml = toMl(parseInt(preset.value) || 0, unit);
      setValue(`presets.${index}.value`, String(displayValue(ml, newUnit)));
    });
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
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors md:hidden"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Settings</h1>
          <div className="w-16 md:hidden" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:grid md:grid-cols-2 md:gap-5 space-y-4 md:space-y-0">

            {/* Profile */}
            <SectionCard title="Profile">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="h-11 px-4 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weightKg" className="text-sm font-semibold text-foreground">
                  Weight (kg)
                </Label>
                <Input
                  id="weightKg"
                  type="number"
                  {...register("weightKg", { valueAsNumber: true })}
                  min={20}
                  max={300}
                  step={0.1}
                  className="h-11 px-4 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dailyGoal" className="text-sm font-semibold text-foreground">
                  Daily Goal ({unitLabel(unit)})
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="dailyGoal"
                    type="number"
                    {...register("dailyGoal", { valueAsNumber: true })}
                    min={1}
                    className="flex-1 h-11 px-4 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRecalculateGoal}
                    className="h-11 px-4 rounded-xl text-sm font-semibold"
                  >
                    Recalc
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Display Unit
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ml", "oz"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitChange(u)}
                      className={`h-11 rounded-xl font-semibold text-sm border transition-all duration-150 ${
                        unit === u
                          ? "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-500/20"
                          : "bg-background border-border text-foreground hover:border-sky-300 dark:hover:border-sky-700"
                      }`}
                    >
                      {u === "ml" ? "ml" : "oz"}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Quick Add Presets */}
            <SectionCard title="Quick Add Presets">
              <p className="text-xs text-muted-foreground -mt-1">
                Amounts shown as quick-add buttons on the dashboard.
              </p>
              <div className="space-y-2.5">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Label htmlFor={`preset-${index}`} className="text-sm font-medium text-muted-foreground w-16 shrink-0">
                      #{index + 1}
                    </Label>
                    <Input
                      id={`preset-${index}`}
                      type="number"
                      {...register(`presets.${index}.value`)}
                      min={1}
                      className="h-10 px-3 rounded-xl flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-8 shrink-0">
                      {unitLabel(unit)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {fields.length < 6 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => append({ value: "" })}
                    className="h-9 rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </Button>
                )}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => remove(fields.length - 1)}
                    className="h-9 rounded-xl text-xs font-semibold"
                  >
                    Remove Last
                  </Button>
                )}
              </div>
            </SectionCard>

            {/* Reminders */}
            <SectionCard title="Reminders">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-foreground">Enable Reminders</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Get nudged to drink water during active hours.</p>
                </div>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={(checked) => setValue("reminderEnabled", checked)}
                />
              </div>

              {reminderEnabled && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label htmlFor="interval" className="text-sm font-semibold text-foreground">
                      Reminder Interval
                    </Label>
                    <Select
                      value={watch("reminderInterval")}
                      onValueChange={(val) => { if (val) setValue("reminderInterval", val); }}
                    >
                      <SelectTrigger className="w-full h-11 px-4 rounded-xl">
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
                    <div className="space-y-1.5">
                      <Label htmlFor="activeStart" className="text-sm font-semibold text-foreground">
                        Active From
                      </Label>
                      <Input
                        id="activeStart"
                        type="time"
                        {...register("activeStart")}
                        className="h-11 px-4 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="activeEnd" className="text-sm font-semibold text-foreground">
                        Active Until
                      </Label>
                      <Input
                        id="activeEnd"
                        type="time"
                        {...register("activeEnd")}
                        className="h-11 px-4 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}
            </SectionCard>
          </div>

          {/* Save */}
          <div className="mt-5 max-w-sm">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 disabled:opacity-40 text-white font-semibold rounded-xl text-base shadow-sm shadow-sky-500/20 transition-all"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* Account */}
        <div className="mt-5 space-y-3 max-w-sm">
          <Separator />
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2">Account</h2>

          {isGuest && (
            <Button
              onClick={handleUpgradeFromGuest}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-sm shadow-emerald-500/20"
            >
              Upgrade to Google Account
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full h-12 rounded-xl font-semibold"
          >
            {isGuest ? "Clear Data & Exit" : "Sign Out"}
          </Button>
        </div>
      </main>
    </>
  );
}
