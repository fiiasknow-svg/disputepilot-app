import { expect, test, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

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
      'View templates, create client-ready drafts, and edit saved letters.',
      'Training Videos',
      'Letter Vault Training Video',
      'Move Letters Training Video',
      'Manual Letters',
      'Select All',
      'Delete All',
      'Move Letters',
      'Letter Preview',
      'Undo Deleted Letters',
      'Move Manual Letters',
      'Move to Letter Category',
      'Response Letters',
      'Respond Credit Bureau',
      'Respond Creditor',
      'Respond Collector',
      'Add Manual Letter',
      'Templates',
      'Saved Letters',
      'No saved letters yet. Use a template or add a manual letter.',
      'Dispute Flow Letters',
      'General Letters',
      'Credit Bureau Letters',
      'Campaign Letters',
    ],
    buttonChecks: [/Add Manual Letter/i, /Letter Vault Training Video/i, /Move Letters Training Video/i],
    afterVisit: async (page) => {
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
      'View templates, create client-ready drafts, and edit saved letters.',
      'Training Videos',
      'Letter Vault Training Video',
      'Move Letters Training Video',
      'Manual Letters',
      'Select All',
      'Delete All',
      'Move Letters',
      'Letter Preview',
      'Undo Deleted Letters',
      'Move Manual Letters',
      'Move to Letter Category',
      'Response Letters',
      'Respond Credit Bureau',
      'Respond Creditor',
      'Respond Collector',
      'Add Manual Letter',
      'Templates',
      'Saved Letters',
      'No saved letters yet. Use a template or add a manual letter.',
      'Dispute Flow Letters',
      'General Letters',
      'Credit Bureau Letters',
      'Campaign Letters',
    ],
    buttonChecks: [/Add Manual Letter/i, /Letter Vault Training Video/i, /Move Letters Training Video/i],
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

    const body = page.locator('body');
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

    if (pageInfo.afterVisit) {
      await pageInfo.afterVisit(page);
    }
  });
}
