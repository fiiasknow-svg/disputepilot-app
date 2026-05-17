import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test.beforeEach(async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') pageErrors.push(message.text());
  });

  await page.exposeFunction('assertNoBillingRuntimeErrors', async () => {
    expect(pageErrors.join('\n')).not.toMatch(/Application error|Runtime Error|Unhandled/i);
  });
});

async function expectNoBillingRuntimeErrors(page: any) {
  await expect(page.locator('body')).not.toContainText(/Application error|Runtime Error/);
  await page.evaluate(async () => {
    await (window as any).assertNoBillingRuntimeErrors();
  });
}

test('billing overview loads useful summary information', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing`);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Billing' })).toBeVisible();
  await expect(main.getByLabel('Billing summary')).toContainText('Open Balance');
  await expect(main.getByLabel('Billing summary')).toContainText('Paid This Month');
  await expect(main.getByLabel('Billing summary')).toContainText('Overdue Invoices');
  await expect(main.getByText('INV-1042')).toBeVisible();
  await expect(main.getByText('PAY-8831')).toBeVisible();
  await expectNoBillingRuntimeErrors(page);
});

test('create invoice opens form, cancel closes it, and save shows invoice confirmation', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/invoices`);

  await page.getByRole('button', { name: 'Add Invoice' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create Invoice' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Client/Customer')).toBeVisible();
  await expect(dialog.getByLabel('Invoice Number')).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Add Invoice' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Create Invoice' });
  await createDialog.getByLabel('Client/Customer').selectOption('Avery Brooks');
  await createDialog.getByLabel('Invoice Number').fill('INV-2001');
  await createDialog.getByLabel('Service/Product').selectOption('Pay Per Deletion');
  await createDialog.getByLabel('Amount').fill('325');
  await createDialog.getByLabel('Status').selectOption('Sent');
  await createDialog.getByLabel('Due Date').fill('2026-05-22');
  await createDialog.getByLabel('Notes').fill('Initial pay per deletion invoice.');
  await createDialog.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('status')).toContainText('Saved invoice INV-2001');
  await expect(page.getByRole('cell', { name: 'INV-2001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Avery Brooks' })).toBeVisible();
  await expectNoBillingRuntimeErrors(page);
});

test('add payment opens form and save shows payment confirmation', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/payments`);

  await page.getByRole('button', { name: 'Add Payment' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add Payment' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Payment Reference')).toBeVisible();
  await expect(dialog.getByLabel('Payment Method')).toBeVisible();

  await dialog.getByLabel('Client/Customer').selectOption('Morgan Credit');
  await dialog.getByLabel('Payment Reference').fill('PAY-9001');
  await dialog.getByLabel('Service/Product').selectOption('Credit Repair Monthly Plan');
  await dialog.getByLabel('Amount').fill('149');
  await dialog.getByLabel('Status').selectOption('Paid');
  await dialog.getByLabel('Payment Date').fill('2026-05-02');
  await dialog.getByLabel('Payment Method').selectOption('Credit Card');
  await dialog.getByLabel('Notes').fill('Card payment collected in office.');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('status')).toContainText('Saved payment PAY-9001');
  await expect(page.getByRole('cell', { name: 'PAY-9001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Morgan Credit' })).toBeVisible();
  await expectNoBillingRuntimeErrors(page);
});

test('billing search and status filters narrow visible records and can be cleared', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing`);

  const main = page.getByRole('main');
  await main.getByLabel('Search billing').fill('INV-1042');
  await expect(main.getByRole('cell', { name: 'INV-1042' })).toBeVisible();
  await expect(main.getByRole('cell', { name: 'INV-1041' })).toHaveCount(0);

  await main.getByRole('button', { name: 'Clear Filters' }).click();
  await expect(main.getByRole('cell', { name: 'INV-1041' })).toBeVisible();

  await main.getByLabel('Billing status filter').selectOption('Overdue');
  await expect(main.getByRole('cell', { name: 'INV-1041' })).toBeVisible();
  await expect(main.getByRole('cell', { name: 'INV-1042' })).toHaveCount(0);

  await main.getByRole('button', { name: 'Clear Filters' }).click();
  await expect(main.getByRole('cell', { name: 'PAY-8831' })).toBeVisible();
  await expectNoBillingRuntimeErrors(page);
});

test('credit card setup saves visible processor settings', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/credit-card-setup`);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Credit Card Setup' })).toBeVisible();
  await main.getByLabel('Payment Processor').selectOption('Square');
  await main.getByLabel('Statement Descriptor').fill('DisputePilot Services');
  await main.getByRole('button', { name: 'Save Card Setup' }).click();

  await expect(page.getByRole('status')).toContainText('Saved Square card settings for DisputePilot Services.');
  await expectNoBillingRuntimeErrors(page);
});

test('view and manage actions open useful details', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing`);
  const main = page.getByRole('main');

  await main.getByRole('button', { name: 'View' }).first().click();
  const invoiceDetails = page.getByRole('dialog', { name: 'Invoice Details' });
  await expect(invoiceDetails).toContainText('invoice Number');
  await expect(invoiceDetails).toContainText('INV-1042');
  await invoiceDetails.getByRole('button', { name: 'Close Details' }).click();
  await expect(invoiceDetails).toHaveCount(0);

  await main.getByRole('button', { name: 'Manage' }).first().click();
  await expect(page.getByRole('dialog', { name: /Details/ })).toContainText(/Payment|Service|reference|amount/i);
  await expectNoBillingRuntimeErrors(page);
});

test('payment history is visible and useful', async ({ page }) => {
  await page.goto(`${BASE_URL}/billing/payment-history`);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Payment History' }).first()).toBeVisible();
  await expect(main.getByText('Showing 3 of 3 payment records')).toBeVisible();
  await expect(main.getByText('$248.00 collected')).toBeVisible();
  await expect(main.getByText('PAY-8831')).toBeVisible();
  await expect(main.getByText('Credit Card')).toBeVisible();
  await expectNoBillingRuntimeErrors(page);
});
