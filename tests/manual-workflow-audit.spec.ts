import { expect, test, type Locator, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://disputepilot-app.vercel.app";
const REPORT_PATH = path.resolve(process.cwd(), "manual-workflow-audit.json");

type WorkflowStatus = "passed" | "missing" | "broken";

type WorkflowIssue = {
  route: string;
  workflow: string;
  status: WorkflowStatus;
  details: string;
};

type RouteReport = {
  route: string;
  controls: {
    buttons: string[];
    links: string[];
  };
  workflows: WorkflowIssue[];
};

function auditError(message: string, status: WorkflowStatus = "broken") {
  const error = new Error(message) as Error & { auditStatus?: WorkflowStatus };
  error.auditStatus = status;
  return error;
}

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function expectVisible(locator: Locator, label: string, timeout = 2000) {
  await expect(locator, label).toBeVisible({ timeout });
}

async function visibleNames(locator: Locator, limit = 50) {
  const count = Math.min(await locator.count(), limit);
  const names: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    if (await item.isVisible()) {
      const text = normalize(await item.innerText().catch(() => ""));
      if (text) names.push(text);
    }
  }
  return [...new Set(names)];
}

async function collectControls(scope: Locator) {
  return {
    buttons: await visibleNames(scope.getByRole("button")),
    links: await visibleNames(scope.getByRole("link")),
  };
}

async function mainScope(page: Page) {
  const main = page.locator("main");
  if (await main.count()) return main.first();
  return page.locator("body");
}

async function openFixedModal(page: Page) {
  const fixed = page.locator('div[style*="position: fixed"]');
  await expect(fixed.last()).toBeVisible();
  return fixed.last();
}

async function fillSiblingInput(container: Locator, visibleText: string, value: string) {
  const label = container.getByText(visibleText, { exact: true });
  const input = label.locator("xpath=../input").first();
  await expect(input).toBeVisible();
  await input.fill(value);
}

async function selectSiblingOption(container: Locator, visibleText: string, value: string) {
  const label = container.getByText(visibleText, { exact: true });
  const select = label.locator("xpath=../select").first();
  await expect(select).toBeVisible();
  await select.selectOption(value);
}

async function fillSiblingTextArea(container: Locator, visibleText: string, value: string) {
  const label = container.getByText(visibleText, { exact: true });
  const textarea = label.locator("xpath=../textarea").first();
  await expect(textarea).toBeVisible();
  await textarea.fill(value);
}

