import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('detail letters can be assigned, viewed, downloaded, and rounds advanced', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes/demo-dispute-1`);

  await expect(page.getByRole('heading', { name: 'Capital One Platinum' })).toBeVisible();
  await page.getByRole('button', { name: 'Assign Letter' }).click();
  await expect(page.getByRole('status')).toContainText('Queued Standard FCRA Dispute Letter');

  await page.getByRole('button', { name: 'Letters Sent' }).click();
  await expect(page.getByRole('heading', { name: 'Letters Sent (1)' })).toBeVisible();
  const letterRow = page.locator('div').filter({ has: page.getByRole('button', { name: 'View Letter' }) }).filter({ hasText: 'Standard FCRA Dispute Letter' }).first();
  await expect(letterRow).toBeVisible();
  await expect(letterRow).toContainText('queued');

  await page.getByRole('button', { name: 'View Letter' }).click();
  const preview = page.getByRole('dialog', { name: 'Letter Preview' });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('Capital One Platinum');
  await expect(preview).toContainText('Incorrect balance');
  await preview.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(preview).toHaveCount(0);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('standard-fcra-dispute-letter.txt');

  await page.getByRole('button', { name: 'Round History' }).click();
  await page.getByRole('button', { name: '+ New Round' }).click();
  await expect(page.getByRole('heading', { name: 'Advance to Round 2?' })).toBeVisible();
  await page.getByRole('button', { name: 'Advance to Round 2' }).click();

  await expect(page.getByRole('status')).toContainText('Advanced to Round 2. Status set to sent.');
  await expect(page.getByText('Round 2').first()).toBeVisible();
  await expect(page.getByText('sent').first()).toBeVisible();
});

test('letters tab Assign & Queue adds a useful letter row', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes/demo-dispute-1`);

  await page.getByRole('button', { name: 'Letters Sent' }).click();
  await page.getByRole('button', { name: 'Assign & Queue' }).click();

  await expect(page.getByRole('status')).toContainText('Queued Standard FCRA Dispute Letter');
  await expect(page.getByRole('heading', { name: 'Letters Sent (1)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Letter' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible();
});
