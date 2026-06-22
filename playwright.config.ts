import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

type EnvironmentVersion = 'pre_prod' | 'prod';

const version = (process.env.VERSION || 'pre_prod') as EnvironmentVersion;

const urls = {
  pre_prod: 'https://multientity.sandbox-preprod.sensehq.com',
  prod: 'https://multientity.sensehq.com',
};

console.log('Version:', version);
console.log('Base URL:', urls[version]);

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 120_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: urls[version],
    headless: true,
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
