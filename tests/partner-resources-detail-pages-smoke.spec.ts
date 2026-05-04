import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://disputepilot-app.vercel.app";

type ButtonCheck = {
  name: string | RegExp;
  exact?: boolean;
  first?: boolean;
};

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  buttonChecks?: ButtonCheck[];
  minBodyLength?: number;
  afterVisit?: (page: Page) => Promise<void>;
};

const ROUTES: RouteSpec[] = [
  {
    route: "/partner-resources/merchant-accounts",
    title: "Merchant Accounts",
    bodyChecks: [
      "Merchant Accounts",
      "Accept credit cards, run recurring billing, and get paid reliably with processors built for the credit repair industry.",
      "Important:",
      "PayHQ",
      "Payroc",
      "Stripe",
      "Square",
      "How to Apply",
    ],
  },
  {
    route: "/partner-resources/monitoring-commissions",
    title: "Monitoring Commissions",
    bodyChecks: [
      "Monitoring Commissions",
      "Earn $10–$15/month per client",
      "AVG COMMISSION/CLIENT",
      "WITH 50 CLIENTS",
      "$6,000/yr",
      "WITH 100 CLIENTS",
      "$12,000+/yr",
      "SmartCredit",
      "MyFreeScore360",
      "IdentityIQ",
      "mySCOREIQ",
      "How to Enroll Clients & Earn Commissions",
    ],
  },
  {
    route: "/partner-resources/dispute-outsourcing",
    title: "Dispute Outsourcing",
    bodyChecks: [
      "Dispute Outsourcing",
      "Scale your credit repair business without hiring",
      "Compliance Rate",
      "Avg Turnaround",
      "Faster Scaling",
      "Hiring Cost",
      "Pay Per Dispute",
      "Starter Bundle",
      "Growth Bundle",
      "Enterprise",
    ],
    buttonChecks: [{ name: "Get Started", exact: true, first: true }],
  },
  {
    route: "/partner-resources/rebuild-credit-affiliate",
    title: "Rebuild Credit Affiliate",
    bodyChecks: [
      "Rebuild Credit Affiliate",
      "Strategy tip:",
      "Credit Strong",
      "Kikoff",
      "Chime Credit Builder",
      "OpenSky Secured Visa",
      "Experian Boost",
      "Self Lender",
      "How to Present Credit Builder Products to Clients",
    ],
  },
  {
    route: "/partner-resources/partner-and-earn",
    title: "Partner & Earn",
    bodyChecks: [
      "Partner & Earn",
      "Refer other credit repair businesses to DisputePilot",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Earnings Calculator",
      "How many businesses can you refer?",
      "MONTHLY EARNINGS",
      "$25/ref/mo",
      "$40/ref/mo",
      "$60/ref/mo",
      "$100/ref/mo",
      "$400",
      "$4,800/year",
      "How to Refer",
      "Get Your Link",
      "Share It",
      "They Sign Up",
      "Earn Monthly",
    ],
    afterVisit: async (page) => {
      await expect(page.getByRole("slider")).toBeVisible();
    },
  },
  {
    route: "/partner-resources/save-and-annual-plan",
    title: "Save with Annual Plan",
    bodyChecks: [
      "Save with Annual Plan",
      "Switch to annual billing and save up to 20% on your DisputePilot subscription",
      "Save 20%",
      "Basic",
      "Standard",
      "Premium",
      "Switch to Annual",
      "Most Popular",
      "What You Save on Annual Billing",
      "Save $192 per year",
      "Save $360 per year",
      "Save $600 per year",
    ],
    buttonChecks: [
      { name: "Monthly", exact: true },
      { name: /^Annual\b/i },
    ],
    afterVisit: async (page) => {
      await page.getByRole("button", { name: "Monthly", exact: true }).click();
      await expect(page.getByRole("button", { name: "Get Started", exact: true }).first()).toBeVisible();
    },
  },
  {
    route: "/partner-resources/offer-free-vacations",
    title: "Offer Free Vacations",
    bodyChecks: [
      "Offer Free Vacations",
      "FREE vacation",
      "Your Cost",
      "Higher Close Rate",
      "Certificate Validity",
      "Destinations",
      "Las Vegas, NV",
      "Orlando, FL",
      "Canc",
      "New York City, NY",
      "How to Offer Vacation Certificates to Clients",
    ],
  },
  {
    route: "/partner-resources/offer-business-funding",
    title: "Offer Business Funding",
    bodyChecks: [
      "Offer Business Funding",
      "Help your clients access business capital and earn",
      "SBA Loans",
      "Business Line of Credit",
      "Equipment Financing",
      "Invoice Factoring",
      "Merchant Cash Advance",
      "How to Introduce Business Funding to Your Clients",
    ],
  },
  {
    route: "/partner-resources/credit-repair-class",
    title: "Credit Repair Class",
    bodyChecks: [
      "Credit Repair Class",
      "White-Label Credit Course",
      "6 Modules",
      "34 Lessons",
      "4.5hr Content",
      "100% White-Label",
      "Understanding Credit Reports",
      "FICO Score Factors",
      "Your Rights Under FCRA & FDCPA",
      "How to Dispute Items",
      "Building Positive Credit",
      "Maintaining Great Credit",
      "How to Use This Course",
      "Course Modules",
    ],
    afterVisit: async (page) => {
      await page.getByText("Understanding Credit Reports", { exact: true }).click();
      await expect(
        page.getByText("How credit reports work, the 3 bureaus, what each section means, and how to read a credit report like a professional.")
      ).toBeVisible();
    },
  },
  {
    route: "/partner-resources/community",
    title: "Community",
    bodyChecks: [
      "Community",
      "Connect with 1,200+ credit repair professionals using DisputePilot.",
      "+ New Post",
      "CHANNELS",
      "General Discussion",
      "Getting Started",
      "Marketing & Growth",
      "Legal & Compliance",
      "Dispute Strategy",
      "Revenue & Pricing",
      "COMMUNITY STATS",
      "Total Members",
      "Posts This Week",
      "Online Now",
      "Top Contributors",
      "Removed 14 negative items in 60 days",
      "Best script for handling",
      "How I got 3 referral partnerships with local realtors in 2 weeks",
    ],
    buttonChecks: [{ name: "+ New Post", exact: true }],
    afterVisit: async (page) => {
      await page.getByRole("button", { name: "+ New Post", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toBeVisible();
      await expect(page.getByRole("combobox").first()).toBeVisible();
      await expect(page.getByPlaceholder("What's your post about?")).toBeVisible();
      await expect(page.getByPlaceholder(/Share your experience, ask a question, or post a tip/i)).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Post", exact: true })).toBeVisible();
    },
  },
];

async function verifyRoute(page: Page, spec: RouteSpec) {
  await page.goto(new URL(spec.route, BASE_URL).toString());
  await expect(page.locator("body")).toBeVisible();

  const bodyText = (await page.locator("body").innerText()).replace(/\s+/g, " ");

  expect(bodyText).not.toContain("404");
  expect(bodyText).not.toContain("Application error");
  expect(bodyText).not.toContain("Runtime Error");
  expect(bodyText.length).toBeGreaterThan(spec.minBodyLength ?? 300);

  await expect(page.getByRole("heading", { level: 1, name: spec.title, exact: true })).toBeVisible();

  for (const text of spec.bodyChecks) {
    expect(bodyText).toContain(text);
  }

  for (const button of spec.buttonChecks ?? []) {
    const locator = page.getByRole("button", {
      name: button.name as string | RegExp,
      exact: button.exact ?? typeof button.name === "string",
    });
    await expect(button.first ? locator.first() : locator).toBeVisible();
  }

  if (spec.afterVisit) {
    await spec.afterVisit(page);
  }
}

for (const spec of ROUTES) {
  test(`${spec.title} route renders usable partner resources UI`, async ({ page }) => {
    await verifyRoute(page, spec);
  });
}
