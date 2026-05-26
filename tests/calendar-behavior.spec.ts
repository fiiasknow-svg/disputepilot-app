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
  'Today',
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

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem('disputepilot.calendar-reminders');
    window.localStorage.removeItem('disputepilot.calendar-events-lite');
  });
});

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

test('calendar previous next and today month navigation update the visible month', async ({ page }) => {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await page.goto(`${BASE_URL}/calendar`);
  await expect(page.getByText(monthLabel(now), { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Previous month' }).click();
  await expect(page.getByText(monthLabel(previous), { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByText(monthLabel(now), { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByText(monthLabel(next), { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.getByText(monthLabel(now), { exact: true })).toBeVisible();
  await expect(page.getByText(`Selected date: ${dateValue(now)}. Reminder scheduled and end dates are ready.`)).toBeVisible();
});

test('calendar date-cell selection visibly highlights and prefills reminder dates', async ({ page }) => {
  const target = new Date();
  target.setDate(15);
  const targetDate = dateValue(target);

  await page.goto(`${BASE_URL}/calendar`);
  const day = page.getByRole('button', { name: new RegExp(`^${targetDate}`) });
  await day.click();

  await expect(day).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(`Selected date: ${targetDate}. Reminder scheduled and end dates are ready.`)).toBeVisible();
  await expect(page.locator('input[type="date"]').nth(0)).toHaveValue(targetDate);
  await expect(page.locator('input[type="date"]').nth(1)).toHaveValue(targetDate);
});

test('calendar tools view buttons active state and status update', async ({ page }) => {
  await page.goto(`${BASE_URL}/calendar`);
  await page.getByRole('button', { name: 'Event Calendar Tools' }).click();

  for (const view of ['Month', 'Week', 'Day', 'Agenda']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await expect(page.getByRole('button', { name: view, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(`Showing ${view} view. Agent is a local event filter.`)).toBeVisible();
  }
});

test('calendar event type agent and upcoming filters affect visible events', async ({ page }) => {
  const now = new Date();
  const insideDate = dateValue(now);
  const outsideDate = dateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 45));
  const meetingTitle = `Meeting filter event ${Date.now()}`;
  const deadlineTitle = `Deadline filter event ${Date.now()}`;
  const distantTitle = `Distant filter event ${Date.now()}`;

  await page.goto(`${BASE_URL}/calendar`);

  await page.getByRole('button', { name: '+ Add Event' }).click();
  await page.getByPlaceholder(/Event title/i).fill(meetingTitle);
  await page.getByRole('combobox', { name: 'Event Type' }).selectOption('Meeting');
  await page.getByRole('combobox', { name: 'Assigned Agent' }).selectOption('Assigned Agent');
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();

  await page.getByRole('button', { name: '+ Add Event' }).click();
  await page.getByPlaceholder(/Event title/i).fill(deadlineTitle);
  await page.getByRole('combobox', { name: 'Event Type' }).selectOption('Deadline');
  await page.getByRole('combobox', { name: 'Assigned Agent' }).selectOption('Unassigned');
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();

  await page.getByRole('button', { name: '+ Add Event' }).click();
  await page.getByPlaceholder(/Event title/i).fill(distantTitle);
  await page.getByRole('dialog').locator('input[type="date"]').fill(outsideDate);
  await page.getByRole('combobox', { name: 'Event Type' }).selectOption('Deadline');
  await page.getByRole('combobox', { name: 'Assigned Agent' }).selectOption('Assigned Agent');
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();

  await expect(page.getByText(meetingTitle)).toBeVisible();
  await expect(page.getByText(deadlineTitle)).toBeVisible();
  await expect(page.getByText(distantTitle)).toBeVisible();

  await page.getByRole('button', { name: 'Event Calendar Tools' }).click();
  await page.getByRole('combobox', { name: 'Event Types' }).selectOption('Deadline');
  await expect(page.getByText(meetingTitle)).toHaveCount(0);
  await expect(page.getByText(deadlineTitle)).toBeVisible();
  await expect(page.getByText(distantTitle)).toBeVisible();

  await page.getByRole('combobox', { name: 'All Agents' }).selectOption('Assigned Agent');
  await expect(page.getByText(deadlineTitle)).toHaveCount(0);
  await expect(page.getByText(distantTitle)).toBeVisible();

  await page.getByRole('button', { name: 'Upcoming (30 days)' }).click();
  await expect(page.getByRole('button', { name: 'Upcoming (30 days)' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(distantTitle)).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Event Types' }).selectOption('All Types');
  await expect(page.getByText(meetingTitle)).toBeVisible();
  await expect(page.getByText(insideDate, { exact: true })).toBeVisible();
});

test('blank calendar reminder and blank event show visible validation', async ({ page }) => {
  await page.goto(`${BASE_URL}/calendar`);

  await page.getByRole('button', { name: 'Save Reminder' }).click();
  await expect(page.getByText('Enter customer and reminder title before saving.')).toBeVisible();

  await page.getByRole('button', { name: '+ Add Event' }).click();
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'New Event' })).toBeVisible();
  await expect(page.getByText('Enter an event title before adding the event.')).toBeVisible();
});

test('iCal download includes created event metadata and reminder todo', async ({ page }) => {
  const eventTitle = `Export event ${Date.now()}`;
  const reminderTitle = `Export reminder ${Date.now()}`;

  await page.goto(`${BASE_URL}/calendar`);
  await page.getByRole('button', { name: '+ Add Event' }).click();
  await page.getByPlaceholder(/Event title/i).fill(eventTitle);
  await page.getByRole('combobox', { name: 'Event Type' }).selectOption('Deadline');
  await page.getByRole('combobox', { name: 'Assigned Agent' }).selectOption('Assigned Agent');
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();

  await page.getByPlaceholder('Customer name').fill('Leslie Sabek');
  await page.getByPlaceholder('Reminder title').fill(reminderTitle);
  await page.getByRole('button', { name: 'Save Reminder', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export iCal' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const content = fs.readFileSync(downloadPath!, 'utf8');

  expect(content).toContain('BEGIN:VCALENDAR');
  expect(content).toContain(`SUMMARY:${eventTitle}`);
  expect(content).toContain('Type: Deadline');
  expect(content).toContain('Agent: Assigned Agent');
  expect(content).toContain('BEGIN:VTODO');
  expect(content).toContain(`SUMMARY:${reminderTitle}`);
});
