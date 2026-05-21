import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('letter vault BACK falls back to letters when there is no useful in-app history', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);

  await page.getByRole('button', { name: 'BACK' }).click();

  await expect(page).toHaveURL(/\/letters$/);
  await expect(page.getByRole('heading', { name: 'Letters' })).toBeVisible();
});

test('letter vault training menu items open visible training dialogs', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);

  await page.getByRole('button', { name: 'Training Videos' }).click();
  await page.getByRole('button', { name: 'Letter Vault Training Video' }).click();
  await expect(page.getByRole('dialog', { name: 'Letter Vault Training Video' })).toBeVisible();
  await expect(page.getByText('Training video placeholder')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Training Videos' }).click();
  await page.getByRole('button', { name: 'Move Letters Training Video' }).click();
  await expect(page.getByRole('dialog', { name: 'Move Letters Training Video' })).toBeVisible();
  await expect(page.getByText('choosing a category')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('letter vault preview shows select status first, then previews selected template', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);
  await page.getByRole('button', { name: 'Open letter tools' }).click();

  await page.getByRole('button', { name: 'Letter Preview' }).click();
  await expect(page.getByLabel('Saved confirmation')).toContainText('Select a letter or saved draft before opening Letter Preview.');

  const templateList = page.getByRole('region', { name: 'Template list' });
  const template = templateList.locator('article').filter({ hasText: 'Personal Information Letter' }).first();
  await template.getByRole('button', { name: 'View', exact: true }).click();
  await page.getByRole('button', { name: 'Letter Preview' }).click();

  const preview = page.getByRole('dialog', { name: 'Letter Preview' });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('Personal Information Letter');
  await expect(preview).toContainText('{{client_name}}');
  await preview.getByRole('button', { name: 'Close' }).click();
});

test('letter vault response buttons open visible response drafts', async ({ page }) => {
  await page.goto(`${BASE_URL}/letter-vault`);
  await page.getByRole('button', { name: 'Open letter tools' }).click();

  for (const response of ['Credit Bureau', 'Creditor', 'Collector']) {
    await page.getByRole('button', { name: `Respond ${response}` }).click();
    await expect(page.getByRole('tab', { name: 'RESPOND LETTERS' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Letter editor')).toBeVisible();
    await expect(page.getByLabel('Subject / Title')).toHaveValue(`${response} Response Letter`);
    await expect(page.getByLabel('Body / Content')).toContainText(`recent ${response.toLowerCase()} communication`);
    await expect(page.getByLabel('Saved confirmation')).toContainText(`Opened ${response.toLowerCase()} response draft in Respond Letters.`);
  }
});
