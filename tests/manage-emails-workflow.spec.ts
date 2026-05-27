import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('manage emails persists templates and smtp settings locally', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-emails`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const templateName = `Playwright Welcome ${Date.now()}`;
  await page.getByRole('button', { name: /New Template/i }).click();
  await page.getByPlaceholder('e.g. Dispute Filed Confirmation').fill(templateName);
  await page.getByPlaceholder('Use {{client_name}}, {{company_name}}, etc.').fill('Welcome {{client_name}}');
  await page.locator('textarea').fill('Hello {{client_name}}, welcome.');
  await page.getByRole('button', { name: /Save Template/i }).click();
  await expect(page.getByRole('cell', { name: templateName, exact: true })).toBeVisible();

  await page.getByRole('row', { name: new RegExp(templateName) }).getByRole('button', { name: /Edit/i }).click();
  await page.getByPlaceholder('Use {{client_name}}, {{company_name}}, etc.').fill('Updated welcome {{client_name}}');
  await page.getByRole('button', { name: /Save Template/i }).click();
  await page.getByRole('row', { name: new RegExp(templateName) }).getByRole('button', { name: /Duplicate/i }).click();
  await expect(page.getByRole('cell', { name: `${templateName} (Copy)` })).toBeVisible();

  await page.getByRole('button', { name: /SMTP Settings/i }).click();
  await page.getByPlaceholder('smtp.gmail.com').fill('smtp.example.com');
  await page.getByPlaceholder('587').fill('587');
  await page.getByPlaceholder('you@gmail.com').fill('sender@example.com');
  await page.locator('input[type="password"]').fill('local-secret');
  await page.getByPlaceholder('noreply@mycompany.com').fill('noreply@example.com');
  await page.getByRole('button', { name: /Save Settings/i }).click();
  await expect(page.getByText(/SMTP settings saved locally for smtp\.example\.com:587/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('cell', { name: templateName, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: `${templateName} (Copy)`, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /SMTP Settings/i }).click();
  await expect(page.getByPlaceholder('smtp.gmail.com')).toHaveValue('smtp.example.com');
});

test('manage emails validates local test send and persists resend status', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-emails`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: /SMTP Settings/i }).click();
  await page.getByPlaceholder('smtp.gmail.com').fill('');
  await page.getByRole('button', { name: /Send Test Email/i }).click();
  await expect(page.getByText(/Send Test Email needs SMTP Host/)).toBeVisible();
  await expect(page.getByText(/no real email was sent/i)).toBeVisible();

  await page.getByRole('button', { name: /Email Log/i }).click();
  await page.getByRole('row', { name: /sophia\.davis@email\.com/ }).getByRole('button', { name: /Resend/i }).click();
  await expect(page.getByText(/No real email was sent/)).toBeVisible();
  await page.waitForTimeout(650);
  await page.reload();
  await page.getByRole('button', { name: /Email Log/i }).click();
  await expect(page.getByRole('row', { name: /sophia\.davis@email\.com/ })).toContainText('sent-local');
});
