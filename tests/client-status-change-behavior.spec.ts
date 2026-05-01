import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client status dropdown can be changed without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  const statusSelect = page.locator('main table select').first();

  await expect(statusSelect).toBeVisible();

  const currentValue = await statusSelect.inputValue();
  const nextValue = currentValue === 'active' ? 'pending' : 'active';

  await statusSelect.selectOption(nextValue);

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(statusSelect).toHaveValue(nextValue);
});