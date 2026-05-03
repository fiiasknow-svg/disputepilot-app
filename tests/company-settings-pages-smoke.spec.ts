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
    route: '/company/settings',
    title: 'Company Settings',
    bodyChecks: [
      'Manage your company profile and contact details.',
      'Business Information',
      'Company Name',
      'Phone',
      'Email',
      'Website',
      'Address',
      'City',
      'State',
      'Zip',
      'Notes / Description',
      'Saved Company Profile',
      'Company',
      'Contact',
      'Save Company',
    ],
    buttonChecks: [/Save Company/i, /Cancel/i],
  },
  {
    route: '/company/portals',
    title: 'Portals / Mobile App',
    bodyChecks: [
      'Manage client portal access, branding, and mobile settings.',
      'Client Portal',
      'Portal URL',
      'Logo',
      'Branding',
      'Welcome Message',
      'Enable Client Portal',
      'Allow Document Uploads',
      'Enable Secure Messages',
      'Mobile App',
      'App Display Name',
      'Enable Mobile App Access',
      'Enable Push Notifications',
      'Allow Biometric Login',
      'Saved Portal Summary',
      'Save Portal Settings',
    ],
    buttonChecks: [/Save Portal Settings/i, /Reset/i],
  },
  {
    route: '/company/manage-portal-content',
    title: 'Manage Portal Content',
    bodyChecks: [
      'Manage Portal Content',
      'Articles and resources displayed in your client portal.',
      '+ Create New',
      'NAME',
      'STATUS',
      'TYPE',
      'ACTIONS',
      'How to Read Your Credit Report',
      'Published',
      'Educational',
      'Edit',
      'Unpublish',
      'Delete',
      '15 articles',
    ],
    buttonChecks: [/Create New/i],
  },
  {
    route: '/company/portal-content',
    title: 'Portal Content',
    bodyChecks: [
      'Portal Content',
    ],
  },
  {
    route: '/company/credit-monitoring',
    title: 'Credit Monitoring',
    bodyChecks: [
      'Credit Monitoring',
      'Configure credit monitoring providers for your clients.',
      'SmartCredit',
      'MyFreeScore360',
      'IdentityIQ',
      'mySCOREIQ',
      'PrivacyGuard',
      'Test',
      'OFF',
      'Save Settings',
    ],
    buttonChecks: [/Save Settings/i],
  },
  {
    route: '/company/digital-contracts',
    title: 'Digital Contracts',
    bodyChecks: [
      'Create, view, send, and track contract workflows.',
      'Create Contract',
      'Documents',
      'Upload',
      'Contracts',
      'Templates',
      'Send',
      'Sign',
      'Contract ID',
      'Document',
      'Type',
      'Recipient',
      'Status',
      'Action',
      'View',
    ],
    buttonChecks: [/Create Contract/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /Create Contract/i }).click();
      await expect(page.getByRole('heading', { name: 'New Digital Contract', exact: true })).toBeVisible();
      await expect(page.getByLabel('Contract Name')).toBeVisible();
      await expect(page.getByLabel('Recipient')).toBeVisible();
      await expect(page.getByLabel('Contract Body')).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Contract/i })).toBeVisible();
    },
  },
  {
    route: '/company/self-service-signup',
    title: 'Self-Service Signup',
    bodyChecks: [
      'Welcome to Self-Service Signup',
      'This wizard will guide you through setting up your client self-service signup portal.',
      'Get Started',
      'Terms of Use',
      'Billing Setup',
      'Design Center',
      'About You',
      'Select a Plan',
      'Agreement',
      'Credit Monitoring',
      'Finish',
      'Embed Code',
      'Previous',
      'Next',
    ],
    buttonChecks: [/Get Started/i, /^Next$/, /Previous/i],
  },
  {
    route: '/company/client-auto-signup',
    title: 'Client Auto Signup',
    bodyChecks: [
      'Enable client auto signup to let clients register and onboard themselves.',
      'Client Auto Signup',
      'Signup URL',
      'Copy',
      'Build Signup Form',
      'Build Signup Form',
      'Client Auto Signup',
      'Signup Basic Settings',
      'Single Credit Card Authorization',
      'Select Contract',
      'Standard Service Agreement',
      'Monthly Billing Authorization',
      'CROA Disclosure',
      'Custom Contract v1',
    ],
    buttonChecks: [/Copy/i, /Build Signup Form/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: 'Signup Basic Settings' }).click();
      await expect(page.getByRole('heading', { name: 'Basic Settings', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Settings/i })).toBeVisible();
      await page.getByRole('button', { name: 'Single Credit Card Authorization' }).click();
      await expect(page.getByRole('heading', { name: 'Credit Card Authorization', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Authorize Card/i })).toBeVisible();
    },
  },
  {
    route: '/company/images-documents',
    title: 'Images & Documents',
    bodyChecks: [
      'Images & Documents',
      '9 files',
      '+ Upload File',
      'TOTAL FILES',
      'IMAGES',
      'DOCUMENTS',
      'STORAGE USED',
      'Drag & drop files here, or click to browse',
      'All Files',
      'Images',
      'Documents',
      'FILE NAME',
      'CATEGORY',
      'SIZE',
      'UPLOADED',
      'ACTIONS',
      'Download',
      'Rename',
      'Share',
      'Delete',
    ],
  },
  {
    route: '/company/manage-emails',
    title: 'Manage Emails',
    bodyChecks: [
      'Email templates, SMTP delivery settings, and send history.',
      'Email Templates',
      'SMTP Settings',
      'Email Log',
      'Total Templates',
      'Active',
      'Total Sends',
      'All Types',
      'TEMPLATE NAME',
      'TYPE',
      'SUBJECT LINE',
      'SENDS',
      'MODIFIED',
      'STATUS',
      'ACTIONS',
      'Preview',
      'Edit',
      'Duplicate',
      'Delete',
      '+ New Template',
    ],
    buttonChecks: [/New Template/i],
  },
  {
    route: '/company/notify-automation',
    title: 'Notify & Automation',
    bodyChecks: [
      'Control which events trigger notifications and set up automated workflows.',
      'Notification Settings',
      'Automation Rules',
      'Master Channel Switches',
      'All Email Notifications',
      'All SMS Notifications',
      'All Portal Notifications',
      'Bulk Toggle',
      'Events Enabled',
      'Active Auto Rules',
      'Total Events',
      'EVENT',
      'EMAIL',
      'SMS',
      'PORTAL',
      'DELAY (DAYS)',
      'TRIGGERS',
      'Save Settings',
    ],
    buttonChecks: [/Save Settings/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: 'Automation Rules' }).click();
      await expect(page.getByRole('button', { name: 'Automation Rules' })).toBeVisible();
      await expect(page.getByRole('button', { name: /\+ New Rule/i })).toBeVisible();
    },
  },
  {
    route: '/company/team-messages',
    title: 'Team Messages',
    bodyChecks: [
      'Team Messages',
      '2 unread messages',
      'Mark All Read',
      '+ Compose',
      'Inbox',
      'Sent',
      'New client onboarded',
      'Reminder: Monthly billing runs Friday',
      'TransUnion round 2 letters need review',
    ],
    buttonChecks: [/Compose/i, /Mark All Read/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: /\+ Compose/i }).click();
      await expect(page.getByRole('heading', { name: 'New Message', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Send Message/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
    },
  },
  {
    route: '/settings/configuration',
    title: 'Configuration',
    bodyChecks: [
      'Manage system settings, statuses, plans, and integrations.',
      'General',
      'Client Statuses',
      'Dispute Statuses',
      'Round Settings',
      'Notifications',
      'Portal',
      'Service Plans',
      'Tags',
      'Integrations',
      'COMPANY INFORMATION',
      'Company Name',
      'Company Email',
      'Phone Number',
      'Business Address',
      'REGIONAL & DISPLAY',
      'Timezone',
      'Date Format',
      'Currency',
      'Primary Brand Color',
      'Save General Settings',
    ],
    buttonChecks: [/Save General Settings/i],
    afterVisit: async (page) => {
      await page.getByRole('button', { name: 'Client Statuses' }).click();
      await expect(page.getByText('Default Client Statuses')).toBeVisible();
      await page.getByRole('button', { name: 'Dispute Statuses' }).click();
      await expect(page.getByText('Default Dispute Statuses')).toBeVisible();
      await page.getByRole('button', { name: 'Round Settings' }).click();
      await expect(page.getByText('Default Round Configuration')).toBeVisible();
      await page.getByRole('button', { name: 'Notifications' }).click();
      await expect(page.getByText('Email Notification Sender')).toBeVisible();
      await page.getByRole('button', { name: 'Portal' }).click();
      await expect(page.getByText('Client Portal Configuration')).toBeVisible();
      await page.getByRole('button', { name: 'Service Plans' }).click();
      await expect(page.getByRole('heading', { name: 'Service Plans', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Tags' }).click();
      await expect(page.getByText('Manage Tags')).toBeVisible();
      await page.getByRole('button', { name: 'Integrations' }).click();
      await expect(page.getByText('Connected Services')).toBeVisible();
      await expect(page.getByText('Webhook Endpoints')).toBeVisible();
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
