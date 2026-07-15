import { defineConfig, devices } from "@playwright/test";

// E2E interaktiviti PERKIB — uji terhadap perkib.my LIVE (deployment sebenar v3.2).
// Fokus: interaktiviti klien yang tidak dapat diuji melalui extension Chrome MCP
// (tab background). Jalankan: `npx playwright test`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://perkib.my",
    headless: true,
    actionTimeout: 15_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
