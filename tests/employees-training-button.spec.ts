import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('employees training videos button opens and closes visible training panel', async ({ page }) => {
  await page.goto(`${BASE_URL}/employees`);

  await page.getByRole('button', { name: 'Training Videos' }).click();
  await expect(page.getByRole('dialog', { name: 'Employees Training Videos' })).toBeVisible();
  await expect(page.getByText(/Employee training video placeholder/i)).toBeVisible();
  await expect(page.getByText(/No hosted employee training video source is connected/i)).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog', { name: 'Employees Training Videos' })).toHaveCount(0);
});
