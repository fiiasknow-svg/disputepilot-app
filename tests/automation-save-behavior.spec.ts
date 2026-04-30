import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('automation page controls are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation`);

  await expect(page.getByText(/Automation|Zapier|Go-HighLevel|GHL|Workflow/i).first()).toBeVisible();

  const toggleOrButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Enable|Save|Workflow|Trigger|Action|Connect|Zapier|GHL|Go-HighLevel/i })
    .first();

  if (await toggleOrButton.count()) {
    await toggleOrButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Automation|Zapier|Go-HighLevel|GHL|Workflow/i).first()).toBeVisible();
});