import { expect, test, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  buttonChecks?: RegExp[];
  afterVisit?: (page: Page) => Promise<void>;
};

const routes: RouteSpec[] = [
  {
    route: '/letters',
    title: 'Letters',
    bodyChecks: [
      'Manage saved and generated dispute letters before review, print, or send.',
      'Total Letters',
      'Ready for Review',
      'Bureaus',
      'Clients',
      'Use Letter Vault',
      'AI Rewriter',
      'Create Letter',
      'Experian Round 1 Collection Dispute',
      'TransUnion MOV Request',
      'Initial dispute',
      'Collection Dispute',
      'Method of Verification',
      'Edit',
    ],
    buttonChecks: [/Create Letter/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /Create Letter/i }).click();
      await expect(page.getByRole('heading', { name: 'Create Saved Letter', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Letter/i })).toBeVisible();
    },
  },
  {
    route: '/letters/vault',
    title: 'Letter Vault',
    bodyChecks: [
      'Training Videos',
      'In this area, you can add and edit your letters.',
      'CREDIT BUREAU LETTERS',
      "CREDITOR'S LETTERS",
      "COLLECTOR'S LETTERS",
      'RESPOND LETTERS',
      'MANUAL LETTERS',
      'Dispute Flow Letters',
      'Pre-Step (Optional)',
      'Personal Information Letter',
      '1-Initial dispute.',
      'General Letters',
      '1.Personal information fix.',
    ],
    buttonChecks: [/Training Videos/i, /Open letter tools/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /Training Videos/i }).click();
      await expect(page.getByRole('button', { name: /Letter Vault Training Video/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Move Letters Training Video/i })).toBeVisible();
      await page.getByRole('button', { name: /Open letter tools/i }).click();
      await page.getByRole('button', { name: /Add Manual Letter/i }).click();
      await expect(page.getByRole('heading', { name: 'Create Letter From Template', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Letter/i })).toBeVisible();
      await expect(page.getByLabel('Client / Customer')).toBeVisible();
      await expect(page.getByLabel('Bureau / Recipient')).toBeVisible();
      await expect(page.getByLabel('Template / Letter Type')).toBeVisible();
      await expect(page.getByLabel('Body / Content')).toBeVisible();
    },
  },
  {
    route: '/letter-vault',
    title: 'Letter Vault',
    bodyChecks: [
      'Training Videos',
      'In this area, you can add and edit your letters.',
      'CREDIT BUREAU LETTERS',
      "CREDITOR'S LETTERS",
      "COLLECTOR'S LETTERS",
      'RESPOND LETTERS',
      'MANUAL LETTERS',
      'Dispute Flow Letters',
      'Pre-Step (Optional)',
      'Personal Information Letter',
      '1-Initial dispute.',
      'General Letters',
      '1.Personal information fix.',
    ],
    buttonChecks: [/Training Videos/i, /Open letter tools/i],
  },
  {
    route: '/letters/ai-rewriter',
    title: 'AI Letter Rewriter',
    bodyChecks: [
      'Paste any dispute letter and AI will rewrite it to be more effective, legally precise, and professional.',
      'Letter Type',
      'Tone',
      'Focus / Strategy',
      'Load Sample',
      'Clear / Reset',
      'Rewrite with AI',
      'ORIGINAL LETTER',
      'REWRITTEN LETTER',
      'Tips for best results',
      'Include account details',
      'Use multiple rewrites',
      'Layer your strategy',
    ],
    buttonChecks: [/Load Sample/i, /Clear \/ Reset/i, /Rewrite with AI/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /Load Sample/i }).click();
      await expect(page.locator('textarea[placeholder*="Paste your existing dispute letter"]')).toHaveValue(/XYZ Collections/);
      await page.getByRole('button', { name: /Rewrite with AI/i }).click();
      await expect(page.getByText('AI Improvements Applied')).toBeVisible();
      await expect(page.getByRole('button', { name: /Copy/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Use as Original/i })).toBeVisible();
    },
  },
];

for (const pageInfo of routes) {
  test(pageInfo.route, async ({ page }) => {
    await page.goto(new URL(pageInfo.route, BASE_URL).toString());

    const body = page.locator('main').last();
    await expect(body).toBeVisible();

    const bodyText = (await body.innerText()).replace(/\s+/g, ' ').trim();
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('Runtime Error');
    expect(bodyText.length).toBeGreaterThan(300);

    await expect(page.getByRole('heading', { level: 1, name: pageInfo.title, exact: true })).toBeVisible();

    for (const expected of pageInfo.bodyChecks) {
      expect(bodyText).toContain(expected);
    }

    for (const pattern of pageInfo.buttonChecks ?? []) {
      await expect(page.getByRole('button', { name: pattern })).toBeVisible();
    }

    if (pageInfo.route.includes('/letter-vault') || pageInfo.route.includes('/letters/vault')) {
      expect(bodyText).not.toContain('View templates, create client-ready drafts, and edit saved letters.');
      expect(bodyText).not.toContain('Add Manual Letter');
      expect(bodyText).not.toContain('Search templates by title');
      expect(bodyText).not.toContain('Create From This Template');
      expect(bodyText).not.toContain('Saved Letters');
      expect(bodyText).not.toContain('Campaign Letters');
      await expect(page.getByRole('button', { name: /Letter Vault Training Video/i })).toHaveCount(0);
      await expect(page.getByRole('tab')).toHaveCount(5);
      await expect(page.getByRole('tab', { name: 'CREDIT BUREAU LETTERS' })).toHaveAttribute('aria-selected', 'true');
    }

    if (pageInfo.afterVisit) {
      await pageInfo.afterVisit(page);
    }
  });
}
