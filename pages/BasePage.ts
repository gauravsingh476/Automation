import { Page, Locator } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
  }

  getByTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  getByPlaceholder(text: string): Locator {
    return this.page.getByPlaceholder(text);
  }

  getByRole(role: Parameters<Page["getByRole"]>[0], name: string): Locator {
    return this.page.getByRole(role, { name });
  }

  getByText(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  getByLabel(text: string): Locator {
    return this.page.getByLabel(text);
  }

  getByTestIdPrefix(prefix: string): Locator {
    return this.page.locator(`[data-testid^='${prefix}']`);
  }

  getByDialog(): Locator {
    return this.page.getByRole("dialog");
  }

  // Escape hatch for legacy UI with no data-testid and no accessible name
  // (icon-only buttons, CSS-module classes). Prefer the methods above —
  // move a selector out of here once the frontend adds a data-testid.
  locatorByCss(selector: string): Locator {
    return this.page.locator(selector);
  }

  async expectURL(pattern: string | RegExp, timeout = 10000) {
    await this.page.waitForURL(pattern, { timeout });
  }
}
