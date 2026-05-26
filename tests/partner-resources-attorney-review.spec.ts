import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('attorney review partner resource has dedicated route and sidebar link', async ({ page }) => {
  await page.goto(`${BASE_URL}/partner-resources/attorney-review`);

  await expect(page.getByRole('heading', { name: 'Attorney Review', exact: true })).toBeVisible();
  await expect(page.getByText(/client file needs legal review/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to Partner Resources' })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Attorney Review' })).toHaveAttribute('href', '/partner-resources/attorney-review');
});
