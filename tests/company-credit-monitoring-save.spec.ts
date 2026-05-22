import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('credit monitoring save persists provider settings locally', async ({ page }) => {
  await page.context().addCookies([{ name: 'dp_auth', value: 'test', domain: '127.0.0.1', path: '/' }]);
  await page.goto(`${BASE_URL}/company/credit-monitoring`);
  await page.evaluate(() => window.localStorage.removeItem('dp_credit_monitoring_settings'));
  await expect(page.getByRole('heading', { name: 'Credit Monitoring' })).toBeVisible();
  await page.getByPlaceholder('Affiliate URL').first().fill('https://smartcredit.example/local');
  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Credit monitoring settings saved locally');
  await page.goto(`${BASE_URL}/company/credit-monitoring`);
  await expect(page.getByPlaceholder('Affiliate URL').first()).toHaveValue('https://smartcredit.example/local');
});
