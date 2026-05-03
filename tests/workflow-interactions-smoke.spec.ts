import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://disputepilot-app.vercel.app";

async function visit(page: Page, route: string) {
  await page.goto(new URL(route, BASE_URL).toString());
  await expect(page.locator("body")).toBeVisible();
  const bodyText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  expect(bodyText).not.toContain("404");
  expect(bodyText).not.toContain("Application error");
  expect(bodyText).not.toContain("Runtime Error");
  expect(bodyText.length).toBeGreaterThan(300);
  return bodyText;
}

test("Letters AI rewriter workflow", async ({ page }) => {
  await visit(page, "/letters/ai-rewriter");

  await expect(page.getByRole("heading", { name: "AI Letter Rewriter", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load Sample", exact: true }).click();
  await expect(page.getByPlaceholder(/Paste your existing dispute letter here/i)).toHaveValue(/Account Name: XYZ Collections/);

  await page.getByRole("button", { name: /Rewrite with AI/i }).click();
  await expect(page.getByText(/Rewritten Letter \(AI\)/i)).toBeVisible();
  await expect(page.getByLabel("Rewritten output")).toContainText("Re: Standard Dispute Letter");
  await expect(page.getByLabel("Rewritten output")).toContainText("Please conduct a reasonable investigation");
  await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
  await expect(page.getByText(/AI Improvements Applied/i)).toBeVisible();
});

test("Team messages compose workflow", async ({ page }) => {
  await visit(page, "/company/team-messages");

  await expect(page.getByRole("heading", { name: "Team Messages", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "+ Compose", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New Message", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox").first()).toBeVisible();
  await expect(page.getByPlaceholder("Message subject")).toBeVisible();
  await expect(page.getByPlaceholder(/Write your message/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send Message", exact: true })).toBeVisible();

  const subject = `Workflow smoke ${Date.now()}`;
  await page.getByRole("combobox").first().selectOption("Support Agent");
  await page.getByPlaceholder("Message subject").fill(subject);
  await page.getByPlaceholder(/Write your message/i).fill("This is a workflow smoke message.");
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New Message", exact: true })).toHaveCount(0);
  await expect(page.getByText(subject, { exact: true })).toBeVisible();
});

test("Images and documents upload workflow", async ({ page }) => {
  const bodyText = await visit(page, "/company/images-documents");

  await expect(page.getByRole("heading", { name: "Images & Documents", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Upload File", exact: true })).toBeVisible();
  await expect(page.getByText("Drag & drop files here, or click to browse", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Share", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete", exact: true }).first()).toBeVisible();

  expect(bodyText).toContain("9 files");
  await page.getByRole("button", { name: "+ Upload File", exact: true }).click();
  await expect(page.getByText(/uploaded to Images & Documents\./i)).toBeVisible();
  await expect(page.getByText("10 files", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Rename", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Rename File", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename", exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});

test("Billing add actions workflow", async ({ page }) => {
  await visit(page, "/billing");

  await expect(page.getByRole("heading", { name: "Billing", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Invoice", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Payment", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Service/Product", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Add Invoice", exact: true }).click();
  const invoiceDialog = page.getByRole("dialog", { name: "Create Invoice" });
  await expect(invoiceDialog).toBeVisible();
  await expect(invoiceDialog.getByLabel(/Client\/Customer/i)).toBeVisible();
  await expect(invoiceDialog.getByLabel("Invoice Number")).toBeVisible();
  await expect(invoiceDialog.getByLabel(/Service\/Product/i)).toBeVisible();
  await expect(invoiceDialog.getByLabel("Amount")).toBeVisible();
  await expect(invoiceDialog.getByLabel("Status")).toBeVisible();
  await expect(invoiceDialog.getByLabel("Due Date")).toBeVisible();
  await expect(invoiceDialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(invoiceDialog.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  await invoiceDialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/Saved invoice/i);

  await page.getByRole("button", { name: "Add Payment", exact: true }).click();
  const paymentDialog = page.getByRole("dialog", { name: "Add Payment" });
  await expect(paymentDialog).toBeVisible();
  await expect(paymentDialog.getByLabel(/Client\/Customer/i)).toBeVisible();
  await expect(paymentDialog.getByLabel("Payment Reference")).toBeVisible();
  await expect(paymentDialog.getByLabel(/Service\/Product/i)).toBeVisible();
  await expect(paymentDialog.getByLabel("Amount")).toBeVisible();
  await expect(paymentDialog.getByLabel("Status")).toBeVisible();
  await expect(paymentDialog.getByLabel("Payment Date")).toBeVisible();
  await expect(paymentDialog.getByLabel("Payment Method")).toBeVisible();
  await paymentDialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/Saved payment/i);

  await page.getByRole("button", { name: "Add Service/Product", exact: true }).click();
  const serviceDialog = page.getByRole("dialog", { name: "Add Service/Product" });
  await expect(serviceDialog).toBeVisible();
  await expect(serviceDialog.getByLabel(/Service\/Product/i)).toBeVisible();
  await expect(serviceDialog.getByLabel("Type")).toBeVisible();
  await expect(serviceDialog.getByLabel("Amount")).toBeVisible();
  await expect(serviceDialog.getByLabel("Status")).toBeVisible();
  await expect(serviceDialog.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  await serviceDialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/Saved service/i);
});

test("Leads add and import workflow", async ({ page }) => {
  await visit(page, "/leads");

  await expect(page.getByRole("button", { name: /Import CSV/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Export CSV/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /\+ Add Lead/i })).toBeVisible();

  await page.getByRole("button", { name: /\+ Add Lead/i }).click();
  await expect(page.getByRole("heading", { name: "Add New Lead", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Lead", exact: true })).toBeVisible();
  await expect(page.locator("input, textarea, select").first()).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await page.getByRole("button", { name: /Import CSV/i }).click();
  await expect(page.getByRole("heading", { name: /Import Leads \(CSV\)/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Click to upload CSV file/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Or paste CSV content here/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Import", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});

test("Calendar add event workflow", async ({ page }) => {
  await visit(page, "/calendar");

  await expect(page.getByRole("heading", { name: "Calendar", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Export iCal/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Add Event", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "+ Add Event", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New Event", exact: true })).toBeVisible();
  await expect(page.getByPlaceholder(/Event title/i)).toBeVisible();
  await expect(page.locator('input[type="date"]').first()).toBeVisible();
  await expect(page.getByText("All day", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Event", exact: true }).last()).toBeVisible();

  const eventTitle = `Workflow Smoke Event ${Date.now()}`;
  await page.getByPlaceholder(/Event title/i).fill(eventTitle);
  await page.getByRole("button", { name: "Add Event", exact: true }).last().click();
  await expect(page.getByText(eventTitle, { exact: true }).first()).toBeVisible();
});

test("Partner resources community new post workflow", async ({ page }) => {
  await visit(page, "/partner-resources/community");

  await expect(page.getByRole("heading", { name: "Community", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ New Post", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "+ New Post", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox").first()).toBeVisible();
  await expect(page.getByPlaceholder("What's your post about?")).toBeVisible();
  await expect(page.getByPlaceholder(/Share your experience, ask a question, or post a tip/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Post", exact: true })).toBeVisible();

  await page.getByRole("combobox").first().selectOption("Strategy");
  await page.getByPlaceholder("What's your post about?").fill(`Workflow Smoke Post ${Date.now()}`);
  await page.getByPlaceholder(/Share your experience, ask a question, or post a tip/i).fill("Posting from the workflow smoke test.");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toHaveCount(0);
});
