import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('bulk print page actions are usable without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/bulk-print`);

  await expect(page.getByText(/Bulk Print|Print|Letters|Disputes/i).first()).toBeVisible();

  const actionButton = page
    .locator('main')
    .getByRole('button')
    .filter({ hasText: /Print|Bulk|Generate|Create|Download|View|Select|Letters/i })
    .first();

  if (await actionButton.count()) {
    await actionButton.click();
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Bulk Print|Print|Letters|Disputes/i).first()).toBeVisible();
});

test('bulk print automation rules can be added, edited, and canceled visibly', async ({ page }) => {
  await page.goto(`${BASE_URL}/bulk-print`);
  await page.getByRole('button', { name: 'Print Automation' }).click();

  await page.getByRole('button', { name: '+ New Rule' }).click();
  await expect(page.getByRole('dialog', { name: 'New automation rule' })).toBeVisible();
  await page.getByLabel('Rule Name').fill('Canceled Rule');
  await page.getByLabel('Trigger').fill('Canceled trigger');
  await page.getByLabel('Action').fill('Canceled action');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Canceled Rule')).toHaveCount(0);

  await page.getByRole('button', { name: '+ New Rule' }).click();
  await page.getByLabel('Rule Name').fill('High Priority Bureau Batch');
  await page.getByLabel('Trigger').fill('When a priority bureau letter is queued');
  await page.getByLabel('Action').fill('Add it to the next print batch');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Automation status')).toContainText('Added automation rule "High Priority Bureau Batch".');
  await expect(page.getByText('High Priority Bureau Batch', { exact: true })).toBeVisible();
  await expect(page.getByText('When a priority bureau letter is queued')).toBeVisible();

  const addedRule = page.getByLabel('Automation rule High Priority Bureau Batch');
  await addedRule.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit automation rule' })).toBeVisible();
  await expect(page.getByLabel('Rule Name')).toHaveValue('High Priority Bureau Batch');
  await page.getByLabel('Rule Name').fill('Updated Priority Bureau Batch');
  await page.getByLabel('Trigger').fill('Every weekday at 9 AM');
  await page.getByLabel('Action').fill('Prepare priority letters for specialist review');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Automation status')).toContainText('Updated automation rule "Updated Priority Bureau Batch".');
  await expect(page.getByText('Updated Priority Bureau Batch', { exact: true })).toBeVisible();
  await expect(page.getByText('Every weekday at 9 AM')).toBeVisible();
  await expect(page.getByText('High Priority Bureau Batch', { exact: true })).toHaveCount(0);

  const updatedRule = page.getByLabel('Automation rule Updated Priority Bureau Batch');
  await updatedRule.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Rule Name').fill('Should Not Save');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Should Not Save')).toHaveCount(0);
  await expect(page.getByText('Updated Priority Bureau Batch', { exact: true })).toBeVisible();
});
