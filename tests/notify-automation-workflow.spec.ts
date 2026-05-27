import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('notify and automation settings cascade save and persist rules locally', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/notify-automation`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByText('All Email Notifications').locator('..').getByRole('button').click();
  await page.getByRole('button', { name: /Save Settings/i }).click();
  await expect(page.getByText(/saved locally on this device/i)).toBeVisible();

  await page.getByRole('button', { name: /Automation Rules/i }).click();
  await page.getByRole('button', { name: /New Rule/i }).click();
  const ruleName = `Playwright Rule ${Date.now()}`;
  await page.getByPlaceholder('e.g. Welcome Email Series').fill(ruleName);
  await page.getByPlaceholder('e.g. New client added').fill('Client completes onboarding');
  await page.getByPlaceholder('e.g. Send welcome email').fill('Send onboarding follow-up');
  await page.getByRole('button', { name: /Create Rule/i }).click();
  await expect(page.getByText(ruleName)).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: /Automation Rules/i }).click();
  await expect(page.getByText(ruleName)).toBeVisible();
  await page.locator('div').filter({ hasText: ruleName }).getByRole('button', { name: /Delete/i }).first().click();
  await expect(page.getByRole('heading', { name: /Delete Automation Rule/i })).toBeVisible();
});
