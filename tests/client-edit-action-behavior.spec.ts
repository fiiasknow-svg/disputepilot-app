import { test, expect } from '@playwright/test';

test('clients edit action opens useful editable UI', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  await page.getByRole('button', { name: '✎' }).first().click();

  await expect(
    page.getByText(/Edit|Update|Save|First Name|Last Name|Email|Phone/i).first()
  ).toBeVisible();
});