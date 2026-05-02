import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('notify and automation settings can toggle save and create rules', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/notify-automation`);

  await page.getByRole('button', { name: /All Off/i }).first().click();
  await page.getByRole('button', { name: /Save Settings/i }).click();
  await expect(page.getByText('Notification settings saved successfully.')).toBeVisible();

  await page.getByRole('button', { name: /Automation Rules/i }).click();
  await page.getByRole('button', { name: /New Rule/i }).click();
  await page.getByPlaceholder('e.g. Welcome Email Series').fill(`Playwright Rule ${Date.now()}`);
  await page.getByPlaceholder('e.g. New client added').fill('Client completes onboarding');
  await page.getByPlaceholder('e.g. Send welcome email').fill('Send onboarding follow-up');
  await page.getByRole('button', { name: /Create Rule/i }).click();

  await expect(page.getByText(/Playwright Rule/i)).toBeVisible();
  await expect(page.getByText('Notification settings saved successfully.')).toBeVisible();
});
