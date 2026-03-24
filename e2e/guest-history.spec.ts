import { test, expect } from "@playwright/test";

test.describe("Guest history page flow", () => {
  test.beforeEach(async ({ page }) => {
    // Seed guest localStorage so we skip onboarding and land on dashboard
    await page.goto("/");
    await page.evaluate(() => {
      const now = new Date().toISOString();
      const guestData = {
        profile: {
          display_name: "Test User",
          weight_kg: 70,
          daily_goal_ml: 2450,
          preferred_unit: "ml",
          active_hours_start: 8,
          active_hours_end: 22,
        },
        logs: [
          { id: "log-1", amount_ml: 250, logged_at: now },
          { id: "log-2", amount_ml: 500, logged_at: now },
        ],
      };
      localStorage.setItem("hydration_guest_mode", "true");
      localStorage.setItem("hydration_guest_onboarded", "true");
      localStorage.setItem("hydration_guest_data", JSON.stringify(guestData));
    });
  });

  test("navigate to history from dashboard and view entries", async ({
    page,
  }, testInfo) => {
    const prefix = testInfo.project.name;

    // 1. Start on dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/history-01-dashboard.png`,
    });

    // 2. Click "History" nav link
    await page.getByRole("link", { name: "History" }).click();

    // 3. Should navigate to history page
    await expect(page).toHaveURL("/history");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/history-02-history-page.png`,
    });

    // 4. Verify "Last 7 Days" section is visible
    await expect(page.getByText("Last 7 Days")).toBeVisible();

    // 5. Verify today's entry shows up with logged totals
    await expect(page.getByText(/750\s*ml/)).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/history-03-today-entry.png`,
    });

    // 6. Click today's entry to see detail view
    const todayEntry = page.getByText(/750\s*ml/).first();
    await todayEntry.click();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/history-04-day-detail.png`,
    });

    // 7. Verify detail view shows total and score
    await expect(page.getByText("Total:")).toBeVisible();
    await expect(page.getByText("Score:")).toBeVisible();

    // 8. Navigate back to all days
    await page.getByRole("link", { name: "All Days" }).click();
    await expect(page.getByText("Last 7 Days")).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/history-05-back-to-all.png`,
    });
  });
});
