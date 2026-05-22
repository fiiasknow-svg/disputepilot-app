import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('website lead form saves, publishes, previews, and hydrates settings', async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('website-form-test-cleared')) {
      window.localStorage.removeItem('disputepilot.websiteLeadForm.settings');
      window.sessionStorage.setItem('website-form-test-cleared', '1');
    }
  });
  await page.goto(`${BASE_URL}/leads/website-lead-form`);

  await page.getByLabel('Form Title').fill('Custom Website Intake');
  await page.getByLabel('Button Text').fill('Send Request');
  await page.getByLabel('Address').uncheck();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/settings saved locally/i)).toBeVisible();

  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText(/published locally/i)).toBeVisible();
  await expect(page.getByText('/public/forms/website-lead-form')).toBeVisible();

  await page.getByRole('button', { name: 'Preview' }).click();
  const modal = page.getByRole('heading', { name: 'Form Preview' }).locator('xpath=../..');
  await expect(modal.getByText('Custom Website Intake')).toBeVisible();
  await expect(modal.getByPlaceholder('Address')).toHaveCount(0);
  await modal.getByRole('button', { name: 'Send Request' }).click();
  await expect(modal.getByText(/Preview submission captured locally/i)).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Form Title')).toHaveValue('Custom Website Intake');
  await expect(page.getByLabel('Button Text')).toHaveValue('Send Request');
});

test('affiliate website form saves, publishes, previews, and hydrates settings', async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('affiliate-form-test-cleared')) {
      window.localStorage.removeItem('disputepilot.affiliateWebsiteForm.settings');
      window.sessionStorage.setItem('affiliate-form-test-cleared', '1');
    }
  });
  await page.goto(`${BASE_URL}/leads/affiliate-website-form`);

  await page.getByLabel('Custom Title').fill('Custom Affiliate Signup');
  await page.getByLabel('Button Text').fill('Send Referral');
  await page.getByLabel('City').uncheck();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/settings saved locally/i)).toBeVisible();

  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText(/published locally/i)).toBeVisible();
  await expect(page.getByText('/public/forms/affiliate-website-form')).toBeVisible();

  await page.getByRole('button', { name: 'Preview' }).click();
  const modal = page.getByRole('heading', { name: 'Form Preview' }).locator('xpath=../..');
  await expect(modal.getByText('Custom Affiliate Signup')).toBeVisible();
  await expect(modal.getByPlaceholder('City')).toHaveCount(0);
  await modal.getByRole('button', { name: 'Send Referral' }).click();
  await expect(modal.getByText(/Preview referral captured locally/i)).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Custom Title')).toHaveValue('Custom Affiliate Signup');
  await expect(page.getByLabel('Button Text')).toHaveValue('Send Referral');
});
