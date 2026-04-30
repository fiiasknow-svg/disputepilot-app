import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('company settings form can save without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/settings`);

  await expect(page.getByText(/Company Settings|Company Name/i).first()).toBeVisible();

  const editableTextInputs = page.locator(
    'main input:not([type="checkbox"]):not([type="radio"]):not([readonly])'
  );

  await expect(editableTextInputs.first()).toBeVisible();

  await editableTextInputs.first().fill(`Test Company ${Date.now()}`);

  await page.getByRole('button', { name: /Save/i }).first().click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Company Settings|Company Name/i).first()).toBeVisible();
});