import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3201";

const resources = [
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
] as const;

async function goto(path: string, page: Page) {
  await page.goto(`${BASE_URL}${path}`);
}

test("partner resources overview cards navigate to their detail pages", async ({ page }) => {
  for (const [title, path] of resources) {
    await goto("/partner-resources", page);
    await page.getByRole("heading", { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, "\\/")}$`));
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
});

test("sidebar partner resources and get customers links navigate", async ({ page }) => {
  const sidebarLinks = [
    ["Get Customers", "/get-customers/get-customers"],
    ["Start - Run - Grow", "/get-customers/start-run-grow"],
    ["Business Strategies", "/get-customers/business-strategies"],
    ["Merchant Accounts", "/partner-resources/merchant-accounts"],
    ["Monitoring Commissions", "/partner-resources/monitoring-commissions"],
    ["Attorney Review", "/partner-resources/attorney-review"],
    ["Offer Business Funding", "/partner-resources/offer-business-funding"],
  ] as const;

  for (const [label, path] of sidebarLinks) {
    await goto("/partner-resources", page);
    await page.getByRole("link", { name: label, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, "\\/")}$`));
  }
});

test("merchant processor request modal saves local interest", async ({ page }) => {
  await goto("/partner-resources/merchant-accounts", page);
  await expect(page.getByRole("button", { name: "Request Processor Link" })).toHaveCount(4);
  await page.getByRole("button", { name: "Request Processor Link" }).first().click();
  await expect(page.getByRole("heading", { name: "Request Processor Link" })).toBeVisible();
  await expect(page.getByText(/Selected processor: PayHQ/i)).toBeVisible();
  await expect(page.getByText(/partner application URL is not connected/i)).toBeVisible();
  await page.getByRole("button", { name: "Save Interest" }).click();
  await expect(page.getByRole("status")).toContainText(/Local interest saved for PayHQ/i);
});

test("monitoring provider affiliate modal copies local tracking context", async ({ page }) => {
  await goto("/partner-resources/monitoring-commissions", page);
  await expect(page.getByRole("button", { name: "Request Affiliate Link" })).toHaveCount(4);
  await page.getByRole("button", { name: "Request Affiliate Link" }).first().click();
  await expect(page.getByRole("heading", { name: "Request Affiliate Link" })).toBeVisible();
  await expect(page.getByText(/Selected provider: SmartCredit/i)).toBeVisible();
  await page.getByRole("button", { name: "Save Interest" }).click();
  await expect(page.getByRole("status")).toContainText(/Real provider link is not connected/i);
});

test("rebuild credit affiliate product CTAs are explicit local demo actions", async ({ page }) => {
  await goto("/partner-resources/rebuild-credit-affiliate", page);
  await expect(page.getByRole("button", { name: "Copy Affiliate Link" })).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Copy Free Tool Link" })).toHaveCount(1);
  await page.getByRole("button", { name: "Request Link" }).nth(4).click();
  await expect(page.getByRole("heading", { name: "Request Link" })).toBeVisible();
  await expect(page.getByText(/recommended free tool with no commission/i)).toBeVisible();
});

test("partner and earn copies local referral link and recalculates slider", async ({ page }) => {
  await goto("/partner-resources/partner-and-earn", page);
  await page.getByRole("button", { name: "Copy Referral Link" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Local demo referral link copied/i })).toBeVisible();
  await page.getByRole("slider").fill("31");
  await expect(page.getByText("$3,100")).toBeVisible();
  await expect(page.getByText("$37,200/year")).toBeVisible();
});

test("dispute outsourcing persists interest and saves local intake", async ({ page }) => {
  await goto("/partner-resources/dispute-outsourcing", page);
  await page.getByRole("button", { name: "Get Started" }).first().click();
  await expect(page.getByRole("heading", { name: "Dispute Outsourcing Intake" })).toBeVisible();
  await page.getByRole("button", { name: "Save Interest" }).click();
  await expect(page.getByRole("status")).toContainText(/Interest saved locally for Pay Per Dispute/i);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Local Intake Form" })).toBeVisible();
  await page.getByLabel("Contact").fill("ops@example.test");
  await page.getByLabel("Client Count").fill("12");
  await page.getByLabel("Notes").fill("Need starter handoff");
  await page.getByRole("button", { name: "Save Intake" }).click();
  await expect(page.getByRole("status")).toContainText(/Local intake saved for Pay Per Dispute/i);
});

