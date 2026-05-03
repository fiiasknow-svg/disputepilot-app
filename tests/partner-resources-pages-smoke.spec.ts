import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const partnerPages = [
  { path: '/partner-resources', expected: ['Partner Resources'] },
  { path: '/partner-resources/merchant-accounts', expected: ['Merchant Accounts'] },
  { path: '/partner-resources/monitoring-commissions', expected: ['Monitoring Commissions'] },
  { path: '/partner-resources/dispute-outsourcing', expected: ['Dispute Outsourcing'] },
  { path: '/partner-resources/rebuild-credit-affiliate', expected: ['Rebuild Credit Affiliate'] },
  { path: '/partner-resources/partner-and-earn', expected: ['Partner & Earn'] },
  { path: '/partner-resources/save-and-annual-plan', expected: ['Save & Annual Plan'] },
  { path: '/partner-resources/offer-free-vacations', expected: ['Offer Free Vacations'] },
  { path: '/partner-resources/offer-business-funding', expected: ['Offer Business Funding'] },
  { path: '/partner-resources/credit-repair-class', expected: ['Credit Repair Class'] },
  { path: '/partner-resources/community', expected: ['Community'] },
];

test.describe('partner resources pages are visible and useful', () => {
  for (const pageInfo of partnerPages) {
    test(`${pageInfo.path} loads partner resource content`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await expect(page.locator('body')).toBeVisible();

      const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

      for (const item of pageInfo.expected) {
        expect(bodyText).toContain(item);
      }

      await expect(page.locator('body')).not.toContainText(/404|Application error|Runtime Error/i);
      expect(bodyText.length).toBeGreaterThan(500);
    });
  }
});