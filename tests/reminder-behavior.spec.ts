import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('disputepilot.calendar-reminders');
    window.localStorage.removeItem('disputepilot.calendar-events-lite');
  });
});

test('calendar blank reminder save shows visible validation and keeps form available', async ({ page }) => {
  await page.goto(`${BASE_URL}/calendar`);

  await page.getByRole('button', { name: 'Save Reminder' }).click();

  await expect(page.getByText('Enter customer and reminder title before saving.')).toBeVisible();
  await expect(page.getByPlaceholder('Customer name')).toBeVisible();
  await expect(page.getByPlaceholder('Reminder title')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'No Reminder Found.' })).toBeVisible();
});
