import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 4173;
const baseURL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    // Dedicated port avoids attaching to a dev server on :3000. `next start` (not standalone node) keeps asset paths aligned for Playwright.
    command: `npm run build && PORT=${E2E_PORT} npm run start`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
