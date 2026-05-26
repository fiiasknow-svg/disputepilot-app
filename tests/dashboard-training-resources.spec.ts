import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('dashboard training and resource cards have meaningful destinations or actions', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);

  await expect(page.getByRole('link', { name: 'Full Walkthrough' })).toHaveAttribute('href', '/academy');
  await expect(page.getByRole('link', { name: '1 to 1' })).toHaveAttribute('href', 'https://clientdisputemanager.com/coaching');
  await expect(page.getByRole('link', { name: 'Group Training' })).toHaveAttribute('href', '/academy');
  await expect(page.getByRole('link', { name: 'Free Mastermind' })).toHaveAttribute('href', '/partner-resources/community');
  await expect(page.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', 'https://help.clientdisputemanager.com');

  await page.getByRole('button', { name: 'Task' }).click();
  await expect(page.locator('#tasks')).toBeVisible();
  await expect(page.getByPlaceholder('Task title')).toBeVisible();
  await expect(page.getByText(/Task form ready/i)).toBeVisible();
});
