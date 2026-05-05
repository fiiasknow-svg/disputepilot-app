import { expect, test } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3201';

test('business login page renders', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await expect(page.getByRole('heading', { name: 'Business Login' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Customer Portal Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Forgot password' })).toBeVisible();
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

test('authenticated business shell exposes logout', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);

  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});
