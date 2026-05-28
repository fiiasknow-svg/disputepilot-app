import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('client auto signup uses reachable local public intake route', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/client-auto-signup`);
  await page.evaluate(() => {
    window.localStorage.removeItem('dp_client_auto_signup_settings');
    window.localStorage.removeItem('dp_client_auto_signup_submissions');
  });

  await expect(page.getByLabel('Signup URL')).toHaveValue(`${BASE_URL}/public/forms/client-auto-signup`);
  await expect(page.getByText('not a hosted portal.disputepilot.com signup')).toBeVisible();
  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('status')).toContainText(/Local client auto signup URL|Clipboard unavailable/);

  await page.getByRole('button', { name: 'Signup Basic Settings' }).click();
  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Signup settings saved locally');

  await page.goto(`${BASE_URL}/public/forms/client-auto-signup`);
  await expect(page.getByRole('heading', { name: 'Client Auto Signup' })).toBeVisible();
  await page.getByLabel('Name').fill('Auto Signup Tester');
  await page.getByLabel('Email').fill('auto@example.com');
  await page.getByLabel(/Phone/).fill('555-0100');
  await page.getByRole('button', { name: 'Save Local Intake' }).click();
  await expect(page.getByRole('status')).toContainText('Signup intake saved locally');
});
