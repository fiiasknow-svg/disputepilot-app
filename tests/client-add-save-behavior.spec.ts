import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('add client form can save without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();

  await page.getByRole('button', { name: /Add New Customer|\+ Add Client|Add Client/i }).first().click();

  const addClientSection = page.getByRole('heading', { name: /Add New Client/i }).locator('..');

  await expect(page.getByRole('heading', { name: /Add New Client/i })).toBeVisible();

  const fields = addClientSection.locator('input:not([type="checkbox"]):not([readonly])');

  await fields.nth(0).fill('Test');
  await fields.nth(1).fill('Client');
  await fields.nth(2).fill(`test.client.${Date.now()}@example.com`);

  await addClientSection.getByRole('button', { name: /Save Client|Save Customer|Save|Create/i }).click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();
});
