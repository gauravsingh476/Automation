import { test, expect, Page } from "@playwright/test";
import { MessagingPage } from "../../../pages/messaging/MessagingPage";

test.describe.serial("Messaging", () => {
  let page: Page;
  let messaging: MessagingPage;
  let inboxData: any;
  let phoneNumbers: string[];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: ".auth.json" });
    page = await context.newPage();
    messaging = new MessagingPage(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test("fetch phone numbers from inbox API @ui", async () => {
    inboxData = await messaging.fetchInboxData();
    console.log(JSON.stringify(inboxData, null, 2));

    const threads = inboxData?.threads ?? [];
    phoneNumbers = threads.map((thread: any) => thread.external_phone);
    expect(phoneNumbers.length).toBeGreaterThan(0);
  });

  test("verify inbox phone numbers appear in left panel @ui", async () => {
    for (const phoneNumber of phoneNumbers) {
      await expect(messaging.threadLinkByPhoneNumber(phoneNumber).first()).toBeVisible();
    }
  });

  test("navigate to Messaging @ui", async () => {
    await messaging.gotoAndWaitForLoad();
  });

  test("send message with variable @ui", async () => {
    const body = await messaging.sendMessageWithVariable("This is an automated message. Please ignore.");
    console.log(body);
  });

  test("send new message to recipient @ui", async () => {
    const body = await messaging.sendNewMessageToRecipient(
      "+13143508201",
      "This is an automated message. Please ignore."
    );
    console.log(JSON.stringify(body, null, 2));
  });

  test("search messages @ui", async () => {
    const body = await messaging.searchMessages("Test");
    console.log(JSON.stringify(body, null, 2));

    const hasResults = (body?.threads?.length ?? 0) > 0 || (body?.contacts?.length ?? 0) > 0;
    if (hasResults) {
      await expect(messaging.searchResultLinks().first()).toBeVisible();
    }

    await messaging.goto();
  });

  test("apply inbox filters @ui", async () => {
    await messaging.applyAssignedToMeFilter();

    const labels = ["Newest", "Unread", "Bookmarked", "Not replied", "Archived", "Newest"];
    await messaging.cycleSortFilters(labels);
  });

  test("open settings @ui", async () => {
    await messaging.openSettings();
  });

  test("open inbox dropdown @ui", async () => {
    await messaging.openInboxDropdown();
  });

  test("open chat menu @ui", async () => {
    await messaging.openChatMenu();
  });
});
