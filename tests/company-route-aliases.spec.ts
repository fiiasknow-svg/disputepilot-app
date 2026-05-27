import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('company route aliases redirect to current company pages', async ({ page }) => {
  await page.goto(`${BASE_URL}/company`);
  await expect(page).toHaveURL(/\/company\/settings$/);
  await expect(page.getByRole('heading', { name: 'Company Settings', exact: true })).toBeVisible();

  await page.goto(`${BASE_URL}/company/dispute-status-notify`);
  await expect(page).toHaveURL(/\/company\/notify-automation$/);
  await expect(page.getByRole('heading', { name: 'Notify & Automation', exact: true })).toBeVisible();
});
