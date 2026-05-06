import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('clients search and clear controls are usable', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  const firstNameInput = page.getByPlaceholder(/first name/i);

  await expect(firstNameInput).toBeVisible();
  await firstNameInput.fill('test');

  await page.getByRole('button', { name: /^Search$/i }).click();

  await expect(firstNameInput).toHaveValue('test');
  await expect(page.locator('body')).not.toContainText('Application error');
  await expect(page.locator('body')).not.toContainText('Runtime Error');

  await page.getByRole('button', { name: /^Clear$/i }).click();

  await expect(firstNameInput).toHaveValue('');
});
