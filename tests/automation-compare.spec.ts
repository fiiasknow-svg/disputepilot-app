import { test, expect } from '@playwright/test';

import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

const CLONE_AUTOMATION = `${BASE_URL}/automation`;

const expectedAutomationItems = [
  'Automation',
  'Zapier',
  'Go-HighLevel',
  'GHL',
  'Workflow',
  'Trigger',
  'Action',
  'Enable',
  'Save',
];

test('compare automation expected items', async ({ page }) => {
  await page.goto(CLONE_AUTOMATION);
  await expect(page.locator('body')).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const missing = expectedAutomationItems.filter(item => !bodyText.includes(item));

  fs.writeFileSync('missing-automation-from-clone.json', JSON.stringify(missing, null, 2));
  console.log(missing);

  expect(missing).toEqual([]);
});
