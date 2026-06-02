import { expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

async function waitForDashboardShell(page: Page) {
  await page.waitForSelector('.cdm-topbar, .cdm-dashboard-page', {
    state: 'visible',
    timeout: 20_000,
  });
}

export async function loginIfNeeded(page: Page) {
  await page.goto(new URL('/dashboard', BASE_URL).toString(), { waitUntil: 'domcontentloaded' });

  const businessLoginHeading = page.getByRole('heading', { name: /Business Login/i });
  const businessLoginVisible = await businessLoginHeading.isVisible({ timeout: 5_000 }).catch(() => false);

  if (!businessLoginVisible) {
    console.log('[live-auth] Business Login was not visible; waiting for existing authenticated dashboard shell.');
    await waitForDashboardShell(page);
    return;
  }

  console.log('[live-auth] Business Login detected; signing in with E2E credentials.');

  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Business Login is required for live admin routes, but E2E_EMAIL and/or E2E_PASSWORD are missing. Set both env vars before running the authenticated live smoke spec.',
    );
  }

  await page.getByLabel(/^Email$/i).fill(email);
  await page.getByLabel(/^Password$/i).fill(password);
  await page.getByRole('button', { name: /^Sign In$/i }).click();

  try {
    await waitForDashboardShell(page);
  } catch (error) {
    const statusText = await page.getByRole('status').innerText({ timeout: 1_000 }).catch(() => '');
    const diagnostic = statusText ? ` Business Login status: "${statusText}"` : '';
    throw new Error(`Business Login submitted, but the dashboard shell did not appear.${diagnostic}`, {
      cause: error,
    });
  }

  await expect(page.locator('.cdm-topbar'), 'Authenticated dashboard shell should include the CDM topbar').toBeVisible();
}

export { BASE_URL };