async function attempt(
  routeReport: RouteReport,
  route: string,
  workflow: string,
  fn: () => Promise<void>,
  timeoutMs = 7000,
): Promise<boolean> {
  try {
    await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          reject(auditError(`Workflow timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
    routeReport.workflows.push({ route, workflow, status: "passed", details: "Passed" });
    return true;
  } catch (error) {
    const status = (error as { auditStatus?: WorkflowStatus }).auditStatus || "broken";
    routeReport.workflows.push({
      route,
      workflow,
      status,
      details: errorMessage(error),
    });
    return false;
  }
}

async function loadRoute(page: Page, route: string, routeReport: RouteReport) {
  try {
    await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: "domcontentloaded" });
    await expect(page.locator("main, body").first()).toBeAttached();

    const bodyText = normalize(await page.locator("body").innerText());
    if (bodyText.includes("404")) throw auditError("Page body contains 404", "broken");
    if (bodyText.includes("Application error")) throw auditError("Page body contains Application error", "broken");
    if (bodyText.includes("Runtime Error")) throw auditError("Page body contains Runtime Error", "broken");

    const scope = await mainScope(page);
    routeReport.controls = await collectControls(scope);
    return { scope, bodyText };
  } catch (error) {
    routeReport.workflows.push({
      route,
      workflow: "route load",
      status: "broken",
      details: errorMessage(error),
    });
    return null;
  }
}

test.setTimeout(900000);

test("manual workflow audit", async ({ context }) => {
  const report: { generatedAt: string; baseUrl: string; routes: RouteReport[] } = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: [],
  };

  const allIssues: WorkflowIssue[] = [];

  async function audit(
    route: string,
    run: (page: Page, scope: Locator, bodyText: string, routeReport: RouteReport) => Promise<void>,
  ) {
    const routeReport: RouteReport = { route, controls: { buttons: [], links: [] }, workflows: [] };
    report.routes.push(routeReport);

    const routePage = await context.newPage();
    try {
      const loaded = await loadRoute(routePage, route, routeReport);
      if (!loaded) {
        allIssues.push(...routeReport.workflows);
        return;
      }

      const { scope, bodyText } = loaded;
      await run(routePage, scope, bodyText, routeReport);
      allIssues.push(...routeReport.workflows.filter(item => item.status !== "passed"));
    } finally {
      await routePage.close().catch(() => {});
    }
  }

  await audit("/clients", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/clients", "Add New Customer modal opens", async () => {
      const add = page.getByRole("button", { name: "Add New Customer", exact: true });
      await expect(add).toBeVisible();
      await add.click();

      const modal = await openFixedModal(page);
      await expect(page.getByRole("heading", { name: "Add New Client", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save Client", exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Add New Client", exact: true })).toHaveCount(0);

      await add.click();
      const freshModal = await openFixedModal(page);
      const stamp = Date.now();
      const clientName = `Audit Client ${stamp}`;

      await fillSiblingInput(freshModal, "First Name *", "Audit");
      await fillSiblingInput(freshModal, "Last Name *", `Client ${stamp}`);
      await fillSiblingInput(freshModal, "Email", `audit.client.${stamp}@example.com`);
      await fillSiblingInput(freshModal, "Phone", "555-555-1212");
      await selectSiblingOption(freshModal, "Status", "active");
      await selectSiblingOption(freshModal, "Type / Category", "Client");
      await fillSiblingTextArea(freshModal, "Notes", "Manual workflow audit client.");
      await page.getByRole("button", { name: "Save Client", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Saved client/i);
      await expect(page.locator("table tbody").getByRole("button", { name: new RegExp(`^${escapeRegex(clientName)}$`) }).first()).toBeVisible();

      await page.getByPlaceholder(/First name/i).fill("Audit");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByText(/Audit Client/i).first()).toBeVisible();
      await page.getByRole("button", { name: "Clear", exact: true }).click();
      await expect(page.getByPlaceholder(/First name/i)).toHaveValue("");

      await page.locator("main").getByRole("button", { name: /^Leads\s+\d+$/i }).first().click();
      await expect(page.getByText("Taylor Reed", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: /^Current\b/i }).click();
      await expect(page.getByText("Audit Client", { exact: false }).first()).toBeVisible();
      await page.getByRole("button", { name: /^Archive\b/i }).click();
      await expect(page.getByRole("heading", { name: "Clients", exact: true })).toBeVisible();
      await page.getByRole("button", { name: /^All\b/i }).click();

      await page.getByRole("combobox").first().selectOption("lead");
      await expect(page.getByText("Taylor Reed", { exact: true })).toBeVisible();
      await page.getByRole("combobox").first().selectOption("client");
      await expect(page.getByText("Audit Client", { exact: false }).first()).toBeVisible();
      await page.getByRole("combobox").first().selectOption("all");

      const viewButton = page.getByRole("button", { name: "View", exact: true }).first();
      await expect(viewButton).toBeVisible();
      await viewButton.click();
      await expect(page.getByRole("heading", { name: /Audit Client/i })).toBeVisible();
      await page.getByRole("button", { name: "Close", exact: true }).click();

      await viewButton.click();
      await expect(page.getByRole("heading", { name: /Audit Client/i })).toBeVisible();
      await page.getByRole("button", { name: "Edit Client", exact: true }).click();
      await expect(page.getByRole("heading", { name: /Edit Client/i })).toBeVisible();
      const editModal = await openFixedModal(page);
      await fillSiblingInput(editModal, "Last Name *", `Updated ${stamp}`);
      await page.getByRole("button", { name: "Save Changes", exact: true }).click();
      await expect(page.getByRole("status")).toContainText(/Updated client/i);
      await expect(page.locator("table tbody").getByRole("button", { name: new RegExp(`^Audit Updated ${stamp}$`) }).first()).toBeVisible();
    });
  });

  await audit("/leads", async (page, _scope, _bodyText, routeReport) => {
    let savedLeadName = "";

    await attempt(routeReport, "/leads", "Lead actions are visible", async () => {
      await expectVisible(page.getByRole("button", { name: /Import CSV/i }), "Waiting for Import CSV button");
      await expectVisible(page.getByRole("button", { name: /Export CSV/i }), "Waiting for Export CSV button");
      await expectVisible(page.getByRole("button", { name: /\+ Add Lead/i }), "Waiting for + Add Lead button");
    });

    await attempt(routeReport, "/leads", "Add Lead modal opens and cancels", async () => {
      const addLead = page.getByRole("button", { name: /\+ Add Lead/i });
      await expectVisible(addLead, "Waiting for + Add Lead button");
      await addLead.click();
      const addLeadModal = await openFixedModal(page);
      await expectVisible(page.getByRole("heading", { name: "Add New Lead", exact: true }), "Waiting for Add New Lead heading");
      await expectVisible(addLeadModal.getByRole("button", { name: "Cancel", exact: true }), "Waiting for Add Lead Cancel button");
      await expectVisible(addLeadModal.getByRole("button", { name: "Add Lead", exact: true }), "Waiting for Add Lead save button");
      await addLeadModal.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(addLeadModal, "Waiting for Add Lead modal to close").not.toBeVisible();
    });

    await attempt(routeReport, "/leads", "Add Lead saves and stays visible", async () => {
      const addLead = page.getByRole("button", { name: /\+ Add Lead/i });
      await expectVisible(addLead, "Waiting for + Add Lead button");
      await addLead.click();
      const createLeadModal = await openFixedModal(page);
      const stamp = Date.now();
      const leadName = `Audit Lead ${stamp}`;
      savedLeadName = leadName;

      await expectVisible(page.getByRole("heading", { name: "Add New Lead", exact: true }), "Waiting for Add New Lead heading");
      await expectVisible(createLeadModal.getByText("First Name *", { exact: true }), "Waiting for First Name * field label");
      await expectVisible(createLeadModal.getByText("Last Name *", { exact: true }), "Waiting for Last Name * field label");
      await expectVisible(createLeadModal.getByText("Email", { exact: true }), "Waiting for Email field label");
      await expectVisible(createLeadModal.getByText("Phone", { exact: true }), "Waiting for Phone field label");
      await expectVisible(page.getByRole("button", { name: "Add Lead", exact: true }), "Waiting for Add Lead save button");

      await fillSiblingInput(createLeadModal, "First Name *", "Audit");
      await fillSiblingInput(createLeadModal, "Last Name *", `Lead ${stamp}`);
      await fillSiblingInput(createLeadModal, "Email", `audit.lead.${stamp}@example.com`);
      await fillSiblingInput(createLeadModal, "Phone", "555-555-1212");
      await selectSiblingOption(createLeadModal, "Source", "Referral");
      await selectSiblingOption(createLeadModal, "Status", "new");
      await createLeadModal.getByRole("button", { name: "Add Lead", exact: true }).click();

      await expectVisible(page.getByRole("status"), "Waiting for Saved lead status");
      await expect(page.getByRole("status"), "Waiting for Saved lead status text").toContainText(/Saved lead/i);
      await expectVisible(page.locator("table tbody tr").filter({ hasText: leadName }).first(), "Waiting for saved lead row");

      if (await page.getByRole("heading", { name: "Add New Lead", exact: true }).count()) {
        await createLeadModal.getByRole("button", { name: "Cancel", exact: true }).click();
      }
      await expect(createLeadModal, "Waiting for Add Lead modal to close").not.toBeVisible();
    });

    await attempt(routeReport, "/leads", "Lead search can find the saved lead", async () => {
      if (!savedLeadName) throw auditError("Saved lead name missing from previous step");
      const searchInput = page.getByPlaceholder(/Search leads/i);
      await expectVisible(searchInput, "Waiting for lead search input");
      await searchInput.fill("Audit");

      await expectVisible(page.locator("table tbody tr").filter({ hasText: savedLeadName }).first(), "Waiting for searched lead row");

      const clearButton = page.getByRole("button", { name: "Clear", exact: true });
      if (await clearButton.count()) {
        await expectVisible(clearButton, "Waiting for Clear button");
        await clearButton.click();
        await expect(searchInput, "Waiting for cleared search input").toHaveValue("");
        await expectVisible(page.locator("table tbody tr").filter({ hasText: savedLeadName }).first(), "Waiting for leads table after clearing search");
      }
    });

    await attempt(routeReport, "/leads", "Import and export controls remain visible", async () => {
      await expectVisible(page.getByRole("button", { name: /Import CSV/i }), "Waiting for Import CSV button");
      await expectVisible(page.getByRole("button", { name: /Export CSV/i }), "Waiting for Export CSV button");
    });
  });

  await audit("/billing", async (page, _scope, _bodyText, routeReport) => {
    const invoiceNumber = `INV-AUDIT-${Date.now()}`;
    const paymentReference = `PAY-AUDIT-${Date.now()}`;
    const serviceName = `Audit Service ${Date.now()}`;

    await attempt(routeReport, "/billing", "Add Invoice modal opens and saves", async () => {
      const addInvoice = page.getByRole("button", { name: "Add Invoice", exact: true });
      await expect(addInvoice).toBeVisible();
      await addInvoice.click();
      const dialog = page.getByRole("dialog", { name: "Create Invoice" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel(/Client\/Customer/i)).toBeVisible();
      await expect(dialog.getByLabel("Invoice Number")).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(dialog).toHaveCount(0);

      await addInvoice.click();
      const createDialog = page.getByRole("dialog", { name: "Create Invoice" });
      await createDialog.getByLabel(/Client\/Customer/i).selectOption("Avery Brooks");
      await createDialog.getByLabel("Invoice Number").fill(invoiceNumber);
      await createDialog.getByLabel(/Service\/Product/i).selectOption("Credit Repair Monthly Plan");
      await createDialog.getByLabel("Amount").fill("177");
      await createDialog.getByLabel("Status").selectOption("Sent");
      await createDialog.getByLabel("Due Date").fill("2026-06-22");
      await createDialog.getByLabel("Notes").fill("Billing audit invoice.");
      await createDialog.getByRole("button", { name: "Save", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Saved invoice/i);
      const invoicesSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Invoices", exact: true }) });
      await expect(invoicesSection.getByRole("cell", { name: invoiceNumber, exact: true })).toBeVisible();

      const viewButton = invoicesSection.getByRole("button", { name: "View", exact: true }).first();
      await viewButton.click();
      const invoiceDetails = page.getByRole("dialog", { name: "Invoice Details" });
      await expect(invoiceDetails).toBeVisible();
      await invoiceDetails.getByRole("button", { name: "Edit", exact: true }).click();

      const editDialog = page.getByRole("dialog", { name: "Edit Invoice" });
      await expect(editDialog).toBeVisible();
      await editDialog.getByLabel("Invoice Number").fill(`${invoiceNumber}-EDIT`);
      await editDialog.getByLabel("Amount").fill("211");
      await editDialog.getByLabel("Status").selectOption("Paid");
      await editDialog.getByLabel("Due Date").fill("2026-06-30");
      await editDialog.getByLabel("Notes").fill("Updated billing audit invoice.");
      await editDialog.getByRole("button", { name: "Save Changes", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Updated invoice/i);
      await expect(invoicesSection.getByRole("cell", { name: `${invoiceNumber}-EDIT`, exact: true })).toBeVisible();
    });

    await attempt(routeReport, "/billing", "Add Payment modal opens and saves", async () => {
      const addPayment = page.getByRole("button", { name: "Add Payment", exact: true });
      await expect(addPayment).toBeVisible();
      await addPayment.click();
      const dialog = page.getByRole("dialog", { name: "Add Payment" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel("Payment Reference")).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

      await addPayment.click();
      const paymentDialog = page.getByRole("dialog", { name: "Add Payment" });
      await paymentDialog.getByLabel(/Client\/Customer/i).selectOption("Morgan Credit");
      await paymentDialog.getByLabel("Payment Reference").fill(paymentReference);
      await paymentDialog.getByLabel(/Service\/Product/i).selectOption("Credit Repair Monthly Plan");
      await paymentDialog.getByLabel("Amount").fill("123");
      await paymentDialog.getByLabel("Status").selectOption("Paid");
      await paymentDialog.getByLabel("Payment Date").fill("2026-06-02");
      await paymentDialog.getByLabel("Payment Method").selectOption("Credit Card");
      await paymentDialog.getByLabel("Notes").fill("Billing audit payment.");
      await paymentDialog.getByRole("button", { name: "Save", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Saved payment/i);
      const paymentsSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Payments", exact: true }) });
      await expect(paymentsSection.getByRole("cell", { name: paymentReference, exact: true })).toBeVisible();

      const manageButton = paymentsSection.getByRole("button", { name: "Manage", exact: true }).first();
      await manageButton.click();
      const paymentDetails = page.getByRole("dialog", { name: "Payment Details" });
      await expect(paymentDetails).toBeVisible();
      await paymentDetails.getByRole("button", { name: "Edit", exact: true }).click();

      const editDialog = page.getByRole("dialog", { name: "Edit Payment" });
      await expect(editDialog).toBeVisible();
      await editDialog.getByLabel("Payment Reference").fill(`${paymentReference}-EDIT`);
      await editDialog.getByLabel("Amount").fill("456");
      await editDialog.getByLabel("Status").selectOption("Refunded");
      await editDialog.getByLabel("Payment Date").fill("2026-06-03");
      await editDialog.getByLabel("Payment Method").selectOption("ACH");
      await editDialog.getByLabel("Notes").fill("Updated billing audit payment.");
      await editDialog.getByRole("button", { name: "Save Changes", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Updated payment/i);
      await expect(paymentsSection.getByRole("cell", { name: `${paymentReference}-EDIT`, exact: true })).toBeVisible();
    });

    await attempt(routeReport, "/billing", "Add Service/Product modal opens and saves", async () => {
      const addService = page.getByRole("button", { name: "Add Service/Product", exact: true });
      await expect(addService).toBeVisible();
      await addService.click();
      const dialog = page.getByRole("dialog", { name: "Add Service/Product" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel(/Service\/Product/i)).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

      await addService.click();
      const serviceDialog = page.getByRole("dialog", { name: "Add Service/Product" });
      await serviceDialog.getByLabel(/Service\/Product/i).fill(serviceName);
      await serviceDialog.getByLabel("Type").selectOption("Service");
      await serviceDialog.getByLabel("Amount").fill("88");
      await serviceDialog.getByLabel("Status").selectOption("Active");
      await serviceDialog.getByLabel("Notes").fill("Billing audit service.");
      await serviceDialog.getByRole("button", { name: "Save", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Saved service/i);
      const servicesSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Services / Products", exact: true }) });
      await expect(servicesSection.getByText(serviceName, { exact: true })).toBeVisible();

      const manageButton = servicesSection.getByRole("button", { name: "Manage", exact: true }).first();
      await manageButton.click();
      const serviceDetails = page.getByRole("dialog", { name: "Service/Product Details" });
      await expect(serviceDetails).toBeVisible();
      await serviceDetails.getByRole("button", { name: "Edit", exact: true }).click();

      const editDialog = page.getByRole("dialog", { name: "Edit Service/Product" });
      await expect(editDialog).toBeVisible();
      await editDialog.getByLabel(/Service\/Product/i).fill(`${serviceName} Updated`);
      await editDialog.getByLabel("Type").selectOption("Product");
      await editDialog.getByLabel("Amount").fill("99");
      await editDialog.getByLabel("Status").selectOption("Inactive");
      await editDialog.getByLabel("Notes").fill("Updated billing audit service.");
      await editDialog.getByRole("button", { name: "Save Changes", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(/Updated product/i);
      await expect(servicesSection.getByText(`${serviceName} Updated`, { exact: true })).toBeVisible();
    });
  });

  await audit("/disputes", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/disputes", "Create New Dispute opens and saves", async () => {
      const create = page.getByRole("button", { name: "Create New Dispute", exact: true });
      await expect(create).toBeVisible();
      await create.click();
      const dialog = page.getByRole("dialog", { name: "Create New Dispute" });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel(/Client \/ Customer/i).fill("Audit Client");
      await dialog.getByLabel("Account / Creditor *").fill("Audit Account");
      await dialog.getByLabel("Status").selectOption("Sent");
      await dialog.getByLabel("Round").selectOption("Round 2");
      await dialog.getByLabel("Bureau").selectOption("Experian");
      await dialog.getByLabel("Dispute Reason / Type").selectOption("Incorrect Balance");
      await dialog.getByLabel("Letter / Template").selectOption("Method of Verification");
      await dialog.getByLabel("Notes").fill("Dispute audit entry.");
      await dialog.getByRole("button", { name: "Save Dispute", exact: true }).click();

      await expect(page.getByRole("heading", { name: "Dispute Saved", exact: true })).toBeVisible();
      await expect(page.getByText(/Audit Client/i).first()).toBeVisible();

      const viewButton = page.getByRole("button", { name: "View", exact: true }).first();
      await viewButton.click();
      await expect(page.getByRole("heading", { name: "Dispute Details", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Close", exact: true }).click();
    });
  });

  await audit("/disputes/status", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/disputes/status", "Status controls remain visible", async () => {
      const main = page.locator("main");
      await expectVisible(main.getByRole("button", { name: "All Disputes", exact: true }), "Waiting for All Disputes button");
      await expectVisible(main.getByRole("button", { name: "By Bureau", exact: true }), "Waiting for By Bureau button");
      await expectVisible(main.getByRole("button", { name: "By Round", exact: true }), "Waiting for By Round button");
      await expectVisible(main.getByRole("button", { name: /Export CSV/i }), "Waiting for Export CSV button");
      await expectVisible(main.getByRole("button", { name: /Refresh/i }), "Waiting for Refresh button");
      await expectVisible(main.locator("table"), "Waiting for disputes table");
    });

    await attempt(routeReport, "/disputes/status", "Status filters can be toggled", async () => {
      const main = page.locator("main");
      const allDisputes = main.getByRole("button", { name: "All Disputes", exact: true });
      const byBureau = main.getByRole("button", { name: "By Bureau", exact: true });
      const byRound = main.getByRole("button", { name: "By Round", exact: true });
      await expectVisible(byBureau, "Waiting for By Bureau button");
      await expectVisible(byRound, "Waiting for By Round button");
      await expectVisible(allDisputes, "Waiting for All Disputes button");

      await byBureau.click();
      await expectVisible(byBureau, "Waiting for By Bureau button after click");
      await expectVisible(byRound, "Waiting for By Round button after click");
      await expectVisible(allDisputes, "Waiting for All Disputes button after click");
      await byRound.click();
      await expectVisible(byBureau, "Waiting for By Bureau button after second click");
      await expectVisible(byRound, "Waiting for By Round button after second click");
      await expectVisible(allDisputes, "Waiting for All Disputes button after second click");
      await allDisputes.click();
      await expectVisible(byBureau, "Waiting for By Bureau button after reset");
      await expectVisible(byRound, "Waiting for By Round button after reset");
      await expectVisible(allDisputes, "Waiting for All Disputes button after reset");
    });
  });

  await audit("/dispute-manager/furnisher-addresses", async (page, _scope, _bodyText, routeReport) => {
    let savedCreditorName = "";

    await attempt(routeReport, "/dispute-manager/furnisher-addresses", "Add New Creditor modal opens and cancels", async () => {
      const add = page.getByRole("button", { name: "+ Add New Creditor", exact: true });
      await expectVisible(add, "Waiting for + Add New Creditor button");
      await add.click();
      const modal = await openFixedModal(page);
      await expectVisible(page.getByRole("heading", { name: "Add New Creditor", exact: true }), "Waiting for Add New Creditor heading");
      await expectVisible(page.getByRole("button", { name: "Cancel", exact: true }), "Waiting for Add New Creditor Cancel button");
      await expectVisible(page.getByRole("button", { name: "Add Creditor", exact: true }), "Waiting for Add Creditor save button");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(modal, "Waiting for Add Creditor modal to close").not.toBeVisible();
    });

    await attempt(routeReport, "/dispute-manager/furnisher-addresses", "Add New Creditor saves visibly", async () => {
      const add = page.getByRole("button", { name: "+ Add New Creditor", exact: true });
      await expectVisible(add, "Waiting for + Add New Creditor button");
      await add.click();
      const addModal = await openFixedModal(page);
      const stamp = Date.now();
      const creditorName = `Audit Creditor ${stamp}`;
      savedCreditorName = creditorName;
      await expectVisible(page.getByRole("heading", { name: "Add New Creditor", exact: true }), "Waiting for Add New Creditor heading");
      await expectVisible(addModal.getByLabel("Company Name"), "Waiting for Company Name field");
      await expectVisible(addModal.getByLabel("Address"), "Waiting for Address field");
      await expectVisible(addModal.getByLabel("City"), "Waiting for City field");
      await expectVisible(addModal.getByLabel("State"), "Waiting for State field");
      await expectVisible(addModal.getByLabel("Zip"), "Waiting for Zip field");
      await expectVisible(addModal.getByRole("button", { name: "Add Creditor", exact: true }), "Waiting for Add Creditor save button");
      await addModal.getByLabel("Company Name").fill(creditorName);
      await addModal.getByLabel("Address").fill("100 Audit Way");
      await addModal.getByLabel("City").fill("Austin");
      await addModal.getByLabel("State").fill("TX");
      await addModal.getByLabel("Zip").fill("78701");
      await addModal.getByRole("button", { name: "Add Creditor", exact: true }).click();
      await expectVisible(page.getByRole("status"), "Waiting for Saved creditor status");
      await expect(page.getByRole("status"), "Waiting for Saved creditor status text").toContainText(/Saved creditor/i);
      await expectVisible(page.locator("tbody tr").filter({ hasText: creditorName }).first(), "Waiting for new creditor row");

      const editButton = page.locator("tbody tr").filter({ hasText: savedCreditorName }).getByRole("button", { name: "Edit", exact: true }).first();
      await expectVisible(editButton, "Waiting for Edit button on new creditor row");
      await editButton.click();
      await expectVisible(page.getByRole("heading", { name: /Edit Creditor/i }), "Waiting for Edit Creditor heading");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("heading", { name: /Edit Creditor/i }), "Waiting for Edit Creditor modal to close").toHaveCount(0);
    });

    await attempt(routeReport, "/dispute-manager/furnisher-addresses", "Delete creditor confirms and removes row", async () => {
      if (!savedCreditorName) throw auditError("Saved creditor name missing from previous step");
      const creditorRow = page.locator("tbody tr").filter({ hasText: savedCreditorName }).first();
      await expectVisible(creditorRow, "Waiting for saved creditor row");
      const deleteButton = creditorRow.getByRole("button", { name: "Delete", exact: true }).first();
      await expectVisible(deleteButton, "Waiting for Delete button on creditor row");
      const confirmation = page.getByRole("heading", { name: "Delete Creditor?", exact: true });
      await deleteButton.click();
      const confirmationVisible = await confirmation.isVisible().catch(() => false);
      if (confirmationVisible) {
        const confirmDeleteModal = await openFixedModal(page);
        await expectVisible(confirmation, "Waiting for Delete Creditor confirmation");
        await expectVisible(confirmDeleteModal.getByRole("button", { name: "Cancel", exact: true }), "Waiting for Delete confirmation Cancel button");
        await confirmDeleteModal.getByRole("button", { name: "Cancel", exact: true }).click();
        await expect(confirmation, "Waiting for Delete Creditor confirmation to close").toHaveCount(0);

        await deleteButton.click();
        const secondVisible = await confirmation.isVisible().catch(() => false);
        if (secondVisible) {
          const secondDeleteModal = await openFixedModal(page);
          await expectVisible(secondDeleteModal.getByRole("button", { name: "Delete", exact: true }), "Waiting for Delete confirmation button");
          await secondDeleteModal.getByRole("button", { name: "Delete", exact: true }).click();
        }
      }
      await expect(creditorRow, "Waiting for creditor row removal").toHaveCount(0);
    });
  });

  await audit("/letters", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/letters", "Create Letter opens editor and saves", async () => {
      const create = page.getByRole("button", { name: "Create Letter", exact: true });
      await expect(create).toBeVisible();
      await create.click();
      await expect(page.getByRole("region", { name: "Letter editor" })).toBeVisible();
      await page.getByLabel("Client / Customer").fill("Audit Client");
      await page.getByLabel("Bureau / Recipient").fill("Experian");
      await page.getByLabel("Dispute Reason / Type").fill("Inaccurate reporting");
      await page.getByLabel("Account / Creditor").fill("Audit Collections");
      await page.getByLabel("Template / Letter Type").fill("Initial dispute");
      await page.getByLabel("Subject / Title").fill(`Audit Letter ${Date.now()}`);
      await page.getByLabel("Body / Content").fill("This is an audit letter body.");
      await page.getByLabel("Notes").fill("Letter audit note.");
      await page.getByRole("button", { name: "Save Letter", exact: true }).click();
      await expect(page.getByRole("region", { name: "Saved confirmation" })).toContainText(/Saved/i);

      const editButton = page.getByRole("button", { name: "Edit", exact: true }).first();
      await editButton.click();
      await expect(page.getByRole("region", { name: "Letter editor" })).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("region", { name: "Letter editor" })).toHaveCount(0);

      const rewriterLink = page.locator("main").getByRole("link", { name: "AI Rewriter", exact: true }).first();
      await expect(rewriterLink).toHaveAttribute("href", "/letters/ai-rewriter");
      await rewriterLink.click();
      await expect(page).toHaveURL(/\/letters\/ai-rewriter$/);
      await expect(page.getByRole("heading", { name: "AI Letter Rewriter", exact: true })).toBeVisible();
      await page.goto(new URL("/letters", BASE_URL).toString(), { waitUntil: "domcontentloaded" });
    });
  });

  await audit("/letters/ai-rewriter", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/letters/ai-rewriter", "Load Sample, rewrite, and copy work", async () => {
      await expect(page.getByRole("heading", { name: "AI Letter Rewriter", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Load Sample", exact: true }).click();
      await expect(page.getByPlaceholder(/Paste your existing dispute letter here/i)).toHaveValue(/Account Name: XYZ Collections/);
      await page.getByRole("button", { name: /Rewrite with AI/i }).click();
      await expect(page.getByText(/Rewritten Letter \(AI\)/i)).toBeVisible();
      await expect(page.getByLabel("Rewritten output")).toContainText("Re: Standard Dispute Letter");
      await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
      await expect(page.getByText(/AI Improvements Applied/i)).toBeVisible();
    });
  });

  await audit("/calendar", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/calendar", "+ Add Event creates a visible calendar event", async () => {
      await expect(page.getByRole("button", { name: "+ Add Event", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "+ Add Event", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Event", exact: true })).toBeVisible();
      await expect(page.getByPlaceholder(/Event title/i)).toBeVisible();
      await expect(page.locator('input[type="date"]').first()).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();

      await page.getByRole("button", { name: "+ Add Event", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Event", exact: true })).toBeVisible();
      const title = `Audit Event ${Date.now()}`;
      await page.getByPlaceholder(/Event title/i).fill(title);
      await page.locator('input[type="date"]').first().fill("2026-06-01");
      await page.getByRole("button", { name: "Add Event", exact: true }).last().click();
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  });

  await audit("/company/images-documents", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/company/images-documents", "Upload, rename, share, and delete flows work", async () => {
      const upload = page.getByRole("button", { name: "+ Upload File", exact: true });
      await expect(upload).toBeVisible();
      await upload.click();
      await expect(page.getByText(/uploaded to Images & Documents\./i)).toBeVisible();
      await expect(page.getByText("10 files", { exact: true })).toBeVisible();

      const renameButton = page.getByRole("button", { name: "Rename", exact: true }).first();
      await renameButton.click();
      await expect(page.getByRole("heading", { name: "Rename File", exact: true })).toBeVisible();
      const renameModal = page.locator('div[style*="position: fixed"]').last();
      await renameModal.locator("input").first().fill(`audit-file-${Date.now()}.pdf`);
      await page.getByRole("button", { name: "Rename", exact: true }).last().click();
      await expect(page.getByText(/File renamed to/i)).toBeVisible();

      await page.getByRole("button", { name: "Share", exact: true }).first().click();
      await expect(page.getByText(/Share link copied\./i)).toBeVisible();

      const deleteButton = page.getByRole("button", { name: "Delete", exact: true }).first();
      await deleteButton.click();
      await expect(page.getByRole("heading", { name: "Delete File?", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Delete File?", exact: true })).toHaveCount(0);
    });
  });

  await audit("/company/team-messages", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/company/team-messages", "+ Compose and Send Message work", async () => {
      await expect(page.getByRole("button", { name: "+ Compose", exact: true })).toBeVisible();
      if (await page.getByRole("button", { name: "Mark All Read", exact: true }).count()) {
        await page.getByRole("button", { name: "Mark All Read", exact: true }).click();
        await expect(page.getByText("All messages read", { exact: true })).toBeVisible();
      }

      await page.getByRole("button", { name: "+ Compose", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Message", exact: true })).toBeVisible();
      const composeModal = page.locator('div[style*="position: fixed"]').last();
      await expect(composeModal.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      await expect(composeModal.getByRole("button", { name: "Send Message", exact: true })).toBeVisible();
      await composeModal.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Message", exact: true })).toHaveCount(0);

      await page.getByRole("button", { name: "+ Compose", exact: true }).click();
      const newMessageModal = page.locator('div[style*="position: fixed"]').last();
      const stamp = Date.now();
      const subject = `Workflow Audit ${stamp}`;
      await selectSiblingOption(newMessageModal, "To", "Support Agent");
      await fillSiblingInput(newMessageModal, "Subject", subject);
      await fillSiblingTextArea(newMessageModal, "Message", "Manual workflow audit message.");
      await newMessageModal.getByRole("button", { name: "Send Message", exact: true }).click();

      await expect(page.getByRole("heading", { name: "New Message", exact: true })).toHaveCount(0);
      await expect(page.getByText(subject, { exact: true })).toBeVisible();
    });
  });

  await audit("/company/settings", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/company/settings", "Save Company updates preview and Cancel resets", async () => {
      await expect(page.getByRole("link", { name: /Back to Dashboard/i })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save Company", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();

      const stamp = Date.now();
      const companyName = `Audit Company ${stamp}`;
      await page.getByLabel("Company Name").fill(companyName);
      await page.getByLabel("Phone").fill("(404) 555-0199");
      await page.getByLabel("Email").fill(`audit.${stamp}@example.com`);
      await page.getByLabel("Website").fill("https://example.com");
      await page.getByLabel("Notes / Description").fill("Manual audit company settings.");
      await page.getByRole("button", { name: "Save Company", exact: true }).click();

      await expect(page.getByRole("status")).toContainText(`Company profile saved for ${companyName}.`);
      await expect(page.getByText("Contact", { exact: true })).toBeVisible();
      await expect(page.getByText(companyName, { exact: true })).toBeVisible();

      await page.getByLabel("Company Name").fill("Unsaved Audit Company");
      await page.getByRole("button", { name: /^Cancel$/i }).click();
      await expect(page.getByLabel("Company Name")).toHaveValue(companyName);
      await expect(page.getByText("Unsaved company changes were reset.")).toBeVisible();

      await page.getByRole("link", { name: /Back to Dashboard/i }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });

  await audit("/partner-resources/community", async (page, _scope, _bodyText, routeReport) => {
    await attempt(routeReport, "/partner-resources/community", "+ New Post opens modal and submits", async () => {
      await expect(page.getByRole("heading", { name: "Community", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "+ New Post", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "+ New Post", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toBeVisible();
      const modal = page.locator('div[style*="position: fixed"]').last();
      await expect(modal.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      await expect(modal.getByRole("button", { name: "Post", exact: true })).toBeVisible();
      await modal.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toHaveCount(0);

      await page.getByRole("button", { name: "+ New Post", exact: true }).click();
      const newPostModal = page.locator('div[style*="position: fixed"]').last();
      const stamp = Date.now();
      const postTitle = `Workflow Audit Post ${stamp}`;
      await selectSiblingOption(newPostModal, "Category", "Strategy");
      await newPostModal.getByPlaceholder("What's your post about?").fill(postTitle);
      await newPostModal.getByPlaceholder(/Share your experience, ask a question, or post a tip/i).fill("Manual audit community post.");
      await newPostModal.getByRole("button", { name: "Post", exact: true }).click();

      await expect(page.getByRole("heading", { name: "New Community Post", exact: true })).toHaveCount(0);
      await expect(page.getByText(postTitle, { exact: true })).toBeVisible({ timeout: 1000 }).catch(() => {
        throw auditError("Community post did not appear in the feed after posting", "broken");
      });
    });
  });

  const broken = allIssues.filter((item) => item.status !== "passed");
  const reportData = {
    generatedAt: report.generatedAt,
    baseUrl: BASE_URL,
    routes: report.routes,
    issues: broken,
  };

  await writeFile(REPORT_PATH, JSON.stringify(reportData, null, 2), "utf8");
  console.log("Missing/broken workflow items:");
  console.log(JSON.stringify(broken, null, 2));

  expect(broken, JSON.stringify(reportData, null, 2)).toHaveLength(0);
});
