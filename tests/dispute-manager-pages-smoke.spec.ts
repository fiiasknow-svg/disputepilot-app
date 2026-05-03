import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  buttonChecks?: RegExp[];
};

const routes: RouteSpec[] = [
  {
    route: '/disputes',
    title: 'Dispute Center',
    bodyChecks: [
      'Manage client disputes, bureaus, letters, accounts, dates, and action status.',
      'Disputes',
      'Client',
      'Status',
      'Round',
      'Bureau',
      'Equifax',
      'Experian',
      'TransUnion',
      'Letters',
      'Accounts',
      'Date',
      'Action',
    ],
    buttonChecks: [/Create New Dispute/i],
  },
  {
    route: '/disputes/status',
    title: 'Dispute Status',
    bodyChecks: [
      'Track and manage all active disputes across all bureaus.',
      'All Disputes',
      'By Bureau',
      'By Round',
      'All Statuses',
      'All Bureaus',
      'All Rounds',
      'Client',
      'Account',
      'Bureau',
      'Round',
      'Status',
      'FILED',
      'UPDATE STATUS',
    ],
    buttonChecks: [/Export CSV/i, /Refresh/i],
  },
  {
    route: '/dispute-manager/furnisher-addresses',
    title: 'Furnisher Addresses',
    bodyChecks: [
      'Creditor and bureau mailing addresses for dispute letters.',
      '+ Add New Creditor',
      'NAME',
      'ADDRESS',
      'CITY',
      'STATE',
      'ZIP',
      'ACTION',
      'Equifax Information Services',
      'Experian',
      'TransUnion LLC',
      'Edit',
      'Delete',
      '10 of 10 creditors',
    ],
    buttonChecks: [/Add New Creditor/i],
  },
  {
    route: '/disputes/dispute-playbook',
    title: 'Dispute Playbook',
    bodyChecks: [
      'Step-by-step strategies to resolve any credit dispute scenario.',
      'Choose Your Dispute System',
      'Run Your Standard Dispute Form',
      'Apply Multi Party Pressure',
      'Escalate the Dispute',
      'Respond to Verification Attempts',
      'Prepare for Arbitration',
      'Online Dispute Portal',
      'Certified Mail Dispute',
      'CFPB Complaint',
      'Method of Verification Letter',
      'Updated Dispute with Evidence',
      'File in Small Claims Court',
    ],
    buttonChecks: [/Online Dispute Portal/i, /Certified Mail Dispute/i, /CFPB Complaint/i],
  },
  {
    route: '/disputes/ai-metro-2-letters',
    title: 'AI / Metro 2 Letters',
    bodyChecks: [
      'Generate AI-powered and Metro 2 compliant dispute letters.',
      'Dispute Manager',
      'AI / Metro 2 Letters',
    ],
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
  });
}
