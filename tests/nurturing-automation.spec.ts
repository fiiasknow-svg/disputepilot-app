import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('website lead nurturing supports add edit toggle test and save', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation/website-lead-nurturing`);
  await page.evaluate(() => window.localStorage.removeItem('disputepilot.automation.websiteLeadNurturing'));
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Website Lead Nurturing' })).toBeVisible();
  const welcome = page.getByRole('article', { name: 'Welcome lead nurture step' });
  await welcome.getByRole('button', { name: 'Enabled' }).click();
  await expect(welcome.getByRole('button', { name: 'Disabled' })).toBeVisible();

  await welcome.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit nurture step' })).toBeVisible();
  await page.getByLabel('Step name').fill('Welcome and qualify lead');
  await page.getByRole('button', { name: 'Save Step' }).click();
  await expect(page.getByText('Welcome and qualify lead')).toBeVisible();

  await page.getByRole('button', { name: 'Add Step' }).click();
  await expect(page.getByRole('heading', { name: 'Edit nurture step' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'New nurture step' })).toBeVisible();

  await page.getByRole('button', { name: 'Test Send' }).first().click();
  await expect(page.getByRole('status')).toContainText('test send queued locally');

  await page.getByRole('button', { name: 'Save Sequence' }).click();
  await expect(page.getByRole('status')).toContainText('nurture sequence saved locally');
});
