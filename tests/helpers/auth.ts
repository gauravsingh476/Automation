import { Page } from '@playwright/test';

export async function signIn(page: Page) {
  const email = process.env.SENSE_EMAIL;
  const password = process.env.SENSE_PASSWORD;
  if (!email || !password) {
    throw new Error('SENSE_EMAIL and SENSE_PASSWORD must be set (see .env.example)');
  }

  await page.goto('/signin');
  await page.getByRole('textbox', { name: 'Enter email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'AI Agents' }).waitFor({ timeout: 60000 });
}
