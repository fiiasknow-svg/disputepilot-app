import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('documents and contracts actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/digital-contracts`);

  await expect(page.getByText(/Digital Contracts|Documents|Contracts|Templates/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Upload|Send|Sign|Template|Contract|Document|Create|Add|Save|View/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Digital Contracts|Documents|Contracts|Templates/i).first()).toBeVisible();
});