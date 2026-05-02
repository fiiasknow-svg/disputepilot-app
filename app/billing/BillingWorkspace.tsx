"use client";

import Link from "next/link";
import type React from "react";
import { FormEvent, useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Invoice = {
  id: number;
  client: string;
  invoiceNumber: string;
  service: string;
  amount: number;
  status: string;
  dueDate: string;
  notes: string;
};

type Payment = {
  id: number;
  client: string;
  reference: string;
  service: string;
  amount: number;
  status: string;
  paymentDate: string;
  method: string;
  notes: string;
};

type Service = {
  id: number;
  name: string;
  type: string;
  amount: number;
  status: string;
  notes: string;
};

type Detail =
  | { kind: "Invoice"; item: Invoice }
  | { kind: "Payment"; item: Payment }
  | { kind: "Service/Product"; item: Service };

const clients = ["Leslie Sabek", "Morgan Credit", "Taylor Johnson", "Avery Brooks"];
const invoiceStatuses = ["Draft", "Sent", "Paid", "Overdue"];
const paymentStatuses = ["Paid", "Pending", "Failed", "Refunded"];
const serviceStatuses = ["Active", "Inactive"];
const methods = ["Credit Card", "ACH", "Cash", "Check", "PayPal"];

const initialInvoices: Invoice[] = [
  { id: 1, client: "Leslie Sabek", invoiceNumber: "INV-1042", service: "Credit Repair Monthly Plan", amount: 149, status: "Sent", dueDate: "2026-05-15", notes: "May service retainer." },
  { id: 2, client: "Morgan Credit", invoiceNumber: "INV-1041", service: "Pay Per Deletion", amount: 240, status: "Overdue", dueDate: "2026-04-30", notes: "Two verified deletions." },
  { id: 3, client: "Taylor Johnson", invoiceNumber: "INV-1040", service: "Credit Report Audit", amount: 99, status: "Paid", dueDate: "2026-04-26", notes: "One-time analysis package." },
];

const initialPayments: Payment[] = [
  { id: 1, client: "Taylor Johnson", reference: "PAY-8831", service: "Credit Report Audit", amount: 99, status: "Paid", paymentDate: "2026-04-26", method: "Credit Card", notes: "Paid invoice INV-1040." },
  { id: 2, client: "Leslie Sabek", reference: "PAY-8830", service: "Credit Repair Monthly Plan", amount: 149, status: "Paid", paymentDate: "2026-04-15", method: "ACH", notes: "Recurring subscription payment." },
  { id: 3, client: "Avery Brooks", reference: "PAY-8829", service: "Document Preparation", amount: 75, status: "Pending", paymentDate: "2026-05-01", method: "Check", notes: "Awaiting check clearance." },
];

const initialServices: Service[] = [
  { id: 1, name: "Credit Repair Monthly Plan", type: "Service", amount: 149, status: "Active", notes: "Monthly dispute processing and client support." },
  { id: 2, name: "Credit Report Audit", type: "Product", amount: 99, status: "Active", notes: "One-time tri-bureau analysis." },
  { id: 3, name: "Pay Per Deletion", type: "Service", amount: 120, status: "Active", notes: "Billed after verified deletion." },
];

const pageTitles = {
  overview: "Billing",
  invoices: "Invoicing",
  payments: "Payments",
  history: "Payment History",
  services: "Services / Products",
};

const money = (amount: number) => `$${amount.toFixed(2)}`;
const displayDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString();

export default function BillingWorkspace({ view = "overview" }: { view?: "overview" | "invoices" | "payments" | "history" | "services" }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [services, setServices] = useState(initialServices);
  const [modal, setModal] = useState<"invoice" | "payment" | "service" | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [confirmation, setConfirmation] = useState("");

  const summary = useMemo(() => {
    const openBalance = invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + i.amount, 0);
    const paidThisMonth = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
    const overdue = invoices.filter(i => i.status === "Overdue").length;
    return { openBalance, paidThisMonth, overdue, activeServices: services.filter(s => s.status === "Active").length };
  }, [invoices, payments, services]);

  function saveInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const invoice: Invoice = {
      id: Date.now(),
      client: String(data.get("client")),
      invoiceNumber: String(data.get("invoiceNumber")),
      service: String(data.get("service")),
      amount: Number(data.get("amount")),
      status: String(data.get("status")),
      dueDate: String(data.get("dueDate")),
      notes: String(data.get("notes")),
    };
    setInvoices(prev => [invoice, ...prev]);
    setModal(null);
    setConfirmation(`Saved invoice ${invoice.invoiceNumber} for ${invoice.client} totaling ${money(invoice.amount)}.`);
  }

  function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payment: Payment = {
      id: Date.now(),
      client: String(data.get("client")),
      reference: String(data.get("reference")),
      service: String(data.get("service")),
      amount: Number(data.get("amount")),
      status: String(data.get("status")),
      paymentDate: String(data.get("paymentDate")),
      method: String(data.get("method")),
      notes: String(data.get("notes")),
    };
    setPayments(prev => [payment, ...prev]);
    setModal(null);
    setConfirmation(`Saved payment ${payment.reference} from ${payment.client} for ${money(payment.amount)} by ${payment.method}.`);
  }

  function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const service: Service = {
      id: Date.now(),
      name: String(data.get("name")),
      type: String(data.get("type")),
      amount: Number(data.get("amount")),
      status: String(data.get("status")),
      notes: String(data.get("notes")),
    };
    setServices(prev => [service, ...prev]);
    setModal(null);
    setConfirmation(`Saved ${service.type.toLowerCase()} ${service.name} at ${money(service.amount)}.`);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1240 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b" }}>{pageTitles[view]}</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Track invoices, payments, services, balances, and client billing activity.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => setModal("invoice")} style={primaryButton}>Add Invoice</button>
            <button onClick={() => setModal("payment")} style={secondaryButton}>Add Payment</button>
            <button onClick={() => setModal("service")} style={secondaryButton}>Add Service/Product</button>
          </div>
        </header>

        <nav aria-label="Billing sections" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            ["Overview", "/billing"],
            ["Invoices", "/billing/invoices"],
            ["Payments", "/billing/payments"],
            ["Services/Products", "/billing/services-products"],
            ["Payment History", "/billing/payment-history"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={tabLink}>{label}</Link>
          ))}
        </nav>

        {confirmation && (
          <section role="status" aria-live="polite" style={{ ...panel, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 700, marginBottom: 18 }}>
            {confirmation}
          </section>
        )}

        {(view === "overview" || view === "history") && <Summary summary={summary} />}
        {(view === "overview" || view === "invoices") && <InvoicesTable invoices={invoices} onView={item => setDetail({ kind: "Invoice", item })} />}
        {(view === "overview" || view === "payments") && <PaymentsTable payments={payments} onView={item => setDetail({ kind: "Payment", item })} />}
        {(view === "overview" || view === "services") && <ServicesTable services={services} onView={item => setDetail({ kind: "Service/Product", item })} />}
        {view === "history" && <PaymentHistory payments={payments} onView={item => setDetail({ kind: "Payment", item })} />}

        {modal === "invoice" && <Modal title="Create Invoice" onClose={() => setModal(null)}><InvoiceForm services={services} onSave={saveInvoice} onCancel={() => setModal(null)} /></Modal>}
        {modal === "payment" && <Modal title="Add Payment" onClose={() => setModal(null)}><PaymentForm services={services} onSave={savePayment} onCancel={() => setModal(null)} /></Modal>}
        {modal === "service" && <Modal title="Add Service/Product" onClose={() => setModal(null)}><ServiceForm onSave={saveService} onCancel={() => setModal(null)} /></Modal>}
        {detail && <Modal title={`${detail.kind} Details`} onClose={() => setDetail(null)}><Details detail={detail} onClose={() => setDetail(null)} /></Modal>}
      </div>
    </CDMLayout>
  );
}

