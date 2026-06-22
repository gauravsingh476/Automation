import { test as setup } from '@playwright/test';
import fs from 'fs';
import { signIn } from './helpers/auth';

const SESSION_FILE = 'playwright/.auth/user.json';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

setup('authenticate', async ({ page }) => {
  if (fs.existsSync(SESSION_FILE)) {
    const { mtimeMs } = fs.statSync(SESSION_FILE);
    if (Date.now() - mtimeMs < SESSION_MAX_AGE_MS) {
      console.log('Reusing existing session');
      return;
    }
  }

  console.log('Session missing or expired — logging in');
  await signIn(page);
  await page.context().storageState({ path: SESSION_FILE });
});
