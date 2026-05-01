import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client table and card view toggles work without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  const cardsButton = page.getByRole('button', { name: /Cards/i }).first();
  const tableButton = page.getByRole('button', { name: /Table/i }).first();

  await expect(cardsButton).toBeVisible();
  await cardsButton.click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Client|Customer|Status|Email|Phone/i).first()).toBeVisible();

  await expect(tableButton).toBeVisible();
  await tableButton.click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.locator('main table')).toBeVisible();
});