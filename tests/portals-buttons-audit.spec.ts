import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('portals back videos and logo summary work visibly', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/portals`);

  const clientPortal = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Client Tracking Portal' }) });
  await clientPortal.getByRole('button', { name: 'WATCH VIDEO' }).click();
  const clientVideo = page.getByRole('dialog', { name: 'Client Tracking Portal Video' });
  await expect(clientVideo).toBeVisible();
  await expect(clientVideo.getByText(/Training video placeholder - connect the final video URL/i)).toBeVisible();
  await clientVideo.getByRole('button', { name: 'Close' }).click();
  await expect(clientVideo).toHaveCount(0);

  const affiliatePortal = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Affiliate Portal' }) });
  await affiliatePortal.getByRole('button', { name: 'WATCH VIDEO' }).click();
  const affiliateVideo = page.getByRole('dialog', { name: 'Affiliate Portal Video' });
  await expect(affiliateVideo).toBeVisible();
  await expect(affiliateVideo.getByText(/No hosted training video is connected yet/i)).toBeVisible();
  await affiliateVideo.getByRole('button', { name: 'Close' }).click();
  await expect(affiliateVideo).toHaveCount(0);

  await page.getByLabel('Logo').setInputFiles({
    name: 'portal-logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('portal logo'),
  });
  await page.getByRole('button', { name: 'Save Portal Settings' }).click();
  await expect(page.getByText('Logo: portal-logo.png', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'BACK' }).click();
  await expect(page).toHaveURL(/\/company\/settings$/);
});
