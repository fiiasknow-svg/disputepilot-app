import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('company sidebar links and aliases route correctly', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/settings`);

  for (const [name, url] of [
    ['Company Settings', /\/company\/settings$/],
    ['Portals/Mobile App', /\/company\/portals$/],
    ['Images/Documents', /\/company\/images-documents$/],
    ['Manage Emails', /\/company\/manage-emails$/],
    ['Dispute Status', /\/disputes\/status$/],
    ['Notify/Automation', /\/company\/notify-automation$/],
    ['Configuration', /\/settings\/configuration$/],
  ] as const) {
    await page.getByRole('link', { name }).first().click();
    await expect(page).toHaveURL(url);
  }

  await page.goto(`${BASE_URL}/company`);
  await expect(page).toHaveURL(/\/company\/settings$/);
  await page.goto(`${BASE_URL}/company/dispute-status-notify`);
  await expect(page).toHaveURL(/\/company\/notify-automation$/);
});
