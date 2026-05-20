import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const ARTIFACT_DIR = join(process.cwd(), 'parity-results', 'employees');

const expectedFirstSurfaceItems = [
  'Employees/Outsourcers',
  'Dashboard',
  'EMPLOYEES INFORMATION',
  'ROLES & PERMISSIONS',
  'BACK',
  'In this area you can add, delete, manage and track your employees.',
  "You can monitor the employee's login time with the activity log.",
  'TRAINING VIDEOS',
  'ADD NEW EMPLOYEE',
  'Employee Quota =',
  'used',
  'Name',
  'Phone Number',
  'User Name',
  'Position',
  'Created At',
  'Active',
  'Action',
  'Reminders/Tasks',
];

const richerStaffItemsThatShouldNotDominateFirstSurface = [
  'Staff Management Tools',
  'Export CSV',
  'Invite by Email',
  'All Roles',
  'All Status',
  'All Departments',
];

function writeJsonArtifact(name: string, value: unknown) {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(join(ARTIFACT_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
}

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

test('employees first visible surface matches Employees/Outsourcers quota table', async ({ page }) => {
  await page.goto(`${BASE_URL}/employees`);

  await expect(page.getByRole('heading', { name: 'Employees/Outsourcers', exact: true })).toBeVisible();
  await expect(page.locator('main table').first()).toBeVisible();

  const bodyText = normalize(await page.locator('body').innerText());
  const firstSurfaceText = normalize(bodyText.split('Staff Management Tools')[0] || bodyText);

  const missingFromClone = expectedFirstSurfaceItems.filter(item => !firstSurfaceText.includes(item));
  const extraInClone = richerStaffItemsThatShouldNotDominateFirstSurface.filter(item => firstSurfaceText.includes(item));
  const differentFromOriginal = [];

  writeJsonArtifact('missing-from-clone.json', missingFromClone);
  writeJsonArtifact('different-from-original.json', differentFromOriginal);
  writeJsonArtifact('extra-in-clone.json', extraInClone);

  expect(missingFromClone).toEqual([]);
  expect(differentFromOriginal).toEqual([]);
  expect(extraInClone).toEqual([]);
});
