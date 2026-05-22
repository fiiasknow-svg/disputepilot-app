import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('academy certificate downloads after all lessons are complete', async ({ page }) => {
  await page.goto(`${BASE_URL}/academy/automation`);
  await expect(page.getByRole('button', { name: /lessons left/i })).toBeDisabled();

  const modules = [
    'Automation Fundamentals',
    'Client Onboarding Automation',
    'Email & Notification Workflows',
    'Dispute & Letter Automation',
    'Advanced Automation & Reporting',
  ];

  for (const moduleName of modules) {
    await page.getByRole('button', { name: new RegExp(moduleName) }).click();
    const lessonToggles = page.locator('button[data-lesson-toggle="true"]');
    if ((await lessonToggles.count()) === 0) {
      await page.getByRole('button', { name: new RegExp(moduleName) }).click();
    }
    const visibleLessons = await lessonToggles.count();
    for (let index = 0; index < visibleLessons; index += 1) {
      await lessonToggles.nth(index).click();
    }
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Certificate' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('certificate');
  await expect(page.getByRole('status')).toContainText('Certificate ready and downloaded');
});
