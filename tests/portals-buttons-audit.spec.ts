import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('portals back videos and logo summary work visibly', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/portals`);

  await page.getByRole('button', { name: 'WATCH VIDEO' }).first().click();
  await expect(page.getByRole('heading', { name: 'Client Tracking Portal Training' })).toBeVisible();
  await expect(page.getByText('Training video placeholder')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByLabel('Logo').setInputFiles({
    name: 'portal-logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('portal logo'),
  });
  await page.getByRole('button', { name: 'Save Portal Settings' }).click();
  await expect(page.getByText('Logo: portal-logo.png', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'BACK' }).click();
  await expect(page).toHaveURL(/\/company\/settings$/);
});
