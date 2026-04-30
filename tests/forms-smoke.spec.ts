import { test, expect } from '@playwright/test';

test('key forms and buttons are visible', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  await expect(page.getByRole('button', { name: '+ Add Client' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add New Customer' })).toBeVisible();
  await expect(page.getByText('Customer Search')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
});