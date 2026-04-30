import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('credit analysis analyzer page is usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/credit-analysis`);

  await expect(page.getByRole('heading', { name: /Credit Analysis/i })).toBeVisible();

  const clientSelect = page.locator('main select').first();
  await expect(clientSelect).toBeVisible();

  const optionValues = await clientSelect.locator('option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).filter(value => value && !value.includes('Select'))
  );

  if (optionValues.length > 0) {
    await clientSelect.selectOption(optionValues[0]);

    const loadButton = page.getByRole('button', { name: /Load Credit Report/i });
    await expect(loadButton).toBeEnabled();
    await loadButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Credit Analysis|Analyzer|Credit|Equifax|Experian|TransUnion/i).first()).toBeVisible();
});
