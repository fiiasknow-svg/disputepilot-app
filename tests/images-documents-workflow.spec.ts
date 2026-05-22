import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('images and documents upload and manage workflow confirms actions', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/images-documents`);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'workflow-upload.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('workflow'),
  });
  await expect(page.getByText(/uploaded to Images & Documents/i)).toBeVisible();

  await page.getByRole('button', { name: /Rename/i }).first().click();
  await expect(page.getByRole('heading', { name: /Rename File/i })).toBeVisible();
  await page.locator('input').last().fill(`renamed-document-${Date.now()}.pdf`);
  await page.getByRole('button', { name: /^Rename$/i }).last().click();
  await expect(page.getByText(/File renamed to renamed-document-/i)).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download/i }).first().click();
  await downloadPromise;
  await expect(page.getByText(/download started/i)).toBeVisible();
});
