import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';

const ORIGINAL = 'https://www.clientdisputemanager.com';
const CLONE = process.env.BASE_URL || 'http://127.0.0.1:3201';

function cleanText(item: string) {
  return item
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(Get Support)(Submit a support ticket)$/i, '$1 $2')
    .replace(/^(Help Center)(Browse all help articles)$/i, '$1 $2')
    .replace(/^(FAQ)(Quick answers to common questions)$/i, '$1 $2')
    .replace(/^(Success Path)(Step-by-step system walkthrough)$/i, '$1 $2')
    .replace(/^(1-on-1 Coaching)(Schedule a session)$/i, '$1 $2')
    .replace(/^(AI Credit Coach)(Get instant guidance)$/i, '$1 $2')
    .replace(/^\d+\s+Days Left in The Trial$/i, 'Days Left in The Trial');
}

test('compare original dashboard to clone dashboard', async () => {
  const browser = await chromium.launch();

  const originalContext = await browser.newContext({
    storageState: 'auth-original.json',
  });

  const cloneContext = await browser.newContext();

  const original = await originalContext.newPage();
  const clone = await cloneContext.newPage();

  await original.goto(`${ORIGINAL}/dashboard`);
  await clone.goto(`${CLONE}/dashboard`);

  await expect(original.locator('body')).toBeVisible();
  await expect(clone.locator('body')).toBeVisible();

  const originalItems = await original
    .locator('h1, h2, h3, button, a, label')
    .allTextContents();

  const cloneItems = await clone
    .locator('h1, h2, h3, button, a, label')
    .allTextContents();

  const cleanOriginal = [...new Set(
    originalItems
      .map(cleanText)
      .filter(Boolean)
      .filter(item => !item.includes('Get $247 in Free Gifts'))
      .filter(item => !item.includes('Your 2 Free Gifts expire'))
  )];

  const cleanClone = [...new Set(
    cloneItems
      .map(cleanText)
      .filter(Boolean)
  )];

  const missingFromClone = cleanOriginal.filter(item => !cleanClone.includes(item));

  fs.writeFileSync(
    'missing-from-clone.json',
    JSON.stringify(missingFromClone, null, 2)
  );

  console.log('Missing items saved to missing-from-clone.json');
  console.log(missingFromClone);

  await browser.close();

  expect(missingFromClone).toEqual([]);
});
