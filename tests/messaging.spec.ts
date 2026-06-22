import { test, expect, Page } from '@playwright/test';

test.describe.serial('Messaging', () => {
  let page: Page;
  let inboxData: any;
  let phoneNumbers: string[];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('fetch phone numbers from inbox API', async () => {
    const inboxResponsePromise = page.waitForResponse(
      res => res.url().includes('/api/v2/messages_v2/inbox') && res.status() === 200
    );

    await page.goto('/messages');

    const inboxResponse = await inboxResponsePromise;
    inboxData = await inboxResponse.json();
    console.log(JSON.stringify(inboxData, null, 2));

    const threads = inboxData?.threads ?? [];
    phoneNumbers = threads.map((thread: any) => thread.external_phone);
    expect(phoneNumbers.length).toBeGreaterThan(0);
  });

  test('verify inbox phone numbers appear in left panel', async () => {
    for (const phoneNumber of phoneNumbers) {
      const threadLink = page.locator(`a[href*="/messages/with/${phoneNumber}"]`);
      await expect(threadLink.first()).toBeVisible();
    }
  });

  test('navigate to Messaging', async () => {
    const inboxResponse = page.waitForResponse(
      res => res.url().includes('api/v2/messages_v2/inbox/') && res.status() === 200
    );
    const threadResponse = page.waitForResponse(
      res => res.url().includes('api/v1/messages_v2/cc-thread-and-messages') && res.status() === 200
    );

    await page.goto('/messages');

    await Promise.all([inboxResponse, threadResponse]);
  });

  test('send message with variable', async () => {
    const appShell = page.locator("div.hamburger-menu__menuWrapper___D0W7S");
    if (await appShell.count()) await appShell.click();

    await page.locator("div.notranslate.public-DraftEditor-content").click();
    await page.locator("i.fa-regular.fa-brackets-curly").click();
    await page.locator("span").filter({ hasText: 'contact_first_name' }).click();

    const sendResponse = page.waitForResponse(
      res => res.url().includes('/api/v1/messages_v2') && res.request().method() === 'POST' && res.status() === 200
    );
    await page.locator("div.notranslate.public-DraftEditor-content").fill('This is an automated message. Please ignore.');
    await page.locator('span:has-text("Send")').click();

    const response = await sendResponse;
    const body = await response.json();
    console.log(body);
    expect(body?.id).toBeTruthy();
  });

  test('send new message to recipient', async () => {
    await page.locator("i.fa-regular.fa-pen-to-square").click();

    const recipientInput = page.locator("input[placeholder='Type a name or phone number']");
    await recipientInput.fill('+13143508201');
    await page.keyboard.press('Enter');

    await page.locator("div.notranslate.public-DraftEditor-content").fill('This is an automated message. Please ignore.');

    const sendResponse = page.waitForResponse(
      res => res.url().includes('/api/v1/messages_v2') && res.request().method() === 'POST' && res.status() >= 200 && res.status() < 300
    );
    await page.locator('span:has-text("Send")').click();    

    const response = await sendResponse;
    const body = await response.json();
    console.log(JSON.stringify(body, null, 2));
  });

  test('search messages', async () => {
    await page.getByRole('button', { name: 'Search' }).click();

    const searchResponse = page.waitForResponse(
      res => res.url().includes('/api/v1/messages_v2/search/keyword') && res.status() === 200
    );

    const searchInput = page.locator('input.inbox-action-bar__searchInput___brYbd');
    await searchInput.fill('Test');

    const response = await searchResponse;
    const body = await response.json();
    console.log(JSON.stringify(body, null, 2));

    const hasResults = (body?.threads?.length ?? 0) > 0 || (body?.contacts?.length ?? 0) > 0;
    if (hasResults) {
      await expect(page.locator('a.inbox-row__row___UCuR9').first()).toBeVisible();
    }

    await page.goto('/messages');
  });

  test('apply inbox filters', async () => {
    await page.locator("span").filter({ hasText: 'All assigned' }).click();
    await page.locator("span").filter({ hasText: 'Assigned to me' }).click();

    const labels = ['Newest', 'Unread', 'Bookmarked', 'Not replied', 'Archived', 'Newest'];
    for (let i = 0; i < labels.length - 1; i++) {
      await page.locator('span').filter({ hasText: labels[i] }).first().click();
      await page.locator('span').filter({ hasText: labels[i + 1] }).first().click();
    }
  });

  test('open settings', async () => {
    await page.locator("div.ButtonDropdown-module__buttonDropdownContainer___kwHEC").first().click();
    await page.locator("span").filter({ hasText: 'Settings' }).first().click();
  });

  test('open inbox dropdown', async () => {
    await page.locator("div.ButtonDropdown-module__buttonDropdownContainer___kwHEC").first().click();
    await page.locator("span").filter({ hasText: 'Inbox' }).first().click();
  });

  test('open chat menu', async () => {
    await page.locator("i.fa-regular.fa-ellipsis").click();
    await page.locator("div.Menu-module__optionTextLabel___VRKEs").first().waitFor({ state: 'visible' });
  });
});
