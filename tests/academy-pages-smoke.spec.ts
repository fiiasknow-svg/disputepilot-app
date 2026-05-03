import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://disputepilot-app.vercel.app';

const academyPages = [
  {
    path: '/academy/credit-repair',
    courseName: 'Credit Repair Specialist',
    topicName: 'Credit Repair',
  },
  {
    path: '/academy/fcra',
    courseName: 'FCRA Specialist',
    topicName: 'FCRA',
  },
  {
    path: '/academy/fdcpa',
    courseName: 'FDCPA Specialist',
    topicName: 'FDCPA',
  },
  {
    path: '/academy/fcba',
    courseName: 'FCBA Specialist',
    topicName: 'FCBA',
  },
  {
    path: '/academy/compliance',
    courseName: 'Compliance Specialist',
    topicName: 'Compliance',
  },
  {
    path: '/academy/rebuild',
    courseName: 'Rebuild Credit Specialist',
    topicName: 'Rebuild Credit',
  },
  {
    path: '/academy/fico',
    courseName: 'FICO Score Specialist',
    topicName: 'FICO',
  },
  {
    path: '/academy/automation',
    courseName: 'Automation Specialist',
    topicName: 'Automation',
  },
  {
    path: '/academy/funding',
    courseName: 'Funding Specialist',
    topicName: 'Funding',
  },
];

test.describe('academy pages are visible and useful', () => {
  for (const pageInfo of academyPages) {
    test(`${pageInfo.path} loads academy content`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await expect(page.getByRole('heading', { name: pageInfo.courseName, exact: true })).toBeVisible();
      const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      expect(bodyText).toContain(pageInfo.topicName);
      expect(bodyText).toContain('lessons');
      expect(bodyText).toContain('Certificate');
      expect(bodyText).toMatch(/course details/i);
      await expect(page.getByRole('button', { name: 'Begin Course' })).toBeVisible();
    });
  }
});
