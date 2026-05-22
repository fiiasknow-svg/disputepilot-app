import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('website lead form exposes copy embed after local publish', async ({ page }) => {
  await page.goto(`${BASE_URL}/leads/website-lead-form`);
  await page.getByRole('button', { name: 'Publish' }).click();

  await expect(page.getByText('Published embed')).toBeVisible();
  await expect(page.getByText('Local placeholder public URL only')).toBeVisible();

  await page.getByRole('button', { name: 'Copy Embed' }).click();
  await expect(page.getByRole('status')).toContainText(/embed snippet copied/i);
});
