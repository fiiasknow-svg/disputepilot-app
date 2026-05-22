import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('manage portal content edit and empty create validation', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-portal-content`);
  await page.getByRole('button', { name: '+ Create New' }).click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Article Title is required')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit Article' })).toBeVisible();
  await page.locator('input').last().fill('Updated Credit Report Guide');
  await page.locator('select').last().selectOption('Guide');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Updated Credit Report Guide')).toBeVisible();
});

test('manage emails resend gives visible local queued and sent status', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-emails`);
  await page.getByRole('button', { name: 'Email Log' }).click();
  await page.getByRole('button', { name: 'Resend' }).first().click();
  await expect(page.getByText(/Resend queued locally/)).toBeVisible();
  await expect(page.getByText(/Resend marked sent locally/)).toBeVisible();
});
