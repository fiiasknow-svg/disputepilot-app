import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    window.localStorage.removeItem('disputepilot.billing.subscription');
    window.localStorage.removeItem('disputepilot.billing.cardSetup');
    window.localStorage.removeItem('disputepilot.billing');
  });
});

test('billing subscription navigation and actions show membership state', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing`);
  await page.getByRole('link', { name: 'Subscription' }).click();

  await expect(page).toHaveURL(/\/billing\/subscription$/);
  await expect(page.getByRole('heading', { name: 'Subscription' })).toBeVisible();
  await expect(page.getByText('Current Plan')).toBeVisible();
  await expect(page.getByText('Trial Days')).toBeVisible();
  await expect(page.getByText('Billing Status')).toBeVisible();

  await page.getByRole('button', { name: 'Upgrade/Manage Plan' }).click();
  await expect(page.getByRole('status')).toContainText('Upgrade selected');
  await page.getByRole('button', { name: 'Cancel Plan' }).click();
  await expect(page.getByRole('status')).toContainText('Cancellation scheduled locally');
  await page.getByRole('button', { name: 'Keep Plan' }).click();
  await expect(page.getByRole('status')).toContainText('Plan kept active');
});

test('payment history tabs, filters, entries selector, and reset work', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/payment-history`);

  await page.getByRole('button', { name: 'Interval Billing History' }).click();
  await expect(page.getByRole('button', { name: 'Interval Billing History' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Interval Billing History' })).toBeVisible();

  await page.getByRole('button', { name: 'Payment History' }).click();
  await page.getByLabel('Select a Client').selectOption('Taylor Johnson');
  await page.getByLabel('Payment Type').selectOption('Credit Card');
  await page.getByLabel('From Date').fill('2026-04-01');
  await page.getByLabel('To Date').fill('2026-04-30');
  await page.getByLabel('Show entries').selectOption('20');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('cell', { name: 'PAY-8831' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'PAY-8830' })).toHaveCount(0);
  await expect(page.getByText('Showing 1 of 3 payment records')).toBeVisible();

  await page.getByRole('button', { name: 'Archived' }).click();
  await expect(page.getByRole('heading', { name: 'Archived Payment History' })).toBeVisible();
  await expect(page.getByText('No billing records match the current filters.')).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Select a Client')).toHaveValue('ALL');
  await expect(page.getByLabel('Payment Type')).toHaveValue('ALL');
  await expect(page.getByLabel('From Date')).toHaveValue('');
  await expect(page.getByLabel('Show entries')).toHaveValue('10');
});

test('services and products panel filters records and opens add modal', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/services-products`);

  await page.getByRole('button', { name: 'Products' }).click();
  await expect(page.getByRole('button', { name: 'Products' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('cell', { name: 'Credit Report Audit' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Pay Per Deletion' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Services', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Pay Per Deletion' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Credit Report Audit' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Add New Services' }).click();
  await expect(page.getByRole('dialog', { name: 'Add Service/Product' })).toBeVisible();
});

test('credit card setup processor CRUD, save persistence, and reset work', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/credit-card-setup`);

  await page.getByRole('button', { name: 'Add New Payment Processor' }).click();
  const addDialog = page.getByRole('dialog', { name: 'Add Payment Processor' });
  await addDialog.getByLabel('Payment Processor Name').fill('Local Processor');
  await addDialog.getByLabel('API Key').fill('pk_test_visible');
  await addDialog.getByLabel('Transaction Key').fill('txn_visible');
  await addDialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('cell', { name: 'Local Processor' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit Payment Processor' });
  await editDialog.getByLabel('Payment Processor Name').fill('Edited Processor');
  await editDialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('cell', { name: 'Edited Processor' })).toBeVisible();

  await page.getByLabel('Payment Processor').selectOption('Square');
  await page.getByLabel('Statement Descriptor').fill('Visible Billing');
  await page.getByLabel('Public Key').fill('pk_saved');
  await page.getByLabel('Enable card processing').uncheck();
  await page.getByRole('button', { name: 'Save Card Setup' }).click();
  await expect(page.getByRole('status')).toContainText('Saved Square card settings for Visible Billing.');
  await page.reload();
  await expect(page.getByLabel('Payment Processor')).toHaveValue('Square');
  await expect(page.getByLabel('Statement Descriptor')).toHaveValue('Visible Billing');
  await expect(page.getByLabel('Enable card processing')).not.toBeChecked();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Payment Processor')).toHaveValue('Stripe');
  await expect(page.getByLabel('Statement Descriptor')).toHaveValue('DisputePilot Billing');
  await expect(page.getByLabel('Enable card processing')).toBeChecked();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No Payment Processor')).toBeVisible();
});

test('pay per deletion fees, tabs, filters, archive, row actions, and previews work', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/pay-per-deletion`);

  await page.getByRole('button', { name: '+ Pay Per Deletion Fees' }).click();
  const fees = page.getByRole('dialog', { name: 'Pay Per Deletion Fees' });
  await fees.getByLabel('Fee amount').fill('175');
  await fees.getByRole('button', { name: 'Save Fees' }).click();
  await expect(page.getByRole('status')).toContainText('Updated pay per deletion fee schedule.');

  await page.getByRole('button', { name: 'View Credentials' }).click();
  await expect(page.getByRole('dialog', { name: 'Pay Per Deletion Credentials' })).toContainText('No live credentials');
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByLabel('Select Client').selectOption('local-leslie');
  await page.getByRole('button', { name: 'Build Estimate' }).click();
  await expect(page.getByRole('status')).toContainText('Generated estimate for Leslie Sabek');
  await expect(page.getByText('Fees $175.00')).toBeVisible();

  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Sent locally')).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).click();
  await expect(await download).toBeTruthy();

  await page.getByRole('button', { name: 'Contract' }).click();
  await expect(page.getByRole('dialog', { name: 'Estimate Contract' })).toContainText('Contract draft opened for Leslie Sabek');
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByLabel('From').fill('2027-01-01');
  await expect(page.getByText('No estimates match this view')).toBeVisible();
  await page.getByLabel('From').fill('');
  await expect(page.getByRole('cell', { name: 'Leslie', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Archive' }).nth(1).click();
  await expect(page.getByRole('button', { name: 'Archive' }).first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('cell', { name: 'Archived' })).toBeVisible();

  await page.getByRole('button', { name: 'Quick Import' }).click();
  await expect(page.getByRole('heading', { name: 'Quick Import' })).toBeVisible();

  for (const name of ['Cover and Welcome', 'Good Faith Estimate', 'Final Preview']) {
    await page.getByRole('button', { name: 'Preview' }).nth(['Cover and Welcome', 'Good Faith Estimate', 'Final Preview'].indexOf(name)).click();
    await expect(page.getByRole('dialog', { name: `${name} Preview` })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  }
});
