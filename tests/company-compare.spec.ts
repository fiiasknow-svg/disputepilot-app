import { test, expect } from '@playwright/test';
import fs from 'fs';

const CLONE_COMPANY = 'https://disputepilot-app.vercel.app/company/settings';

const expectedCompanyItems = [
  'Company Settings',
  'Company Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'State',
  'Zip',
  'Save',
];

test('compare company settings expected items', async ({ page }) => {
  await page.goto(CLONE_COMPANY);
  await expect(page.locator('body')).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const missing = expectedCompanyItems.filter(item => !bodyText.includes(item));

  fs.writeFileSync('missing-company-from-clone.json', JSON.stringify(missing, null, 2));
  console.log(missing);

  expect(missing).toEqual([]);
});