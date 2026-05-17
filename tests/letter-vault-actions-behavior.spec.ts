import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('letter vault actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);

  await expect(page.getByText(/Letter Vault|Letters|Template|AI Rewriter/i).first()).toBeVisible();

  await page.getByRole('button', { name: 'Add Manual Letter' }).click();
  await expect(page.getByLabel('Letter editor')).toBeVisible();

  await expect(page.locator('main').getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Letter Vault|Letters|Template|AI Rewriter/i).first()).toBeVisible();
});
