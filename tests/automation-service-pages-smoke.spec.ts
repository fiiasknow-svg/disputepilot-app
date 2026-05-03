import { expect, test, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  buttonChecks?: RegExp[];
  minBodyLength?: number;
  afterVisit?: (page: Page) => Promise<void>;
};

const routes: RouteSpec[] = [
  {
    route: '/automation',
    title: 'Automation',
    minBodyLength: 250,
    bodyChecks: [
      'Manage Zapier, Go-HighLevel, GHL, Workflow, Trigger, Action, and Enable settings.',
      'Zapier',
      'Go-HighLevel',
      'GHL',
      'Enable',
      'Workflow',
      'Trigger',
      'Action',
      'Client Onboarding',
      'Payment Reminder',
      'Send Email',
      'Send Portal Notification',
      'Enabled',
      'Save',
    ],
    buttonChecks: [/Save/i, /Zapier/i, /Go-HighLevel/i, /^GHL$/, /Enable/i],
  },
  {
    route: '/academy/automation',
    title: 'Automation Specialist',
    bodyChecks: [
      'Automate your credit repair business and scale without adding more hours.',
      'Learn how to set up email workflows, auto-dispute scheduling, client onboarding sequences, and billing automation using DisputePilot so your business runs itself.',
      'Intermediate',
      '21 lessons',
      '4.5 hours',
      'lessons',
      'Certificate of Completion',
      'Automation Fundamentals',
      'Client Onboarding Automation',
      'Email & Notification Workflows',
      'Dispute & Letter Automation',
      'Advanced Automation & Reporting',
      'Begin Course',
      'COURSE DETAILS',
      'YOUR PROGRESS',
      'Certified Automation Specialist',
    ],
    buttonChecks: [/Begin Course/i],
  },
  {
    route: '/academy/credit-repair',
    title: 'Credit Repair Specialist',
    bodyChecks: [
      'Master the complete credit repair process from client intake to dispute resolution.',
      'Learn how to run a professional credit repair business',
      'Beginner',
      '24 lessons',
      '6 hours',
      'lessons',
      'Certificate of Completion',
      'Introduction to Credit Repair',
      'Reading & Analyzing Credit Reports',
      'The Dispute Process',
      'Writing Dispute Letters',
      'Client Management & Business Basics',
      'Begin Course',
      'COURSE DETAILS',
      'YOUR PROGRESS',
      'Certified Credit Repair Specialist',
    ],
    buttonChecks: [/Begin Course/i],
  },
  {
    route: '/leads/website-lead-form',
    title: 'Website Lead Form',
    bodyChecks: [
      'Select Form Style',
      'Required Fields',
      'Form Title / Company Name Settings',
      'Form Fields',
      'Design Settings',
      'Design Settings 2',
      'Form Preview',
      'Preview',
      'Publish',
      'Save',
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'Comments',
      'Background Color',
      'Button Color',
      'Font Size',
      'Font Family',
      'Button Text',
    ],
    buttonChecks: [/Preview/i, /Publish/i, /Save/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /Preview/i }).click();
      await expect(page.getByRole('heading', { name: 'Form Preview', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /x/i }).first()).toBeVisible();
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
    expect(bodyText.length).toBeGreaterThan(pageInfo.minBodyLength ?? 300);

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
