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
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-balance">
            Set Up Your Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ll calculate your daily hydration goal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Your name"
              className="h-12 px-4 rounded-xl"
              autoFocus
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="weightKg" className="text-gray-700 dark:text-gray-300">
              Weight (kg)
            </Label>
            <Input
              id="weightKg"
              type="number"
              {...register("weightKg", { valueAsNumber: true })}
              placeholder="e.g., 70"
              min={20}
              max={300}
              step={0.1}
              className="h-12 px-4 rounded-xl"
            />
            {errors.weightKg && (
              <p className="text-xs text-red-500">{errors.weightKg.message}</p>
            )}
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
                  onClick={() => setValue("unit", u)}
                  className={`h-12 rounded-xl font-medium transition-colors ${
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
            disabled={!weight || weight <= 0 || onboardMutation.isPending}
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:dark:bg-gray-800 disabled:dark:text-gray-500 font-semibold rounded-xl text-lg not-disabled:text-white"
          >
            {onboardMutation.isPending ? "Saving..." : "Start Tracking"}
          </Button>
        </form>
      </div>
    </div>
  );
}
