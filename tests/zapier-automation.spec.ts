import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('zapier route supports copy connect test and save statuses', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation/zapier`);
  await page.evaluate(() => window.localStorage.removeItem('disputepilot.automation.zapier'));
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Zapier Integration' })).toBeVisible();
  await expect(page.getByLabel('Webhook URL')).toHaveValue(/webhooks\/zapier\/website-lead/);

  await page.getByRole('button', { name: 'Copy Webhook' }).click();
  await expect(page.getByRole('status')).toContainText(/copied/i);

  await page.getByLabel(/API Key or connection token/i).fill('zapier-local-token');
  await page.getByRole('button', { name: 'Connect' }).click();
  await expect(page.getByRole('status')).toContainText('connected locally');

  await page.getByRole('button', { name: 'Test Zap' }).click();
  await expect(page.getByRole('status')).toContainText('Test Zap queued locally');

  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Zapier settings saved locally');
});
