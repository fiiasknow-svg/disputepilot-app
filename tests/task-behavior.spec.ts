import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('dashboard task See All reveals all local task states without route navigation', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await expect(page.getByText('Client Dispute Manager', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Pending', exact: true }).click();
  await expect(page.getByText('Follow up on overdue invoices')).toHaveCount(0);

  await page.getByRole('button', { name: 'See All' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Showing all tasks.')).toBeVisible();
  await expect(page.getByText('Review new client applications')).toBeVisible();
  await expect(page.getByText('Follow up on overdue invoices')).toBeVisible();
  await expect(page.getByText('Archive completed onboarding checklist')).toBeVisible();
});
