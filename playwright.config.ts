import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

const envFile = `.env.${process.env.ENV ?? "local"}`;
dotenv.config({ path: envFile });

type EnvironmentVersion = "pre_prod" | "prod";

const version = (process.env.VERSION || "pre_prod") as EnvironmentVersion;

const urls = {
  pre_prod: "https://multientity.sandbox-preprod.sensehq.com",
  prod: "https://multientity.sensehq.com",
};

const baseURL = urls[version];

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./fixtures/authSetup.ts",
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  expect: { timeout: 15_000 },

  use: {
    baseURL,
    storageState: ".auth.json",
    headless: true,
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
