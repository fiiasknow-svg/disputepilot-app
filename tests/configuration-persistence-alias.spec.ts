import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('configuration persists settings and copies webhooks', async ({ page }) => {
  await page.goto(`${BASE_URL}/settings/configuration?tab=Round%20Settings`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('spinbutton').first().fill('5');
  await page.getByRole('button', { name: 'Save Round Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Round settings saved locally');
  await page.reload();
  await expect(page.getByRole('spinbutton').first()).toHaveValue('5');

  await page.getByRole('button', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();

  await page.getByRole('button', { name: 'Setup' }).first().click();
  await expect(page.getByRole('heading', { name: /Setup$/ })).toBeVisible();
  await page.getByPlaceholder(/account identifier/i).fill('local-account');
  await page.getByPlaceholder(/Stored locally/i).fill('local-secret');
  await page.getByRole('button', { name: 'Save Setup' }).click();
  await expect(page.getByRole('status')).toContainText(/setup saved locally/i);
  await expect(page.getByText(/Local setup for local-account/)).toBeVisible();
});

test('configuration alias redirects to real configuration controls', async ({ page }) => {
  await page.goto(`${BASE_URL}/configuration`);
  await expect(page).toHaveURL(/\/settings\/configuration$/);
  await expect(page.getByRole('heading', { name: 'Configuration', exact: true })).toBeVisible();
});
