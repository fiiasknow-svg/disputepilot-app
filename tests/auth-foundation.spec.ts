import { expect, test } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3201';

test('logged-out dashboard redirects to login', async ({ browser }) => {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'x-disputepilot-test-auth': '0',
    },
  });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/dashboard`);

  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login\\?next=%2Fdashboard`));
  await expect(page.getByRole('heading', { name: 'Business Login' })).toBeVisible();

  await context.close();
});

test('business login page renders', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await expect(page.getByRole('heading', { name: 'Business Login' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Customer Portal Login' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Forgot password' })).toBeVisible();
});

test('customer login page renders', async ({ page }) => {
  await page.goto(`${BASE_URL}/client-login`);

  await expect(page.getByRole('heading', { name: 'Customer Portal Login' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Business Login' })).toBeVisible();
});

test('login pages link to each other', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('link', { name: 'Customer Portal Login' }).click();
  await expect(page).toHaveURL(`${BASE_URL}/client-login`);
  await expect(page.getByRole('heading', { name: 'Customer Portal Login' })).toBeVisible();

  await page.getByRole('link', { name: 'Business Login' }).click();
  await expect(page).toHaveURL(`${BASE_URL}/login`);
  await expect(page.getByRole('heading', { name: 'Business Login' })).toBeVisible();
});

test('authenticated test session can access dashboard and exposes logout', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);

  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});

test('forgot password requires an email before sending reset', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('button', { name: 'Forgot password' }).click();

  await expect(page.getByRole('status')).toContainText('Enter your email address before requesting a password reset.');
});

test('reset password page renders', async ({ page }) => {
  await page.goto(`${BASE_URL}/reset-password`);

  await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  await expect(page.getByLabel('New password')).toBeVisible();
  await expect(page.getByLabel('Confirm password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Update Password' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Business Login' })).toBeVisible();
});