function Summary({ summary }: { summary: { openBalance: number; paidThisMonth: number; overdue: number; activeServices: number } }) {
  return (
    <section aria-label="Billing summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 18 }}>
      <SummaryCard label="Open Balance" value={money(summary.openBalance)} note="Unpaid invoice total" />
      <SummaryCard label="Paid This Month" value={money(summary.paidThisMonth)} note="Collected payments" />
      <SummaryCard label="Overdue Invoices" value={String(summary.overdue)} note="Need follow-up" />
      <SummaryCard label="Active Services" value={String(summary.activeServices)} note="Billable catalog items" />
    </section>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={panel}>
      <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
      <strong style={{ display: "block", fontSize: 24, color: "#0f172a" }}>{value}</strong>
      <span style={{ color: "#64748b", fontSize: 13 }}>{note}</span>
    </article>
  );
}

function InvoicesTable({ invoices, onView }: { invoices: Invoice[]; onView: (invoice: Invoice) => void }) {
  return <TableSection title="Invoices" rows={invoices} headers={["Client", "Invoice Number", "Service/Product", "Amount", "Status", "Due Date", "Notes", "Action"]} renderRow={invoice => [
    invoice.client, invoice.invoiceNumber, invoice.service, money(invoice.amount), invoice.status, displayDate(invoice.dueDate), invoice.notes,
    <button key="view" onClick={() => onView(invoice)} style={smallButton}>View</button>,
  ]} />;
}

