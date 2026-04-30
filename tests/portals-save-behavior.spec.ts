import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('portals settings can save without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/portals`);

  await expect(page.getByText(/Portals|Mobile App|Client Portal/i).first()).toBeVisible();

  const editableInputs = page.locator(
    'main input:not([type="checkbox"]):not([type="radio"]):not([readonly])'
  );

  await expect(editableInputs.first()).toBeVisible();

  await editableInputs.first().fill(`https://portal-test-${Date.now()}.example.com`);

  const checkbox = page.locator('main input[type="checkbox"]').first();
  if (await checkbox.count()) {
    await checkbox.check().catch(() => {});
  }

  await page.getByRole('button', { name: /Save/i }).first().click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Portals|Mobile App|Client Portal/i).first()).toBeVisible();
});