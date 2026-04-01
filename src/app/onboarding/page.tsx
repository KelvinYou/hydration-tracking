"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertProfile, getUser } from "@/lib/api";
import {
  isGuestMode,
  updateGuestProfile,
  setGuestOnboarded,
} from "@/lib/guest-storage";
import { UnitPreference } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const onboardingSchema = z.object({
  name: z.string(),
  weightKg: z.number().min(20, "Weight must be at least 20 kg").max(300, "Weight must be at most 300 kg"),
  unit: z.enum(["ml", "oz"]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      weightKg: undefined as unknown as number,
      unit: "ml" as const,
    },
  });

  const weight = watch("weightKg") ?? 0;
  const unit = watch("unit");
  const dailyGoalMl = Math.round(weight * 35);

  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      const guest = isGuestMode();

      if (guest) {
        updateGuestProfile({
          name: data.name || "Guest",
          weight_kg: data.weightKg,
          daily_goal_ml: Math.round(data.weightKg * 35),
          preferred_unit: data.unit,
        });
        setGuestOnboarded();
        return;
      }

      const user = await getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await upsertProfile({
        id: user.id,
        email: user.email!,
        name: data.name || user.user_metadata?.full_name || "User",
        weight_kg: data.weightKg,
        daily_goal_ml: Math.round(data.weightKg * 35),
        preferred_unit: data.unit,
      });
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to save profile. Please try again.");
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    onboardMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, oklch(0.55 0.12 230 / 0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-400/8 dark:bg-sky-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/25 mb-1">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Set up your profile
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll calculate your perfect daily hydration goal.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border/60 rounded-2xl p-7 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Your name
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="e.g., Alex"
                className="h-11 px-4 rounded-xl"
                autoFocus
              />
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <Label htmlFor="weightKg" className="text-sm font-semibold text-foreground">
                Weight <span className="font-normal text-muted-foreground">(kg)</span>
              </Label>
              <Input
                id="weightKg"
                type="number"
                {...register("weightKg", { valueAsNumber: true })}
                placeholder="e.g., 70"
                min={20}
                max={300}
                step={0.1}
                className="h-11 px-4 rounded-xl"
              />
              {errors.weightKg && (
                <p className="text-xs text-destructive">{errors.weightKg.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used to calculate your goal — WHO recommends ~35 ml per kg daily.
              </p>
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">
                Preferred unit
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                {(["ml", "oz"] as UnitPreference[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue("unit", u)}
                    className={`h-11 rounded-xl font-semibold text-sm border transition-all duration-150 ${
                      unit === u
                        ? "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-500/20"
                        : "bg-card border-border/60 text-foreground hover:border-sky-300 dark:hover:border-sky-700"
                    }`}
                  >
                    {u === "ml" ? "Milliliters (ml)" : "Ounces (oz)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Goal */}
            {weight > 0 && (
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 p-4 space-y-0.5">
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                  Your recommended daily goal
                </p>
                <p className="text-3xl font-black text-sky-600 dark:text-sky-300 tabular-nums">
                  {unit === "oz"
                    ? `${Math.round(dailyGoalMl / 29.5735)} oz`
                    : `${dailyGoalMl.toLocaleString()} ml`}
                </p>
                <p className="text-xs text-sky-500/70 dark:text-sky-400/70">
                  Based on {weight} kg &times; 35 ml/kg
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!weight || weight <= 0 || onboardMutation.isPending}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 disabled:opacity-40 text-white font-semibold rounded-xl text-base shadow-sm shadow-sky-500/20 transition-all"
            >
              {onboardMutation.isPending ? "Saving…" : "Start Tracking →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