test("attorney review saves local request without pretending scheduling", async ({ page }) => {
  await goto("/partner-resources/attorney-review", page);
  await page.getByRole("button", { name: "Request Attorney Review" }).click();
  await page.getByLabel("Client Name").fill("Avery Client");
  await page.getByLabel("Notes").fill("Repeated verification failure");
  await page.getByRole("button", { name: "Save Request" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Local attorney review request saved/i }).first()).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Backend scheduling is not connected/i }).first()).toBeVisible();
});

test("vacation certificates save local package interest", async ({ page }) => {
  await goto("/partner-resources/offer-free-vacations", page);
  await page.getByRole("button", { name: "Select Package" }).nth(1).click();
  await expect(page.getByRole("heading", { name: "Vacation Certificate Setup" })).toBeVisible();
  await expect(page.getByText(/Package: Orlando, FL/i)).toBeVisible();
  await page.getByLabel("Recipient / Client Name").fill("Client Traveler");
  await page.getByLabel("Recipient Email").fill("client@example.test");
  await page.getByRole("button", { name: "Save Certificate Interest" }).click();
  await expect(page.getByRole("status")).toContainText(/No vacation partner backend is connected/i);
});

test("business funding referral saves locally", async ({ page }) => {
  await goto("/partner-resources/offer-business-funding", page);
  await page.getByRole("button", { name: "Submit Funding Referral" }).click();
  await page.getByLabel("Business Name").fill("Client Bakery LLC");
  await page.getByLabel("Contact").fill("owner@example.test");
  await page.getByLabel("Monthly Revenue").fill("$42,000");
  await page.getByLabel("Funding Amount").fill("$75,000");
  await page.getByRole("button", { name: "Submit Referral" }).click();
  await expect(page.getByRole("status")).toContainText(/No backend partner submission was sent/i);
});

test("credit repair class setup, preview, and sales link controls are visible", async ({ page }) => {
  await goto("/partner-resources/credit-repair-class", page);
  await page.getByRole("button", { name: "Preview Course" }).click();
  await expect(page.getByRole("heading", { name: "Preview Course" })).toBeVisible();
  await expect(page.getByText(/No hosted academy video source is connected/i)).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Request White-Label Setup" }).click();
  await page.getByLabel("Business Name").fill("Credit Studio");
  await page.getByLabel("Contact").fill("owner@example.test");
  await page.getByRole("button", { name: "Save Request" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Local white-label setup request saved/i }).first()).toBeVisible();
});

test("community post cards open details and allow local reply validation", async ({ page }) => {
  await goto("/partner-resources/community", page);
  await page.getByText("Removed 14 negative items in 60 days - here's what worked", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Removed 14 negative items in 60 days - here's what worked" })).toBeVisible();
  await expect(page.getByText(/General Discussion \/ Success Story/i)).toBeVisible();
  await page.getByRole("button", { name: "Post Reply" }).click();
  await expect(page.getByText("Enter a reply before posting.", { exact: true })).toBeVisible();
  await page.getByLabel("Add Reply").fill("Thanks for sharing the workflow.");
  await page.getByRole("button", { name: "Post Reply" }).click();
  await expect(page.getByText("Thanks for sharing the workflow.")).toBeVisible();
});

test("save and annual plan CTAs carry selected plan and billing query to subscription", async ({ page }) => {
  const plans = ["Basic", "Standard", "Premium"] as const;

  for (const billing of ["Annual", "Monthly"] as const) {
    for (const [index, plan] of plans.entries()) {
      await goto("/partner-resources/save-and-annual-plan", page);
      await page.getByRole("button", { name: new RegExp(`^${billing}`) }).click();
      await page.getByRole("button", { name: billing === "Annual" ? "Switch to Annual" : "Get Started" }).nth(index).click();
      await expect(page).toHaveURL(new RegExp(`/billing/subscription\\?plan=${plan.toLowerCase()}&billing=${billing.toLowerCase()}`));
      await expect(page.getByText(`${plan} Plan selected with ${billing.toLowerCase()} billing`)).toBeVisible();
    }
  }
});
