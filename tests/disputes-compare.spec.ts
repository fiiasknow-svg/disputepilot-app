import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';

const ORIGINAL_DISPUTES = 'https://www.clientdisputemanager.com/User/DisputeCenter';
const CLONE_DISPUTES = 'https://disputepilot-app.vercel.app/disputes';

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
    'missing-disputes-from-clone.json',
    JSON.stringify(missingFromClone, null, 2)
  );

  console.log('Missing dispute items saved to missing-disputes-from-clone.json');
  console.log(missingFromClone);

  await browser.close();

  expect(missingFromClone).toEqual([]);
});