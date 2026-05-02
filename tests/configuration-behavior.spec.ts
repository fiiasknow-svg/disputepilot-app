import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('configuration can edit and save practical settings', async ({ page }) => {
  await page.goto(`${BASE_URL}/settings/configuration`);

  await page.getByPlaceholder('Your Company Name').fill(`Config Company ${Date.now()}`);
  await page.getByPlaceholder('info@yourcompany.com').fill('config@example.com');
  await page.getByPlaceholder('(555) 000-0000').fill('(212) 555-0144');
  await page.locator('select').first().selectOption('America/Chicago');

  await page.getByRole('button', { name: /Save General Settings/i }).click();
  await expect(page.getByRole('button', { name: /Saved/i })).toBeVisible();
});
