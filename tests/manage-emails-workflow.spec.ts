import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('manage emails can create edit and save templates and smtp settings', async ({ page }) => {
  await page.goto(`${BASE_URL}/company/manage-emails`);

  const templateName = `Playwright Welcome ${Date.now()}`;
  await page.getByRole('button', { name: /New Template/i }).click();
  await page.getByPlaceholder('e.g. Dispute Filed Confirmation').fill(templateName);
  await page.getByPlaceholder('Use {{client_name}}, {{company_name}}, etc.').fill('Welcome {{client_name}}');
  await page.locator('textarea').fill('Hello {{client_name}}, welcome.');
  await page.getByRole('button', { name: /Save Template/i }).click();

  await expect(page.getByText(`Email template created: ${templateName}.`)).toBeVisible();
  await expect(page.getByRole('cell', { name: templateName })).toBeVisible();

  await page.getByRole('row', { name: new RegExp(templateName) }).getByRole('button', { name: /Edit/i }).click();
  await page.getByPlaceholder('Use {{client_name}}, {{company_name}}, etc.').fill('Updated welcome {{client_name}}');
  await page.getByRole('button', { name: /Save Template/i }).click();
  await expect(page.getByText(`Email template saved: ${templateName}.`)).toBeVisible();

  await page.getByRole('button', { name: /SMTP Settings/i }).click();
  await page.getByPlaceholder('smtp.gmail.com').fill('smtp.example.com');
  await page.getByPlaceholder('587').fill('587');
  await page.getByRole('button', { name: /Save Settings/i }).click();
  await expect(page.getByText('SMTP settings saved for smtp.example.com:587.')).toBeVisible();
});
