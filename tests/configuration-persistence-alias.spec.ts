import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('configuration persists settings and copies webhooks', async ({ page }) => {
  await page.goto(`${BASE_URL}/settings/configuration?tab=Round%20Settings`);
  await page.getByRole('spinbutton').first().fill('5');
  await page.getByRole('button', { name: 'Save Round Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Round settings saved locally');
  await page.reload();
  await expect(page.getByRole('spinbutton').first()).toHaveValue('5');

  await page.getByRole('button', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
});

test('configuration alias redirects to real configuration controls', async ({ page }) => {
  await page.goto(`${BASE_URL}/configuration`);
  await expect(page).toHaveURL(/\/settings\/configuration$/);
  await expect(page.getByRole('heading', { name: 'Configuration', exact: true })).toBeVisible();
});
