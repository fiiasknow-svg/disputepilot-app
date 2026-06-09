import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ORIGINAL_BASE_URL = 'https://www.clientdisputemanager.com';
const CLONE_BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const OUTPUT_DIRECTORY = path.resolve(process.cwd(), 'audit-results', 'full-visual-audit');
const SCREENSHOT_DIRECTORY = path.join(OUTPUT_DIRECTORY, 'screenshots');
const ORIGINAL_STORAGE_STATE = path.resolve(process.cwd(), 'auth-original.json');

const ROUTES = [
  '/dashboard',
  '/clients',
  '/leads',
  '/billing',
  '/disputes',
  '/disputes/status',
  '/dispute-manager/furnisher-addresses',
  '/letters',
  '/letters/ai-rewriter',
  '/calendar',
  '/company/settings',
  '/company/images-documents',
  '/company/team-messages',
  '/automation',
  '/documents',
  '/help',
  '/portals',
] as const;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

type OriginalStatus = 'captured' | 'blocked-original-session' | 'original-error';
type CloneStatus = 'captured' | 'clone-error';
type DiffStatus = 'not-compared';

type AuditEntry = {
  route: string;
  viewport: string;
  viewportSize: { width: number; height: number };
  originalRequestedUrl: string;
  originalReachedUrl: string | null;
  originalStatus: OriginalStatus;
  originalScreenshotPath: string | null;
  cloneRequestedUrl: string;
  cloneReachedUrl: string | null;
  cloneStatus: CloneStatus;
  cloneScreenshotPath: string | null;
  diffStatus: DiffStatus;
  diffPercent: number | null;
  diffPixels: number | null;
  notes: string[];
};

