"use client";

import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

export default function PaymentPage() {
  const [form, setForm] = useState({
    customer: "",
    invoice: "",
    amount: "",
    method: "Card",
    reference: "",
  });

  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Make Payment</h1>
        <p style={subtitle}>Record and process a customer payment.</p>

        <div style={card}>
          <Field label="Customer">
            <input style={input} value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
          </Field>
          <div style={grid2}>
            <Field label="Invoice">
              <input style={input} value={form.invoice} onChange={(e) => setForm({ ...form, invoice: e.target.value })} placeholder="INV-1001" />
            </Field>
            <Field label="Amount">
              <input style={input} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </Field>
          </div>
          <div style={grid2}>
            <Field label="Method">
              <select style={input} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option>Card</option>
                <option>ACH</option>
                <option>Cash</option>
                <option>Check</option>
              </select>
            </Field>
            <Field label="Reference">
              <input style={input} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Txn ID / Check No." />
            </Field>
          </div>
          <div style={actions}>
            <button style={secondaryBtn}>Cancel</button>
            <button style={primaryBtn}>Process Payment</button>
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
const actions: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 10 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 14px", fontWeight: 600, cursor: "pointer" };
