import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('digital contracts workflow panels body view and send', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/digital-contracts`);
  for (const tab of ['Documents', 'Upload', 'Templates', 'Send', 'Sign']) {
    await page.getByRole('button', { name: tab, exact: true }).first().click();
    await expect(page.getByText(new RegExp(`${tab} panel`, 'i'))).toBeVisible();
  }
  await page.getByRole('button', { name: 'Create Contract' }).click();
  await page.getByLabel('Contract Name').fill('Playwright Contract');
  await page.getByLabel('Recipient').fill('Case Tester');
  await page.getByLabel('Contract Body').fill('Unique local contract body for viewing.');
  await page.getByRole('button', { name: 'Save Contract' }).click();
  await page.getByRole('row', { name: /Playwright Contract/ }).getByRole('button', { name: 'View' }).click();
  await expect(page.getByText('Unique local contract body for viewing.')).toBeVisible();
  await page.getByRole('button', { name: 'Send Contract' }).click();
  await expect(page.getByText('Playwright Contract sent to Case Tester.')).toBeVisible();
});
