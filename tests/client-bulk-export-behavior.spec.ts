import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('bulk toolbar Export downloads only selected clients', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('disputepilot.clients', JSON.stringify([
      {
        id: 'local-export-alpha',
        first_name: 'Export',
        last_name: 'Alpha',
        full_name: 'Export Alpha',
        email: 'export.alpha@example.com',
        phone: '555-3101',
        status: 'active',
        client_type: 'Client',
        created_at: '2026-05-01T12:00:00.000Z',
        updated_at: '2026-05-01T12:00:00.000Z',
      },
      {
        id: 'local-export-beta',
        first_name: 'Export',
        last_name: 'Beta',
        full_name: 'Export Beta',
        email: 'export.beta@example.com',
        phone: '555-3102',
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

  await page.goto(`${BASE_URL}/clients`);
  await expect(page.getByText('Export Alpha')).toBeVisible();
  await expect(page.getByText('Export Beta')).toBeVisible();

  await page.getByRole('row', { name: /Export Alpha/i }).locator('input[type="checkbox"]').check();
  await expect(page.getByText('1 selected')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export Selected/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('selected-clients.csv');
  const stream = await download.createReadStream();
  expect(stream).toBeTruthy();
  let csv = '';
  for await (const chunk of stream!) csv += chunk.toString();

  expect(csv).toContain('"Export","Alpha"');
  expect(csv).toContain('export.alpha@example.com');
  expect(csv).not.toContain('"Export","Beta"');
  expect(csv).not.toContain('export.beta@example.com');
  await expect(page.getByText(/selected-clients\.csv/i)).toBeVisible();
});
