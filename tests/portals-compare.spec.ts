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
  "In this area, you can access and share all your company's portals",
  'Client Tracking Portal',
  'Give your clients an easy way to track their dispute progress, upload documents, and send you messages securely.',
  'Watch the video below to see what your clients experience inside the Client Tracking Portal.',
  'WATCH VIDEO',
  'Preview what your clients see inside the Client Tracking Portal - no login required.',
  'Client Tracking Portal Q&A',
  'What is the Client Tracking Portal?',
  'How can my clients access it?',
  'Can my clients upload images and documents?',
  'Will clients see their credit reports inside the portal?',
  'Can I customize the portal with my company details?',
  'Client Tracking Portal Link',
  'Use this link to connect your Client Portal to your website or share it directly with your customers.',
  'https://www.creditrestorationportal.com/Account/Login',
  'COPY LINK',
  'Affiliate Portal',
  'Empower your referral partners to track their leads, view commissions, and manage their performance in real time.',
  'Watch the video below to see what affiliates experience after signing up.',
  'Preview the Affiliate Portal view - see exactly what your partners will see.',
  'Affiliate Portal Q&A',
  'What is the Affiliate Portal used for?',
  'How do affiliates sign up?',
  'What information can affiliates see?',
  'Can I adjust affiliate commission amounts?',
  'Can I preview the Affiliate Portal myself?',
  'Affiliate Portal Link',
  'Use this link to add the Affiliate Portal to your website or share it with partners who refer new clients.',
  'https://www.affiliatecreditrepairportal.com/Account/Login',
  'Client Tracking Portal Mobile Application',
  'In this area, you can give your customers access to the mobile Client Tracking Portal, allowing them to log in and view their status in real time.',
  'Share these links with your customers so they can download the Client Tracking Portal mobile app.',
  'Android Application',
  'https://play.google.com/store/apps/details?id=com.incode.portal_client',
  'IOS Application',
  'https://apps.apple.com/us/app/client-tracking-portal/id1549632923',
  'What is the Client Tracking Mobile App?',
  'Which app stores are available?',
  'How do I find the app in the stores?',
  'Is the mobile app included in my plan?',
  'Can I customize the app with my logo or brand colors?',
  'Are there templates to let the customer know?',
  'How can I let the customers know right now about the app?',
  'Client Tracking Portal Login: What if I don\'t want the customer to get the app?',
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
    ...(mainFirstHeading === 'Client Tracking Portal'
      ? []
      : [
          {
            item: 'First content section',
            original: 'Original begins instructional content with Client Tracking Portal after the intro.',
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
