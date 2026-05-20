import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';
const RESULT_DIR = path.join('parity-results', 'calendar');

const ORIGINAL_REMINDER_SURFACE = [
  'Calendar',
  'Dashboard',
  'BACK',
  'In this area, you can set reminders for each customer in the software.',
  'Reminder',
  'Scheduled Reminder',
  'Read Reminder',
  'Past Due',
  'TODAY',
  'Reminders',
  'Mark All as Read',
  'Customer',
  'Reminder Title',
  'Schedule Date',
  'Schedule Time',
  'End Date',
  'End Time',
  'Type of Reminder',
  'Read',
  'Action',
  'No Reminder Found.',
];

const PREVIOUS_CLONE_EXTRA_GROUPS = [
  'Month Week Day Agenda',
  'All Types',
  'All Agents',
  'Upcoming (30 days)',
  'Event Types',
  'appointment followup deadline',
  'lead invoice dispute',
];

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function writeParityArtifacts(bodyText: string) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });

  const missingFromClone = ORIGINAL_REMINDER_SURFACE.filter((item) => !bodyText.includes(item));
  const differentFromOriginal = [
    'Original /Reminder is reminder-table oriented; clone now starts with reminder tabs, Mark All as Read, customer reminder fields, and the no-reminder empty state.',
  ].filter((item) => missingFromClone.length > 0 && item);
  const extraInClone = [
    ...PREVIOUS_CLONE_EXTRA_GROUPS.filter((item) => bodyText.includes(item)),
    ...['Export iCal', '+ Add Event', 'Event Calendar Tools'].filter((item) => bodyText.includes(item)),
  ];

  fs.writeFileSync(path.join(RESULT_DIR, 'missing-from-clone.json'), JSON.stringify(missingFromClone, null, 2));
  fs.writeFileSync(path.join(RESULT_DIR, 'different-from-original.json'), JSON.stringify(differentFromOriginal, null, 2));
  fs.writeFileSync(path.join(RESULT_DIR, 'extra-in-clone.json'), JSON.stringify(extraInClone, null, 2));

  return { missingFromClone, differentFromOriginal, extraInClone };
}

test('calendar page matches reminder-table first surface and remains usable', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', error => pageErrors.push(error));
  await page.addInitScript(() => {
    window.localStorage.removeItem('disputepilot.calendar-reminders');
    window.localStorage.removeItem('disputepilot.calendar-events-lite');
  });

  await page.goto(`${BASE_URL}/calendar`);
  await expect(page.locator('body')).toBeVisible();
  const initialBody = normalize(await page.locator('body').innerText());
  const artifacts = writeParityArtifacts(initialBody);

  expect(artifacts.missingFromClone).toEqual([]);
  expect(artifacts.differentFromOriginal).toEqual([]);
  expect(artifacts.extraInClone).toEqual(['Export iCal', '+ Add Event', 'Event Calendar Tools']);

  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.getByText('Scheduled Reminder', { exact: true })).toBeVisible();
  await expect(page.getByText('Read Reminder', { exact: true })).toBeVisible();
  await expect(page.getByText('Past Due', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark All as Read', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'No Reminder Found.', exact: true })).toBeVisible();

  const reminderTitle = `Calendar reminder parity ${Date.now()}`;
  await page.getByPlaceholder('Customer name').fill('Leslie Sabek');
  await page.getByPlaceholder('Reminder title').fill(reminderTitle);
  await page.getByRole('button', { name: 'Save Reminder', exact: true }).click();
  await expect(page.getByText(reminderTitle, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mark All as Read', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Yes', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '+ Add Event', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'New Event', exact: true })).toBeVisible();
  const eventTitle = `Secondary event ${Date.now()}`;
  await page.getByPlaceholder(/Event title/i).fill(eventTitle);
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();
  await expect(page.getByText(eventTitle, { exact: true })).toBeVisible();

  await expect(page.getByText(/404|Application error|Runtime Error/i)).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
