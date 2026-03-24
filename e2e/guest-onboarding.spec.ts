import { test, expect } from "@playwright/test";

test.describe("Guest onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear guest localStorage keys before each test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("hydration_guest_mode");
      localStorage.removeItem("hydration_guest_data");
      localStorage.removeItem("hydration_guest_onboarded");
    });
  });

  test("login as guest → fill in details → reach dashboard", async ({
    page,
  }, testInfo) => {
    const prefix = testInfo.project.name;

    // 1. Navigate to login page
    await page.goto("/login");
    await expect(page.getByText("Welcome to HydrateTrack")).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/01-login-page.png`,
    });

    // 2. Click "Continue as Guest"
    await page.getByRole("button", { name: "Continue as Guest" }).click();

    // 3. Should redirect to onboarding
    await expect(page).toHaveURL("/onboarding");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/02-onboarding-empty.png`,
    });

    // 4. Fill in onboarding form
    await page.getByLabel("Name").fill("Test User");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/03-name-filled.png`,
    });

    await page.getByLabel("Weight (kg)").fill("70");
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/04-weight-filled.png`,
    });

    // Select milliliters unit
    await page.getByRole("button", { name: "Milliliters (ml)" }).click();

    // Verify calculated goal is displayed (toLocaleString may add comma)
    await expect(page.getByText("Your recommended daily goal")).toBeVisible();
    await expect(page.getByText(/2,?450\s*ml/)).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/05-form-complete.png`,
    });

    // 5. Submit the form
    await page.getByRole("button", { name: "Start Tracking" }).click();

    // 6. Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");

    // 7. Verify dashboard loaded — guest banner should be visible
    await expect(page.getByText("Data stored locally only")).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/${prefix}/06-dashboard.png`,
    });

    // 8. Verify localStorage was set correctly
    const guestMode = await page.evaluate(() =>
      localStorage.getItem("hydration_guest_mode")
    );
    expect(guestMode).toBe("true");

    const onboarded = await page.evaluate(() =>
      localStorage.getItem("hydration_guest_onboarded")
    );
    expect(onboarded).toBe("true");

    const guestData = await page.evaluate(() =>
      localStorage.getItem("hydration_guest_data")
    );
    expect(guestData).not.toBeNull();

    const parsed = JSON.parse(guestData!);
    expect(parsed.profile.daily_goal_ml).toBe(2450);
    expect(parsed.profile.preferred_unit).toBe("ml");
  });
});
