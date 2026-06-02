import { expect, test, type Page } from '@playwright/test';
import { BASE_URL, loginIfNeeded } from './helpers/loginIfNeeded';

async function expectAuthenticatedShell(page: Page) {
  await expect(page.locator('.cdm-topbar'), 'Expected authenticated dashboard shell; Business Login may still be blocking this route.').toBeVisible();
  await expect(page.getByText(/Business Login/i), 'Authenticated route unexpectedly showed Business Login.').toHaveCount(0);
}

test.describe('authenticated live smoke', () => {
  test('admin routes work after Business Login', async ({ page }) => {
    await loginIfNeeded(page);

    await test.step('dashboard reaches shell and activation opens modal', async () => {
      await expectAuthenticatedShell(page);
      await expect(page.locator('.cdm-dashboard-page')).toBeVisible();

      await page.locator('.cdm-topbar').getByRole('button', { name: 'ACTIVATE MEMBERSHIP' }).click();
      await expect(page.getByRole('heading', { name: /Activate\s+Your\s+Client Dispute Manager\s+Account Today/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /ACTIVATE .* CLAIM MY GIFTS/i })).toBeVisible();
      await page.getByRole('button', { name: /^Close$/i }).click();
    });

    await test.step('company settings saves and reloads local profile', async () => {
      await page.goto(new URL('/company/settings', BASE_URL).toString());
      await expectAuthenticatedShell(page);

      const companyName = `Live Smoke Company ${Date.now()}`;
      await page.getByLabel('Company Name').fill(companyName);
      await page.getByLabel('Phone').fill('(404) 555-0199');
      await page.getByLabel('Email').fill('live-smoke@example.test');
      await page.getByLabel('Website').fill('https://example.test');
      await page.getByLabel('Notes / Description').fill('Authenticated live smoke local company profile.');
      await page.getByRole('button', { name: /Save Company/i }).click();

      await expect(page.getByRole('status')).toContainText(`Company profile saved locally for ${companyName}`);
      await page.reload();
      await expectAuthenticatedShell(page);
      await expect(page.getByLabel('Company Name')).toHaveValue(companyName);
      await expect(page.getByRole('status')).toContainText('Company profile loaded from local storage.');
    });

    await test.step('pay per deletion reaches page and shows local send wording', async () => {
      await page.goto(new URL('/billing/pay-per-deletion', BASE_URL).toString());
      await expectAuthenticatedShell(page);
      await expect(page.getByRole('heading', { name: 'Pay Per Deletion' })).toBeVisible();

      await page.getByLabel('Select Client').selectOption({ index: 1 });
      await page.getByRole('button', { name: /Build Estimate/i }).click();
      await expect(page.getByRole('button', { name: 'Mark Sent Locally' })).toBeVisible();
    });

    await test.step('automation cards route to Zapier and GoHighLevel pages', async () => {
      await page.goto(new URL('/automation', BASE_URL).toString());
      await expectAuthenticatedShell(page);

      await page.getByRole('button', { name: /^Zapier/i }).click();
      await expect(page).toHaveURL(/\/automation\/zapier$/);
      await expect(page.getByRole('heading', { name: 'Zapier Integration' })).toBeVisible();

      await page.goto(new URL('/automation', BASE_URL).toString());
      await expectAuthenticatedShell(page);
      await page.getByRole('button', { name: /^Go-HighLevel/i }).click();
      await expect(page).toHaveURL(/\/automation\/go-highlevel$/);
      await expect(page.getByRole('heading', { name: 'GoHighLevel Integration' })).toBeVisible();
    });
  });
});
