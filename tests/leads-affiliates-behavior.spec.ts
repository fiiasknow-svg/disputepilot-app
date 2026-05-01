import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('leads and affiliates page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/leads`);

  await expect(page.getByText(/Leads|Affiliates|Website Lead Form/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Add|Create|New|Save|View|Edit|Lead|Affiliate|Form/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Leads|Affiliates|Website Lead Form/i).first()).toBeVisible();
});