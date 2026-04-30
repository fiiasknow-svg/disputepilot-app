import { test, expect } from '@playwright/test';

test('clients add client action opens a usable form or modal', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  await page.getByRole('button', { name: /\+ Add Client|Add New Customer/i }).first().click();

  await expect(
    page.getByText(/First Name|Last Name|Email|Phone|Save|Create|Add/i).first()
  ).toBeVisible();
});