import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('manage portal content edit and empty create validation', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-portal-content`);
  await page.evaluate(() => window.localStorage.removeItem('dp_portal_content_articles'));
  await page.reload();
  await page.getByRole('button', { name: '+ Create New' }).click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Article Title is required')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit Article' })).toBeVisible();
  await page.locator('input').last().fill('Updated Credit Report Guide');
  await page.locator('select').last().selectOption('Guide');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('row', { name: /Updated Credit Report Guide/ })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('saved locally');

  await page.getByRole('row', { name: /Updated Credit Report Guide/ }).getByRole('button', { name: 'Unpublish' }).click();
  await expect(page.getByRole('status')).toContainText('marked Draft locally');

  await page.reload();
  await expect(page.getByText('Updated Credit Report Guide')).toBeVisible();
  await expect(page.getByRole('row', { name: /Updated Credit Report Guide/ }).getByRole('button', { name: 'Publish' })).toBeVisible();
});

test('manage portal content delete requires confirmation', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-portal-content`);
  await page.evaluate(() => window.localStorage.removeItem('dp_portal_content_articles'));
  await page.reload();

  const rowName = 'How to Read Your Credit Report';
  await page.getByRole('row', { name: new RegExp(rowName) }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm portal article delete' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('row', { name: new RegExp(rowName) })).toBeVisible();

  await page.getByRole('row', { name: new RegExp(rowName) }).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm Delete' }).click();
  await expect(page.getByRole('status')).toContainText('deleted locally');
  await expect(page.getByRole('row', { name: new RegExp(rowName) })).toHaveCount(0);
});

test('manage emails resend gives visible local queued and sent status', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-emails`);
  await page.getByRole('button', { name: 'Email Log' }).click();
  await page.getByRole('button', { name: 'Resend' }).first().click();
  await expect(page.getByText(/Resend queued locally/)).toBeVisible();
  await expect(page.getByText(/Resend marked sent locally/)).toBeVisible();
});
