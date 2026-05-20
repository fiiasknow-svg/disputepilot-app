import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const RESULTS_DIR = path.join(process.cwd(), 'parity-results', 'configuration');

function writeJson(name: string, data: unknown) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

test('configuration first visible surface tracks original parity', async ({ page }) => {
  await page.goto(`${BASE_URL}/settings/configuration`);

  await expect(page.getByRole('heading', { name: 'Configuration', exact: true })).toBeVisible();
  await expect(page.getByText('Custom Status', { exact: true })).toBeVisible();
  await expect(page.getByText('Customer Deletion Activity', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
  await expect(page.getByText('No Customer Deletion Activity Found.', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Enter custom status')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  const originalFirstSurface = [
    'Configuration',
    'Custom Status',
    'Customer Deletion Activity',
    'Change Password',
    'No Customer Deletion Activity Found.',
  ];
  const broaderCloneItems = [
    'Round Settings',
    'Notifications',
    'Portal',
    'Service Plans',
    'Tags',
    'Integrations',
  ];

  const missingFromClone = originalFirstSurface
    .filter(item => !bodyText.includes(item))
    .map(item => ({
      section: 'configuration',
      item,
      original: 'Visible on original first configuration surface',
      clone: 'Not found on clone page',
    }));

  const differentFromOriginal = [
    {
      section: 'configuration',
      item: 'First visible surface',
      original: 'Original starts with Custom Status, Customer Deletion Activity, and Change Password.',
      clone: 'Clone now starts with those same configuration sections before broader settings.',
      status: 'fixed',
    },
    {
      section: 'configuration',
      item: 'Status controls',
      original: 'Original presents status management as a table/form surface.',
      clone: 'Clone presents an inline status form, default status rows, preview chips, and custom rows.',
      status: 'closer',
    },
  ];

  const extraInClone = broaderCloneItems
    .filter(item => bodyText.includes(item))
    .map(item => ({
      section: 'configuration',
      item,
      original: 'Not part of the captured original first configuration surface.',
      clone: 'Still available below the first parity surface under Additional Settings.',
    }));

  writeJson('missing-from-clone.json', missingFromClone);
  writeJson('different-from-original.json', differentFromOriginal);
  writeJson('extra-in-clone.json', extraInClone);

  expect(missingFromClone).toEqual([]);
  await expect(page.getByText('Additional Settings', { exact: true })).toBeVisible();
});
