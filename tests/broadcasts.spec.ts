import { test, expect, Page } from '@playwright/test';

test.describe.serial('Broadcasts', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('navigate to Broadcasts', async () => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Broadcast', exact: true }).click();
    await expect(page).toHaveURL(/\/messages\/hv-broadcasts$/);
    await page.waitForLoadState('networkidle');
    // Page title wrapper contains the heading as an H1
    await expect(page.locator('[data-testid="PageTitle"]')).toContainText('Broadcast');
  });

  test('create broadcast page loads correctly', async () => {
    await page.getByRole('button', { name: 'Create Broadcast' }).click();
    await expect(page).toHaveURL(/\/messages\/hv-broadcasts\/new/);

    // Page heading — rendered as <h1>
    await expect(page.getByRole('heading', { name: 'Create New Broadcast' })).toBeVisible();

    // Required Details section
    await expect(page.getByText('Required Details')).toBeVisible();

    // Broadcast name field is empty and visible
    const nameInput = page.getByPlaceholder('Enter name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeEmpty();

    // Mode dropdown defaults to SMS
    await expect(page.locator('input[placeholder="Select..."]')).toHaveValue('SMS');

    // Inbox dropdown is visible and pre-filled
    await expect(page.locator('input[placeholder="Select"]')).toHaveValue('(213) 204-6663');

    // Warning about excluded numbers — rendered as <h5>
    await expect(page.locator('h5', { hasText: 'Some numbers may be excluded from this broadcast' })).toBeVisible();
    // In 'create broadcast page loads correctly':
    await expect(page.getByText('View Details')).toBeVisible();

    // In 'create broadcast — handle excluded numbers':
    await page.getByText('View Details').click();
    await page.getByRole('button', { name: 'close' }).click();

    // Recipients section
    await expect(page.getByPlaceholder('Search Contact List')).toBeVisible();

    // Message section
    await expect(page.getByText('Message', { exact: true })).toBeVisible();

    // Schedule section — "Schedule for Later" is selected by default on this page
    await expect(page.getByText('Schedule', { exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Send Now' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Schedule for Later' })).not.toBeChecked();

    // Send is disabled — no fields filled yet
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('create broadcast — fill required details', async () => {
    const nameInput = page.getByPlaceholder('Enter name');
    await nameInput.fill('Automated Broadcast');
    await expect(nameInput).toHaveValue('Automated Broadcast');

    // Send still disabled — contact list and message not filled
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('create broadcast — handle excluded numbers', async () => {
    // In 'create broadcast page loads correctly':
    await expect(page.getByText('View Details')).toBeVisible();

    // In 'create broadcast — handle excluded numbers':
    await page.getByText('View Details').click();
    await page.locator('input[name="suppression-setting"][value="dont-apply"]').check();
    await expect(page.locator('input[name="suppression-setting"][value="dont-apply"]')).toBeChecked();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'close' }).click();

    // Warning should be gone after acknowledging
    await expect(
      page.locator('h5', { hasText: 'Some numbers may be excluded from this broadcast' })
    ).toBeVisible();
  });

  test('create broadcast — add contact list', async () => {
    const searchInput = page.getByPlaceholder('Search Contact List');
    await searchInput.click();
    await searchInput.fill('prod list');
    await page.getByRole('button', { name: 'Prod list', exact: true }).click();

    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Recipient list should appear as selected
    await expect(page.locator('.Chip-module__chipWrapper___RnidE', { hasText: 'Prod list' })).toBeVisible();

    // Send still disabled — message not filled yet
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('create broadcast — upload CSV file', async () => {
    const csvInput = page.getByPlaceholder('CSV Upload');
    await csvInput.click();

    const uploadResponsePromise = page.waitForResponse(
      res => res.url().includes('/api/v2/messages_v2/contacts/file/upload') && res.status() >= 200 && res.status() < 300
    );

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByText('Drag and drop or click to upload a file').click(),
    ]);
    await fileChooser.setFiles('/Users/senseadmin/Downloads/contacts.csv');

    await expect(page.getByText('contacts.csv')).toBeVisible();

    // Advance to column mapping step
    await page.getByRole('button', { name: 'Next step' }).click();

    // Map CSV columns to contact fields
    const nameRow = page.getByRole('row', { name: /name/i });
    await nameRow.getByRole('button').click();
    await page.getByRole('button', { name: 'First name' }).click();

    const emailRow = page.getByRole('row', { name: /email/i });
    await emailRow.getByRole('button').click();
    await page.getByRole('button', { name: 'Email address' }).click();

    const phoneRow = page.getByRole('row', { name: /phone/i });
    await phoneRow.getByRole('button').click();
    await page.getByRole('button', { name: 'Phone number' }).click();

    await page.getByRole('button', { name: 'Finish' }).click();

    const uploadResponse = await uploadResponsePromise;
    const uploadData = await uploadResponse.json();
    console.log(JSON.stringify(uploadData, null, 2));
  });

  test('create broadcast — compose message', async () => {
    // Click the DraftJS contenteditable editor
    const messageEditor = page.locator('.public-DraftEditor-content');
    await messageEditor.click();

    const messageText = 'This is a test broadcast';
    await messageEditor.fill(messageText);

    // Verify message was entered
    await expect(messageEditor).toHaveText(messageText);

    // Send is now enabled — all required fields are filled
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  test('create broadcast — send', async () => {

    await page.getByRole('button', { name: 'Send' }).click();
    
    const sendResponse = page.waitForResponse(
      res =>
        res.url().includes('api/v2/messages_v2/broadcasts/create') &&
        res.request().method() === 'POST' &&
        res.status() >= 200 &&
        res.status() < 300
    );

    const response = await sendResponse;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });
});
