import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('add client form can save without app error', async ({ page }) => {
  let sawClientInsert = false;

  await page.route('**/rest/v1/clients*', async route => {
    const request = route.request();

    if (request.method() === 'POST') {
      sawClientInsert = true;
      const body = request.postDataJSON();

      expect(Array.isArray(body)).toBe(true);
      expect(body[0]).not.toHaveProperty('client_type');

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });

  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
  await expect(page.getByText(/Loading/i)).toHaveCount(0);

  await page.getByRole('button', { name: /Add New Customer|\+ Add Client|Add Client/i }).first().click();

  const addClientSection = page.getByRole('heading', { name: /Add New Client/i }).locator('..');

  await expect(page.getByRole('heading', { name: /Add New Client/i })).toBeVisible();

  const fields = addClientSection.locator('input:not([type="checkbox"]):not([readonly])');

  await fields.nth(0).fill('Test');
  await fields.nth(1).fill('Client');
  await fields.nth(2).fill(`test.client.${Date.now()}@example.com`);

  await addClientSection.getByRole('button', { name: /Save Client|Save Customer|Save|Create/i }).click();

  await expect.poll(() => sawClientInsert).toBe(true);
  await expect(page.getByText(/client_type|schema cache/i)).toHaveCount(0);
  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
});
