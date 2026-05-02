import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('digital contracts workflow opens, saves, views, and sends', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/digital-contracts`);

  const contractName = `Playwright Service Agreement ${Date.now()}`;
  await page.getByRole('button', { name: /Create Contract/i }).click();
  await expect(page.getByRole('heading', { name: /New Digital Contract/i })).toBeVisible();

  await page.getByLabel('Contract Name').fill(contractName);
  await page.getByLabel('Recipient').fill('Automation Client');
  await page.getByLabel('Contract Body').fill('Client agrees to automated test terms.');
  await page.getByRole('button', { name: /Save Contract/i }).click();

  await expect(page.getByText('Digital contract saved for Automation Client.')).toBeVisible();
  await expect(page.getByText(contractName)).toBeVisible();

  await page.getByRole('row', { name: new RegExp(contractName) }).getByRole('button', { name: /View/i }).click();
  await expect(page.getByText('This contract is ready for review, sending, or signing.')).toBeVisible();
  await page.getByRole('button', { name: /Send Contract/i }).click();
  await expect(page.getByText(`${contractName} sent to Automation Client.`)).toBeVisible();
});
