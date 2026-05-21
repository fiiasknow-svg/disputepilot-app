import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('status row checkbox selects once and batch update works', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes/status`);

  await page.getByLabel(/Select dispute Capital One Platinum/i).click();
  await expect(page.getByRole('button', { name: 'Update 1 Selected' })).toBeVisible();

  await page.getByRole('button', { name: 'Update 1 Selected' }).click();
  await expect(page.getByRole('heading', { name: 'Update 1 Disputes' })).toBeVisible();
  await page.getByRole('button', { name: 'resolved', exact: true }).click();
  await page.getByRole('button', { name: 'Set All to "resolved"' }).click();

  await expect(page.getByRole('button', { name: /Update 1 Selected/ })).toHaveCount(0);
  await expect(page.getByRole('row').filter({ hasText: 'Capital One Platinum' })).toContainText('resolved');
});
