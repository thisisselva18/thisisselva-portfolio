import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  // The dev server makes each image size on first request, so full-page tests are slow and
  // too many at once time out.
  timeout: 90_000,
  workers: 2,
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
