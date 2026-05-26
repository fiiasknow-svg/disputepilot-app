import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

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

async function selectFirstClientAndLoad(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/credit-analysis`);
  const clientSelect = page.locator('main select').first();
  await expect(clientSelect).toBeVisible();
  await expect.poll(async () => clientSelect.locator('option').count()).toBeGreaterThan(1);
  const optionValues = await clientSelect.locator('option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).filter(Boolean)
  );
  await clientSelect.selectOption(optionValues[0]);
  await page.getByRole('button', { name: /Load Credit Report/i }).click();
}

test('credit-analyzer direct route redirects to the credit analysis workflow', async ({ page }) => {
  await page.goto(`${BASE_URL}/credit-analyzer`);
  await expect(page).toHaveURL(/\/credit-analysis$/);
  await expect(page.getByRole('heading', { name: /Credit Analysis/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Analyze\/Import Report/i })).toBeVisible();
});

test('credit analysis shows client-specific demo load status', async ({ page }) => {
  await selectFirstClientAndLoad(page);
  await expect(page.getByRole('status').filter({ hasText: /Demo report loaded for/i })).toBeVisible();
  await expect(page.getByText(/upload\/import is not connected to backend storage yet/i)).toBeVisible();
  await expect(page.getByText(/Tradelines/i)).toBeVisible();
});

test('credit analysis imports a local report snapshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/credit-analysis`);
  const clientSelect = page.locator('main select').first();
  await expect.poll(async () => clientSelect.locator('option').count()).toBeGreaterThan(1);
  const optionValues = await clientSelect.locator('option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).filter(Boolean)
  );
  await clientSelect.selectOption(optionValues[0]);

  await page.getByPlaceholder(/Equifax score/i).fill('Equifax score 701, Experian score 712, TransUnion score 688');
  await page.getByRole('button', { name: /Analyze\/Import Report/i }).click();

  await expect(page.getByRole('status').filter({ hasText: /Imported local snapshot/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Equifax\s+701/i })).toBeVisible();
  await expect(page.getByText(/Backend report parsing and AI analysis are not connected/i)).toBeVisible();
});

test('bureau score cards are accessible buttons and keyboard selectable', async ({ page }) => {
  await selectFirstClientAndLoad(page);
  const experianCard = page.getByRole('button', { name: /Experian\s+638/i });
  await expect(experianCard).toBeVisible();
  await experianCard.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Tradelines .* Experian/i)).toBeVisible();
});

test('credit analysis exports CSV and downloads text report', async ({ page }) => {
  await selectFirstClientAndLoad(page);

  const csvDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export CSV/i }).click();
  const csvDownload = await csvDownloadPromise;
  expect(csvDownload.suggestedFilename()).toBe('credit_report_Equifax.csv');

  const reportDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download Report/i }).click();
  const reportDownload = await reportDownloadPromise;
  expect(reportDownload.suggestedFilename()).toMatch(/credit_report_.*_Equifax\.txt/);
});

test('print report calls browser print', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {
      window.dispatchEvent(new Event('print-called'));
    };
  });
  await selectFirstClientAndLoad(page);
  const printed = page.evaluate(() => new Promise<boolean>(resolve => {
    window.addEventListener('print-called', () => resolve(true), { once: true });
  }));
  await page.getByRole('button', { name: /Print Report/i }).click();
  await expect(printed).resolves.toBe(true);
});

test('add to disputes stores a visible local queue item', async ({ page }) => {
  await selectFirstClientAndLoad(page);
  await page.getByRole('button', { name: 'Dispute', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: /Add Dispute Item/i })).toBeVisible();
  await page.getByLabel(/Notes/i).fill('Queue this locally for review.');
  await page.getByRole('button', { name: /Add to Disputes/i }).click();
  await expect(page.getByText(/local disputes queue/i)).toBeVisible();
  await expect(page.getByText(/Chase Sapphire|Capital One|Discover Card/i).first()).toBeVisible();
});
