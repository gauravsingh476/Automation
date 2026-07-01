import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";

// Login tests need an unauthenticated browser context.
test.use({ storageState: { cookies: [], origins: [] } });

test("login with valid credentials @ui", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  const login = new LoginPage(page);
  await login.loginAs(process.env.EMAIL!, process.env.PASSWORD!);

  await dashboard.expectLoaded();
});
