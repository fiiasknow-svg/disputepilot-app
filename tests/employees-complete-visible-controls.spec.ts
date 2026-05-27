import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

const employees = [
  {
    id: 'local-employee-1',
    name: 'Ada Lovelace',
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.com',
    phone: '555-0101',
    role: 'Admin',
    status: 'active',
    department: 'Operations',
    title: 'Director',
    notes: 'CSV "quoted" note',
    created_at: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 'local-employee-2',
    name: 'Grace Hopper',
    first_name: 'Grace',
    last_name: 'Hopper',
    email: 'grace@example.com',
    phone: '555-0102',
    role: 'Support Agent',
    status: 'inactive',
    department: 'Support',
    title: 'Support Lead',
    notes: 'Keeps local notes',
    created_at: '2026-05-02T12:00:00.000Z',
  },
];

async function seedEmployees(page: import('@playwright/test').Page) {
  await page.addInitScript((seed) => {
    window.localStorage.setItem('disputepilot.employees.local', JSON.stringify(seed));
    window.localStorage.removeItem('disputepilot.employees.pendingInvites');
    window.localStorage.removeItem('disputepilot.employees.tasks');
  }, employees);
}

test('employees tabs, permissions, local fields, invite, tasks, delete, bulk remove, and export work visibly', async ({ page }) => {
  await seedEmployees(page);
  await page.goto(`${BASE_URL}/employees`);

  await expect(page.getByRole('tab', { name: 'Employees Information' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Roles & Permissions' }).click();
  await expect(page.getByRole('tab', { name: 'Roles & Permissions' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Role permissions are read-only presets.')).toBeVisible();
  await page.getByRole('tab', { name: 'Employees Information' }).click();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();

  await page.getByRole('button', { name: /Permissions Ada Lovelace/ }).click();
  await expect(page.getByRole('heading', { name: /Permissions/ })).toBeVisible();
  await page.getByRole('button', { name: /Edit Role/ }).click();
  await expect(page.getByRole('heading', { name: 'Edit Employee' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: /Add New Employee/i }).click();
  const modal = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Add Employee' }) }).last();
  await modal.locator('input').nth(0).fill('Local');
  await modal.locator('input').nth(1).fill('Fields');
  await modal.locator('input').nth(2).fill('local.fields@example.com');
  await modal.locator('input').nth(3).fill('555-0199');
  await modal.locator('select').nth(0).selectOption('Manager');
  await modal.locator('select').nth(1).selectOption('inactive');
  await modal.locator('select').nth(2).selectOption('Billing');
  await modal.locator('input').nth(4).fill('Billing Manager');
  await modal.locator('textarea').fill('Visible local notes');
  await page.getByRole('button', { name: /^Add Employee$/ }).click();
  await expect(page.getByText('Local Fields')).toBeVisible();
  await expect(page.getByText('555-0199')).toBeVisible();
  await expect(page.getByText('Billing / Manager')).toBeVisible();
  await expect(page.getByText('Notes: Visible local notes')).toBeVisible();

  await page.getByRole('button', { name: 'Invite by Email' }).click();
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.locator('input[type="email"]').fill('invite@example.com');
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await expect(page.getByText('Pending Local Invites')).toBeVisible();
  await expect(page.getByText('invite@example.com - Dispute')).toBeVisible();

  await page.getByRole('button', { name: /0 Manage/ }).first().click();
  await expect(page.getByRole('heading', { name: /Reminders\/Tasks/ })).toBeVisible();
  await page.getByPlaceholder('Follow up with employee').fill('Review role access');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByText('Review role access')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: /1 Manage/ })).toBeVisible();

  await page.getByRole('button', { name: /Delete Grace Hopper/ }).click();
  await expect(page.getByRole('heading', { name: 'Remove Employee?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Grace Hopper')).toBeVisible();

  await page.getByRole('button', { name: /Delete Grace Hopper/ }).click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Grace Hopper')).toHaveCount(0);

  await page.locator('tbody tr').filter({ hasText: 'Ada Lovelace' }).locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByRole('heading', { name: 'Remove Selected Employees?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export/ }).first().click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('"Ada","Lovelace","ada@example.com","555-0101","Admin","Operations","Director","CSV ""quoted"" note"');
  expect(csv).not.toContain('local.fields@example.com');
});

test('sidebar routes Employees and Team Messages to implemented pages', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`);
  await page.getByRole('link', { name: 'Employees' }).click();
  await expect(page).toHaveURL(/\/employees$/);
  await expect(page.getByRole('heading', { name: 'Employees/Outsourcers' })).toBeVisible();

  await page.getByRole('link', { name: 'Team Messages' }).click();
  await expect(page).toHaveURL(/\/company\/team-messages$/);
  await expect(page.getByRole('heading', { name: 'Team Messages' })).toBeVisible();
});
