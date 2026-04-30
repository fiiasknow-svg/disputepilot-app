import { test, expect } from '@playwright/test';

const pages = [
  '/company/settings',
  '/company/portals',
  '/automation',
];

test.describe('save buttons do not throw app errors', () => {
  for (const path of pages) {
    test(`${path} save button keeps page usable`, async ({ page }) => {
      await page.goto(`https://disputepilot-app.vercel.app${path}`);

      const saveButton = page.getByRole('button', { name: /^Save$/i }).first();
      await expect(saveButton).toBeVisible();

      await saveButton.click();

      await expect(page.getByText(/404|Application error|Runtime Error/i)).not.toBeVisible();
    });
  }
});