import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('images documents uses selected local file metadata and download handler', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/images-documents`);
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

  await page.locator('button').filter({ hasText: '⊞' }).click();
  const gridDownload = page.waitForEvent('download');
  await page.locator('div[title="local-upload-playwright.pdf"]').locator('..').getByRole('button').first().click();
  await gridDownload;

  await page.locator('button').filter({ hasText: '☰' }).click();
  await page.getByRole('row', { name: /company-logo\.png/ }).getByRole('button', { name: 'Download' }).click();
  await expect(page.getByRole('status')).toContainText('sample document');
});
