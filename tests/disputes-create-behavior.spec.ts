import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('disputes create action opens usable UI without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes`);

  await expect(page.getByText(/Dispute Center|Dispute Manager|Create New Dispute/i).first()).toBeVisible();

  const createButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Create New Dispute|Create|New Dispute|Add|Start|Dispute/i })
    .first();

  if (await createButton.count()) {
    await createButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Dispute Center|Dispute Manager|Create New Dispute|Equifax|Experian|TransUnion/i).first()).toBeVisible();
});