function PaymentsTable({ payments, onView }: { payments: Payment[]; onView: (payment: Payment) => void }) {
  return <TableSection title="Payments" rows={payments} headers={["Client", "Payment Reference", "Service/Product", "Amount", "Status", "Payment Date", "Method", "Action"]} renderRow={payment => [
    payment.client, payment.reference, payment.service, money(payment.amount), payment.status, displayDate(payment.paymentDate), payment.method,
    <button key="manage" onClick={() => onView(payment)} style={smallButton}>Manage</button>,
  ]} />;
}

function ServicesTable({ services, onView }: { services: Service[]; onView: (service: Service) => void }) {
  return <TableSection title="Services / Products" rows={services} headers={["Service/Product", "Type", "Amount", "Status", "Notes", "Action"]} renderRow={service => [
    service.name, service.type, money(service.amount), service.status, service.notes,
    <button key="manage" onClick={() => onView(service)} style={smallButton}>Manage</button>,
  ]} />;
}

function PaymentHistory({ payments, onView }: { payments: Payment[]; onView: (payment: Payment) => void }) {
  const totalPaid = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  return (
    <section style={{ marginBottom: 18 }}>
      <h2 style={{ ...sectionTitle, marginBottom: 6 }}>Payment History</h2>
      <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 14 }}>Showing {payments.length} payment records with {money(totalPaid)} collected from paid payments.</p>
      <PaymentsTable payments={payments} onView={onView} />
    </section>
  );
}

