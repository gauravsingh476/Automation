import { Locator } from "@playwright/test";
import { BasePage } from "../BasePage";

// TODO: replace NON_TESTID/CSS selectors with data-testid once frontend adds them
const SELECTORS = {
  // NON_TESTID
  contactFirstNameVariable: "contact_first_name",
  recipientInput: "Type a name or phone number",
  searchButton: "Search",
  sendButtonText: "Send",
  allAssignedOption: "All assigned",
  assignedToMeOption: "Assigned to me",
  settingsOption: "Settings",
  inboxOption: "Inbox",

  // CSS (icon-only controls / CSS-module classes, no accessible name available)
  appShellClose: "div.hamburger-menu__menuWrapper___D0W7S",
  messageEditor: "div.notranslate.public-DraftEditor-content",
  variableButton: "i.fa-regular.fa-brackets-curly",
  newMessageButton: "i.fa-regular.fa-pen-to-square",
  searchInput: "input.inbox-action-bar__searchInput___brYbd",
  searchResultLink: "a.inbox-row__row___UCuR9",
  dropdownButton: "div.ButtonDropdown-module__buttonDropdownContainer___kwHEC",
  chatMenuButton: "i.fa-regular.fa-ellipsis",
  chatMenuOption: "div.Menu-module__optionTextLabel___VRKEs",
};

export class MessagingPage extends BasePage {
  async goto() {
    await super.goto("/messages");
  }

  async gotoAndWaitForLoad() {
    const inboxResponse = this.page.waitForResponse(
      (res) => res.url().includes("api/v2/messages_v2/inbox/") && res.status() === 200
    );
    const threadResponse = this.page.waitForResponse(
      (res) => res.url().includes("api/v1/messages_v2/cc-thread-and-messages") && res.status() === 200
    );

    await this.goto();

    await Promise.all([inboxResponse, threadResponse]);
  }

  async fetchInboxData(): Promise<any> {
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes("/api/v2/messages_v2/inbox") && res.status() === 200
    );

    await this.goto();

    const response = await responsePromise;
    return response.json();
  }

  threadLinkByPhoneNumber(phoneNumber: string): Locator {
    return this.locatorByCss(`a[href*="/messages/with/${phoneNumber}"]`);
  }

  private sendButton(): Locator {
    return this.getByText(SELECTORS.sendButtonText);
  }

  private async closeAppShellIfPresent() {
    const appShell = this.locatorByCss(SELECTORS.appShellClose);
    if (await appShell.count()) await appShell.click();
  }

  async sendMessageWithVariable(message: string): Promise<any> {
    await this.closeAppShellIfPresent();

    await this.locatorByCss(SELECTORS.messageEditor).click();
    await this.locatorByCss(SELECTORS.variableButton).click();
    await this.getByText(SELECTORS.contactFirstNameVariable).click();

    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes("/api/v1/messages_v2") && res.request().method() === "POST" && res.status() === 200
    );
    await this.locatorByCss(SELECTORS.messageEditor).fill(message);
    await this.sendButton().click();

    const response = await responsePromise;
    return response.json();
  }

  async sendNewMessageToRecipient(phoneNumber: string, message: string): Promise<any> {
    await this.locatorByCss(SELECTORS.newMessageButton).click();

    await this.getByPlaceholder(SELECTORS.recipientInput).fill(phoneNumber);
    await this.page.keyboard.press("Enter");

    await this.locatorByCss(SELECTORS.messageEditor).fill(message);

    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/messages_v2") &&
        res.request().method() === "POST" &&
        res.status() >= 200 &&
        res.status() < 300
    );
    await this.sendButton().click();

    const response = await responsePromise;
    return response.json();
  }

  async searchMessages(query: string): Promise<any> {
    await this.getByRole("button", SELECTORS.searchButton).click();

    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes("/api/v1/messages_v2/search/keyword") && res.status() === 200
    );
    await this.locatorByCss(SELECTORS.searchInput).fill(query);

    const response = await responsePromise;
    return response.json();
  }

  searchResultLinks(): Locator {
    return this.locatorByCss(SELECTORS.searchResultLink);
  }

  async applyAssignedToMeFilter() {
    await this.getByText(SELECTORS.allAssignedOption).click();
    await this.getByText(SELECTORS.assignedToMeOption).click();
  }

  async cycleSortFilters(labels: string[]) {
    for (let i = 0; i < labels.length - 1; i++) {
      await this.getByText(labels[i]).first().click();
      await this.getByText(labels[i + 1]).first().click();
    }
  }

  async openSettings() {
    await this.locatorByCss(SELECTORS.dropdownButton).first().click();
    await this.getByText(SELECTORS.settingsOption).first().click();
  }

  async openInboxDropdown() {
    await this.locatorByCss(SELECTORS.dropdownButton).first().click();
    await this.getByText(SELECTORS.inboxOption).first().click();
  }

  async openChatMenu() {
    await this.locatorByCss(SELECTORS.chatMenuButton).click();
    await this.locatorByCss(SELECTORS.chatMenuOption).first().waitFor({ state: "visible" });
  }
}
