import { BasePage } from "./BasePage";

// TODO: replace NON_TESTID selectors with data-testid once frontend adds them
const SELECTORS = {
  // NON_TESTID
  emailInput: "Enter email",
  passwordInput: "Enter password",
  signInButton: "Sign In",
};

export class LoginPage extends BasePage {
  async goto() {
    await super.goto("/signin");
  }

  async loginAs(email: string, password: string) {
    await this.getByPlaceholder(SELECTORS.emailInput).fill(email);
    await this.getByPlaceholder(SELECTORS.passwordInput).fill(password);
    await this.getByRole("button", SELECTORS.signInButton).click();
  }
}
