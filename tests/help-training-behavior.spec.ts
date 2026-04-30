import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('help and training links are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);

  await expect(page.getByText(/Dashboard|Help/i).first()).toBeVisible();

  const helpButton = page.getByRole('button', { name: /Help/i }).first();
  await expect(helpButton).toBeVisible();
  await helpButton.click();

  await expect(page.getByText(/Get Support|Help Center|FAQ|Success Path|1-on-1 Coaching|AI Credit Coach/i).first()).toBeVisible();

  const helpLink = page
    .getByRole('link')
    .filter({ hasText: /Help Center|FAQ|Success Path|1-on-1 Coaching|AI Credit Coach|Get Support/i })
    .first();

  if (await helpLink.count()) {
    await helpLink.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Help|Dashboard|Get Support|Help Center|FAQ/i).first()).toBeVisible();
});