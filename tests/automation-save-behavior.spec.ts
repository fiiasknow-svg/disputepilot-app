import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('automation main page saves toggles and hydrates local settings', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation`);
  await page.evaluate(() => window.localStorage.removeItem('disputepilot.automation.settings'));
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Automation', exact: true })).toBeVisible();

  const globalToggle = page.getByRole('button', { name: /Enable: On/i });
  await expect(globalToggle).toBeVisible();
  await globalToggle.click();
  await expect(page.getByRole('button', { name: /Enable: Off/i })).toBeVisible();

  const onboardingRow = page.getByRole('row').filter({ hasText: 'Client Onboarding' });
  await onboardingRow.getByRole('button', { name: 'Enabled' }).click();
  await expect(onboardingRow.getByRole('button', { name: 'Disabled' })).toBeVisible();

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Automation settings saved locally.');

  await page.reload();
  await expect(page.getByRole('button', { name: /Enable: Off/i })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Client Onboarding' }).getByRole('button', { name: 'Disabled' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Saved automation settings loaded locally.');
});

test('automation integration cards navigate to dedicated local routes', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation`);
  await page.getByRole('button', { name: /^Zapier/i }).click();
  await expect(page).toHaveURL(/\/automation\/zapier$/);

  await page.goto(`${BASE_URL}/automation`);
  await page.getByRole('button', { name: /^Go-HighLevel/i }).click();
  await expect(page).toHaveURL(/\/automation\/go-highlevel$/);

  await page.goto(`${BASE_URL}/automation`);
  await page.getByRole('button', { name: /^Website Lead Nurturing/i }).click();
  await expect(page).toHaveURL(/\/automation\/website-lead-nurturing$/);
});
