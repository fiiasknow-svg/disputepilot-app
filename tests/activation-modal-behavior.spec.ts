import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('activation modal validates locally and reserves gifts locally', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await page.evaluate(() => {
    window.localStorage.removeItem('dp_activation_registration_validation');
    window.localStorage.removeItem('dp_activation_free_gifts_reservation');
  });

  await page.locator('.cdm-topbar').getByRole('button', { name: 'ACTIVATE MEMBERSHIP' }).click();
  await page.getByRole('button', { name: 'Validate Password Locally' }).click();
  await expect(page.getByText('Enter your registration password before opening registration.')).toBeVisible();

  await page.getByRole('button', { name: 'Reserve 2 Free Gifts Locally' }).click();
  await expect(page.getByText(/Free gifts reserved locally/)).toBeVisible();
  await expect(page.evaluate(() => window.localStorage.getItem('dp_activation_free_gifts_reservation'))).resolves.toContain('reserved-locally');

  await page.getByPlaceholder('Enter Password').fill('local-password');
  await page.getByRole('button', { name: 'Validate Password Locally' }).click();
  await expect(page).toHaveURL(/\/billing/);
  await expect(page.evaluate(() => window.localStorage.getItem('dp_activation_registration_validation'))).resolves.toContain('validatedAt');
});
