import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';

const SESSION_FILE = 'playwright/.auth/user.json';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

async function globalSetup(config: FullConfig) {
  if (fs.existsSync(SESSION_FILE)) {
    const { mtimeMs } = fs.statSync(SESSION_FILE);
    if (Date.now() - mtimeMs < SESSION_MAX_AGE_MS) {
      console.log('Session valid — skipping login');
      return;
    }
  }

  console.log('Logging in and saving session...');
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const email = process.env.SENSE_EMAIL;
  const password = process.env.SENSE_PASSWORD;
  if (!email || !password) {
    throw new Error('SENSE_EMAIL and SENSE_PASSWORD must be set (see .env.example)');
  }

  await page.goto(`${baseURL}/signin`);
  await page.getByRole('textbox', { name: 'Enter email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'AI Agents' }).waitFor({ timeout: 60000 });

  await context.storageState({ path: SESSION_FILE });
  await browser.close();
}

export default globalSetup;
