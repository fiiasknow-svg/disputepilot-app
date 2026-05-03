import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const pages = [
  {
    path: '/reports',
    title: 'Reports',
    checks: [
      'Revenue (Paid Invoices)',
      'Disputes Filed',
      'New Clients / Month',
      'Disputes by Bureau',
      'Dispute Resolution Rate',
      '3 Mo',
      '6 Mo',
      '12 Mo',
    ],
    buttons: [/3 Mo/i, /6 Mo/i, /12 Mo/i],
  },
  {
    path: '/calendar',
    title: 'Calendar',
    checks: [
      'Export iCal',
      '+ Add Event',
      'Today',
      'Month',
      'Week',
      'Day',
      'Agenda',
      'All Types',
      'All Agents',
      'Event Types',
      'Upcoming (30 days)',
    ],
    buttons: [/Export iCal/i, /\+ Add Event/i, /Today/i],
  },
  {
    path: '/employees',
    title: 'Employees',
    checks: [
      '+ Add Employee',
      'Export CSV',
      'Invite by Email',
      '0 active staff members',
      'TOTAL STAFF',
      'ACTIVE',
      'INACTIVE',
      'ADMINS',
      'All Roles',
      'All Status',
      'All Departments',
      'EMPLOYEE',
      'EMAIL',
      'ROLE',
      'STATUS',
      'ACTIONS',
    ],
    buttons: [/\+ Add Employee/i, /Export CSV/i, /Invite by Email/i],
  },
  {
    path: '/bulk-print',
    title: 'Bulk Print',
    checks: [
      'Print Queue',
      'Credit Bureau Addresses',
      'Print Automation',
      'Select All',
      'Print Selected',
      'Print dispute letters in bulk by client, bureau, or round.',
      'Total in Queue',
      'Selected Letters',
      'Selected Pages',
      'Current Queue',
      'Archive',
      'All Bureaus',
      'All Rounds',
      'All Statuses',
      'STATUS',
      'CLIENT',
      'BUREAU',
      'ROUND',
      'LETTER / ITEM',
      'DATE ADDED',
      'ACTION',
    ],
    buttons: [/Select All/i, /Print Selected/i],
  },
  {
    path: '/credit-analysis',
    title: 'Credit Analysis',
    checks: [
      'Select Client',
      'Load Credit Report',
      'Select a client above to load their 3-bureau credit analysis.',
    ],
    buttons: [/Load Credit Report/i],
  },
  {
    path: '/credit-analyzer',
    title: 'Credit Analyzer',
    checks: [
      'Credit Analyzer',
    ],
    buttons: [],
  },
];

test.describe('operational pages are visible and useful', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.path} loads visible content`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);

      await expect(page.locator('body')).toBeVisible();

      const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      expect(bodyText).not.toMatch(/404/i);
      expect(bodyText).not.toMatch(/Application error/i);
      expect(bodyText).not.toMatch(/Runtime Error/i);
      expect(bodyText.length).toBeGreaterThan(300);

      await expect(page.getByRole('heading', { level: 1, name: pageInfo.title, exact: true })).toBeVisible();

      for (const check of pageInfo.checks) {
        expect(bodyText).toContain(check);
      }

      for (const buttonName of pageInfo.buttons) {
        await expect(page.getByRole('button', { name: buttonName })).toBeVisible();
      }
    });
  }
});
