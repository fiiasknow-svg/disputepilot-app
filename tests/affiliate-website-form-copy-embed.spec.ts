import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('affiliate website form copy embed target exists and public submit saves locally', async ({ page, request }) => {
  await page.goto(`${BASE_URL}/leads/affiliate-website-form`);
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText('Published embed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy Embed' })).toBeVisible();

  const embed = await request.get(`${BASE_URL}/embed/affiliate-website-form.js`);
  expect(embed.status()).toBe(200);
  expect(embed.headers()['content-type']).toContain('application/javascript');
  await expect(await embed.text()).toContain('/public/forms/affiliate-website-form');

  await page.goto(`${BASE_URL}/public/forms/affiliate-website-form`);
  await expect(page.getByRole('heading', { name: /Affiliate Referral Form/i })).toBeVisible();
  await page.getByLabel('First Name').fill('Public');
  await page.getByLabel('Last Name').fill('Affiliate');
  await page.getByLabel('Email').fill('public-affiliate@example.test');
  await page.getByRole('button', { name: /Submit Referral/i }).click();
  await expect(page.getByRole('status')).toContainText(/Affiliate referral submitted successfully/i);

  await page.goto(`${BASE_URL}/leads`);
  await expect(page.getByText('Public Affiliate', { exact: true })).toBeVisible();
  await expect(page.locator('tbody').getByText('Affiliate', { exact: true }).first()).toBeVisible();
});
