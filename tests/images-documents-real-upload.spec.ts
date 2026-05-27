import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('images documents keeps session downloads and reloads honest metadata only', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/images-documents`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'local-upload-playwright.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('pdf content'),
  });
  await expect(page.getByText('local-upload-playwright.pdf', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('row', { name: /local-upload-playwright\.pdf/ }).getByRole('button', { name: 'Download' }).click();
  await downloadPromise;
  await expect(page.getByRole('status')).toContainText('download started');

  await page.reload();
  await expect(page.getByText('local-upload-playwright.pdf', { exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: /local-upload-playwright\.pdf/ })).toContainText('Download unavailable until re-uploaded');
  await page.getByRole('row', { name: /local-upload-playwright\.pdf/ }).getByRole('button', { name: 'Download' }).click();
  await expect(page.getByRole('status')).toContainText('download requires re-upload');
});
