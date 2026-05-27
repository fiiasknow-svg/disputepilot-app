import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('website lead form exposes copy embed after local publish', async ({ page }) => {
  await page.goto(`${BASE_URL}/leads/website-lead-form`);
  await page.getByRole('button', { name: 'Publish' }).click();

  await expect(page.getByText('Published embed')).toBeVisible();
  await expect(page.getByText('/public/forms/website-lead-form')).toBeVisible();

  await page.getByRole('button', { name: 'Copy Embed' }).click();
  await expect(page.getByRole('status')).toContainText(/embed snippet copied/i);
});

test('website lead form public route and embed script are reachable and submit locally', async ({ page, request }) => {
  const embed = await request.get(`${BASE_URL}/embed/website-lead-form.js`);
  expect(embed.status()).toBe(200);
  expect(embed.headers()['content-type']).toContain('application/javascript');
  await expect(await embed.text()).toContain('/public/forms/website-lead-form');

  await page.goto(`${BASE_URL}/public/forms/website-lead-form`);
  await expect(page.getByRole('heading', { name: /Request a Free Consultation/i })).toBeVisible();
  await page.getByLabel('First Name').fill('Public');
  await page.getByLabel('Last Name').fill('Website');
  await page.getByLabel('Email').fill('public-website@example.test');
  await page.getByRole('button', { name: /Submit/i }).click();
  await expect(page.getByRole('status')).toContainText(/Website lead submitted successfully/i);

  await page.goto(`${BASE_URL}/leads`);
  await expect(page.getByText('Public Website', { exact: true })).toBeVisible();
  await expect(page.locator('tbody').getByText('Website', { exact: true }).first()).toBeVisible();
});
