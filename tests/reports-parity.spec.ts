import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const RESULTS_DIR = path.join(process.cwd(), 'parity-results', 'reports');

function writeJson(name: string, data: unknown) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

test('reports route is discoverable and exposes visible report dashboard surface', async ({ page }) => {
  await page.goto(`${BASE_URL}/reports`);

  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Reports', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reports', exact: true })).toBeVisible();

  const expectedSurface = [
    'Reports',
    'Clients',
    'Disputes',
    'Resolved',
    'Revenue',
    'Leads',
    'Revenue (Paid Invoices)',
    'Disputes Filed',
    'New Clients / Month',
    'Disputes by Bureau',
    'Dispute Resolution Rate',
  ];

  const visibleControls = ['3 Mo', '6 Mo', '12 Mo'];

  for (const control of visibleControls) {
    await expect(page.getByRole('button', { name: control, exact: true })).toBeVisible();
  }

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(bodyText).not.toMatch(/404/i);
  expect(bodyText).not.toMatch(/Application error/i);
  expect(bodyText).not.toMatch(/Runtime Error/i);

  const missingFromClone = expectedSurface
    .filter(item => !bodyText.includes(item))
    .map(item => ({
      route: '/reports',
      item,
      original: 'Reports-related surface expected from current clone context and captured navigation.',
      clone: 'Not found on visible /reports surface.',
    }));

  const differentFromOriginal = [
    {
      route: '/reports',
      item: 'Original route target',
      original: 'Captured audit could not reach a dedicated original Reports page; /Reports redirected to /Home/Index?aspxerrorpath=/Reports.',
      clone: 'Clone exposes a dedicated /reports dashboard route.',
      status: 'known-gap',
    },
    {
      route: '/reports',
      item: 'First visible reports surface',
      original: 'Original reports-specific page content remains unknown from the final audit.',
      clone: 'Visible dashboard includes client, dispute, resolved, revenue, lead, paid invoice, bureau, and resolution-rate reporting.',
      status: 'safe-smoke-surface',
    },
  ];

  const extraInClone = [
    'Clients',
    'Disputes',
    'Resolved',
    'Revenue',
    'Leads',
    'Revenue (Paid Invoices)',
    'Disputes Filed',
    'New Clients / Month',
    'Disputes by Bureau',
    'Dispute Resolution Rate',
  ]
    .filter(item => bodyText.includes(item))
    .map(item => ({
      route: '/reports',
      item,
      original: 'Not confirmed on a dedicated original Reports route because that route was blocked/unknown.',
      clone: 'Visible on clone /reports.',
    }));

  writeJson('missing-from-clone.json', missingFromClone);
  writeJson('different-from-original.json', differentFromOriginal);
  writeJson('extra-in-clone.json', extraInClone);

  expect(missingFromClone).toEqual([]);
});
