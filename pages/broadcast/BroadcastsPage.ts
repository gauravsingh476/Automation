import { Locator } from "@playwright/test";
import { BasePage } from "../BasePage";

// TODO: replace NON_TESTID/CSS selectors with data-testid once frontend adds them
const SELECTORS = {
  // NON_TESTID
  broadcastLink: "Broadcast",
  createBroadcastButton: "Create Broadcast",
  heading: "Create New Broadcast",
  requiredDetailsText: "Required Details",
  nameInput: "Enter name",
  excludedNumbersWarning: "Some numbers may be excluded from this broadcast",
  viewDetailsLink: "View Details",
  closeButton: "close",
  searchContactListInput: "Search Contact List",
  messageSectionText: "Message",
  scheduleSectionText: "Schedule",
  sendNowRadio: "Send Now",
  scheduleForLaterRadio: "Schedule for Later",
  sendButton: "Send",
  saveButton: "Save",
  csvUploadInput: "CSV Upload",
  csvUploadDropzone: "Drag and drop or click to upload a file",
  nextStepButton: "Next step",
  finishButton: "Finish",
  firstNameOption: "First name",
  emailAddressOption: "Email address",
  phoneNumberOption: "Phone number",

  // CSS (CSS-module classes, no accessible name available)
  pageTitle: '[data-testid="PageTitle"]',
  modeDropdown: 'input[placeholder="Select..."]',
  inboxDropdown: 'input[placeholder="Select"]',
  excludedNumbersHeading: "h5",
  suppressionDontApplyRadio: 'input[name="suppression-setting"][value="dont-apply"]',
  contactListChip: ".Chip-module__chipWrapper___RnidE",
  messageEditor: ".public-DraftEditor-content",
};

export class BroadcastsPage extends BasePage {
  async goto() {
    await super.goto("/messages/hv-broadcasts");
  }

  async navigateFromHome() {
    await super.goto("/");
    await this.getByRole("link", SELECTORS.broadcastLink).click();
  }

  async expectLoaded() {
    await this.expectURL(/\/messages\/hv-broadcasts$/, 15000);
    await this.page.waitForLoadState("networkidle");
  }

  get pageTitle(): Locator {
    return this.locatorByCss(SELECTORS.pageTitle);
  }

  async clickCreateBroadcast() {
    await this.getByRole("button", SELECTORS.createBroadcastButton).click();
  }

  get heading(): Locator {
    return this.getByRole("heading", SELECTORS.heading);
  }

  get requiredDetailsText(): Locator {
    return this.getByText(SELECTORS.requiredDetailsText);
  }

  get nameInput(): Locator {
    return this.getByPlaceholder(SELECTORS.nameInput);
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  get modeDropdown(): Locator {
    return this.locatorByCss(SELECTORS.modeDropdown);
  }

  get inboxDropdown(): Locator {
    return this.locatorByCss(SELECTORS.inboxDropdown);
  }

  get excludedNumbersWarning(): Locator {
    return this.locatorByCss(SELECTORS.excludedNumbersHeading).filter({ hasText: SELECTORS.excludedNumbersWarning });
  }

  get viewDetailsLink(): Locator {
    return this.getByText(SELECTORS.viewDetailsLink);
  }

  async dismissExcludedNumbersDialog() {
    await this.viewDetailsLink.click();
    await this.getByRole("button", SELECTORS.closeButton).click();
  }

  async acknowledgeExcludedNumbers() {
    await this.viewDetailsLink.click();
    await this.suppressionDontApplyRadio.check();
    await this.getByRole("button", SELECTORS.saveButton).click();
    await this.getByRole("button", SELECTORS.closeButton).click();
  }

  get suppressionDontApplyRadio(): Locator {
    return this.locatorByCss(SELECTORS.suppressionDontApplyRadio);
  }

  get searchContactListInput(): Locator {
    return this.getByPlaceholder(SELECTORS.searchContactListInput);
  }

  async addContactList(searchQuery: string, listDisplayName: string) {
    await this.searchContactListInput.click();
    await this.searchContactListInput.fill(searchQuery);
    await this.getByRole("button", listDisplayName).click();
    await this.page.locator("body").click({ position: { x: 10, y: 10 } });
  }

  contactListChip(name: string): Locator {
    return this.locatorByCss(SELECTORS.contactListChip).filter({ hasText: name });
  }

  get messageSectionText(): Locator {
    return this.getByText(SELECTORS.messageSectionText);
  }

  get scheduleSectionText(): Locator {
    return this.getByText(SELECTORS.scheduleSectionText);
  }

  get sendNowRadio(): Locator {
    return this.getByRole("radio", SELECTORS.sendNowRadio);
  }

  get scheduleForLaterRadio(): Locator {
    return this.getByRole("radio", SELECTORS.scheduleForLaterRadio);
  }

  get sendButton(): Locator {
    return this.getByRole("button", SELECTORS.sendButton);
  }

  async uploadCsvFile(filePath: string) {
    await this.getByPlaceholder(SELECTORS.csvUploadInput).click();

    const uploadResponsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v2/messages_v2/contacts/file/upload") &&
        res.status() >= 200 &&
        res.status() < 300
    );

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.getByText(SELECTORS.csvUploadDropzone).click(),
    ]);
    await fileChooser.setFiles(filePath);

    return uploadResponsePromise;
  }

  csvFileName(fileName: string): Locator {
    return this.getByText(fileName);
  }

  async mapCsvColumns() {
    await this.getByRole("button", SELECTORS.nextStepButton).click();

    const nameRow = this.page.getByRole("row", { name: /name/i });
    await nameRow.getByRole("button").click();
    await this.getByRole("button", SELECTORS.firstNameOption).click();

    const emailRow = this.page.getByRole("row", { name: /email/i });
    await emailRow.getByRole("button").click();
    await this.getByRole("button", SELECTORS.emailAddressOption).click();

    const phoneRow = this.page.getByRole("row", { name: /phone/i });
    await phoneRow.getByRole("button").click();
    await this.getByRole("button", SELECTORS.phoneNumberOption).click();

    await this.getByRole("button", SELECTORS.finishButton).click();
  }

  get messageEditor(): Locator {
    return this.locatorByCss(SELECTORS.messageEditor);
  }

  async composeMessage(message: string) {
    await this.messageEditor.click();
    await this.messageEditor.fill(message);
  }

  async sendBroadcast() {
    const sendResponsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes("api/v2/messages_v2/broadcasts/create") &&
        res.request().method() === "POST" &&
        res.status() >= 200 &&
        res.status() < 300
    );
    await this.sendButton.click();
    return sendResponsePromise;
  }
}
