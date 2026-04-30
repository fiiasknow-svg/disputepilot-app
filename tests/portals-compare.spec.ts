import { test, expect } from '@playwright/test';
import fs from 'fs';

const CLONE_PORTALS = 'https://disputepilot-app.vercel.app/company/portals';

const expectedPortalItems = [
  'Portals',
  'Mobile App',
  'Client Portal',
  'Portal URL',
  'Logo',
  'Branding',
  'Enable',
  'Save',
];

test('compare portals expected items', async ({ page }) => {
  await page.goto(CLONE_PORTALS);
  await expect(page.locator('body')).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const missing = expectedPortalItems.filter(item => !bodyText.includes(item));

  fs.writeFileSync('missing-portals-from-clone.json', JSON.stringify(missing, null, 2));
  console.log(missing);

  expect(missing).toEqual([]);
});