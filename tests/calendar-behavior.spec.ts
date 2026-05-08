import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('calendar page actions are usable without app error', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', error => pageErrors.push(error));

  await page.goto(`${BASE_URL}/calendar`);

  await expect(page.getByText(/Calendar|Event|Appointment|Schedule/i).first()).toBeVisible();

  await page.getByRole('button', { name: '+ Add Event', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'New Event', exact: true })).toBeVisible();

  const title = `Calendar ownership pilot ${Date.now()}`;
  await page.getByPlaceholder(/Event title/i).fill(title);
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  expect(pageErrors).toEqual([]);
  await expect.poll(async () => page.getByText(title).count()).toBeGreaterThan(0);
  await expect(page.getByText(/Calendar|Event|Appointment|Schedule/i).first()).toBeVisible();
});
