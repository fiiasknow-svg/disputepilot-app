import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

function expectNoBusinessLoginHtml(body: string) {
  expect(body, 'Public response unexpectedly returned Business Login HTML').not.toMatch(/Business Login/i);
}

test.describe('live public route smoke', () => {
  test('client auto signup renders and submits local intake', async ({ page }) => {
    await page.goto(`${BASE_URL}/public/forms/client-auto-signup`);
    await expect(page.getByText(/Business Login/i), 'Public route unexpectedly showed Business Login').toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Client Auto Signup/i })).toBeVisible();

    await page.getByLabel(/^Name$/i).fill('Live Public Tester');
    await page.getByLabel(/^Email$/i).fill(`live-public-${Date.now()}@example.test`);
    await page.getByRole('button', { name: /Save Local Intake/i }).click();

    await expect(page.getByRole('status')).toContainText(/saved|submitted|success/i);
  });

  test('website lead form renders and submits required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/public/forms/website-lead-form`);
    await expect(page.getByText(/Business Login/i), 'Public route unexpectedly showed Business Login').toHaveCount(0);
    await expect(page.getByRole('heading', { name: /consultation|website lead|lead form/i })).toBeVisible();

    await page.getByLabel(/First Name/i).fill('Live');
    await page.getByLabel(/Last Name/i).fill('Website');
    await page.getByLabel(/^Email$/i).fill(`live-website-${Date.now()}@example.test`);
    await page.getByRole('button', { name: /Submit/i }).click();

    await expect(page.getByRole('status')).toContainText(/submitted|success/i);
  });

  test('affiliate website form renders and submits required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/public/forms/affiliate-website-form`);
    await expect(page.getByText(/Business Login/i), 'Public route unexpectedly showed Business Login').toHaveCount(0);
    await expect(page.getByRole('heading', { name: /affiliate|referral/i })).toBeVisible();

    await page.getByLabel(/First Name/i).fill('Live');
    await page.getByLabel(/Last Name/i).fill('Affiliate');
    await page.getByLabel(/^Email$/i).fill(`live-affiliate-${Date.now()}@example.test`);
    await page.getByRole('button', { name: /Submit/i }).click();

    await expect(page.getByRole('status')).toContainText(/submitted|success/i);
  });

  test('website lead embed returns JavaScript instead of login HTML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/embed/website-lead-form.js`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/javascript/i);

    const body = await response.text();
    expectNoBusinessLoginHtml(body);
    expect(body).toContain('/public/forms/website-lead-form');
  });

  test('affiliate website embed returns JavaScript instead of login HTML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/embed/affiliate-website-form.js`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/javascript/i);

    const body = await response.text();
    expectNoBusinessLoginHtml(body);
    expect(body).toContain('/public/forms/affiliate-website-form');
  });
});
