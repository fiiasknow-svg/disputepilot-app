import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('company settings controlled extras save and cancel', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/settings`);

  await page.getByLabel('Select a Time Zone').selectOption('UTC-8: Pacific Time (PT)');
  await page.getByLabel('Fax').fill('(404) 555-0101');
  await page.getByLabel('Office Hours').fill('Monday-Thursday 8am-6pm');
  await page.getByLabel('Brand Color').fill('#123456');
  await page.getByLabel('Brand Text Color').fill('#eeeeee');
  await page.getByLabel('Button Color').fill('#654321');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'company-logo-test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('logo'),
  });

  await expect(page.getByText('Selected logo: company-logo-test.png')).toBeVisible();
  await page.getByRole('button', { name: /Save Company/i }).click();
  await expect(page.getByText(/Saved preview refreshed/)).toBeVisible();
  await expect(page.getByText('Saved logo: company-logo-test.png')).toBeVisible();
  await expect(page.getByText(/Fax: \(404\) 555-0101/)).toBeVisible();

  await page.getByLabel('Fax').fill('(999) 999-9999');
  await page.getByLabel('Select a Time Zone').selectOption('UTC-5: Eastern Time (ET)');
  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByLabel('Fax')).toHaveValue('(404) 555-0101');
  await expect(page.getByLabel('Select a Time Zone')).toHaveValue('UTC-8: Pacific Time (PT)');
});

test('client auto signup visible actions are local and validated', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/client-auto-signup`);

  await page.getByRole('button', { name: 'Build Signup Form' }).click();
  await expect(page.getByRole('heading', { name: 'Signup Form Builder' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Signup Basic Settings' }).click();
  await page.getByRole('button', { name: 'Save Settings' }).click();
  await expect(page.getByRole('status')).toContainText('Signup settings saved locally');

  await page.getByRole('button', { name: 'Single Credit Card Authorization' }).click();
  await page.getByRole('button', { name: 'Authorize Card' }).click();
  await expect(page.getByRole('status')).toContainText('Enter cardholder name');
  await page.getByPlaceholder('Full name on card').fill('Test User');
  await page.getByPlaceholder('**** **** **** ****').fill('4242424242424242');
  await page.getByPlaceholder('MM/YY').fill('12/30');
  await page.getByPlaceholder('***', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'Authorize Card' }).click();
  await expect(page.getByRole('status')).toContainText('No payment was charged');
});

test('team messages require subject and body before sending', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/team-messages`);
  await page.getByRole('button', { name: '+ Compose' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Subject and Message are required before sending.')).toBeVisible();
  await page.getByPlaceholder('Message subject').fill('Operations update');
  await page.getByPlaceholder('Write your message…').fill('Please review today.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('heading', { name: 'New Message' })).toBeHidden();
});
