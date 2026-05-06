import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('clients edit action opens useful editable UI', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await page.getByRole('button', { name: '✎' }).first().click();

  await expect(
    page.getByText(/Edit|Update|Save|First Name|Last Name|Email|Phone/i).first()
  ).toBeVisible();
});