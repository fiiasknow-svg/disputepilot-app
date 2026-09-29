import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
  type StorageState,
} from '@playwright/test';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ORIGINAL_BASE_URL = 'https://www.clientdisputemanager.com';
const CLONE_BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const OUTPUT_DIRECTORY = path.resolve(process.cwd(), 'audit-results', 'full-visual-audit');
const SCREENSHOT_DIRECTORY = path.join(OUTPUT_DIRECTORY, 'screenshots');
const ORIGINAL_STORAGE_STATE = path.resolve(process.cwd(), 'auth-original.json');
const ORIGINAL_E2E_EMAIL = process.env.ORIGINAL_E2E_EMAIL;
const ORIGINAL_E2E_PASSWORD = process.env.ORIGINAL_E2E_PASSWORD;

type RouteMappingConfidence = 'exact' | 'guessed' | 'clone-only' | 'needs-review';

type AuditRoute = {
  label: string;
  clonePath: string;
  originalPath: string | null;
  routeMappingConfidence: RouteMappingConfidence;
  notes?: string;
};

const ROUTES: AuditRoute[] = [
  {
    label: 'Dashboard',
    clonePath: '/dashboard',
    originalPath: '/',
    routeMappingConfidence: 'exact',
    notes: 'Known from tests/compare.spec.ts; original navigation also links Dashboard to the site root.',
  },
  {
    label: 'Clients',
    clonePath: '/clients',
    originalPath: '/User/ClientIndex',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture.',
  },
  {
    label: 'Leads',
    clonePath: '/leads',
    originalPath: '/WebLeads/MyWebLeads',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture and agents/reports/agent-4-report.md.',
  },
  {
    label: 'Billing',
    clonePath: '/billing',
    originalPath: '/PaymentProcessor',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed original billing child route; the Billing parent is menu-only in the captured original navigation.',
  },
  {
    label: 'Disputes',
    clonePath: '/disputes',
    originalPath: '/User/DisputeCenter',
    routeMappingConfidence: 'exact',
    notes: 'Known from tests/disputes-compare.spec.ts.',
  },
  {
    label: 'Dispute Status',
    clonePath: '/disputes/status',
    originalPath: '/home/quickview',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture.',
  },
  {
    label: 'Furnisher Addresses',
    clonePath: '/dispute-manager/furnisher-addresses',
    originalPath: '/CreditorsCollectors/CreditorsCollectorsList',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture.',
  },
  {
    label: 'Letter Vault',
    clonePath: '/letter-vault',
    originalPath: '/LetterVault',
    routeMappingConfidence: 'exact',
    notes: 'Known from tests/letters-compare.spec.ts and tests/sidebar-compare.spec.ts.',
  },
  {
    label: 'AI Letter Rewriter',
    clonePath: '/letters/ai-rewriter',
    originalPath: null,
    routeMappingConfidence: 'clone-only',
    notes: 'No original equivalent is encoded in the existing compare tests.',
  },
  {
    label: 'Calendar',
    clonePath: '/calendar',
    originalPath: '/Reminder',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture and agents/reports/round-2-calendar-report.md.',
  },
  {
    label: 'Company Settings',
    clonePath: '/company/settings',
    originalPath: '/Settings',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture and parity-results/agent-5-audit/desktop-text.json.',
  },
  {
    label: 'Images/Documents',
    clonePath: '/company/images-documents',
    originalPath: null,
    routeMappingConfidence: 'clone-only',
    notes: 'Original navigation labels this item but exposes no direct href in the captured account.',
  },
  {
    label: 'Team Messages',
    clonePath: '/company/team-messages',
    originalPath: '/Messages',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture.',
  },
  {
    label: 'Automation',
    clonePath: '/automation',
    originalPath: null,
    routeMappingConfidence: 'clone-only',
    notes: 'Original navigation exposes Automation as a menu group without a direct captured route.',
  },
  {
    label: 'Documents',
    clonePath: '/company/images-documents',
    originalPath: null,
    routeMappingConfidence: 'clone-only',
    notes: 'Audit clone path changed from /documents because the clone has no /documents route; original Images/Documents has no direct captured href.',
  },
  {
    label: 'Help',
    clonePath: '/help',
    originalPath: null,
    routeMappingConfidence: 'clone-only',
    notes: 'Existing help comparison exercises the clone dashboard help menu; no original route is encoded.',
  },
  {
    label: 'Portals / Mobile App',
    clonePath: '/company/portals',
    originalPath: '/Settings/PortalsMobileApp',
    routeMappingConfidence: 'exact',
    notes: 'Confirmed from authenticated original navigation capture and agents/reports/round-2-portals-report.md; audit clone path changed from /portals because the clone has no /portals route.',
  },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

type OriginalStatus =
  | 'captured'
  | 'blocked-original-session'
  | 'original-route-fallback'
  | 'original-unexpected-redirect'
  | 'clone-only'
  | 'original-error';
type CloneStatus = 'captured' | 'clone-error';
type DiffStatus = 'matched' | 'different' | 'not-compared' | 'compare-error';
type OriginalLoginStatus = 'skipped' | 'passed' | 'failed';

type AuditEntry = {
  label: string;
  route: string;
  clonePath: string;
  originalPath: string | null;
  routeMappingConfidence: RouteMappingConfidence;
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
  diffScreenshotPath: string | null;
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

type OriginalLoginResult = {
  attempted: boolean;
  status: OriginalLoginStatus;
  notes: string[];
  storageState: StorageState | string | undefined;
};

type DiffResult = {
  status: DiffStatus;
  screenshotPath: string | null;
  percent: number | null;
  pixels: number | null;
  notes: string[];
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function routeSlug(route: string) {
  return route === '/' ? 'root' : route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function isOriginalFallbackUrl(url: string | null) {
  return Boolean(url && /\/Home\/Index\?aspxerrorpath=/i.test(url));
}

function normalizeRouteUrl(url: string) {
  const parsed = new URL(url);
  const pathname = parsed.pathname.replace(/\/+$/g, '').toLowerCase() || '/';
  return `${parsed.origin.toLowerCase()}${pathname}${parsed.search.toLowerCase()}`;
}

function isExpectedReachedUrl(requestedUrl: string, reachedUrl: string | null) {
  if (!reachedUrl) return false;
  return normalizeRouteUrl(requestedUrl) === normalizeRouteUrl(reachedUrl);
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

async function firstVisibleLocator(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible({ timeout: 1_000 }).catch(() => false)) return locator;
  }
  return null;
}

async function attemptOriginalLogin(
  browser: Browser,
  originalStorageStateAvailable: boolean,
): Promise<OriginalLoginResult> {
  if (!ORIGINAL_E2E_EMAIL || !ORIGINAL_E2E_PASSWORD) {
    const credentialNote = ORIGINAL_E2E_EMAIL || ORIGINAL_E2E_PASSWORD
      ? 'Original login skipped because only one required credential environment variable was provided.'
      : 'Original login skipped because ORIGINAL_E2E_EMAIL and ORIGINAL_E2E_PASSWORD were not provided.';

    return {
      attempted: false,
      status: 'skipped',
      notes: [
        credentialNote,
        originalStorageStateAvailable
          ? 'Existing auth-original.json storage state will be used for original captures.'
          : 'No auth-original.json storage state is available; original captures will use a fresh session.',
      ],
      storageState: originalStorageStateAvailable ? ORIGINAL_STORAGE_STATE : undefined,
    };
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const notes: string[] = [];

  try {
    await page.goto(new URL('/dashboard', ORIGINAL_BASE_URL).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await settlePage(page);

    if (!(await isOriginalLoginPage(page))) {
      notes.push('Original dashboard was already authenticated before credential fields were needed.');
      return {
        attempted: true,
        status: 'passed',
        notes,
        storageState: await context.storageState(),
      };
    }

    const emailInput = await firstVisibleLocator(page, [
      'input[type="email"]',
      'input[name*="email" i]',
      'input[id*="email" i]',
      'input[name*="user" i]',
      'input[id*="user" i]',
      'input[type="text"]',
    ]);
    const passwordInput = await firstVisibleLocator(page, ['input[type="password"]']);
    const submitButton = await firstVisibleLocator(page, [
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      'button:has-text("Log In")',
      'input[type="submit"]',
      'button[type="submit"]',
    ]);

    if (!emailInput || !passwordInput || !submitButton) {
      throw new Error('Original Business Login fields or submit control were not found.');
    }

    await emailInput.fill(ORIGINAL_E2E_EMAIL);
    await passwordInput.fill(ORIGINAL_E2E_PASSWORD);
    await submitButton.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1_000);

    await page.goto(new URL('/dashboard', ORIGINAL_BASE_URL).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await settlePage(page);

    if (await isOriginalLoginPage(page)) {
      const bodyText = await page.locator('body').innerText({ timeout: 2_000 }).catch(() => '');
      const diagnostic = bodyText.replace(/\s+/g, ' ').trim().slice(0, 300);
      throw new Error(
        `Original Business Login did not produce an authenticated dashboard.${diagnostic ? ` Login page text: ${diagnostic}` : ''}`,
      );
    }

    notes.push(`Original Business Login reached ${page.url()}.`);
    return {
      attempted: true,
      status: 'passed',
      notes,
      storageState: await context.storageState(),
    };
  } catch (error) {
    notes.push(`Original login failed: ${errorMessage(error)}`);
    return {
      attempted: true,
      status: 'failed',
      notes,
      storageState: await context.storageState().catch(() => undefined),
    };
  } finally {
    await context.close().catch(() => {});
  }
}

async function captureOriginal(
  context: BrowserContext,
  auditRoute: AuditRoute,
  viewportName: string,
): Promise<CaptureResult<OriginalStatus>> {
  if (!auditRoute.originalPath) {
    return {
      reachedUrl: null,
      status: 'clone-only',
      screenshotPath: null,
      notes: ['Original capture skipped because this audit route is clone-only.'],
    };
  }

  const page = await context.newPage();
  const requestedUrl = new URL(auditRoute.originalPath, ORIGINAL_BASE_URL).toString();
  const screenshotFile = path.join(
    SCREENSHOT_DIRECTORY,
    `${viewportName}-${routeSlug(auditRoute.label)}-original.png`,
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
    if (isOriginalFallbackUrl(page.url())) {
      notes.push('Original route mapping needs review.');
    }
    if (!blocked && !isOriginalFallbackUrl(page.url()) && !isExpectedReachedUrl(requestedUrl, page.url())) {
      notes.push(`Original route redirected unexpectedly from ${requestedUrl} to ${page.url()}; mapping needs review.`);
    }

    return {
      reachedUrl: page.url(),
      status: blocked
        ? 'blocked-original-session'
        : isOriginalFallbackUrl(page.url())
          ? 'original-route-fallback'
          : isExpectedReachedUrl(requestedUrl, page.url())
            ? 'captured'
            : 'original-unexpected-redirect',
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
  auditRoute: AuditRoute,
  viewportName: string,
): Promise<CaptureResult<CloneStatus>> {
  const page = await context.newPage();
  const requestedUrl = new URL(auditRoute.clonePath, CLONE_BASE_URL).toString();
  const screenshotFile = path.join(
    SCREENSHOT_DIRECTORY,
    `${viewportName}-${routeSlug(auditRoute.label)}-clone.png`,
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
    if (response?.status() === 404) {
      notes.push('Clone route missing or audit clonePath is wrong.');
    }

    return {
      reachedUrl: page.url(),
      status: response?.status() === 404 ? 'clone-error' : 'captured',
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

async function compareScreenshots(
  originalScreenshotPath: string | null,
  cloneScreenshotPath: string | null,
  label: string,
  viewportName: string,
): Promise<DiffResult> {
  if (!originalScreenshotPath || !cloneScreenshotPath) {
    return {
      status: 'not-compared',
      screenshotPath: null,
      percent: null,
      pixels: null,
      notes: ['Pixel comparison was skipped because one or both screenshots were unavailable.'],
    };
  }

  const originalFile = path.resolve(process.cwd(), originalScreenshotPath);
  const cloneFile = path.resolve(process.cwd(), cloneScreenshotPath);
  const diffFile = path.join(SCREENSHOT_DIRECTORY, `${viewportName}-${routeSlug(label)}-diff.png`);

  try {
    const [originalMetadata, cloneMetadata] = await Promise.all([
      sharp(originalFile).metadata(),
      sharp(cloneFile).metadata(),
    ]);
    const width = Math.max(originalMetadata.width || 0, cloneMetadata.width || 0);
    const height = Math.max(originalMetadata.height || 0, cloneMetadata.height || 0);

    if (!width || !height) throw new Error('Screenshot dimensions could not be read.');

    const normalize = (filePath: string) => sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: filePath, left: 0, top: 0 }])
      .raw()
      .toBuffer();

    const [originalPixels, clonePixels] = await Promise.all([
      normalize(originalFile),
      normalize(cloneFile),
    ]);
    const diffPixelsBuffer = Buffer.alloc(originalPixels.length);
    let differentPixels = 0;

    for (let offset = 0; offset < originalPixels.length; offset += 4) {
      const redDelta = Math.abs(originalPixels[offset] - clonePixels[offset]);
      const greenDelta = Math.abs(originalPixels[offset + 1] - clonePixels[offset + 1]);
      const blueDelta = Math.abs(originalPixels[offset + 2] - clonePixels[offset + 2]);
      const different = Math.max(redDelta, greenDelta, blueDelta) > 16;

      if (different) {
        differentPixels += 1;
        diffPixelsBuffer[offset] = 255;
        diffPixelsBuffer[offset + 1] = 0;
        diffPixelsBuffer[offset + 2] = 0;
      } else {
        const gray = Math.round(
          (originalPixels[offset] + originalPixels[offset + 1] + originalPixels[offset + 2]) / 3,
        );
        const faded = Math.round(255 - ((255 - gray) * 0.2));
        diffPixelsBuffer[offset] = faded;
        diffPixelsBuffer[offset + 1] = faded;
        diffPixelsBuffer[offset + 2] = faded;
      }
      diffPixelsBuffer[offset + 3] = 255;
    }

    await sharp(diffPixelsBuffer, { raw: { width, height, channels: 4 } }).png().toFile(diffFile);

    const totalPixels = width * height;
    const percent = Number(((differentPixels / totalPixels) * 100).toFixed(4));
    return {
      status: differentPixels === 0 ? 'matched' : 'different',
      screenshotPath: relativeOutputPath(diffFile),
      percent,
      pixels: differentPixels,
      notes: [
        `Compared ${totalPixels} pixels on a ${width}x${height} normalized canvas with a 16-level RGB channel tolerance.`,
      ],
    };
  } catch (error) {
    return {
      status: 'compare-error',
      screenshotPath: null,
      percent: null,
      pixels: null,
      notes: [`Pixel comparison error: ${errorMessage(error)}`],
    };
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
  originalLoginAttempted: boolean;
  originalLoginStatus: OriginalLoginStatus;
  originalLoginNotes: string[];
  totalEntries: number;
  originalCapturedCount: number;
  originalBlockedCount: number;
  cloneCapturedCount: number;
  cloneErrorCount: number;
  comparedCount: number;
  differentCount: number;
  exactMappingCount: number;
  guessedMappingCount: number;
  needsReviewMappingCount: number;
  cloneOnlyCount: number;
  originalFallbackCount: number;
  originalUnexpectedRedirectCount: number;
  clone404Count: number;
  entries: AuditEntry[];
}) {
  const originalErrors = report.entries.filter((entry) => entry.originalStatus === 'original-error').length;

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
    `Original login attempted: ${report.originalLoginAttempted ? 'yes' : 'no'}`,
    '',
    `Original login status: ${report.originalLoginStatus}`,
    '',
    `Original login notes: ${report.originalLoginNotes.join(' ')}`,
    '',
    '## Summary',
    '',
    `- Entries: ${report.totalEntries}`,
    `- Original captured: ${report.originalCapturedCount}`,
    `- Original session blocked: ${report.originalBlockedCount}`,
    `- Original errors: ${originalErrors}`,
    `- Clone captured: ${report.cloneCapturedCount}`,
    `- Clone errors: ${report.cloneErrorCount}`,
    `- Compared: ${report.comparedCount}`,
    `- Different: ${report.differentCount}`,
    `- Exact route mappings: ${report.exactMappingCount}`,
    `- Guessed route mappings: ${report.guessedMappingCount}`,
    `- Needs-review route mappings: ${report.needsReviewMappingCount}`,
    `- Clone-only route mappings: ${report.cloneOnlyCount}`,
    `- Original route fallbacks: ${report.originalFallbackCount}`,
    `- Original unexpected redirects: ${report.originalUnexpectedRedirectCount}`,
    `- Clone 404s: ${report.clone404Count}`,
    '',
    '## Valid Compared Mappings',
    '',
    '| Route | Viewport | Mapping confidence | Diff status | Diff percent | Original reached URL | Clone reached URL |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
  ];

  for (const entry of report.entries.filter(
    (entry) => entry.diffStatus === 'matched' || entry.diffStatus === 'different',
  )) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.routeMappingConfidence,
        entry.diffStatus,
        entry.diffPercent,
        entry.originalReachedUrl,
        entry.cloneReachedUrl,
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push(
    '',
    '## Original Fallback Mappings Needing Review',
    '',
    '| Route | Viewport | Original path | Original reached URL | Notes |',
    '| --- | --- | --- | --- | --- |',
  );

  for (const entry of report.entries.filter((entry) => entry.originalStatus === 'original-route-fallback')) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.originalPath,
        entry.originalReachedUrl,
        entry.notes.join(' '),
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push(
    '',
    '## Original Unexpected Redirect Mappings Needing Review',
    '',
    '| Route | Viewport | Original path | Original reached URL | Notes |',
    '| --- | --- | --- | --- | --- |',
  );

  for (const entry of report.entries.filter((entry) => entry.originalStatus === 'original-unexpected-redirect')) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.originalPath,
        entry.originalReachedUrl,
        entry.notes.join(' '),
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push(
    '',
    '## Clone 404 Mappings',
    '',
    '| Route | Viewport | Clone path | Clone reached URL | Notes |',
    '| --- | --- | --- | --- | --- |',
  );

  for (const entry of report.entries.filter((entry) =>
    entry.cloneStatus === 'clone-error' && entry.notes.some((note) => note.includes('Clone HTTP status: 404')),
  )) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.clonePath,
        entry.cloneReachedUrl,
        entry.notes.join(' '),
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push(
    '',
    '## Top Visual Diffs',
    '',
    '| Route | Viewport | Diff percent | Diff pixels | Diff screenshot |',
    '| --- | --- | ---: | ---: | --- |',
  );

  for (const entry of report.entries
    .filter((entry) => entry.diffStatus === 'different')
    .sort((a, b) => (b.diffPercent ?? 0) - (a.diffPercent ?? 0))
    .slice(0, 10)) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.diffPercent,
        entry.diffPixels,
        entry.diffScreenshotPath,
      ].map(markdownCell).join(' | ')} |`,
    );
  }

  lines.push(
    '',
    '## Entries',
    '',
    '| Route | Viewport | Mapping confidence | Original path | Clone path | Original status | Clone status | Original reached URL | Clone reached URL | Original screenshot | Clone screenshot | Diff screenshot | Diff status | Diff percent | Diff pixels | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- |',
  );

  for (const entry of report.entries) {
    lines.push(
      `| ${[
        entry.label,
        entry.viewport,
        entry.routeMappingConfidence,
        entry.originalPath,
        entry.clonePath,
        entry.originalStatus,
        entry.cloneStatus,
        entry.originalReachedUrl,
        entry.cloneReachedUrl,
        entry.originalScreenshotPath,
        entry.cloneScreenshotPath,
        entry.diffScreenshotPath,
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
  originalStorageState: StorageState | string | undefined,
) {
  const originalContext = await browser.newContext({
    viewport,
    storageState: originalStorageState,
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
  await rm(SCREENSHOT_DIRECTORY, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIRECTORY, { recursive: true });

  const originalStorageStateAvailable = await fileExists(ORIGINAL_STORAGE_STATE);
  const originalLogin = await attemptOriginalLogin(browser, originalStorageStateAvailable);
  const entries: AuditEntry[] = [];

  for (const viewport of VIEWPORTS) {
    const { originalContext, cloneContext } = await createContexts(
      browser,
      { width: viewport.width, height: viewport.height },
      originalLogin.storageState,
    );

    try {
      for (const auditRoute of ROUTES) {
        const [original, clone] = await Promise.all([
          captureOriginal(originalContext, auditRoute, viewport.name),
          captureClone(cloneContext, auditRoute, viewport.name),
        ]);

        const comparable = original.status === 'captured' && clone.status === 'captured';
        const diff = comparable
          ? await compareScreenshots(
              original.screenshotPath,
              clone.screenshotPath,
              auditRoute.label,
              viewport.name,
            )
          : {
              status: 'not-compared' as const,
              screenshotPath: null,
              percent: null,
              pixels: null,
              notes: ['Pixel comparison was skipped because both pages were not captured.'],
            };

        const notes = [...original.notes, ...clone.notes, ...diff.notes];
        if (auditRoute.notes) notes.unshift(auditRoute.notes);
        if (!originalLogin.storageState) {
          notes.push('auth-original.json was unavailable; original capture used a fresh session.');
        }

        entries.push({
          label: auditRoute.label,
          route: auditRoute.clonePath,
          clonePath: auditRoute.clonePath,
          originalPath: auditRoute.originalPath,
          routeMappingConfidence: original.status === 'original-route-fallback'
            || original.status === 'original-unexpected-redirect'
            ? 'needs-review'
            : auditRoute.routeMappingConfidence,
          viewport: viewport.name,
          viewportSize: { width: viewport.width, height: viewport.height },
          originalRequestedUrl: auditRoute.originalPath
            ? new URL(auditRoute.originalPath, ORIGINAL_BASE_URL).toString()
            : '',
          originalReachedUrl: original.reachedUrl,
          originalStatus: original.status,
          originalScreenshotPath: original.screenshotPath,
          cloneRequestedUrl: new URL(auditRoute.clonePath, CLONE_BASE_URL).toString(),
          cloneReachedUrl: clone.reachedUrl,
          cloneStatus: clone.status,
          cloneScreenshotPath: clone.screenshotPath,
          diffStatus: diff.status,
          diffScreenshotPath: diff.screenshotPath,
          diffPercent: diff.percent,
          diffPixels: diff.pixels,
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

  const originalCapturedCount = entries.filter((entry) => entry.originalStatus === 'captured').length;
  const originalBlockedCount = entries.filter(
    (entry) => entry.originalStatus === 'blocked-original-session',
  ).length;
  const cloneCapturedCount = entries.filter((entry) => entry.cloneStatus === 'captured').length;
  const cloneErrorCount = entries.filter((entry) => entry.cloneStatus === 'clone-error').length;
  const comparedCount = entries.filter(
    (entry) => entry.diffStatus === 'matched' || entry.diffStatus === 'different',
  ).length;
  const differentCount = entries.filter((entry) => entry.diffStatus === 'different').length;
  const routeConfidenceByLabel = new Map<string, RouteMappingConfidence>();
  for (const route of ROUTES) {
    routeConfidenceByLabel.set(route.label, route.routeMappingConfidence);
  }
  for (const entry of entries) {
    if (entry.routeMappingConfidence === 'needs-review') {
      routeConfidenceByLabel.set(entry.label, 'needs-review');
    }
  }
  const routeConfidenceCounts = [...routeConfidenceByLabel.values()].reduce<Record<RouteMappingConfidence, number>>(
    (counts, confidence) => {
      counts[confidence] += 1;
      return counts;
    },
    { exact: 0, guessed: 0, 'needs-review': 0, 'clone-only': 0 },
  );
  const originalFallbackCount = entries.filter(
    (entry) => entry.originalStatus === 'original-route-fallback',
  ).length;
  const originalUnexpectedRedirectCount = entries.filter(
    (entry) => entry.originalStatus === 'original-unexpected-redirect',
  ).length;
  const clone404Count = entries.filter((entry) =>
    entry.cloneStatus === 'clone-error' && entry.notes.some((note) => note.includes('Clone HTTP status: 404')),
  ).length;

  const report = {
    generatedAt: new Date().toISOString(),
    originalBaseUrl: ORIGINAL_BASE_URL,
    cloneBaseUrl: CLONE_BASE_URL,
    originalStorageStateAvailable,
    originalLoginAttempted: originalLogin.attempted,
    originalLoginStatus: originalLogin.status,
    originalLoginNotes: originalLogin.notes,
    totalEntries: entries.length,
    originalCapturedCount,
    originalBlockedCount,
    cloneCapturedCount,
    cloneErrorCount,
    comparedCount,
    differentCount,
    exactMappingCount: routeConfidenceCounts.exact,
    guessedMappingCount: routeConfidenceCounts.guessed,
    needsReviewMappingCount: routeConfidenceCounts['needs-review'],
    cloneOnlyCount: routeConfidenceCounts['clone-only'],
    originalFallbackCount,
    originalUnexpectedRedirectCount,
    clone404Count,
    routes: ROUTES.map((route) => ({ ...route })),
    viewports: VIEWPORTS.map((viewport) => ({ ...viewport })),
    entries,
  };

  await Promise.all([
    writeFile(path.join(OUTPUT_DIRECTORY, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(path.join(OUTPUT_DIRECTORY, 'report.md'), buildMarkdownReport(report), 'utf8'),
  ]);

  expect(entries.length).toBe(ROUTES.length * VIEWPORTS.length);
});
