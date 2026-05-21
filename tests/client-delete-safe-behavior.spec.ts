import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

async function seedClients(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('disputepilot.clients', JSON.stringify([
      {
        id: 'local-delete-alpha',
        first_name: 'Delete',
        last_name: 'Alpha',
        full_name: 'Delete Alpha',
        email: 'delete.alpha@example.com',
        phone: '555-1101',
        status: 'active',
        client_type: 'Client',
        created_at: '2026-05-01T12:00:00.000Z',
        updated_at: '2026-05-01T12:00:00.000Z',
      },
      {
        id: 'local-delete-beta',
        first_name: 'Delete',
        last_name: 'Beta',
        full_name: 'Delete Beta',
        email: 'delete.beta@example.com',
        phone: '555-1102',
        status: 'active',
        client_type: 'Client',
        created_at: '2026-05-02T12:00:00.000Z',
        updated_at: '2026-05-02T12:00:00.000Z',
      },
    ]));
  });

  await page.route('**/rest/v1/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

test('single client delete action uses a visible confirmation modal', async ({ page }) => {
  await seedClients(page);
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
  await page.getByRole('row', { name: /Delete Alpha/i }).locator('button[title="Delete"]').click();

  await expect(page.getByRole('heading', { name: /Delete Client\?/i })).toBeVisible();
  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByText('Delete Alpha')).toBeVisible();
});

test('bulk delete confirms, cancel preserves selection, and confirm removes selected clients', async ({ page }) => {
  await seedClients(page);
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByText('Delete Alpha')).toBeVisible();
  await page.getByRole('row', { name: /Delete Alpha/i }).locator('input[type="checkbox"]').check();
  await page.getByRole('row', { name: /Delete Beta/i }).locator('input[type="checkbox"]').check();
  await expect(page.getByText('2 selected')).toBeVisible();

  await page.getByRole('button', { name: /Delete$/i }).first().click();
  await expect(page.getByRole('heading', { name: /Delete Selected Clients\?/i })).toBeVisible();

  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByText('2 selected')).toBeVisible();
  await expect(page.getByText('Delete Alpha')).toBeVisible();
  await expect(page.getByText('Delete Beta')).toBeVisible();

  await page.getByRole('button', { name: /Delete$/i }).first().click();
  await page.getByRole('button', { name: /^Confirm Delete$/i }).click();

  await expect(page.getByText('Delete Alpha')).toHaveCount(0);
  await expect(page.getByText('Delete Beta')).toHaveCount(0);
  await expect(page.getByText('2 selected')).toHaveCount(0);
  await expect(page.getByText(/Removed 2 clients/i)).toBeVisible();
});
