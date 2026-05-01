import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('employees page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/employees`);

  await expect(page.getByText(/Employees|Team|Staff|Agent/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Add|Create|New|Invite|Employee|Team|Staff|Agent|Save|View|Edit/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Employees|Team|Staff|Agent/i).first()).toBeVisible();
});