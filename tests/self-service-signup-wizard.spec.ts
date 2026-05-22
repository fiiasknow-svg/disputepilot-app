import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('self service signup finish validates and saves locally', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/self-service-signup`);
  await page.evaluate(() => window.localStorage.removeItem('dp_self_service_signup_wizard'));
  await page.getByRole('button', { name: /9\. Finish/ }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Complete Terms');

  await page.getByRole('button', { name: /2\. Terms of Use/ }).click();
  await page.getByLabel('I have read and agree to the Terms of Use').check();
  await page.getByRole('button', { name: /4\. Design Center/ }).click();
  await page.getByPlaceholder('Your Company').fill('Wizard Co');
  await page.getByPlaceholder('info@company.com').fill('wizard@example.com');
  await page.getByRole('button', { name: /5\. About You/ }).click();
  await page.locator('main input').first().fill('Wizard Legal LLC');
  await page.getByRole('button', { name: /7\. Agreement/ }).click();
  await page.getByLabel('I agree to the Service Agreement').check();
  await page.getByRole('button', { name: /9\. Finish/ }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('wizard configuration saved locally');
});
