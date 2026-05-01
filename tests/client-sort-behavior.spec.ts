import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client sort dropdown can change without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  const sortSelect = page.locator('main select').filter({ hasText: /Newest First|Name A–Z|By Status|By Score/i }).first();

  await expect(sortSelect).toBeVisible();

  await sortSelect.selectOption({ label: 'Name A–Z' });

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(sortSelect).toHaveValue(/name/i);
});