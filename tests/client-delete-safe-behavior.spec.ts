import { test, expect } from '@playwright/test';

test('clients delete action asks for confirmation or keeps page safe', async ({ page }) => {
  await page.goto('https://disputepilot-app.vercel.app/clients');

  page.once('dialog', async dialog => {
    expect(dialog.message()).toMatch(/delete|remove|confirm|are you sure/i);
    await dialog.dismiss();
  });

  await page.getByRole('button', { name: '🗑' }).first().click();

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();
});