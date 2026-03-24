import { test, expect } from "@playwright/test";

test.describe("Guest settings page flow", () => {
  test.beforeEach(async ({ page }) => {
    // Seed guest localStorage so we skip onboarding and land on dashboard
    await page.goto("/");
    await page.evaluate(() => {
      const guestData = {
        profile: {
          display_name: "Test User",
          weight_kg: 70,
          daily_goal_ml: 2450,
          preferred_unit: "ml",
          active_hours_start: 8,
          active_hours_end: 22,
        },
        logs: [],
      };
      localStorage.setItem("hydration_guest_mode", "true");
      localStorage.setItem("hydration_guest_onboarded", "true");
      localStorage.setItem("hydration_guest_data", JSON.stringify(guestData));
    });
  });

  test("navigate to settings from dashboard and update profile", async ({
    page,
  }, testInfo) => {
    const prefix = testInfo.project.name;

    // 1. Start on dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-01-dashboard.png`,
    });

    // 2. Click "Settings" nav link
    await page.getByRole("link", { name: "Settings" }).click();

    // 3. Should navigate to settings page
    await expect(page).toHaveURL("/settings");
    await expect(
      page.getByRole("heading", { name: "Settings" })
    ).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-02-settings-page.png`,
    });

    // 4. Verify profile section is pre-filled with seeded data
    await expect(page.getByLabel("Name")).toHaveValue("Test User");
    await expect(page.getByLabel("Weight (kg)")).toHaveValue("70");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-03-profile-prefilled.png`,
    });

    // 5. Update the name
    await page.getByLabel("Name").clear();
    await page.getByLabel("Name").fill("Updated User");

    // 6. Update weight and recalculate goal
    await page.getByLabel("Weight (kg)").clear();
    await page.getByLabel("Weight (kg)").fill("80");
    await page.getByRole("button", { name: "Recalculate" }).click();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-04-updated-fields.png`,
    });

    // 7. Switch display unit to oz
    await page.getByRole("button", { name: "oz" }).click();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-05-unit-switched.png`,
    });

    // 8. Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-06-saved.png`,
    });

    // 9. Verify localStorage was updated
    const guestData = await page.evaluate(() =>
      localStorage.getItem("hydration_guest_data")
    );
    expect(guestData).not.toBeNull();
    const parsed = JSON.parse(guestData!);
    expect(parsed.profile.display_name).toBe("Updated User");
    expect(parsed.profile.weight_kg).toBe(80);
    expect(parsed.profile.preferred_unit).toBe("oz");

    // 10. Navigate back to dashboard to confirm settings took effect
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/settings-07-back-to-dashboard.png`,
    });
  });
});
