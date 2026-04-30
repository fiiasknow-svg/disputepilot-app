import { test, expect } from '@playwright/test';
import fs from 'fs';

const CLONE_DOCUMENTS = 'https://disputepilot-app.vercel.app/company/digital-contracts';

const expectedDocumentItems = [
  'Digital Contracts',
  'Documents',
  'Contracts',
  'Templates',
  'Upload',
  'Send',
  'Sign',
  'Status',
  'Action',
];

test('compare documents contracts expected items', async ({ page }) => {
  await page.goto(CLONE_DOCUMENTS);
  await expect(page.locator('body')).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const missing = expectedDocumentItems.filter(item => !bodyText.includes(item));

  fs.writeFileSync('missing-documents-from-clone.json', JSON.stringify(missing, null, 2));
  console.log(missing);

  expect(missing).toEqual([]);
});