type CaptureResult<Status> = {
  reachedUrl: string | null;
  status: Status;
  screenshotPath: string | null;
  notes: string[];
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function routeSlug(route: string) {
  return route === '/' ? 'root' : route.slice(1).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

function relativeOutputPath(filePath: string) {
  return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isOriginalLoginPage(page: Page) {
  const reachedUrl = page.url();
  if (/\/account\/login(?:[/?#]|$)/i.test(reachedUrl)) return true;

  const passwordInputVisible = await page.locator('input[type="password"]:visible').count().catch(() => 0);
  const bodyText = await page.locator('body').innerText({ timeout: 2_000 }).catch(() => '');

  return passwordInputVisible > 0 && /sign in|log in|login|enter your email and password/i.test(bodyText);
}

async function settlePage(page: Page) {
  await page.locator('body').waitFor({ state: 'attached', timeout: 10_000 });
  await page.waitForTimeout(750);
}

async function captureOriginal(
  context: BrowserContext,
  route: string,
  viewportName: string,
): Promise<CaptureResult<OriginalStatus>> {
  const page = await context.newPage();
  const requestedUrl = new URL(route, ORIGINAL_BASE_URL).toString();
  const screenshotFile = path.join(
    SCREENSHOT_DIRECTORY,
    `${viewportName}-${routeSlug(route)}-original.png`,
  );

  try {
    const response = await page.goto(requestedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await settlePage(page);

    const blocked = await isOriginalLoginPage(page);
    await page.screenshot({ path: screenshotFile, fullPage: true, animations: 'disabled' });

    const notes: string[] = [];
    if (response) notes.push(`Original HTTP status: ${response.status()}.`);
    if (blocked) notes.push('Original route reached a login page; no authenticated comparison was available.');

    return {
      reachedUrl: page.url(),
      status: blocked ? 'blocked-original-session' : 'captured',
      screenshotPath: relativeOutputPath(screenshotFile),
      notes,
    };
  } catch (error) {
    return {
      reachedUrl: page.url() === 'about:blank' ? null : page.url(),
      status: 'original-error',
      screenshotPath: null,
      notes: [`Original capture error: ${errorMessage(error)}`],
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function captureClone(
  context: BrowserContext,
  route: string,
  viewportName: string,
): Promise<CaptureResult<CloneStatus>> {
  const page = await context.newPage();
  const requestedUrl = new URL(route, CLONE_BASE_URL).toString();
  const screenshotFile = path.join(
    SCREENSHOT_DIRECTORY,
    `${viewportName}-${routeSlug(route)}-clone.png`,
  );

  try {
    const response = await page.goto(requestedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await settlePage(page);
    await page.screenshot({ path: screenshotFile, fullPage: true, animations: 'disabled' });

    const notes: string[] = [];
    if (response) notes.push(`Clone HTTP status: ${response.status()}.`);

    return {
      reachedUrl: page.url(),
      status: 'captured',
      screenshotPath: relativeOutputPath(screenshotFile),
      notes,
    };
  } catch (error) {
    return {
      reachedUrl: page.url() === 'about:blank' ? null : page.url(),
      status: 'clone-error',
      screenshotPath: null,
      notes: [`Clone capture error: ${errorMessage(error)}`],
    };
  } finally {
    await page.close().catch(() => {});
  }
}

function markdownCell(value: string | number | null) {
  if (value === null) return '';
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function buildMarkdownReport(report: {
  generatedAt: string;
  originalBaseUrl: string;
  cloneBaseUrl: string;
  originalStorageStateAvailable: boolean;
  entries: AuditEntry[];
}) {
  const originalCaptured = report.entries.filter((entry) => entry.originalStatus === 'captured').length;
  const originalBlocked = report.entries.filter(
    (entry) => entry.originalStatus === 'blocked-original-session',
  ).length;
  const originalErrors = report.entries.filter((entry) => entry.originalStatus === 'original-error').length;
  const cloneCaptured = report.entries.filter((entry) => entry.cloneStatus === 'captured').length;
  const cloneErrors = report.entries.filter((entry) => entry.cloneStatus === 'clone-error').length;

  const lines = [
    '# Full Visual Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Original: ${report.originalBaseUrl}`,
    '',
    `Clone: ${report.cloneBaseUrl}`,
    '',
    `Original storage state available: ${report.originalStorageStateAvailable ? 'yes' : 'no'}`,
    '',
    '## Summary',
    '',
    `- Entries: ${report.entries.length}`,
    `- Original captured: ${originalCaptured}`,
    `- Original session blocked: ${originalBlocked}`,
    `- Original errors: ${originalErrors}`,
    `- Clone captured: ${cloneCaptured}`,
    `- Clone errors: ${cloneErrors}`,
    `- Pixel comparison: not performed (${report.entries.length} entries marked not-compared)`,
    '',
    '## Entries',
    '',
    '| Route | Viewport | Original status | Clone status | Original reached URL | Clone reached URL | Original screenshot | Clone screenshot | Diff status | Diff percent | Diff pixels | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- |',
  ];

  for (const entry of report.entries) {
    lines.push(
      `| ${[
        entry.route,
        entry.viewport,
        entry.originalStatus,
        entry.cloneStatus,
        entry.originalReachedUrl,
        entry.cloneReachedUrl,
        entry.originalScreenshotPath,
        entry.cloneScreenshotPath,
        entry.diffStatus,
        entry.diffPercent,
        entry.diffPixels,
        entry.notes.join(' '),
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function createContexts(
  browser: Browser,
  viewport: { width: number; height: number },
  originalStorageStateAvailable: boolean,
) {
  const originalContext = await browser.newContext({
    viewport,
    storageState: originalStorageStateAvailable ? ORIGINAL_STORAGE_STATE : undefined,
  });
  const cloneContext = await browser.newContext({
    viewport,
    extraHTTPHeaders: {
      'x-disputepilot-test-auth': '1',
    },
  });

  return { originalContext, cloneContext };
}

test.describe.configure({ mode: 'serial' });
test.setTimeout(20 * 60 * 1000);

test('full report-only visual audit', async ({ browser }) => {
  await mkdir(SCREENSHOT_DIRECTORY, { recursive: true });

  const originalStorageStateAvailable = await fileExists(ORIGINAL_STORAGE_STATE);
  const entries: AuditEntry[] = [];

  for (const viewport of VIEWPORTS) {
    const { originalContext, cloneContext } = await createContexts(
      browser,
      { width: viewport.width, height: viewport.height },
      originalStorageStateAvailable,
    );

    try {
      for (const route of ROUTES) {
        const [original, clone] = await Promise.all([
          captureOriginal(originalContext, route, viewport.name),
          captureClone(cloneContext, route, viewport.name),
        ]);

        const notes = [...original.notes, ...clone.notes];
        if (!originalStorageStateAvailable) {
          notes.push('auth-original.json was unavailable; original capture used a fresh session.');
        }
        notes.push('Pixel comparison was not performed; screenshots are available for manual review.');

        entries.push({
          route,
          viewport: viewport.name,
          viewportSize: { width: viewport.width, height: viewport.height },
          originalRequestedUrl: new URL(route, ORIGINAL_BASE_URL).toString(),
          originalReachedUrl: original.reachedUrl,
          originalStatus: original.status,
          originalScreenshotPath: original.screenshotPath,
          cloneRequestedUrl: new URL(route, CLONE_BASE_URL).toString(),
          cloneReachedUrl: clone.reachedUrl,
          cloneStatus: clone.status,
          cloneScreenshotPath: clone.screenshotPath,
          diffStatus: 'not-compared',
          diffPercent: null,
          diffPixels: null,
          notes,
        });
      }
    } finally {
      await Promise.all([
        originalContext.close().catch(() => {}),
        cloneContext.close().catch(() => {}),
      ]);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    originalBaseUrl: ORIGINAL_BASE_URL,
    cloneBaseUrl: CLONE_BASE_URL,
    originalStorageStateAvailable,
    routes: [...ROUTES],
    viewports: VIEWPORTS.map((viewport) => ({ ...viewport })),
    entries,
  };

  await Promise.all([
    writeFile(path.join(OUTPUT_DIRECTORY, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(path.join(OUTPUT_DIRECTORY, 'report.md'), buildMarkdownReport(report), 'utf8'),
  ]);

  expect(entries.length).toBe(ROUTES.length * VIEWPORTS.length);
});
