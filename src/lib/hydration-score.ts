import { WaterLog, HydrationScore, HydrationSlot } from "@/types";

export function calculateHydrationScore(
  logs: WaterLog[],
  dailyGoalMl: number,
  activeStart: string = "07:00",
  activeEnd: string = "23:00"
): HydrationScore {
  if (dailyGoalMl <= 0) {
    return { total: 0, volumeScore: 0, distributionScore: 0, label: "Needs improvement", level: "poor" as const };
  }

  const totalIntake = logs.reduce((sum, log) => sum + log.amount_ml, 0);

  // Volume Score (70%)
  const volumeScore = Math.min((totalIntake / dailyGoalMl) * 100, 100);

  // Distribution Score (30%)
  const distributionScore = calculateDistributionScore(logs, dailyGoalMl, activeStart, activeEnd);

  const total = Math.round(volumeScore * 0.7 + distributionScore * 0.3);

  return {
    total,
    volumeScore: Math.round(volumeScore),
    distributionScore: Math.round(distributionScore),
    ...getScoreLabel(total),
  };
}

function calculateDistributionScore(
  logs: WaterLog[],
  dailyGoalMl: number,
  activeStart: string,
  activeEnd: string
): number {
  const NUM_SLOTS = 8;
  const startHour = parseTimeToHours(activeStart);
  const endHour = parseTimeToHours(activeEnd);
  const activeHours = endHour - startHour;
  const slotDuration = activeHours / NUM_SLOTS;
  const expectedPerSlot = dailyGoalMl / NUM_SLOTS;

  if (expectedPerSlot <= 0) return 0;

  const slotIntakes = new Array(NUM_SLOTS).fill(0);

  for (const log of logs) {
    const logDate = new Date(log.logged_at);
    const logHour = logDate.getHours() + logDate.getMinutes() / 60;
    const slotIndex = Math.floor((logHour - startHour) / slotDuration);
    if (slotIndex >= 0 && slotIndex < NUM_SLOTS) {
      slotIntakes[slotIndex] += log.amount_ml;
    }
  }

  const slotRatios = slotIntakes.map(
    (intake) => Math.min(intake / expectedPerSlot, 1.0)
  );

  const avgRatio = slotRatios.reduce((a, b) => a + b, 0) / NUM_SLOTS;
  return avgRatio * 100;
}

function parseTimeToHours(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

function getScoreLabel(score: number): { label: string; level: "excellent" | "good" | "fair" | "poor" } {
  if (score >= 80) return { label: "Excellent", level: "excellent" };
  if (score >= 60) return { label: "Good", level: "good" };
  if (score >= 40) return { label: "Fair", level: "fair" };
  return { label: "Needs improvement", level: "poor" };
}

/**
 * Returns per-slot hydration data for the rhythm visualizer.
 * Uses the same 8-slot bucketing as the distribution score.
 */
export function getHydrationSlots(
  logs: WaterLog[],
  dailyGoalMl: number,
  activeStart: string = "07:00",
  activeEnd: string = "23:00",
  now: Date = new Date()
): HydrationSlot[] {
  const NUM_SLOTS = 8;
  const startHour = parseTimeToHours(activeStart);
  const endHour = parseTimeToHours(activeEnd);
  const activeHours = endHour - startHour;
  const slotDuration = activeHours / NUM_SLOTS;
  const expectedPerSlot = dailyGoalMl / NUM_SLOTS;
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const slotIntakes = new Array(NUM_SLOTS).fill(0);

  for (const log of logs) {
    const logDate = new Date(log.logged_at);
    const logHour = logDate.getHours() + logDate.getMinutes() / 60;
    const slotIndex = Math.floor((logHour - startHour) / slotDuration);
    if (slotIndex >= 0 && slotIndex < NUM_SLOTS) {
      slotIntakes[slotIndex] += log.amount_ml;
    }
  }

  return Array.from({ length: NUM_SLOTS }, (_, i) => {
    const slotStartHour = startHour + i * slotDuration;
    const slotEndHour = slotStartHour + slotDuration;
    const hour = Math.floor(slotStartHour);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return {
      index: i,
      label: `${displayHour} ${ampm}`,
      intakeMl: slotIntakes[i],
      expectedMl: expectedPerSlot,
      ratio: expectedPerSlot > 0 ? Math.min(slotIntakes[i] / expectedPerSlot, 1.0) : 0,
      isCurrent: currentHour >= slotStartHour && currentHour < slotEndHour,
      isPast: currentHour >= slotEndHour,
    };
  });
}

/**
 * Calculate what percentage of the daily goal should have been consumed by now,
 * based on active hours. Returns 0 before active hours start and 100 after they end.
 */
export function getExpectedProgress(
  activeStart: string = "07:00",
  activeEnd: string = "23:00",
  now: Date = new Date()
): number {
  const startHour = parseTimeToHours(activeStart);
  const endHour = parseTimeToHours(activeEnd);
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (currentHour <= startHour) return 0;
  if (currentHour >= endHour) return 100;

  return ((currentHour - startHour) / (endHour - startHour)) * 100;
}
