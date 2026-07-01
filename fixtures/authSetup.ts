import { chromium, FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import fs from "fs";
import { LoginPage } from "../pages/LoginPage";

const envFile = `.env.${process.env.ENV ?? "local"}`;
dotenv.config({ path: envFile });

const SESSION_FILE = ".auth.json";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

export default async function authSetup(config: FullConfig) {
  if (fs.existsSync(SESSION_FILE)) {
    const { mtimeMs } = fs.statSync(SESSION_FILE);
    if (Date.now() - mtimeMs < SESSION_MAX_AGE_MS) {
      console.log("Session valid — skipping login");
      return;
    }
  }

  console.log("Logging in and saving session...");
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const login = new LoginPage(page);
  await login.goto();
  await login.loginAs(process.env.EMAIL!, process.env.PASSWORD!);
  await page.getByRole("link", { name: "AI Agents" }).waitFor({ timeout: 60000 });

  await context.storageState({ path: SESSION_FILE });
  await browser.close();
}
