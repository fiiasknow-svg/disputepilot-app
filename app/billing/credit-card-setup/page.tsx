"use client";

import { FormEvent, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const processors = ["Stripe", "Square", "Authorize.Net", "PayPal", "Manual / External"];
const frequencies = ["One-time only", "Monthly recurring", "Weekly recurring", "Custom schedule"];

const panel = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.06)" };
const fieldLabel = { display: "flex", flexDirection: "column" as const, gap: 6, color: "#374151", fontWeight: 700, fontSize: 13 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, background: "#fff" };
const primaryButton = { background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const secondaryButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };

export default function Page() {
  const [enabled, setEnabled] = useState(true);
  const [autoReceipts, setAutoReceipts] = useState(true);
  const [portalPayments, setPortalPayments] = useState(true);
  const [saved, setSaved] = useState("");

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaved(`Saved ${data.get("processor")} card settings for ${data.get("statementName")}.`);
  }

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1120 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b" }}>Credit Card Setup</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Configure credit card processing for client billing. In this area, you can setup a payment processor for your company.</p>
          </div>
          <span style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 800 }}>
            {enabled ? "Processing Enabled" : "Processing Disabled"}
          </span>
        </header>

        {saved && (
          <section role="status" aria-live="polite" style={{ ...panel, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 700, marginBottom: 18 }}>
            {saved}
          </section>
        )}

        <section style={{ ...panel, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Payment Processor Records</h2>
            <button type="button" style={primaryButton}>Add New Payment Processor</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["No.", "Payment Processor Name", "API Key", "Transaction Key", "Default Method", "Test Mode", "Created By", "Last Edited", "Action"].map(header => (
                    <th key={header} style={{ padding: "11px 14px", textAlign: "left", color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: "center", color: "#64748b", borderTop: "1px solid #f1f5f9" }}>No Payment Processor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <form onSubmit={saveSettings} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.65fr)", gap: 18 }}>
          <section style={panel}>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Processor Settings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <label style={fieldLabel}>Payment Processor
                <select name="processor" defaultValue="Stripe" style={inputStyle}>
                  {processors.map((processor) => <option key={processor} value={processor}>{processor}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Statement Descriptor
                <input name="statementName" defaultValue="DisputePilot Billing" style={inputStyle} />
              </label>
              <label style={fieldLabel}>Public Key
                <input name="publicKey" placeholder="pk_live_..." style={inputStyle} />
              </label>
              <label style={fieldLabel}>Webhook Endpoint
                <input name="webhookEndpoint" defaultValue="https://disputepilot-app.vercel.app/api/billing/webhook" style={inputStyle} />
              </label>
              <label style={fieldLabel}>Default Payment Frequency
                <select name="frequency" defaultValue="Monthly recurring" style={inputStyle}>
                  {frequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Failed Payment Retry Days
                <input name="retryDays" type="number" min="0" defaultValue="3" style={inputStyle} />
              </label>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 18 }}>
            <section style={panel}>
              <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Client Payment Options</h2>
              {[
                ["Enable card processing", enabled, setEnabled],
                ["Allow portal payments", portalPayments, setPortalPayments],
                ["Send automatic receipts", autoReceipts, setAutoReceipts],
              ].map(([label, value, setter]) => (
                <label key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, color: "#334155", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  {String(label)}
                  <input type="checkbox" checked={Boolean(value)} onChange={(event) => (setter as (next: boolean) => void)(event.target.checked)} style={{ width: 18, height: 18, accentColor: "#1e3a5f" }} />
                </label>
              ))}
            </section>

            <section style={panel}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Setup Checklist</h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                <li>Connect a processor account.</li>
                <li>Confirm statement descriptor.</li>
                <li>Enable portal payment links.</li>
                <li>Send a test invoice before collecting payments.</li>
              </ul>
            </section>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="reset" style={secondaryButton}>Reset</button>
              <button type="submit" style={primaryButton}>Save Card Setup</button>
            </div>
          </aside>
        </form>
      </main>
    </CDMLayout>
  );
}