function TableSection<T>({ title, rows, headers, renderRow }: { title: string; rows: T[]; headers: string[]; renderRow: (row: T) => React.ReactNode[] }) {
  return (
    <section style={{ ...panel, padding: 0, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0" }}>
        <h2 style={sectionTitle}>{title}</h2>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>{headers.map(header => <th key={header} style={th}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} style={{ borderTop: "1px solid #f1f5f9" }}>
                {renderRow(row).map((cell, cellIndex) => <td key={cellIndex} style={td}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={event => event.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: 720, maxWidth: "100%", maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{title}</h2>
          <button aria-label="Close" onClick={onClose} style={{ ...smallButton, fontSize: 18, lineHeight: 1 }}>x</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

function InvoiceForm({ services, onSave, onCancel }: { services: Service[]; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSave} style={formGrid}>
      <SelectField label="Client/Customer" name="client" options={clients} />
      <Field label="Invoice Number" name="invoiceNumber" defaultValue="INV-1100" />
      <SelectField label="Service/Product" name="service" options={services.map(s => s.name)} />
      <Field label="Amount" name="amount" type="number" defaultValue="149" />
      <SelectField label="Status" name="status" options={invoiceStatuses} />
      <Field label="Due Date" name="dueDate" type="date" defaultValue="2026-05-15" />
      <TextArea label="Notes" name="notes" defaultValue="Client billing notes." />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function PaymentForm({ services, onSave, onCancel }: { services: Service[]; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSave} style={formGrid}>
      <SelectField label="Client/Customer" name="client" options={clients} />
      <Field label="Payment Reference" name="reference" defaultValue="PAY-9000" />
      <SelectField label="Service/Product" name="service" options={services.map(s => s.name)} />
      <Field label="Amount" name="amount" type="number" defaultValue="149" />
      <SelectField label="Status" name="status" options={paymentStatuses} />
      <Field label="Payment Date" name="paymentDate" type="date" defaultValue="2026-05-02" />
      <SelectField label="Payment Method" name="method" options={methods} />
      <TextArea label="Notes" name="notes" defaultValue="Payment received and applied to account." />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function ServiceForm({ onSave, onCancel }: { onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSave} style={formGrid}>
      <Field label="Service/Product" name="name" defaultValue="Document Preparation" />
      <SelectField label="Type" name="type" options={["Service", "Product"]} />
      <Field label="Amount" name="amount" type="number" defaultValue="75" />
      <SelectField label="Status" name="status" options={serviceStatuses} />
      <TextArea label="Notes" name="notes" defaultValue="Reusable catalog item for client billing." />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue = "" }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <label style={fieldLabel}>{label}
      <input required name={name} type={type} defaultValue={defaultValue} step={type === "number" ? "0.01" : undefined} min={type === "number" ? "0" : undefined} style={inputStyle} />
    </label>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label style={fieldLabel}>{label}
      <select required name={name} style={inputStyle}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select>
    </label>
  );
}

function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label style={{ ...fieldLabel, gridColumn: "1 / -1" }}>{label}
      <textarea name={name} defaultValue={defaultValue} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
    </label>
  );
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button type="button" onClick={onCancel} style={secondaryButton}>Cancel</button>
      <button type="submit" style={primaryButton}>Save</button>
    </div>
  );
}

function Details({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const rows = detailRows(detail);
  return (
    <div>
      <p style={{ margin: "0 0 16px", color: "#64748b" }}>Review billing details and manage the record from this panel.</p>
      <dl style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: "10px 16px", margin: 0 }}>
        {rows.map(([key, value]) => (
          <div key={key} style={{ display: "contents" }}>
            <dt style={{ fontWeight: 700, color: "#475569", textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</dt>
            <dd style={{ margin: 0, color: "#0f172a" }}>{typeof value === "number" ? money(value) : String(value)}</dd>
          </div>
        ))}
      </dl>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        <button onClick={onClose} style={primaryButton}>Close Details</button>
      </div>
    </div>
  );
}

function detailRows(detail: Detail): Array<[string, string | number]> {
  if (detail.kind === "Invoice") {
    return Object.entries(detail.item).filter(([key]) => key !== "id");
  }
  if (detail.kind === "Payment") {
    return Object.entries(detail.item).filter(([key]) => key !== "id");
  }
  return Object.entries(detail.item).filter(([key]) => key !== "id");
}

const panel = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.06)" };
const primaryButton = { background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const secondaryButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const smallButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const tabLink = { color: "#1e3a5f", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 12px", textDecoration: "none", fontWeight: 700, fontSize: 13 };
const sectionTitle = { margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" };
const th = { padding: "11px 14px", textAlign: "left" as const, color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" as const };
const td = { padding: "12px 14px", color: "#334155", verticalAlign: "top" as const, whiteSpace: "nowrap" as const };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 };
const fieldLabel = { display: "flex", flexDirection: "column" as const, gap: 6, color: "#374151", fontWeight: 700, fontSize: 13 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, background: "#fff" };
