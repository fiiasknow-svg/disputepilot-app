import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('clients add client action opens a usable form or modal', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await page.getByRole('button', { name: /\+ Add Client|Add New Customer/i }).first().click();

  await expect(
    page.getByText(/First Name|Last Name|Email|Phone|Save|Create|Add/i).first()
  ).toBeVisible();
});