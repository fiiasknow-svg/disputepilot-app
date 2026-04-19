"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PROCESSORS = ["Stripe", "Square", "PayPal", "Authorize.net", "NMI", "Other"];
const PAYMENT_TYPES = ["Single Payment", "Recurring", "Installment"];

export default function Page() {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [processor, setProcessor] = useState("");
  const [paymentType, setPaymentType] = useState("Single Payment");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name").then(({ data }) => setClients(data || []));
  }, []);

  async function process() {
    if (!clientId || !processor || !amount) return;
    setProcessing(true);
    await supabase.from("payments").insert([{
      client_id: clientId,
      processor,
      payment_type: paymentType,
      amount: parseFloat(amount),
      status: "paid",
    }]);
    setProcessing(false);
    setSuccess(true);
    setClientId("");
    setProcessor("");
    setAmount("");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "#1e293b" }}>Payments</h1>

        {success && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#166534", fontWeight: 600, fontSize: 14 }}>
            Payment processed successfully.
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" }}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Processor</label>
              <select value={processor} onChange={e => setProcessor(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" }}>
                <option value="">-- Select Processor --</option>
                {PROCESSORS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Payment Type</label>
              <select value={paymentType} onChange={e => setPaymentType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" }}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Amount ($)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Accepted Methods:</span>
            {/* Credit Card */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>Credit Card</span>
            </div>
            {/* Cash */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>Cash</span>
            </div>
            {/* Bank */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1"/><path d="M3 10l9-7 9 7"/><line x1="12" y1="10" x2="12" y2="21"/><line x1="7" y1="10" x2="7" y2="21"/><line x1="17" y1="10" x2="17" y2="21"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6" }}>Bank Transfer</span>
            </div>
          </div>

          <button onClick={process} disabled={processing || !clientId || !processor || !amount}
            style={{ padding: "12px 36px", background: (!clientId || !processor || !amount) ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: (!clientId || !processor || !amount) ? "not-allowed" : "pointer" }}>
            {processing ? "Processing…" : "Process Payment"}
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
