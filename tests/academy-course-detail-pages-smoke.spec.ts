import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://disputepilot-app.vercel.app";

type RouteSpec = {
  route: string;
  title: string;
  bodyChecks: string[];
  minBodyLength?: number;
};

const ROUTES: RouteSpec[] = [
  {
    route: "/academy/credit-repair",
    title: "Credit Repair Specialist",
    bodyChecks: [
      "Credit Repair Specialist",
      "Beginner",
      "Learn how to run a professional credit repair business",
      "6 hours",
      "24 lessons",
      "Certified Credit Repair Specialist",
      "Introduction to Credit Repair",
      "Reading & Analyzing Credit Reports",
      "The Dispute Process",
      "Writing Dispute Letters",
      "Client Management & Business Basics",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/fdcpa",
    title: "FDCPA Specialist",
    bodyChecks: [
      "FDCPA Specialist",
      "Intermediate",
      "Master the Fair Debt Collection Practices Act",
      "4.5 hours",
      "22 lessons",
      "Certified FDCPA Specialist",
      "FDCPA Overview",
      "Prohibited Collection Practices",
      "Consumer Rights & Debt Validation",
      "Removing Collections via the FDCPA",
      "FDCPA Enforcement & Civil Remedies",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/fcra",
    title: "FCRA Specialist",
    bodyChecks: [
      "FCRA Specialist",
      "Intermediate",
      "Deep knowledge of the Fair Credit Reporting Act",
      "5 hours",
      "22 lessons",
      "Certified FCRA Specialist",
      "FCRA Foundations",
      "Consumer Rights Under the FCRA",
      "Credit Bureau & Furnisher Obligations",
      "FCRA in Dispute Practice",
      "Civil Remedies & Enforcement",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/fcba",
    title: "FCBA Specialist",
    bodyChecks: [
      "FCBA Specialist",
      "Intermediate",
      "Leverage the Fair Credit Billing Act",
      "3.5 hours",
      "17 lessons",
      "Certified FCBA Specialist",
      "FCBA Fundamentals",
      "Billing Errors & Disputes",
      "The FCBA Dispute Process",
      "FCBA in Credit Repair Practice",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/compliance",
    title: "Compliance Specialist",
    bodyChecks: [
      "Compliance Specialist",
      "Advanced",
      "Stay legally compliant",
      "5.5 hours",
      "22 lessons",
      "Certified Compliance Specialist",
      "Credit Repair Organizations Act (CROA)",
      "Service Contracts & Written Agreements",
      "State Laws & Licensing",
      "Advertising & Marketing Compliance",
      "Risk Management & Best Practices",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/rebuild",
    title: "Rebuild Credit Specialist",
    bodyChecks: [
      "Rebuild Credit Specialist",
      "Beginner",
      "Help clients build strong credit from scratch or after repair.",
      "4 hours",
      "18 lessons",
      "Certified Rebuild Credit Specialist",
      "Credit Rebuilding Foundations",
      "Secured Credit Cards",
      "Credit Builder Loans & Products",
      "Building a 700+ Score Plan",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/fico",
    title: "FICO Score Specialist",
    bodyChecks: [
      "FICO Score Specialist",
      "Advanced",
      "Understand every scoring model and learn how to maximize any client's score.",
      "5 hours",
      "19 lessons",
      "Certified FICO Score Specialist",
      "FICO Score Models",
      "The 5 Score Factors",
      "Score Optimization Strategies",
      "Score Simulators & Client Coaching",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/automation",
    title: "Automation Specialist",
    bodyChecks: [
      "Automation Specialist",
      "Intermediate",
      "Learn how to set up email workflows",
      "4.5 hours",
      "21 lessons",
      "Certified Automation Specialist",
      "Automation Fundamentals",
      "Client Onboarding Automation",
      "Email & Notification Workflows",
      "Dispute & Letter Automation",
      "Advanced Automation & Reporting",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
  {
    route: "/academy/funding",
    title: "Funding Specialist",
    bodyChecks: [
      "Funding Specialist",
      "Advanced",
      "Help clients access business and personal funding after credit repair.",
      "5 hours",
      "19 lessons",
      "Certified Funding Specialist",
      "Funding Foundations",
      "Building Business Credit",
      "Loan & Funding Products",
      "Funding Strategy & Client Coaching",
      "COURSE DETAILS",
      "YOUR PROGRESS",
      "Certificate of Completion",
    ],
  },
];

async function verifyCourse(page: Page, spec: RouteSpec) {
  await page.goto(new URL(spec.route, BASE_URL).toString());
  await expect(page.locator("body")).toBeVisible();

  const bodyText = (await page.locator("body").innerText()).replace(/\s+/g, " ");

  expect(bodyText).not.toContain("404");
  expect(bodyText).not.toContain("Application error");
  expect(bodyText).not.toContain("Runtime Error");
  expect(bodyText.length).toBeGreaterThan(spec.minBodyLength ?? 500);

  await expect(page.getByRole("heading", { level: 1, name: spec.title, exact: true })).toBeVisible();

  for (const text of spec.bodyChecks) {
    expect(bodyText).toContain(text);
  }

  await expect(page.getByRole("button", { name: /Begin Course/i })).toBeVisible();
  await page.getByRole("button", { name: /Begin Course/i }).click();
  await expect(page.getByRole("button", { name: /Mark Complete/i })).toBeVisible();
}

for (const spec of ROUTES) {
  test(`${spec.title} course page renders usable academy UI`, async ({ page }) => {
    await verifyCourse(page, spec);
  });
}
