import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

const ORIGINAL_DISPUTES = 'https://www.clientdisputemanager.com/User/DisputeCenter';
const CLONE_DISPUTES = `${BASE_URL}/disputes`;

const expectedDisputeItems = [
  'Dispute Manager',
  'All Disputes',
  'Create New Dispute',
  'All Statuses',
  'All Bureaus',
  'Clear Filters',
  'Client',
  'Status',
  'Round',
  'Bureau',
  'Equifax',
  'Experian',
  'TransUnion',
  'Letters',
  'Accounts',
];
const expectedColumnHeaders = ['Client', 'Status', 'Round', 'Bureau', 'Equifax', 'Experian', 'TransUnion', 'Letters', 'Accounts', 'Date', 'Action'];

const confirmedDisputeRoutes = [
  '/disputes',
  '/disputes/status',
  '/disputes/furnisher-addresses',
  '/disputes/ai-metro-2-letters',
  '/disputes/dispute-playbook',
];

function discoverDisputeRoutes() {
  const disputeRoot = path.join(process.cwd(), 'app', 'disputes');
  const routes: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.name !== 'page.tsx') continue;

      const relativeDir = path.relative(disputeRoot, dir);
      const route = relativeDir
        ? `/disputes/${relativeDir.split(path.sep).join('/')}`
        : '/disputes';
      routes.push(route);
    }
  }

  walk(disputeRoot);
  return routes.sort();
}

test('discover and compare dispute routes to clone disputes surface', async () => {
  const artifactDir = path.join(process.cwd(), 'parity-results', 'disputes');
  fs.mkdirSync(artifactDir, { recursive: true });

  const discoveredRoutes = discoverDisputeRoutes();
  const missingDisputeRoutes = confirmedDisputeRoutes.filter(route => !discoveredRoutes.includes(route));
  const extraDisputeRoutes = discoveredRoutes.filter(route => !confirmedDisputeRoutes.includes(route));

  const browser = await chromium.launch();

  const originalContext = await browser.newContext({
    storageState: 'auth-original.json',
    viewport: { width: 1440, height: 1000 },
  });

  const cloneContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });

  const original = await originalContext.newPage();
  const clone = await cloneContext.newPage();

  let originalReachable = true;
  let originalUrl = ORIGINAL_DISPUTES;
  let originalBodyText = '';
  try {
    const response = await original.goto(ORIGINAL_DISPUTES, { waitUntil: 'domcontentloaded', timeout: 30000 });
    originalUrl = original.url();
    originalReachable = Boolean(response?.ok()) && originalUrl === ORIGINAL_DISPUTES;
    originalBodyText = (await original.locator('body').innerText({ timeout: 10000 })).replace(/\s+/g, ' ');
  } catch (error) {
    originalReachable = false;
    originalBodyText = error instanceof Error ? error.message : String(error);
  }

  await clone.goto(CLONE_DISPUTES);

  await expect(clone.locator('body')).toBeVisible();
  if (await original.locator('body').count()) {
    await expect(original.locator('body')).toBeVisible();
  }
  const cloneBodyText = (await clone.locator('body').innerText()).replace(/\s+/g, ' ');

  await original.screenshot({ path: path.join(artifactDir, 'desktop-original.png'), fullPage: true });
  await clone.screenshot({ path: path.join(artifactDir, 'desktop-clone.png'), fullPage: true });

  await original.setViewportSize({ width: 390, height: 844 });
  await clone.setViewportSize({ width: 390, height: 844 });
  await original.screenshot({ path: path.join(artifactDir, 'mobile-original.png'), fullPage: true });
  await clone.screenshot({ path: path.join(artifactDir, 'mobile-clone.png'), fullPage: true });

  const missingVisibleItems = expectedDisputeItems.filter(
    item => !cloneBodyText.includes(item)
  );
  const expectedControls = [
    'Search customer, furnisher, account, bureau, or letter',
    'Filter by status',
    'Filter by bureau',
  ];
  const missingControls: string[] = [];
  for (const control of expectedControls) {
    if (await clone.getByLabel(control).count() === 0) missingControls.push(control);
  }
  const missingColumnHeaders: string[] = [];
  for (const header of expectedColumnHeaders) {
    if (await clone.locator('th').filter({ hasText: header }).count() === 0) missingColumnHeaders.push(header);
  }
  const missingFromClone = [
    ...missingDisputeRoutes.map(route => ({ type: 'route', route })),
    ...missingVisibleItems.map(item => ({ type: 'visible-surface', item })),
    ...missingControls.map(item => ({ type: 'control', item })),
    ...missingColumnHeaders.map(item => ({ type: 'column-header', item })),
  ];
  const differentFromOriginal = originalReachable
    ? expectedDisputeItems
        .filter(item => originalBodyText.includes(item) !== cloneBodyText.includes(item))
        .map(item => ({
          item,
          originalHasItem: originalBodyText.includes(item),
          cloneHasItem: cloneBodyText.includes(item),
        }))
    : [{
        type: 'blocked-original-session',
        originalUrl,
        expectedUrl: ORIGINAL_DISPUTES,
        detail: 'Original Dispute Center could not be confirmed in this run; prior audit observed redirect to dashboard, so exact original page parity remains session-limited.',
      }];

  fs.writeFileSync(
    path.join(artifactDir, 'missing-from-clone.json'),
    JSON.stringify(missingFromClone, null, 2)
  );
  fs.writeFileSync(
    path.join(artifactDir, 'different-from-original.json'),
    JSON.stringify(differentFromOriginal, null, 2)
  );
  fs.writeFileSync(
    path.join(artifactDir, 'extra-in-clone.json'),
    JSON.stringify(extraDisputeRoutes.map(route => ({ type: 'route', route })), null, 2)
  );

  console.log('Dispute parity artifacts saved to parity-results/disputes');
  console.log(missingFromClone);

  expect(missingFromClone).toEqual([]);
  for (const route of confirmedDisputeRoutes) {
    const response = await clone.goto(`${BASE_URL}${route}`);
    expect(response?.status(), route).toBeLessThan(400);
    await expect(clone.locator('body'), route).toBeVisible();
  }

  await browser.close();
});
