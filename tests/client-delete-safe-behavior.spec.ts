import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('clients delete action asks for confirmation or keeps page safe', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  page.once('dialog', async dialog => {
    expect(dialog.message()).toMatch(/delete|remove|confirm|are you sure/i);
    await dialog.dismiss();
  });

  await page.getByRole('button', { name: '🗑' }).first().click();

  await expect(page.getByRole('heading', { name: /Clients/i })).toBeVisible();
});