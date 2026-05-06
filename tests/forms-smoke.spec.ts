import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('key forms and buttons are visible', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('button', { name: '+ Add Client' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add New Customer' })).toBeVisible();
  await expect(page.getByText('Customer Search')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
});