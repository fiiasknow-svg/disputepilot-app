import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('client rows per page controls work without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();
  await expect(page.getByText(/Rows per page/i)).toBeVisible();

  const rows50Button = page.getByRole('button', { name: /^50$/ }).first();

  await expect(rows50Button).toBeVisible();
  await rows50Button.click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Rows per page/i)).toBeVisible();

  const nextButton = page.getByRole('button', { name: /›|»/ }).first();

  if (await nextButton.isEnabled().catch(() => false)) {
    await nextButton.click();
    await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  }

  await expect(page.getByText(/Page/i).first()).toBeVisible();
});