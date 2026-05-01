import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const routes = [
  '/company/manage-portal-content',
  '/company/credit-monitoring',
  '/company/self-service-signup',
  '/company/client-auto-signup',
  '/company/images-documents',
  '/company/manage-emails',
  '/disputes/status',
  '/company/notify-automation',
  '/company/team-messages',
  '/letters',
  '/letters/ai-rewriter',
  '/billing/invoices',
  '/billing/credit-card-setup',
  '/billing/services-products',
  '/billing/payments',
  '/billing/payment-history',
  '/billing/pay-per-deletion',
  '/leads/website-lead-form',
  '/affiliates',
  '/affiliates/website-form',
  '/academy/credit-repair',
  '/academy/fdcpa',
  '/academy/fcra',
  '/academy/fcba',
  '/academy/compliance',
  '/academy/rebuild',
  '/academy/fico',
  '/academy/automation',
  '/academy/funding',
  '/partner-resources/merchant-accounts',
  '/partner-resources/monitoring-commissions',
  '/partner-resources/dispute-outsourcing',
  '/partner-resources/rebuild-credit-affiliate',
  '/partner-resources/partner-and-earn',
  '/partner-resources/save-and-annual-plan',
  '/partner-resources/offer-free-vacations',
  '/partner-resources/offer-business-funding',
  '/partner-resources/credit-repair-class',
  '/partner-resources/community',
];

for (const route of routes) {
  test(`remaining sidebar route works: ${route}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${route}`);

    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
    await expect(page.locator('body')).toContainText(/\S/);
  });
}
