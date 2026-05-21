import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('blank Add Creditor submit shows visible validation and saving still uses localStorage', async ({ page }) => {
  await page.goto(`${BASE_URL}/dispute-manager/furnisher-addresses`);

  await page.getByRole('button', { name: '+ Add New Creditor' }).click();
  await page.getByRole('button', { name: 'Add Creditor' }).click();

  await expect(page.getByText('Company Name is required before adding a creditor.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add New Creditor' })).toBeVisible();

  const creditorName = `Validation Creditor ${Date.now()}`;
  await page.getByLabel('Company Name').fill(creditorName);
  await page.getByLabel('Address').fill('100 Validation Way');
  await page.getByLabel('City').fill('Austin');
  await page.getByLabel('State').fill('TX');
  await page.getByLabel('Zip').fill('78701');
  await page.getByRole('button', { name: 'Add Creditor' }).click();

  await expect(page.getByRole('status')).toContainText(`Saved creditor: ${creditorName}`);
  await expect(page.locator('tbody tr').filter({ hasText: creditorName })).toBeVisible();

  await page.reload();
  await expect(page.locator('tbody tr').filter({ hasText: creditorName })).toBeVisible();
});
