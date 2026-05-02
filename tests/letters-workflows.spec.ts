import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

test('letter vault view, create, cancel, save, and edit workflows are usable', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);

  const template = page.locator('article').filter({ hasText: 'Personal Information Letter' }).first();
  await template.getByRole('button', { name: 'View' }).click();

  await expect(page.getByLabel('Template details')).toContainText('Request correction or removal');
  await expect(page.getByLabel('Template details')).toContainText('{{client_name}}');

  await template.getByRole('button', { name: 'Use Template' }).click();
  await expect(page.getByLabel('Letter editor')).toBeVisible();
  await expect(page.getByLabel('Subject / Title')).toHaveValue('Personal Information Letter');

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByLabel('Letter editor')).toHaveCount(0);

  await template.getByRole('button', { name: 'Use Template' }).click();
  await page.getByLabel('Client / Customer').fill('Avery Client');
  await page.getByLabel('Bureau / Recipient').fill('Equifax');
  await page.getByLabel('Dispute Reason / Type').fill('Incorrect personal information');
  await page.getByLabel('Account / Creditor').fill('Profile section');
  await page.getByLabel('Subject / Title').fill('Avery Equifax Personal Info Dispute');
  await page.getByLabel('Notes').fill('Attach ID and utility bill.');
  await page.getByRole('button', { name: 'Save Letter' }).click();

  await expect(page.getByLabel('Saved confirmation')).toContainText('Avery Equifax Personal Info Dispute');
  await expect(page.getByLabel('Saved letters')).toContainText('Avery Client to Equifax');

  await page.getByLabel('Saved letters').getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByLabel('Letter editor')).toBeVisible();
  await expect(page.getByLabel('Subject / Title')).toHaveValue('Avery Equifax Personal Info Dispute');
  await page.getByLabel('Subject / Title').fill('Updated Avery Equifax Dispute');
  await page.getByLabel('Body / Content').fill('Updated visible body for the saved letter.');
  await page.getByRole('button', { name: 'Save Letter' }).click();

  await expect(page.getByLabel('Saved letters')).toContainText('Updated Avery Equifax Dispute');
  await expect(page.getByLabel('Saved letters')).toContainText('Updated visible body');
});

test('letters page supports creating and editing saved letters', async ({ page }) => {
  await page.goto(`${BASE_URL}/letters`);

  await expect(page.getByRole('heading', { name: 'Letters' })).toBeVisible();
  const savedLetters = page.getByRole('region', { name: 'Saved letters' });
  await expect(savedLetters).toContainText('Experian Round 1 Collection Dispute');

  await page.getByRole('button', { name: 'Create Letter' }).click();
  await expect(page.getByLabel('Letter editor')).toBeVisible();
  await page.getByLabel('Client / Customer').fill('Riley Green');
  await page.getByLabel('Bureau / Recipient').fill('TransUnion');
  await page.getByLabel('Dispute Reason / Type').fill('Late payment is inaccurate');
  await page.getByLabel('Account / Creditor').fill('North Bank');
  await page.getByLabel('Template / Letter Type').fill('Late Payment Dispute');
  await page.getByLabel('Subject / Title').fill('Riley TransUnion Late Payment Dispute');
  await page.getByLabel('Body / Content').fill('Please investigate and correct the inaccurate late payment.');
  await page.getByLabel('Notes').fill('Generated from client intake.');
  await page.getByRole('button', { name: 'Save Letter' }).click();

  await expect(page.getByLabel('Saved confirmation')).toContainText('Riley TransUnion Late Payment Dispute');
  await expect(savedLetters).toContainText('Riley Green to TransUnion');

  const saved = savedLetters.locator('article').filter({ hasText: 'Riley TransUnion Late Payment Dispute' });
  await saved.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Notes').fill('Updated after specialist review.');
  await page.getByRole('button', { name: 'Save Letter' }).click();

  await expect(savedLetters).toContainText('Updated after specialist review.');
});

test('AI rewriter accepts input, produces visible output, and clears/reset', async ({ page }) => {
  await page.goto(`${BASE_URL}/letters/ai-rewriter`);

  const original = page.getByPlaceholder(/Paste your existing dispute letter here/i);
  await original.fill('I dispute the ABC Collections account because it is not mine.');
  await page.getByRole('button', { name: /Rewrite with AI/i }).click();

  const output = page.getByLabel('Rewritten output');
  await expect(page.getByText('Rewritten Letter (AI)')).toBeVisible();
  await expect(output).toContainText('I dispute the ABC Collections account because it is not mine.');
  await expect(output).toContainText(/within 30 days/i);

  await page.getByRole('button', { name: 'Clear / Reset' }).click();
  await expect(original).toHaveValue('');
  await expect(page.getByText('Your rewritten letter will appear here')).toBeVisible();
});
