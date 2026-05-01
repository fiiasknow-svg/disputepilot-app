import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client filter tabs work without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  const filters = [/All/i, /Current/i, /Leads/i, /Archive/i];

  for (const filter of filters) {
    const button = page.locator('main').getByRole('button', { name: filter }).first();

    await expect(button).toBeVisible();
    await button.click();

    await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();
  }
});