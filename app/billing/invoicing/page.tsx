"use client";

import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

export default function BillingInvoicingPage() {
  const [form, setForm] = useState({
    customer: "",
    invoiceNumber: "",
    dueDate: "",
    amount: "",
    notes: "",
  });

  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Invoicing</h1>
        <p style={subtitle}>Create and prepare invoices for customer billing.</p>
        <div style={card}>
          <Field label="Customer">
            <input style={input} value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
          </Field>
          <div style={grid2}>
            <Field label="Invoice Number">
              <input style={input} value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="INV-1001" />
            </Field>
            <Field label="Due Date">
              <input type="date" style={input} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Amount">
            <input style={input} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Notes">
            <textarea style={textarea} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
          </Field>
          <div style={actions}>
            <button style={secondaryBtn}>Save Draft</button>
            <button style={primaryBtn}>Create Invoice</button>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <span style={{ color: "#334155", fontSize: 13, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const container: React.CSSProperties = { padding: 24, background: "#ffffff", minHeight: "100vh" };
const title: React.CSSProperties = { margin: 0, fontSize: 28, color: "#0f172a" };
const subtitle: React.CSSProperties = { margin: "8px 0 18px", color: "#64748b" };
const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const input: React.CSSProperties = { border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fff" };
const textarea: React.CSSProperties = { border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", fontSize: 14, minHeight: 110, resize: "vertical", outline: "none", background: "#fff" };
const actions: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 10 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 14px", fontWeight: 600, cursor: "pointer" };
