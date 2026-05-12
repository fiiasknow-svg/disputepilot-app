import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

function collectRuntimeErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));

  return errors;
}

test('employees page actions are usable without app error', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);

  await page.goto(`${BASE_URL}/employees`);

  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
  await expect(page.getByText(/Application error|Runtime Error/i)).toHaveCount(0);

  await page.getByRole('button', { name: '+ Add Employee' }).click();
  await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();

  const addModal = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Add Employee' }) }).last();
  const stamp = Date.now();
  await addModal.locator('input').nth(0).fill('Playwright');
  await addModal.locator('input').nth(1).fill(`Employee ${stamp}`);
  await addModal.locator('input').nth(2).fill(`employee.${stamp}@example.com`);
  await page.getByRole('button', { name: /^Add Employee$/ }).click();

  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
  await expect(page.getByText(/Application error|Runtime Error/i)).toHaveCount(0);

  const saveError = page.getByRole('alert').filter({ hasText: /Employee could not be saved/i });
  if (await saveError.count()) {
    await expect(saveError).toContainText(/Employee could not be saved: .+/);
    await page.getByRole('button', { name: 'Cancel' }).click();
  }

  const firstDataRow = page.locator('tbody tr').filter({ has: page.locator('td') }).first();

  if (await firstDataRow.count()) {
    const statusSelect = firstDataRow.locator('select').first();
    if (await statusSelect.count()) {
      await statusSelect.click();
    }

    const editButton = firstDataRow.getByRole('button', { name: '✏️' }).first();
    if (await editButton.count()) {
      await editButton.click();
      await expect(page.getByRole('heading', { name: 'Edit Employee' })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
    }

    const removeButton = firstDataRow.getByRole('button', { name: '🗑️' }).first();
    if (await removeButton.count()) {
      await removeButton.click();
      await expect(page.getByRole('heading', { name: 'Remove Employee?' })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  }

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
