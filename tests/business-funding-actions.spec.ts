import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3201";

test("business funding referral is a local visible form, not a fake partner submit", async ({ page }) => {
  await page.goto(`${BASE_URL}/partner-resources/offer-business-funding`);
  await page.getByRole("button", { name: "Submit Funding Referral" }).click();
  await expect(page.getByRole("heading", { name: "Submit Funding Referral" })).toBeVisible();
  await expect(page.getByText(/Local\/no backend partner submission/i)).toBeVisible();
  await page.getByLabel("Business Name").fill("Client Bakery LLC");
  await page.getByLabel("Contact").fill("owner@example.test");
  await page.getByLabel("Monthly Revenue").fill("$42,000");
  await page.getByLabel("Funding Amount").fill("$75,000");
  await page.getByLabel("Notes").fill("Interested in working capital");
  await page.getByRole("button", { name: "Submit Referral" }).click();
  await expect(page.getByRole("status")).toContainText(/Local funding referral saved/i);
});
