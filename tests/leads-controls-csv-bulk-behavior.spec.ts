import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const leads = [
      { id: 'local-lead-current', first_name: 'Current', last_name: 'Lead', email: 'current@example.test', phone: '111', source: 'Website', status: 'new', created_at: '2026-05-20T10:00:00.000Z' },
      { id: 'local-lead-portal', first_name: 'Portal', last_name: 'Lead', email: 'portal@example.test', phone: '222', source: 'Client Portal', status: 'contacted', created_at: '2026-05-20T10:00:00.000Z' },
      { id: 'local-lead-referral', first_name: 'Referral', last_name: 'Lead', email: 'referral@example.test', phone: '333', source: 'Referral', status: 'qualified', created_at: '2026-05-20T10:00:00.000Z' },
      { id: 'local-lead-archived', first_name: 'Archived', last_name: 'Lead', email: 'archived@example.test', phone: '444', source: 'Website', status: 'new', archived: true, created_at: '2026-05-20T10:00:00.000Z' },
    ];
    window.localStorage.setItem('disputepilot.leads', JSON.stringify(leads));
    window.localStorage.setItem('disputepilot.leads.archivedIds', JSON.stringify(['local-lead-archived']));
  });
});

test('leads filter controls, CSV import, selected export, and bulk delete are visible behaviors', async ({ page }) => {
  await page.goto(`${BASE_URL}/leads`);
  await expect(page.getByText('Current Lead', { exact: true })).toBeVisible();
  await expect(page.getByText('Archived Lead', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Client Portal' }).click();
  await expect(page.getByText(/Client Portal context/i)).toBeVisible();
  await expect(page.getByText('Portal Lead', { exact: true })).toBeVisible();
  await expect(page.getByText('Referral Lead', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Client Referral Leads' }).click();
  await expect(page.getByText(/Client Referral Leads: referral-tagged/i)).toBeVisible();
  await expect(page.getByText('Referral Lead', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByText(/Archive: archived leads/i)).toBeVisible();
  await expect(page.getByText('Archived Lead', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Current' }).click();
  await page.getByRole('button', { name: 'Move Archive' }).click();
  await expect(page.getByText(/Moved \d+ visible leads? to archive/i)).toBeVisible();
  await expect(page.getByText('Current Lead', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Current' }).click();
  await expect(page.getByText('Current Lead', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: /Import CSV/i }).click();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText(/Paste or upload a CSV/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Import Leads/i })).toBeVisible();

  await page.getByPlaceholder(/paste CSV/i).fill('name,email,phone,source,status\nCSV Person,csv@example.test,555,Referral,new');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText(/Imported 1 lead/i)).toBeVisible();
  await expect(page.getByText('CSV Person', { exact: true })).toBeVisible();

  const row = page.locator('tbody tr').filter({ hasText: 'CSV Person' });
  await row.locator('input[type="checkbox"]').check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /^.*Export$/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('selected-leads.csv');
  await expect(page.getByText(/Exported 1 selected lead/i)).toBeVisible();

  await page.getByRole('button', { name: /^.*Delete$/ }).click();
  await expect(page.getByRole('heading', { name: 'Delete Selected Leads?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('CSV Person', { exact: true })).toBeVisible();
});

test('auto-archive applies to locally created and imported Website source leads', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('disputepilot.leads', JSON.stringify([]));
    window.localStorage.setItem('disputepilot.leads.archivedIds', JSON.stringify([]));
    window.localStorage.setItem('disputepilot.leads.autoArchiveWebsite', 'true');
  });
  await page.goto(`${BASE_URL}/leads`);
  await expect(page.getByText(/Loading/i)).toHaveCount(0);

  await page.getByRole('button', { name: /Add Lead/i }).click();
  const addModal = page.getByRole('heading', { name: 'Add New Lead' }).locator('xpath=..');
  await addModal.locator('input').nth(0).fill('Archived');
  await addModal.locator('input').nth(1).fill('WebsiteCreate');
  await addModal.getByRole('button', { name: 'Add Lead' }).click();
  await expect(page.getByText(/Auto-archive applied/i)).toBeVisible();
  await expect(page.getByText('Archived WebsiteCreate', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByText('Archived WebsiteCreate', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Current' }).click();
  await page.getByRole('button', { name: /Import CSV/i }).click();
  await page.getByPlaceholder(/paste CSV/i).fill('name,email,phone,source,status\nArchived Import,archived-import@example.test,555,Website,new');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByText(/Auto-archive applied to 1 Website source lead/i)).toBeVisible();
  await expect(page.getByText('Archived Import', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByText('Archived Import', { exact: true })).toBeVisible();
});

test('bulk send email reports success and setup/auth failure accurately', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('disputepilot.leads', JSON.stringify([
      { id: 'local-email-ok', first_name: 'Email', last_name: 'Success', email: 'success@example.test', phone: '111', source: 'Website', status: 'new', created_at: '2026-05-20T10:00:00.000Z' },
    ]));
    window.localStorage.setItem('disputepilot.leads.archivedIds', JSON.stringify([]));
  });
  await page.route('**/api/send-email', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.goto(`${BASE_URL}/leads`);
  await page.locator('tbody tr').filter({ hasText: 'Email Success' }).locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /Send Email/i }).click();
  await page.getByPlaceholder(/Email subject/i).fill('Hello');
  await page.getByPlaceholder(/Write your message/i).fill('Message');
  await page.getByRole('button', { name: 'Send Email', exact: true }).click();
  await expect(page.getByText(/Email sent to 1 lead/i)).toBeVisible();

  await page.unroute('**/api/send-email');
  await page.route('**/api/send-email', async route => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Missing business auth or RESEND_API_KEY' }) });
  });
  await page.locator('tbody tr').filter({ hasText: 'Email Success' }).locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /Send Email/i }).click();
  await page.getByPlaceholder(/Email subject/i).fill('Hello again');
  await page.getByRole('button', { name: 'Send Email', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: /Email was not sent/i })).toContainText(/Email was not sent.*setup\/auth/i);
});
