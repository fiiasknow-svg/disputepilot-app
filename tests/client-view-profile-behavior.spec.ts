import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client view action opens usable client profile without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  const viewButton = page
    .locator('main')
    .getByRole('button', { name: /View/i })
    .first();

  await expect(viewButton).toBeVisible();
  await viewButton.click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Client|Customer|Profile|Status|Email|Phone|Disputes|Payment/i).first()).toBeVisible();
});