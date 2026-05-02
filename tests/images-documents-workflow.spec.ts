import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('images and documents upload and manage workflow confirms actions', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/images-documents`);

  await page.getByRole('button', { name: /Upload File/i }).click();
  await expect(page.getByText(/uploaded to Images & Documents/i)).toBeVisible();

  await page.getByRole('button', { name: /Rename/i }).first().click();
  await expect(page.getByRole('heading', { name: /Rename File/i })).toBeVisible();
  await page.locator('input').last().fill(`renamed-document-${Date.now()}.pdf`);
  await page.getByRole('button', { name: /^Rename$/i }).last().click();
  await expect(page.getByText(/File renamed to renamed-document-/i)).toBeVisible();

  await page.getByRole('button', { name: /Download/i }).first().click();
  await expect(page.getByText(/is ready to download/i)).toBeVisible();
});
