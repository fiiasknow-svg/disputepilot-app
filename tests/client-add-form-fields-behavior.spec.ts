import { test, expect } from '@playwright/test';

test('add client form has usable customer fields', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  await page.getByRole('button', { name: /\+ Add Client|Add New Customer/i }).first().click();

  const form = page
    .getByRole('heading', { name: /Add New Client/i })
    .locator('..');

  await expect(form.getByRole('heading', { name: /Add New Client/i })).toBeVisible();

  const textboxes = form.getByRole('textbox');

  await textboxes.nth(0).fill('Playwright');
  await textboxes.nth(1).fill('Tester');
  await textboxes.nth(2).fill('playwright@example.com');

  await expect(textboxes.nth(0)).toHaveValue('Playwright');
  await expect(textboxes.nth(1)).toHaveValue('Tester');
  await expect(textboxes.nth(2)).toHaveValue('playwright@example.com');
});