import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('AI Metro 2 letters workflow generates, copies, saves, and can navigate', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE_URL });
  await page.goto(`${BASE_URL}/disputes/ai-metro-2-letters`);

  await page.getByLabel('Letter Type / Template').selectOption('Metro 2 Compliance Dispute');
  await page.getByLabel('Client Name').fill('Avery Brooks');
  await page.getByLabel('Account / Furnisher').fill('First National Bank');
  await page.getByLabel('Bureau / Recipient').selectOption('Experian');
  await page.getByLabel('Dispute Reason').fill('Duplicate account reporting');
  await page.getByLabel('Facts / Evidence').fill('The same tradeline appears twice with different balances.');

  await page.getByRole('button', { name: 'Generate Draft' }).click();
  await expect(page.getByRole('status')).toContainText('Draft generated.');
  const preview = page.getByLabel('Generated draft preview');
  await expect(preview).toContainText('Avery Brooks');
  await expect(preview).toContainText('First National Bank');
  await expect(preview).toContainText('Metro 2 fields');

  await page.getByRole('button', { name: 'Copy Draft' }).click();
  await expect(page.getByRole('status')).toContainText('Draft copied to clipboard.');

  await page.getByRole('button', { name: 'Save/Queue Locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally: Metro 2 Compliance Dispute for Avery Brooks.');

  await page.getByRole('button', { name: 'Open AI Rewriter' }).click();
  await expect(page).toHaveURL(/\/letters\/ai-rewriter$/);
});
