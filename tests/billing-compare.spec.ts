import { test, expect } from '@playwright/test';

import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

const CLONE_BILLING = `${BASE_URL}/billing`;

const expectedBillingItems = [
  'Billing',
  'Payments',
  'Invoices',
  'Subscription',
  'Plan',
  'Amount',
  'Date',
  'Status',
  'Action',
];

test('compare billing page expected items', async ({ page }) => {
  await page.goto(CLONE_BILLING);
  await expect(page.locator('body')).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

  const missing = expectedBillingItems.filter(item => !bodyText.includes(item));

  fs.writeFileSync('missing-billing-from-clone.json', JSON.stringify(missing, null, 2));

  console.log(missing);

  expect(missing).toEqual([]);
});
