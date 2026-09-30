import { test, expect } from '@playwright/test';

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const RESULT_DIR = path.join('parity-results', 'portals');

function writeJson(name: string, value: unknown) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULT_DIR, name), JSON.stringify(value, null, 2));
}

const originalPortalsSurface = [
  'Portals / Mobile App',
  'DASHBOARD PORTALS / MOBILE APP',
  'BACK',
  "In this area, you can access and share configurable demo portal links",
  'DisputePilot Portal',
  'Give your clients an easy way to track their dispute progress, upload documents, and send you messages securely.',
  'Open the training placeholder below to review the planned DisputePilot Portal experience.',
  'WATCH VIDEO',
  'Preview what your clients will see inside the DisputePilot Portal once final portal hosting is configured.',
  'DisputePilot Portal Q&A',
  'What is the DisputePilot Portal?',
  'How can my clients access it?',
  'Can my clients upload images and documents?',
  'Will clients see their credit reports inside the portal?',
  'Can I customize the portal with my company details?',
  'DisputePilot Portal Link',
  'Use this configurable demo link until the buyer-owned client portal URL is connected.',
  'https://portal.disputepilot.com/demo/client',
  'COPY LINK',
  'Referral Partner Portal',
  'Empower your referral partners to track their leads, view commissions, and manage their performance in real time.',
  'Open the training placeholder below to review the planned referral partner portal experience.',
  'Preview the referral partner portal flow once final portal hosting is configured.',
  'Referral Partner Portal Q&A',
  'What is the referral partner portal used for?',
  'How do affiliates sign up?',
  'What information can affiliates see?',
  'Can I adjust affiliate commission amounts?',
  'Can I preview the referral partner portal myself?',
  'Referral Partner Portal Link',
  'Use this configurable demo link until the buyer-owned referral partner portal URL is connected.',
  'https://portal.disputepilot.com/demo/referrals',
  'DisputePilot Portal Mobile Access',
  'In this area, you can prepare customer-facing mobile access guidance for the DisputePilot Portal.',
  'Replace these demo app-store links with buyer-owned mobile app links before sharing them with customers.',
  'Android Demo Link',
  'https://portal.disputepilot.com/demo/mobile-android',
  'iOS Demo Link',
  'https://portal.disputepilot.com/demo/mobile-ios',
  'What is DisputePilot mobile access?',
  'Which app stores are available?',
  'How do I find the app in the stores?',
  'Is the mobile app included in my plan?',
  'Can I customize the app with my logo or brand colors?',
  'Are there templates to let the customer know?',
  'How can I let the customers know right now about the app?',
  'DisputePilot Portal Login: What if I don\'t want the customer to get the app?',
];

const cloneOnlySettings = [
  'Portal Settings',
  'Manage client portal access, branding, and mobile settings',
  'Portal URL',
  'Logo',
  'Branding',
  'Welcome Message',
  'Enable Client Portal',
  'Save Portal Settings',
  'Saved Portal Summary',
];

test('portals first surface tracks original instructional portal/mobile app layout', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${BASE_URL}/company/portals`);

  const body = page.locator('body');
  await expect(body).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Portals / Mobile App', exact: true })).toBeVisible();

  const bodyText = (await body.innerText()).replace(/\s+/g, ' ').trim();
  const mainFirstHeading = await page.locator('main h2').first().innerText();

  const missingFromClone = originalPortalsSurface
    .filter((item) => !bodyText.includes(item))
    .map((item) => ({
      item,
      original: 'Visible on the captured original Portals/Mobile App page.',
      clone: 'Missing from clone body text.',
    }));

  const differentFromOriginal = [
    ...(mainFirstHeading === 'DisputePilot Portal'
      ? []
      : [
          {
            item: 'First content section',
            original: 'Original begins instructional content with DisputePilot Portal after the intro.',
            clone: `Clone begins with ${mainFirstHeading}.`,
          },
        ]),
  ];

  const extraInClone = cloneOnlySettings
    .filter((item) => bodyText.includes(item))
    .map((item) => ({
      item,
      original: 'Not part of the captured original instructional Portals/Mobile App page.',
      clone: 'Still present below the instructional parity surface as editable clone behavior.',
    }));

  writeJson('missing-from-clone.json', missingFromClone);
  writeJson('different-from-original.json', differentFromOriginal);
  writeJson('extra-in-clone.json', extraInClone);

  expect(missingFromClone).toEqual([]);
  expect(differentFromOriginal).toEqual([]);
});
