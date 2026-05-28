import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('digital contracts workflow panels body view and send', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/digital-contracts`);
  await page.evaluate(() => window.localStorage.removeItem('dp_digital_contracts'));
  await page.reload();
  for (const tab of ['Documents', 'Upload', 'Templates', 'Send', 'Sign']) {
    await page.getByRole('button', { name: tab, exact: true }).first().click();
    await expect(page.getByText(new RegExp(`${tab} panel`, 'i'))).toBeVisible();
  }
  await page.getByRole('button', { name: 'Create Contract' }).click();
  await page.getByRole('button', { name: 'Save Contract' }).click();
  await expect(page.getByText('Enter Contract Name and Recipient')).toBeVisible();
  await page.getByLabel('Contract Name').fill('Playwright Contract');
  await page.getByLabel('Recipient').fill('Case Tester');
  await page.getByLabel('Contract Body').fill('Unique local contract body for viewing.');
  await page.getByRole('button', { name: 'Save Contract' }).click();
  await expect(page.getByRole('status')).toContainText('saved locally');
  await page.reload();
  await expect(page.getByRole('row', { name: /Playwright Contract/ })).toBeVisible();
  await page.getByRole('row', { name: /Playwright Contract/ }).getByRole('button', { name: 'View' }).click();
  await expect(page.getByText('Unique local contract body for viewing.')).toBeVisible();
  await page.getByRole('button', { name: 'Mark Contract Sent Locally' }).click();
  await expect(page.getByRole('status')).toContainText('marked sent locally');
  await expect(page.getByText('No email or e-signature request was sent')).toBeVisible();
});
