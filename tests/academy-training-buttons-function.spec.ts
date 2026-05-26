import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

test('academy catalog links to every visible course and rebuild-credit aliases to rebuild', async ({ page }) => {
  await page.goto(`${BASE_URL}/academy`);

  await expect(page.getByRole('heading', { name: 'CRB Academy' })).toBeVisible();
  const courseHrefs = [
    '/academy/credit-repair',
    '/academy/fdcpa',
    '/academy/fcra',
    '/academy/fcba',
    '/academy/compliance',
    '/academy/rebuild',
    '/academy/fico',
    '/academy/automation',
    '/academy/funding',
  ];
  for (const href of courseHrefs) {
    await expect(page.locator(`a[href="${href}"]`).last()).toBeVisible();
  }

  await page.goto(`${BASE_URL}/academy/rebuild-credit`);
  await expect(page).toHaveURL(/\/academy\/rebuild$/);
  await expect(page.getByRole('heading', { name: 'Rebuild Credit Specialist', exact: true })).toBeVisible();
});

test('academy video play opens a visible placeholder player and non-video lessons do not show play', async ({ page }) => {
  await page.goto(`${BASE_URL}/academy/credit-repair`);
  await page.getByRole('button', { name: 'Begin Course' }).click();

  await page.getByRole('button', { name: /Play What is Credit Repair/i }).click();
  await expect(page.getByRole('dialog', { name: 'What is Credit Repair?' })).toBeVisible();
  await expect(page.getByText(/No hosted video source is connected/i)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByText('The 3 Major Bureaus Explained').click();
  await expect(page.getByRole('button', { name: /Play The 3 Major Bureaus Explained/i })).toHaveCount(0);
});

test('academy progress persists locally after reload', async ({ page }) => {
  await page.goto(`${BASE_URL}/academy/automation`);
  await page.evaluate(() => window.localStorage.removeItem('academy-progress:automation-specialist'));
  await page.reload();

  await page.getByRole('button', { name: 'Begin Course' }).click();
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(page.getByText('1 of 21 lessons complete')).toBeVisible();

  await page.reload();
  await expect(page.getByText('1 of 21 lessons complete')).toBeVisible();
  await expect(page.getByRole('button', { name: /20 lessons left/i })).toBeDisabled();
});
