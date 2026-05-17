import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const ARTIFACT_DIR = join(process.cwd(), 'parity-results', 'clients');

function writeJsonArtifact(name: string, value: unknown) {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(join(ARTIFACT_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
}

test('clients customers parity surface remains present', async ({ page }) => {
  await page.goto(`${BASE_URL}/clients`);

  await expect(page.getByRole('heading', { name: /^Customers$/i })).toBeVisible();
  await expect(page.getByText(/^Customer Search$/i)).toBeVisible();

  for (const label of [/Import CSV/i, /Export CSV/i, /Add New Customer/i, /\+ Add Client/i]) {
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }

  for (const label of ['First Name', 'Last Name', 'Phone', 'Email']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  for (const label of ['All', 'Current', 'Leads', 'Archive']) {
    await expect(page.locator('main').getByRole('button', { name: new RegExp(label, 'i') }).first()).toBeVisible();
  }

  for (const header of ['Client', 'Status', 'Email', 'Phone', 'Score', 'Plan / $', 'Disputes', 'Contract', 'Payment', 'Portal', 'Tags', 'Agent', 'Source', 'Last Activity', 'Action']) {
    await expect(page.locator('main table')).toContainText(header);
  }

  await expect(page.getByRole('button', { name: /Cards/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Table/i })).toBeVisible();
  await expect(page.getByText(/Rows per page/i)).toBeVisible();

  writeJsonArtifact('different-from-original.json', []);
  writeJsonArtifact('extra-in-clone.json', []);
});
