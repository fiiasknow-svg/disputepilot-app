import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('ai credit coach generates copies and saves local guidance', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation/ai-credit-coach`);
  await page.evaluate(() => window.localStorage.removeItem('disputepilot.automation.aiCreditCoach'));
  await page.reload();

  await expect(page.getByRole('heading', { name: 'AI Credit Coach' })).toBeVisible();
  await page.getByLabel('Client scenario/problem').fill('Paid collection still reports as open');
  await page.getByLabel('Account').fill('ABC Collections');
  await page.getByLabel('Facts and documents').fill('Paid in full letter dated May 1');

  await page.getByRole('button', { name: 'Generate Guidance' }).click();
  await expect(page.getByRole('status')).toContainText('guidance generated locally');
  await expect(page.locator('pre')).toContainText('ABC Collections');

  await page.getByRole('button', { name: 'Copy Guidance' }).click();
  await expect(page.getByRole('status')).toContainText(/copied/i);

  await page.getByRole('button', { name: 'Save Coach Note' }).click();
  await expect(page.getByRole('status')).toContainText('note saved locally');
});
