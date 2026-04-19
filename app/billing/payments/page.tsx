"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYMENT_METHODS = ["Credit Card", "ACH / Bank Transfer", "Check", "Cash", "Other"];
const CARD_ICONS = ["Visa", "Mastercard", "Amex", "Discover"];

export default function Page() {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Credit Card");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  async function processPayment() {
    if (!client || !amount) return;
    setProcessing(true);
    await supabase.from("payments").insert([{
      client_name: client,
      amount: parseFloat(amount),
      method,
      note,
      status: "paid",
      created_at: new Date().toISOString(),
    }]);
    setProcessing(false);
    setSuccess(true);
    setClient("");
    setAmount("");
    setNote("");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 700 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Payments</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Process a payment for a client.</p>

        {success && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#166534", fontWeight: 600, fontSize: 14 }}>
            Payment processed successfully.
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Client Name</label>
            <input
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Enter client name or search…"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Payment Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Invoice #, service description, etc."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, minHeight: 72, resize: "vertical", boxSizing: "border-box" as const }}
            />
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Subtotal</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>${amount ? parseFloat(amount).toFixed(2) : "0.00"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Processing Fee</span>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>$0.00</span>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>${amount ? parseFloat(amount).toFixed(2) : "0.00"}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            {CARD_ICONS.map(card => (
              <span key={card} style={{ fontSize: 11, padding: "3px 8px", background: "#f1f5f9", borderRadius: 4, color: "#64748b", fontWeight: 600 }}>{card}</span>
            ))}
          </div>

          <button
            onClick={processPayment}
            disabled={processing || !client || !amount}
            style={{ width: "100%", padding: "12px", background: (!client || !amount) ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: (!client || !amount) ? "not-allowed" : "pointer" }}
          >
            {processing ? "Processing…" : "Process Payment"}
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
