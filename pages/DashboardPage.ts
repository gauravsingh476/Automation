import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  async goto() {
    await super.goto("/dashboard");
  }

  async expectLoaded() {
    await this.expectURL(/dashboard/, 15000);
  }
}
