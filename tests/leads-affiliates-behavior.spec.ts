import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('leads and affiliates page actions are usable without app error', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(`${BASE_URL}/leads`);

  await expect(page.getByText(/Leads|Affiliates|Website Lead Form/i).first()).toBeVisible();
  await expect(page.getByText(/Loading/i)).toHaveCount(0);

  await page.getByRole('button', { name: /Add Lead/i }).click();
  const addModal = page.getByRole('heading', { name: 'Add New Lead' }).locator('xpath=..');
  await expect(addModal).toBeVisible();

  const unique = Date.now();
  await addModal.locator('input').nth(0).fill('Scoped');
  await addModal.locator('input').nth(1).fill(`Lead ${unique}`);
  await addModal.locator('input').nth(2).fill(`scoped-lead-${unique}@example.test`);
  await addModal.getByRole('button', { name: 'Add Lead' }).click();

  await expect(page.getByText(`Saved lead: Scoped Lead ${unique}`)).toBeVisible();
  await expect(page.locator('tbody').getByText(`Scoped Lead ${unique}`, { exact: true })).toBeVisible();

  const leadRow = page.locator('tbody tr').filter({ hasText: `Lead ${unique}` }).first();
  await leadRow.getByTitle('Edit').click();
  const editModal = page.getByRole('heading', { name: 'Edit Lead' }).locator('xpath=..');
  await editModal.locator('input').nth(1).fill(`Lead Updated ${unique}`);
  await editModal.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText(`Updated lead: Scoped Lead Updated ${unique}`)).toBeVisible();
  await expect(page.locator('tbody').getByText(`Scoped Lead Updated ${unique}`, { exact: true })).toBeVisible();

  const updatedRow = page.locator('tbody tr').filter({ hasText: `Lead Updated ${unique}` }).first();
  await updatedRow.locator('select').selectOption('contacted');
  await expect(updatedRow.locator('select')).toHaveValue('contacted');

  await updatedRow.getByTitle('Delete').click();
  await expect(page.getByRole('heading', { name: 'Delete Lead?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('tbody').getByText(`Scoped Lead Updated ${unique}`, { exact: true })).toHaveCount(0);

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Leads|Affiliates|Website Lead Form/i).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
