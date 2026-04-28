import { test, expect } from "@playwright/test";

async function waitForHydratedThemeControls(page: import("@playwright/test").Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page
    .locator('button[aria-label="Dark theme"]')
    .waitFor({ state: "visible", timeout: 30_000 });
}

test.describe("Home", () => {
  test("loads hero and QR card", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "QR Code Generator", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your QR code", level: 2 }),
    ).toBeVisible();
    await expect(page.getByLabel("URL or text")).toBeVisible();
  });

  test("theme toggle applies dark class on html", async ({ page }) => {
    await waitForHydratedThemeControls(page);
    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.getByRole("button", { name: "Light theme" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("download shows success toast", async ({ page }) => {
    await waitForHydratedThemeControls(page);
    await page.getByRole("button", { name: "Download PNG" }).click();
    await expect(
      page.getByText("PNG saved to your device.", { exact: true }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Skip to content" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
