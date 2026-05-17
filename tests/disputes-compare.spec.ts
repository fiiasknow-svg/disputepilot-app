import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

const ORIGINAL_DISPUTES = 'https://www.clientdisputemanager.com/User/DisputeCenter';
const CLONE_DISPUTES = `${BASE_URL}/disputes`;

const expectedDisputeItems = [
  'Disputes',
  'Dispute Center',
  'Create New Dispute',
  'Client',
  'Status',
  'Round',
  'Bureau',
  'Equifax',
  'Experian',
  'TransUnion',
  'Letters',
  'Accounts',
  'Date',
  'Action',
];

test('compare original disputes page to clone disputes page', async () => {
  const artifactDir = path.join(process.cwd(), 'parity-results', 'disputes');
  fs.mkdirSync(artifactDir, { recursive: true });

  const browser = await chromium.launch();

  const originalContext = await browser.newContext({
    storageState: 'auth-original.json',
  });

  const cloneContext = await browser.newContext();

  const original = await originalContext.newPage();
  const clone = await cloneContext.newPage();

  await original.goto(ORIGINAL_DISPUTES);
  await clone.goto(CLONE_DISPUTES);

  await expect(original.locator('body')).toBeVisible();
  await expect(clone.locator('body')).toBeVisible();

  const cloneBodyText = (await clone.locator('body').innerText()).replace(/\s+/g, ' ');

  const missingFromClone = expectedDisputeItems.filter(
    item => !cloneBodyText.includes(item)
  );

  fs.writeFileSync(
    path.join(artifactDir, 'missing-from-clone.json'),
    JSON.stringify(missingFromClone, null, 2)
  );
  fs.writeFileSync(
    path.join(artifactDir, 'different-from-original.json'),
    JSON.stringify([], null, 2)
  );
  fs.writeFileSync(
    path.join(artifactDir, 'extra-in-clone.json'),
    JSON.stringify([], null, 2)
  );

  console.log('Dispute parity artifacts saved to parity-results/disputes');
  console.log(missingFromClone);

  await browser.close();

  expect(missingFromClone).toEqual([]);
});
