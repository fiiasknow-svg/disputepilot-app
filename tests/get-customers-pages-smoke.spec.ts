import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

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

test('get customers cards and page actions navigate or update visible content', async ({ page }) => {
  await page.goto(`${BASE_URL}/get-customers`);

  await page.getByText('Step-by-step guidance for launching').click();
  await expect(page).toHaveURL(/\/get-customers\/start-run-grow$/);
  await expect(page.getByRole('heading', { name: 'Start, Run & Grow' })).toBeVisible();
  await page.getByRole('button', { name: /Back to Get Customers/i }).click();
  await expect(page).toHaveURL(/\/get-customers$/);

  await page.getByText('Proven marketing and outreach strategies to attract').click();
  await expect(page).toHaveURL(/\/get-customers\/business-strategies$/);
  await expect(page.getByRole('heading', { name: 'Business Strategies' })).toBeVisible();
  await page.getByRole('button', { name: /View Client Acquisition/i }).click();
  await expect(page).toHaveURL(/\/get-customers\/get-customers$/);

  await page.getByRole('button', { name: /Back to Get Customers/i }).click();
  await page.getByText('Specific client acquisition tactics').click();
  await expect(page).toHaveURL(/\/get-customers\/get-customers$/);
  await expect(page.getByRole('heading', { name: 'Get Customers' })).toBeVisible();

  await page.getByText('Social Media Organic').click();
  await expect(page.getByText('Post credit tips daily on Facebook and Instagram')).toBeVisible();
  await page.getByText('Paid Facebook / Instagram Ads').click();
  await expect(page.getByText('Create a lead generation ad')).toBeVisible();
  await page.getByText('Google Ads & SEO').click();
  await expect(page.getByText(/Target high-intent keywords/i)).toBeVisible();
  await page.getByText('Referral Network').click();
  await expect(page.getByText(/Identify 10 potential referral partners/i)).toBeVisible();

  await page.goto(`${BASE_URL}/get-customers/start-run-grow`);
  await page.getByRole('button', { name: /Next: Business Strategies/i }).click();
  await expect(page).toHaveURL(/\/get-customers\/business-strategies$/);

  await page.goto(`${BASE_URL}/get-customers`);
  await page.getByRole('button', { name: /View Partner Resources/i }).click();
  await expect(page).toHaveURL(/\/partner-resources$/);
});
