import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('billing page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing`);

  await expect(page.getByText(/Billing|Payments|Invoices|Subscription/i).first()).toBeVisible();

  const clickableAction = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Invoice|Payment|Subscription|Plan|Add|Create|Save|View|Manage|Update/i })
    .first();

  if (await clickableAction.count()) {
    await clickableAction.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Billing|Payments|Invoices|Subscription/i).first()).toBeVisible();
});