import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('create dispute opens a usable form', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes`);

  await page.getByRole('button', { name: 'Create New Dispute' }).click();

  const dialog = page.getByRole('dialog', { name: 'Create New Dispute' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Client / Customer *')).toBeVisible();
  await expect(dialog.getByLabel('Status')).toBeVisible();
  await expect(dialog.getByLabel('Round')).toBeVisible();
  await expect(dialog.getByLabel('Bureau')).toBeVisible();
  await expect(dialog.getByLabel('Dispute Reason / Type')).toBeVisible();
  await expect(dialog.getByLabel('Account / Creditor *')).toBeVisible();
  await expect(dialog.getByLabel('Letter / Template')).toBeVisible();
  await expect(dialog.getByLabel('Date')).toBeVisible();
  await expect(dialog.getByLabel('Notes')).toBeVisible();
});

test('cancel closes the dispute form', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes`);

  await page.getByRole('button', { name: 'Create New Dispute' }).click();
  await expect(page.getByRole('dialog', { name: 'Create New Dispute' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('dialog', { name: 'Create New Dispute' })).toHaveCount(0);
});

test('save shows the created dispute in the visible table and confirmation', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes`);

  await page.getByRole('button', { name: 'Create New Dispute' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create New Dispute' });

  await dialog.getByLabel('Client / Customer *').fill('Avery Brooks');
  await dialog.getByLabel('Status').selectOption('Sent');
  await dialog.getByLabel('Round').selectOption('Round 2');
  await dialog.getByLabel('Bureau').selectOption('Experian');
  await dialog.getByLabel('Dispute Reason / Type').selectOption('Duplicate Account');
  await dialog.getByLabel('Account / Creditor *').fill('First National Bank');
  await dialog.getByLabel('Letter / Template').selectOption('Metro 2 Compliance Letter');
  await dialog.getByLabel('Date').fill('2026-05-02');
  await dialog.getByLabel('Notes').fill('Client uploaded proof that the same tradeline is reporting twice.');

  await dialog.getByRole('button', { name: 'Save Dispute' }).click();

  await expect(page.getByRole('dialog', { name: 'Create New Dispute' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Dispute Saved' })).toBeVisible();
  await expect(page.getByText('Avery Brooks now has a Experian round 2 dispute for First National Bank using Metro 2 Compliance Letter.')).toBeVisible();

  const row = page.getByRole('row').filter({ hasText: 'Avery Brooks' });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Sent');
  await expect(row).toContainText('Round 2');
  await expect(row).toContainText('Experian');
  await expect(row).toContainText('First National Bank');
  await expect(row).toContainText('Metro 2 Compliance Letter');
});

test('view opens useful dispute details', async ({ page }) => {
  await page.goto(`${BASE_URL}/disputes`);

  await page.getByRole('row').filter({ hasText: 'John Smith' }).getByRole('button', { name: 'View' }).click();

  const details = page.getByRole('dialog', { name: 'Dispute Details' });
  await expect(details).toBeVisible();
  await expect(details).toContainText('John Smith');
  await expect(details).toContainText('In Progress');
  await expect(details).toContainText('Round 1');
  await expect(details).toContainText('Equifax');
  await expect(details).toContainText('Capital One Platinum');
  await expect(details).toContainText('609 Dispute Letter');
  await expect(details).toContainText('04/29/2026');
  await expect(details).toContainText('Client says the balance was paid before the statement date.');
});
