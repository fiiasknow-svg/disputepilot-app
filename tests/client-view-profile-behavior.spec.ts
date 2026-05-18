import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

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
