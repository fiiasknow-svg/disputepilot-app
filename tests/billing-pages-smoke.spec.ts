import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  buttonChecks?: RegExp[];
};

const routes: RouteSpec[] = [
  {
    route: '/billing',
    title: 'Billing',
    bodyChecks: [
      'Track invoices, payments, services, balances, and client billing activity.',
      'Overview',
      'Invoices',
      'Payments',
      'Services/Products',
      'Payment History',
      'OPEN BALANCE',
      'PAID THIS MONTH',
      'OVERDUE INVOICES',
      'ACTIVE SERVICES',
      'Add Invoice',
      'Add Payment',
      'Add Service/Product',
      'Invoices',
      'Payments',
      'Services / Products',
    ],
    buttonChecks: [/Add Invoice/i, /Add Payment/i, /Add Service\/Product/i],
  },
  {
    route: '/billing/invoices',
    title: 'Invoicing',
    bodyChecks: [
      'Track invoices, payments, services, balances, and client billing activity.',
      'Invoices',
      'Client',
      'Invoice Number',
      'Service/Product',
      'Amount',
      'Status',
      'Due Date',
      'Notes',
      'Action',
      'View',
      'Add Invoice',
      'Sent',
      'Paid',
      'Overdue',
    ],
    buttonChecks: [/Add Invoice/i],
  },
  {
    route: '/billing/credit-card-setup',
    title: 'Credit Card Setup',
    bodyChecks: [
      'Configure credit card processing for client billing.',
    ],
  },
  {
    route: '/billing/services-products',
    title: 'Services / Products',
    bodyChecks: [
      'Track invoices, payments, services, balances, and client billing activity.',
      'Services / Products',
      'Service/Product',
      'Type',
      'Amount',
      'Status',
      'Notes',
      'Action',
      'Manage',
      'Add Service/Product',
      'Credit Repair Monthly Plan',
      'Credit Report Audit',
      'Pay Per Deletion',
      'Active',
    ],
    buttonChecks: [/Add Service\/Product/i],
  },
  {
    route: '/billing/payments',
    title: 'Payments',
    bodyChecks: [
      'Track invoices, payments, services, balances, and client billing activity.',
      'Payments',
      'Client',
      'Payment Reference',
      'Service/Product',
      'Amount',
      'Status',
      'Payment Date',
      'Method',
      'Action',
      'Manage',
      'Add Payment',
      'Paid',
      'Pending',
    ],
    buttonChecks: [/Add Payment/i],
  },
  {
    route: '/billing/payment-history',
    title: 'Payment History',
    bodyChecks: [
      'Track invoices, payments, services, balances, and client billing activity.',
      'Payment History',
      'Showing',
      'payment records',
      'collected from paid payments.',
      'Client',
      'Payment Reference',
      'Service/Product',
      'Amount',
      'Status',
      'Payment Date',
      'Method',
      'Action',
      'Manage',
      'Paid',
      'Pending',
    ],
  },
  {
    route: '/billing/pay-per-deletion',
    title: 'Pay Per Deletion',
    bodyChecks: [
      'Pay Per Deletion',
      'Include Sections',
      'Credit Analysis',
      'Personal Information',
      'Return Item',
      'Select Client',
      'Report Type',
      'Standard Report',
      '3-Bureau Report',
      'Single Bureau',
      'HTML Credit Report',
      'Browse HTML File',
      'Build Estimate',
      'FIRST NAME',
      'LAST NAME',
      'EMAIL',
      'DATE',
      'ESTIMATION PREVIEW',
      'REPORT TYPE',
      'SEND EMAIL',
      'DOWNLOADS',
      'SEND A CONTRACT',
      'ACTION',
      'Select a client and click Build Estimate to generate a preview.',
      'Cover and Welcome',
      'Good Faith Estimate',
      'Final Preview',
      'Preview',
    ],
    buttonChecks: [/Build Estimate/i],
  },
];

for (const pageInfo of routes) {
  test(pageInfo.route, async ({ page }) => {
    await page.goto(new URL(pageInfo.route, BASE_URL).toString());

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const bodyText = (await body.innerText()).replace(/\s+/g, ' ').trim();
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('Runtime Error');
    expect(bodyText.length).toBeGreaterThan(300);

    await expect(page.getByRole('heading', { level: 1, name: pageInfo.title, exact: true })).toBeVisible();

    for (const expected of pageInfo.bodyChecks) {
      expect(bodyText).toContain(expected);
    }

    for (const pattern of pageInfo.buttonChecks ?? []) {
      await expect(page.getByRole('button', { name: pattern })).toBeVisible();
    }
  });
}
