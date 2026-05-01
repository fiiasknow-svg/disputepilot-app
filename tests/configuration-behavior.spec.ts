import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('configuration page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/settings/configuration`);

  await expect(page.getByText(/Configuration|Settings|System|Default/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Save|Update|Add|Create|Edit|Configure|Settings|Default/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Configuration|Settings|System|Default/i).first()).toBeVisible();
});