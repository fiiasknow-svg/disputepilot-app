import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

async function seedProfile(page, overrides = {}) {
  const now = new Date().toISOString();
  await page.addInitScript(client => {
    window.localStorage.setItem('disputepilot.clients', JSON.stringify([client]));
  }, {
    id: 'local-profile-tabs',
    first_name: 'Profile',
    last_name: 'Tabs',
    full_name: 'Profile Tabs',
    email: 'profile.tabs@example.com',
    phone: '555-2101',
    mobile_phone: '555-2101',
    status: 'active',
    portal_access: false,
    notes: 'Local profile seed',
    created_at: now,
    updated_at: now,
    ...overrides,
  });

  await page.route('**/rest/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'GET' && request.url().includes('/clients') && request.url().includes('id=eq.local-profile-tabs')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

test('client view action opens usable client profile without app error', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();

  const viewButton = page
    .locator('main')
    .getByRole('button', { name: /View/i })
    .first();

  await expect(viewButton).toBeVisible();
  await viewButton.click();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  await expect(page.getByText(/Client|Customer|Profile|Status|Email|Phone|Disputes|Payment/i).first()).toBeVisible();
});

test('client profile save uses a safe Supabase payload', async ({ page }) => {
  let sawProfileUpdate = false;

  await page.addInitScript(() => {
    window.localStorage.setItem('disputepilot.clients', JSON.stringify([{
      id: 'local-profile-payload',
      first_name: 'Profile',
      last_name: 'Payload',
      full_name: 'Profile Payload',
      email: 'profile.payload@example.com',
      phone: '555-0142',
      mobile_phone: '555-0142',
      status: 'active',
      notes: 'Local profile seed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]));
  });

  await page.route('**/rest/v1/clients*', async route => {
    const request = route.request();

    if (request.method() === 'PATCH') {
      sawProfileUpdate = true;
      const body = request.postDataJSON();

      expect(body).toMatchObject({
        first_name: 'Profile',
        last_name: 'Payload',
        full_name: 'Profile Payload',
        phone: '555-0142',
        mobile_phone: '555-0142',
        email: 'profile.payload@example.com',
      });
      expect(body).not.toHaveProperty('dob_month');
      expect(body).not.toHaveProperty('dob_day');
      expect(body).not.toHaveProperty('dob_year');
      expect(body).not.toHaveProperty('cc_number');
      expect(body).not.toHaveProperty('cc_cvv');
      expect(body).not.toHaveProperty('cc_expiry');
      expect(body).not.toHaveProperty('cm_username');
      expect(body).not.toHaveProperty('cm_password');
      expect(body).not.toHaveProperty('cm_last4');
      expect(body).not.toHaveProperty('cm_provider');
      expect(body).not.toHaveProperty('comments');
      expect(body).not.toHaveProperty('eq_score');
      expect(body).not.toHaveProperty('ex_score');
      expect(body).not.toHaveProperty('tu_score');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([body]),
      });
      return;
    }

    if (request.method() === 'GET' && request.url().includes('id=eq.local-profile-payload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'local-profile-payload',
          first_name: 'Profile',
          last_name: 'Payload',
          full_name: 'Profile Payload',
          email: 'profile.payload@example.com',
          phone: '555-0142',
          mobile_phone: '555-0142',
          status: 'active',
          notes: 'Local profile seed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });

  await page.goto(`${BASE_URL}/clients/local-profile-payload`);

  await expect(page.getByRole('heading', { name: /Profile Payload/i })).toBeVisible();
  for (const label of ['Overview', 'Disputes', 'Letters', 'Documents', 'Invoices', 'Notes', 'Portal', 'Activity']) {
    await expect(page.locator('main').getByRole('button', { name: new RegExp(label, 'i') }).first()).toBeVisible();
  }

  await page.getByRole('button', { name: /^Save Changes$/i }).first().click();

  await expect.poll(() => sawProfileUpdate).toBe(true);
  await expect(page.getByText(/schema cache|dob_month|cc_number|Application error|Runtime Error/i)).toHaveCount(0);
});

test('client profile Letters and Portal tabs show usable visible content', async ({ page }) => {
  await seedProfile(page);
  await page.goto(`${BASE_URL}/clients/local-profile-tabs`);

  await expect(page.getByRole('heading', { name: /Profile Tabs/i })).toBeVisible();

  await page.locator('main').getByRole('button', { name: /^Letters$/i }).click();
  await expect(page.getByRole('heading', { name: /^Letters$/i })).toBeVisible();
  await expect(page.getByText(/No letters are attached/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /View Letter Vault/i })).toBeVisible();

  await page.locator('main').getByRole('button', { name: /^Portal$/i }).click();
  await expect(page.getByRole('heading', { name: /^Portal Access$/i })).toBeVisible();
  await expect(page.getByText('profile.tabs@example.com', { exact: true })).toBeVisible();
  await expect(page.getByText(/Portal access is currently disabled/i)).toBeVisible();

  await page.getByLabel(/Access disabled/i).check();
  await page.getByRole('button', { name: /^Save Changes$/i }).last().click();
  await expect(page.getByRole('button', { name: /^Saved$/i })).toBeVisible();
  await expect(page.getByText(/Application error|Runtime Error/i)).toHaveCount(0);
});

test('client profile uploaded document exposes a real download action', async ({ page }) => {
  await seedProfile(page);
  await page.goto(`${BASE_URL}/clients/local-profile-tabs`);

  await page.locator('main').getByRole('button', { name: /^Documents$/i }).click();
  await expect(page.getByText(/No documents uploaded yet/i)).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'local-report.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('downloadable local report'),
  });

  await expect(page.getByText('local-report.txt')).toBeVisible();
  const downloadLink = page.getByRole('link', { name: /^Download$/i });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute('download', 'local-report.txt');
  await expect(downloadLink).toHaveAttribute('href', /^blob:/);
});
