import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const pages = [
  {
    path: '/leads',
    title: 'Leads',
    checks: [
      'Leads',
      'Import CSV',
      'Export CSV',
      'Add Lead',
      '0 leads in pipeline',
      'All Sources',
      'Pipeline',
      'NAME',
      'CONTACT',
      'Status',
      'SOURCE',
      'ACTIONS',
    ],
    buttons: [/Add Lead/i, /Import CSV/i, /Export CSV/i],
  },
  {
    path: '/leads/affiliates',
    title: 'Affiliates',
    checks: [
      'Affiliates',
      '+ Add New',
      'Manage Affiliate',
      'Documents & Commissions',
      'Active',
      'Lead',
      'Inactive',
      'Pending Messages',
      'Pending Referrals',
      'COMPANY NAME',
      'OFFICE PHONE',
      'CELL PHONE',
      'COMMISSION',
      'ACTION',
    ],
    buttons: [/Add New/i, /Manage Affiliate/i, /Documents & Commissions/i],
  },
  {
    path: '/leads/affiliate-website-form',
    title: 'Affiliate Website Form',
    checks: [
      'Affiliate Website Form',
      'Preview',
      'Publish',
      'Save',
      'Select Form Style',
      'Required Fields',
      'Form Preview',
    ],
    buttons: [/Preview/i, /Publish/i, /Save/i],
  },
  {
    path: '/leads/website-lead-form',
    title: 'Website Lead Form',
    checks: [
      'Website Lead Form',
      'Preview',
      'Publish',
      'Save',
      'Select Form Style',
      'Required Fields',
      'Form Preview',
    ],
    buttons: [/Preview/i, /Publish/i, /Save/i],
  },
  {
    path: '/affiliates',
    title: 'Affiliates',
    checks: [
      'Affiliates',
      'Manage your affiliate partners and referral programs.',
    ],
    buttons: [],
  },
  {
    path: '/affiliates/website-form',
    title: 'Affiliate Website Form',
    checks: [
      'Affiliate Website Form',
      'Embed signup forms on affiliate websites.',
    ],
    buttons: [],
  },
];

test.describe('leads and affiliates pages are visible and useful', () => {
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
