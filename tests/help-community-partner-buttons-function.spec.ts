import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3201";

const partnerCards = [
  ["Merchant Accounts", "/partner-resources/merchant-accounts"],
  ["Monitoring Commissions", "/partner-resources/monitoring-commissions"],
  ["Dispute Outsourcing", "/partner-resources/dispute-outsourcing"],
  ["Rebuild Credit Affiliate", "/partner-resources/rebuild-credit-affiliate"],
  ["Partner & Earn", "/partner-resources/partner-and-earn"],
  ["Save with Annual Plan", "/partner-resources/save-and-annual-plan"],
  ["Offer Free Vacations", "/partner-resources/offer-free-vacations"],
  ["Offer Business Funding", "/partner-resources/offer-business-funding"],
  ["Credit Repair Class", "/partner-resources/credit-repair-class"],
  ["Community", "/partner-resources/community"],
];

const detailRoutes = [
  "/partner-resources/merchant-accounts",
  "/partner-resources/monitoring-commissions",
  "/partner-resources/dispute-outsourcing",
  "/partner-resources/attorney-review",
  "/partner-resources/rebuild-credit-affiliate",
  "/partner-resources/partner-and-earn",
  "/partner-resources/save-and-annual-plan",
  "/partner-resources/offer-free-vacations",
  "/partner-resources/offer-business-funding",
  "/partner-resources/credit-repair-class",
  "/partner-resources/community",
];

async function expectNoAppError(page: Page) {
  await expect(page.locator("body")).not.toContainText(/404|Application error|Runtime Error/i);
}

test("help route renders support options and Need Help opens the help menu", async ({ page }) => {
  await page.goto(`${BASE_URL}/help`);
  await expect(page.getByRole("heading", { name: "Help", exact: true })).toBeVisible();
  for (const option of ["Get Support", "Help Center", "FAQ", "Success Path", "1-on-1 Coaching", "AI Credit Coach"]) {
    await expect(page.getByRole("link", { name: new RegExp(option) }).first()).toBeVisible();
  }
  await expectNoAppError(page);

  await page.goto(`${BASE_URL}/dashboard`);
  await page.getByRole("button", { name: "Need Help?", exact: true }).click();
  for (const option of ["Get Support", "Help Center", "FAQ", "Success Path", "1-on-1 Coaching", "AI Credit Coach"]) {
    await expect(page.getByRole("link", { name: new RegExp(option) }).first()).toBeVisible();
  }
});

test("community route redirects to community UI with channel and category behavior", async ({ page }) => {
  await page.goto(`${BASE_URL}/community`);
  await expect(page).toHaveURL(/\/partner-resources\/community$/);
  await expect(page.getByRole("heading", { name: "Community", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Showing General Discussion" })).toBeVisible();

  await page.getByRole("button", { name: /Marketing & Growth/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Showing Marketing & Growth" })).toBeVisible();
  await expect(page.getByText("How I got 3 referral partnerships with local realtors in 2 weeks")).toBeVisible();

  await page.getByRole("button", { name: "Strategy", exact: true }).click();
  await expect(page.getByText("How I got 3 referral partnerships with local realtors in 2 weeks")).toBeVisible();
  await page.getByRole("button", { name: "Question", exact: true }).click();
  await expect(page.getByText("No posts match Marketing & Growth with the Question category filter.")).toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByText("How I got 3 referral partnerships with local realtors in 2 weeks")).toBeVisible();
});

test("community new post shows validation and still creates valid local posts", async ({ page }) => {
  await page.goto(`${BASE_URL}/partner-resources/community`);
  await page.getByRole("button", { name: /Revenue & Pricing/ }).click();
  await page.getByRole("button", { name: "+ New Post", exact: true }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("Enter a title and content before posting.", { exact: true })).toBeVisible();

  await page.getByPlaceholder("What's your post about?").fill("Pricing question from automation");
  await page.getByPlaceholder(/Share your experience/).fill("How should I package monitoring with disputes?");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("Pricing question from automation")).toBeVisible();
});

test("partner overview cards navigate to their detail pages", async ({ page }) => {
  for (const [title, destination] of partnerCards) {
    await page.goto(`${BASE_URL}/partner-resources`);
    await page.getByRole("heading", { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expectNoAppError(page);
  }
});

test("partner detail back controls return to partner resources", async ({ page }) => {
  for (const route of detailRoutes) {
    await page.goto(`${BASE_URL}${route}`);
    await page.getByRole("button", { name: /Back to Partner Resources/ }).click();
    await expect(page).toHaveURL(/\/partner-resources$/);
    await expect(page.getByRole("heading", { name: "Partner Resources", exact: true })).toBeVisible();
  }
});

test("dispute outsourcing Get Started opens selected-plan intake modal and status", async ({ page }) => {
  await page.goto(`${BASE_URL}/partner-resources/dispute-outsourcing`);
  const buttons = page.getByRole("button", { name: "Get Started", exact: true });
  const plans = ["Pay Per Dispute", "Starter Bundle", "Growth Bundle", "Enterprise"];

  for (let index = 0; index < plans.length; index += 1) {
    await buttons.nth(index).click();
    await expect(page.getByRole("dialog", { name: "Dispute Outsourcing Intake" })).toBeVisible();
    await expect(page.getByText(`Selected plan: ${plans[index]}`)).toBeVisible();
    await page.getByRole("button", { name: "Save Interest", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(`Interest saved locally for ${plans[index]}.`);
    await page.getByRole("button", { name: "Close", exact: true }).click();
  }
});

test("save annual plan CTAs carry plan and cadence to subscription", async ({ page }) => {
  await page.goto(`${BASE_URL}/partner-resources/save-and-annual-plan`);
  await page.getByRole("button", { name: "Switch to Annual", exact: true }).nth(1).click();
  await expect(page).toHaveURL(/\/billing\/subscription\?plan=standard&billing=annual$/);
  await expect(page.getByRole("status")).toContainText("Standard Plan selected with annual billing.");

  await page.goto(`${BASE_URL}/partner-resources/save-and-annual-plan`);
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await page.getByRole("button", { name: "Get Started", exact: true }).nth(2).click();
  await expect(page).toHaveURL(/\/billing\/subscription\?plan=premium&billing=monthly$/);
  await expect(page.getByRole("status")).toContainText("Premium Plan selected with monthly billing.");
});
