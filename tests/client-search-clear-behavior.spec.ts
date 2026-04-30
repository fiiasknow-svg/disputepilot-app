import { test, expect } from '@playwright/test';

test('clients search and clear controls are usable', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  const firstNameInput = page.getByPlaceholder(/first name/i);

  await expect(firstNameInput).toBeVisible();
  await firstNameInput.fill('test');

  await page.getByRole('button', { name: /^Search$/i }).click();

  await expect(firstNameInput).toHaveValue('test');
  await expect(page.getByText(/1–1 of 1 clients|of 1 clients/i)).toBeVisible();

  await page.getByRole('button', { name: /^Clear$/i }).click();

  await expect(firstNameInput).toHaveValue('');
});