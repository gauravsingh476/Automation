import { test, expect, Page } from "@playwright/test";
import { BroadcastsPage } from "../../../pages/broadcast/BroadcastsPage";

test.describe.serial("Broadcasts", () => {
  let page: Page;
  let broadcasts: BroadcastsPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: ".auth.json" });
    page = await context.newPage();
    broadcasts = new BroadcastsPage(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test("navigate to Broadcasts @ui", async () => {
    await broadcasts.navigateFromHome();
    await broadcasts.expectLoaded();
    await expect(broadcasts.pageTitle).toContainText("Broadcast");
  });

  test("create broadcast page loads correctly @ui", async () => {
    await broadcasts.clickCreateBroadcast();
    await expect(page).toHaveURL(/\/messages\/hv-broadcasts\/new/);

    await expect(broadcasts.heading).toBeVisible();
    await expect(broadcasts.requiredDetailsText).toBeVisible();

    await expect(broadcasts.nameInput).toBeVisible();
    await expect(broadcasts.nameInput).toBeEmpty();

    await expect(broadcasts.modeDropdown).toHaveValue("SMS");
    await expect(broadcasts.inboxDropdown).toHaveValue("(213) 204-6663");

    await expect(broadcasts.excludedNumbersWarning).toBeVisible();
    await expect(broadcasts.viewDetailsLink).toBeVisible();

    await broadcasts.dismissExcludedNumbersDialog();

    await expect(broadcasts.searchContactListInput).toBeVisible();
    await expect(broadcasts.messageSectionText).toBeVisible();

    await expect(broadcasts.scheduleSectionText).toBeVisible();
    await expect(broadcasts.sendNowRadio).toBeChecked();
    await expect(broadcasts.scheduleForLaterRadio).not.toBeChecked();

    await expect(broadcasts.sendButton).toBeDisabled();
  });

  test("create broadcast — fill required details @ui", async () => {
    await broadcasts.fillName("Automated Broadcast");
    await expect(broadcasts.nameInput).toHaveValue("Automated Broadcast");

    await expect(broadcasts.sendButton).toBeDisabled();
  });

  test("create broadcast — handle excluded numbers @ui", async () => {
    await expect(broadcasts.viewDetailsLink).toBeVisible();

    await broadcasts.acknowledgeExcludedNumbers();

    await expect(broadcasts.excludedNumbersWarning).toBeVisible();
  });

  test("create broadcast — add contact list @ui", async () => {
    await broadcasts.addContactList("prod list", "Prod list");

    await expect(broadcasts.contactListChip("Prod list")).toBeVisible();
    await expect(broadcasts.sendButton).toBeDisabled();
  });

  test("create broadcast — upload CSV file @ui", async () => {
    const uploadResponsePromise = await broadcasts.uploadCsvFile("/Users/senseadmin/Downloads/contacts.csv");

    await expect(broadcasts.csvFileName("contacts.csv")).toBeVisible();

    await broadcasts.mapCsvColumns();

    const uploadResponse = await uploadResponsePromise;
    const uploadData = await uploadResponse.json();
    console.log(JSON.stringify(uploadData, null, 2));
  });

  test("create broadcast — compose message @ui", async () => {
    const messageText = "This is a test broadcast";
    await broadcasts.composeMessage(messageText);

    await expect(broadcasts.messageEditor).toHaveText(messageText);
    await expect(broadcasts.sendButton).toBeEnabled();
  });

  test("create broadcast — send @ui", async () => {
    const sendResponsePromise = await broadcasts.sendBroadcast();

    const response = await sendResponsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });
});
