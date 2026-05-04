import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('clients workflow is usable end to end', async ({ page }) => {
  test.setTimeout(90000);
  const stamp = Date.now();
  const firstName = `Flow${stamp}`;
  const lastName = 'Client';
  const editedLastName = 'Updated';
  const email = `flow.${stamp}@example.com`;

  await page.goto(`${BASE_URL}/clients`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /^Clients$/i })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: /Add New Customer|\+ Add Client/i }).first().click();
  await expect(page.getByRole('heading', { name: /Add New Client/i })).toBeVisible();
  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByRole('heading', { name: /Add New Client/i })).toHaveCount(0);

  await page.getByRole('button', { name: /Add New Customer|\+ Add Client/i }).first().click();
  const addModal = page.getByRole('heading', { name: /Add New Client/i }).locator('..');
  const addInputs = addModal.locator('input:not([type="checkbox"]):not([readonly])');
  await addInputs.nth(0).fill(firstName);
  await addInputs.nth(1).fill(lastName);
  await addInputs.nth(2).fill(email);
  await addInputs.nth(3).fill('555-0199');
  await addModal.locator('select').nth(0).selectOption('active');
  await addModal.locator('select').nth(1).selectOption('Client');
  await addModal.getByRole('textbox').last().fill('Created by workflow test');
  await addModal.getByRole('button', { name: /Save Client/i }).click();

  await expect(page.getByRole('button', { name: `${firstName} ${lastName}` })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /^Saved client:/i }).first()).toBeVisible();

  const row = page.locator('tr', { hasText: `${firstName} ${lastName}` });
  await row.getByRole('button', { name: /^View$/i }).click();
  await expect(page.getByRole('heading', { name: new RegExp(`${firstName} ${lastName}`) })).toBeVisible();
await expect(page.getByText(email).last()).toBeVisible();
await page.getByRole('button', { name: /^Close$/i }).click();

  await page.locator('tr', { hasText: `${firstName} ${lastName}` }).getByTitle('Edit').click();
  const editModal = page.getByRole('heading', { name: /Edit Client/i }).locator('..');
  await editModal.locator('input:not([type="checkbox"]):not([readonly])').nth(1).fill(editedLastName);
  await editModal.getByRole('button', { name: /Save Changes/i }).click();
  await expect(page.getByRole('button', { name: `${firstName} ${editedLastName}` })).toBeVisible();
  await expect(page.getByText(/Updated client:/i)).toBeVisible();

  await page.getByPlaceholder(/First name/i).fill(firstName);
  await page.getByPlaceholder(/Last name/i).fill(editedLastName);
  await page.getByRole('button', { name: /^Search$/i }).click();
  await expect(page.getByRole('button', { name: `${firstName} ${editedLastName}` })).toBeVisible();
  await page.getByRole('button', { name: /^Clear$/i }).click();
  await expect(page.getByPlaceholder(/First name/i)).toHaveValue('');
  await expect(page.getByPlaceholder(/Last name/i)).toHaveValue('');

  await page.getByRole('button', { name: /Import CSV/i }).click();
  await expect(page.getByRole('heading', { name: /Import Clients from CSV/i })).toBeVisible();
  await page.locator('textarea').fill(`first_name,last_name,email,phone,status,type,notes\nImport${stamp},Customer,import.${stamp}@example.com,555-0111,pending,Lead,Imported safely`);
  await page.getByRole('button', { name: /^Import$/i }).click();
  await expect(page.getByText(`Import${stamp} Customer`)).toBeVisible();
  await expect(page.getByText(/Imported 1 client from CSV/i)).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('clients.csv');
  await expect(page.getByText(/Export ready:/i)).toBeVisible();
});
