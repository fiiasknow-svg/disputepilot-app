import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('go-highlevel route supports connect test and save statuses', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation/go-highlevel`);
  await page.evaluate(() => window.localStorage.removeItem('disputepilot.automation.goHighLevel'));
  await page.reload();

  await expect(page.getByRole('heading', { name: 'GoHighLevel Integration' })).toBeVisible();
  await page.getByLabel('Location ID').fill('loc_123');
  await page.getByLabel('API Key/Token').fill('ghl-token');
  await page.getByLabel('Pipeline').fill('Repair Pipeline');
  await page.getByLabel('Stage').fill('Booked Consultation');

  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('connection saved locally');
  await page.reload();
  await expect(page.getByLabel('Location ID')).toHaveValue('loc_123');

  await page.getByRole('button', { name: 'Record Local Test' }).click();
  await expect(page.getByRole('status')).toContainText('Local GoHighLevel connection test recorded');

  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('status')).toContainText('GoHighLevel settings saved locally');
});
