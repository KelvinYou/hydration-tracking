import { WaterLog, HydrationScore } from "@/types";

export function calculateHydrationScore(
  logs: WaterLog[],
  dailyGoalMl: number,
  activeStart: string = "07:00",
  activeEnd: string = "23:00"
): HydrationScore {
  if (dailyGoalMl <= 0) {
    return { total: 0, volumeScore: 0, distributionScore: 0, label: "Needs improvement", color: "text-red-500" };
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

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-500" };
  if (score >= 60) return { label: "Good", color: "text-blue-500" };
  if (score >= 40) return { label: "Fair", color: "text-yellow-500" };
  return { label: "Needs improvement", color: "text-red-500" };
}
