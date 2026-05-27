import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3201';

async function clearMessages(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/company/team-messages`);
  await page.evaluate(() => {
    window.localStorage.removeItem('disputepilot.teamMessages.local');
  });
  await page.reload();
}

test('team messages compose, search, tabs, reply, read, and delete persist through reload', async ({ page }) => {
  await clearMessages(page);

  await page.getByRole('button', { name: '+ Compose' }).click();
  await page.getByPlaceholder('Message subject').fill('Local persistence check');
  await page.getByPlaceholder(/Write your message/).fill('This message should stay in sent after reload.');
  await page.getByRole('button', { name: 'high' }).click();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText('Message saved to Sent locally');
  await expect(page.getByRole('button', { name: /sent/i })).toHaveCSS('font-weight', /700|bold/);
  await expect(page.getByText('Local persistence check')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'sent' }).click();
  await expect(page.getByText('Local persistence check')).toBeVisible();
  await page.getByPlaceholder(/Search messages/).fill('persistence');
  await expect(page.getByText('Local persistence check')).toBeVisible();
  await page.getByPlaceholder(/Search messages/).fill('no-match-value');
  await expect(page.getByText('No messages.')).toBeVisible();
  await page.getByPlaceholder(/Search messages/).fill('');

  await page.getByText('Local persistence check').click();
  await page.getByPlaceholder(/Write a reply/).fill('Persist this reply locally.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Persist this reply locally.')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'sent' }).click();
  await page.getByText('Local persistence check').click();
  await expect(page.getByText('Persist this reply locally.')).toBeVisible();

  await page.getByRole('button', { name: 'inbox' }).click();
  await page.getByRole('button', { name: 'Mark All Read' }).click();
  await expect(page.getByText('All messages read', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('All messages read', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'sent' }).click();
  await page.getByText('Local persistence check').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('status')).toContainText('Message archived locally');
  await page.reload();
  await page.getByRole('button', { name: 'sent' }).click();
  await expect(page.getByText('Local persistence check')).toHaveCount(0);
});

test('compose cancel clears the draft', async ({ page }) => {
  await clearMessages(page);

  await page.getByRole('button', { name: '+ Compose' }).click();
  await page.getByPlaceholder('Message subject').fill('Draft subject');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: '+ Compose' }).click();
  await expect(page.getByPlaceholder('Message subject')).toHaveValue('');
});
