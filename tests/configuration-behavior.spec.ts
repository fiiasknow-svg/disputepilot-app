import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

function collectRuntimeErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));

  return errors;
}

test('configuration can edit and save practical settings', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.goto(`${BASE_URL}/settings/configuration`);

  await page.getByPlaceholder('Your Company Name').fill(`Config Company ${Date.now()}`);
  await page.getByPlaceholder('info@yourcompany.com').fill('config@example.com');
  await page.getByPlaceholder('(555) 000-0000').fill('(212) 555-0144');
  await page.locator('select').first().selectOption('America/Chicago');

  await page.getByRole('button', { name: /Save General Settings/i }).click();
  await expect(page.getByRole('button', { name: /Saved/i })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('configuration custom client status can be created and deleted', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.goto(`${BASE_URL}/settings/configuration`);

  await expect(page.getByRole('heading', { name: 'Configuration', exact: true })).toBeVisible();
  await expect(page.getByText(/Could not load custom statuses from Supabase/i)).toHaveCount(0);
  await expect(page.getByText(/Could not find the table 'public\.statuses'/i)).toHaveCount(0);
  await page.getByRole('button', { name: 'Client Statuses' }).click();
  await expect(page.getByText('Default Client Statuses')).toBeVisible();
  await expect(page.getByText(/Loading/)).toBeHidden();

  const statusName = `Playwright Status ${Date.now()}`;
  await page.getByRole('button', { name: '+ Add Status' }).click();
  await expect(page.getByRole('heading', { name: 'Add Custom Client Status' })).toBeVisible();
  await page.getByPlaceholder('e.g. On Hold').fill(statusName);
  await page.getByRole('button', { name: /^Add Status$/ }).click();

  const statusRow = page.locator(`xpath=//span[normalize-space()="${statusName}"]/ancestor::div[button][1]`).first();
  await expect(statusRow).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: /statuses|schema cache/i })).toHaveCount(0);
  await statusRow.getByRole('button').click();
  await expect(statusRow).toBeHidden();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('Application error');
  expect(bodyText).not.toContain('Runtime Error');
  expect(runtimeErrors).toEqual([]);
});

test('configuration missing statuses table uses session fallback without red alert', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  let mockedStatusesRequest = false;

  await page.route('**/rest/v1/statuses*', async route => {
    mockedStatusesRequest = true;
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'PGRST205',
        message: "Could not find the table 'public.statuses' in the schema cache",
      }),
    });
  });

  await page.goto(`${BASE_URL}/settings/configuration`);
  await page.getByRole('button', { name: 'Client Statuses' }).click();
  await expect(page.getByText('Default Client Statuses')).toBeVisible();
  await expect(page.getByText(/Loading/)).toBeHidden();

  test.skip(
    !mockedStatusesRequest,
    'Supabase browser client is not configured in this environment, so the missing-table network mock cannot be exercised.'
  );

  await expect(page.getByRole('alert').filter({ hasText: /Could not load custom statuses from Supabase|schema cache/i })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: /Custom statuses are not connected yet/i })).toBeVisible();

  const statusName = `Missing Table Status ${Date.now()}`;
  await page.getByRole('button', { name: '+ Add Status' }).click();
  await expect(page.getByRole('heading', { name: 'Add Custom Client Status' })).toBeVisible();
  await page.getByPlaceholder('e.g. On Hold').fill(statusName);
  await page.getByRole('button', { name: /^Add Status$/ }).click();

  const statusRow = page.locator(`xpath=//span[normalize-space()="${statusName}"]/ancestor::div[button][1]`).first();
  await expect(statusRow).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /Added status locally/i })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: /statuses|schema cache/i })).toHaveCount(0);
  await statusRow.getByRole('button').click();
  await expect(statusRow).toBeHidden();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('Application error');
  expect(bodyText).not.toContain('Runtime Error');
  expect(runtimeErrors).toEqual([]);
});
