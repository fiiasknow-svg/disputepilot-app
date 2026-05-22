import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('notify automation edit updates row and integrations link opens configuration tab', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/notify-automation`);
  await page.getByRole('button', { name: 'Automation Rules' }).click();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit Automation Rule' })).toBeVisible();
  await page.getByPlaceholder('e.g. Welcome Email Series').fill('Updated Welcome Rule');
  await page.getByRole('button', { name: 'Save Rule' }).click();
  await expect(page.getByText('Updated Welcome Rule')).toBeVisible();

  await page.getByRole('button', { name: 'Notification Settings' }).click();
  await page.getByRole('link', { name: /Integrations/ }).click();
  await expect(page).toHaveURL(/\/settings\/configuration\?tab=Integrations#integrations/);
  await expect(page.getByText('Connected Services')).toBeVisible();
});
