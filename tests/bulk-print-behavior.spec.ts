import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('bulk print page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/bulk-print`);

  await expect(page.getByText(/Bulk Print|Print|Letters|Disputes/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Print|Bulk|Generate|Create|Download|View|Select|Letters/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Bulk Print|Print|Letters|Disputes/i).first()).toBeVisible();
});