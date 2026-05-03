import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const pages = [
  {
    path: '/get-customers',
    title: 'Get Customers',
    checks: [
      'Resources, strategies, and tools to grow your credit repair client base.',
      'Quick Wins for Getting More Credit Repair Clients',
      'Add extra revenue streams to your practice',
      'View Partner Resources',
    ],
    button: /View Partner Resources/i,
  },
  {
    path: '/get-customers/business-strategies',
    title: 'Business Strategies',
    checks: [
      'Proven marketing and outreach strategies for credit repair professionals',
      'Social Media Marketing',
      'Referral Partnerships',
      'Content Marketing & SEO',
      'Networking & Community',
      'Paid Advertising',
      'Email Marketing & Nurture Sequences',
    ],
    button: /View Client Acquisition/i,
  },
  {
    path: '/get-customers/get-customers',
    title: 'Get Customers',
    checks: [
      'Your client acquisition playbook',
      'Top Lead Sources for Credit Repair',
      'Client Conversion Funnel',
      'Word-for-Word Sales Scripts',
    ],
    button: /Back to Get Customers/i,
  },
  {
    path: '/get-customers/start-run-grow',
    title: 'Start, Run & Grow',
    checks: [
      'Your complete step-by-step guide to launching and scaling a successful credit repair business.',
      'Choose Your Business Structure',
      'Understand the Laws (CROA & State Laws)',
      'Set Up Your CRM (DisputePilot)',
      "You're ready to start!",
    ],
    button: /Next: Business Strategies/i,
  },
];

test.describe('get customers pages are visible and useful', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.path} loads visible content`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);

      await expect(page.locator('body')).toBeVisible();

      const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      expect(bodyText).not.toMatch(/404/i);
      expect(bodyText).not.toMatch(/Application error/i);
      expect(bodyText).not.toMatch(/Runtime Error/i);
      expect(bodyText.length).toBeGreaterThan(500);

      await expect(page.getByRole('heading', { level: 1, name: pageInfo.title, exact: true })).toBeVisible();

      for (const check of pageInfo.checks) {
        expect(bodyText).toContain(check);
      }

      await expect(page.getByRole('button', { name: pageInfo.button })).toBeVisible();
    });
  }
});
