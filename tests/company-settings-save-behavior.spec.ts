import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('company settings can be edited, saved, and reset', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/settings`);

  const companyName = `Test Company ${Date.now()}`;
  await page.getByLabel('Company Name').fill(companyName);
  await page.getByLabel('Phone').fill('(404) 555-0199');
  await page.getByLabel('Email').fill('ops@example.com');
  await page.getByLabel('Website').fill('https://example.com');
  await page.getByLabel('Notes / Description').fill('Updated company profile from Playwright.');

  await page.getByRole('button', { name: /Save Company/i }).click();

  await expect(page.getByText(`Company profile saved for ${companyName}.`)).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: companyName })).toBeVisible();

  await page.getByLabel('Company Name').fill('Unsaved Company');
  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByLabel('Company Name')).toHaveValue(companyName);
  await expect(page.getByText('Unsaved company changes were reset.')).toBeVisible();
});
