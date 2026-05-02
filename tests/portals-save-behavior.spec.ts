import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('portals and mobile app settings can be changed, saved, and reset', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/portals`);

  const portalUrl = `https://portal-test-${Date.now()}.example.com`;
  await page.getByLabel('Portal URL').fill(portalUrl);
  await page.getByLabel('Branding').fill('Playwright Credit Co');
  await page.getByLabel('Welcome Message').fill('Welcome from an automated portal test.');
  await page.getByLabel('Enable Push Notifications').check();

  await page.getByRole('button', { name: /Save Portal Settings/i }).click();

  await expect(page.getByText('Portal and mobile app settings saved for Playwright Credit Co.')).toBeVisible();
  await expect(page.getByText(`Playwright Credit Co at ${portalUrl}`)).toBeVisible();

  await page.getByLabel('Branding').fill('Unsaved Portal Brand');
  await page.getByRole('button', { name: /^Reset$/i }).click();
  await expect(page.getByLabel('Branding')).toHaveValue('Playwright Credit Co');
});
