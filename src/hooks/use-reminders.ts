"use client";

import { useEffect, useRef } from "react";
import { Profile } from "@/types";

export function useReminders(
  profile: Partial<Profile> | null,
  totalIntake: number,
  dailyGoalMl: number
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!profile?.reminder_enabled) return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed
      });
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const intervalMs = (profile.reminder_interval_hours || 2) * 60 * 60 * 1000;
    const startHour = parseTime(profile.active_hours_start || "07:00");
    const endHour = parseTime(profile.active_hours_end || "23:00");

    const checkAndNotify = () => {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;

      // Only during active hours
      if (currentHour < startHour || currentHour > endHour) return;

      // Check if behind pace
      const activeHours = endHour - startHour;
      const hoursElapsed = currentHour - startHour;
      const expectedIntake = (dailyGoalMl / activeHours) * hoursElapsed;

      if (totalIntake < expectedIntake) {
        showReminder();
      }
    };

    timerRef.current = setInterval(checkAndNotify, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [profile, totalIntake, dailyGoalMl]);
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

function showReminder() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Time to hydrate! 💧", {
      body: "You're falling behind your hydration pace. Take a sip!",
      icon: "/icon-192.png",
      tag: "hydration-reminder",
    });
  }
}
