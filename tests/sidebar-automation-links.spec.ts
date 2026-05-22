import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('sidebar automation links route to implemented pages', async ({ page }) => {
  await page.goto(`${BASE_URL}/automation`);

  const links = [
    ['Zapier Automation', '/automation/zapier', 'Zapier Integration'],
    ['Go-HighLevel', '/automation/go-highlevel', 'GoHighLevel Integration'],
    ['Website Lead Nurturing', '/automation/website-lead-nurturing', 'Website Lead Nurturing'],
    ['AI Credit Coach', '/automation/ai-credit-coach', 'AI Credit Coach'],
  ] as const;

  for (const [label, route, heading] of links) {
    await page.getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});
