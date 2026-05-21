"use client";

import { FormEvent, useEffect, useState } from "react";
import type React from "react";
import CDMLayout from "@/components/CDMLayout";

type CardSettings = {
  processor: string;
  statementName: string;
  publicKey: string;
  webhookEndpoint: string;
  frequency: string;
  retryDays: string;
  enabled: boolean;
  portalPayments: boolean;
  autoReceipts: boolean;
};

type ProcessorRecord = {
  id: number;
  name: string;
  apiKey: string;
  transactionKey: string;
  defaultMethod: string;
  testMode: boolean;
  createdBy: string;
  lastEdited: string;
};

const processorOptions = ["Stripe", "Square", "Authorize.Net", "PayPal", "Manual / External"];
const frequencies = ["One-time only", "Monthly recurring", "Weekly recurring", "Custom schedule"];
const LOCAL_CARD_KEY = "disputepilot.billing.cardSetup";
const today = "2026-05-21";

const defaultSettings: CardSettings = {
  processor: "Stripe",
  statementName: "DisputePilot Billing",
  publicKey: "",
  webhookEndpoint: "https://disputepilot-app.vercel.app/api/billing/webhook",
  frequency: "Monthly recurring",
  retryDays: "3",
  enabled: true,
  portalPayments: true,
  autoReceipts: true,
};

const panel = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.06)" };
const fieldLabel = { display: "flex", flexDirection: "column" as const, gap: 6, color: "#374151", fontWeight: 700, fontSize: 13 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, background: "#fff" };
const primaryButton = { background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const secondaryButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const smallButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 10px", fontWeight: 700, fontSize: 12, cursor: "pointer" };

export default function Page() {
  const [settings, setSettings] = useState(defaultSettings);
  const [records, setRecords] = useState<ProcessorRecord[]>([]);
  const [modal, setModal] = useState<ProcessorRecord | "new" | null>(null);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(LOCAL_CARD_KEY) || "null");
      if (parsed?.settings) setSettings({ ...defaultSettings, ...parsed.settings });
      if (Array.isArray(parsed?.records)) setRecords(parsed.records);
    } catch {}
  }, []);

  function persist(nextSettings = settings, nextRecords = records) {
    window.localStorage.setItem(LOCAL_CARD_KEY, JSON.stringify({ settings: nextSettings, records: nextRecords }));
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persist(settings, records);
    setSaved(`Saved ${settings.processor} card settings for ${settings.statementName}.`);
  }

  function resetSettings() {
    setSettings(defaultSettings);
    setSaved("Card setup reset to default local settings.");
  }

  function saveProcessor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const current = typeof modal === "object" ? modal : null;
    const record: ProcessorRecord = {
      id: current?.id || Date.now(),
      name: String(data.get("name")),
      apiKey: String(data.get("apiKey")),
      transactionKey: String(data.get("transactionKey")),
      defaultMethod: String(data.get("defaultMethod")),
      testMode: data.get("testMode") === "on",
      createdBy: current?.createdBy || "Local admin",
      lastEdited: today,
    };
    const nextRecords = current ? records.map((item) => item.id === current.id ? record : item) : [record, ...records];
    setRecords(nextRecords);
    persist(settings, nextRecords);
    setModal(null);
    setSaved(`${current ? "Updated" : "Added"} payment processor ${record.name}.`);
  }

  function deleteProcessor(id: number) {
    const nextRecords = records.filter((record) => record.id !== id);
    setRecords(nextRecords);
    persist(settings, nextRecords);
    setSaved("Deleted payment processor record.");
  }

  const update = (key: keyof CardSettings, value: string | boolean) => setSettings((current) => ({ ...current, [key]: value }));

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1120 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b" }}>Credit Card Setup</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Configure credit card processing for client billing. No real payments are charged from this local setup.</p>
          </div>
          <span style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 800 }}>
            {settings.enabled ? "Processing Enabled" : "Processing Disabled"}
          </span>
        </header>

        {saved && <section role="status" aria-live="polite" style={{ ...panel, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 700, marginBottom: 18 }}>{saved}</section>}

        <section style={{ ...panel, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Payment Processor Records</h2>
            <button type="button" onClick={() => setModal("new")} style={primaryButton}>Add New Payment Processor</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>{["No.", "Payment Processor Name", "API Key", "Transaction Key", "Default Method", "Test Mode", "Created By", "Last Edited", "Action"].map(header => <th key={header} style={th}>{header}</th>)}</tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={9} style={{ ...td, padding: 24, textAlign: "center", color: "#64748b" }}>No Payment Processor</td></tr>
                ) : records.map((record, index) => (
                  <tr key={record.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={td}>{index + 1}</td>
                    <td style={td}>{record.name}</td>
                    <td style={td}>{record.apiKey || "Not set"}</td>
                    <td style={td}>{record.transactionKey || "Not set"}</td>
                    <td style={td}>{record.defaultMethod}</td>
                    <td style={td}>{record.testMode ? "Test" : "Live"}</td>
                    <td style={td}>{record.createdBy}</td>
                    <td style={td}>{record.lastEdited}</td>
                    <td style={{ ...td, display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => setModal(record)} style={smallButton}>Edit</button>
                      <button type="button" onClick={() => deleteProcessor(record.id)} style={smallButton}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form onSubmit={saveSettings} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.65fr)", gap: 18 }}>
          <section style={panel}>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Processor Settings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <label style={fieldLabel}>Payment Processor
                <select name="processor" value={settings.processor} onChange={(event) => update("processor", event.target.value)} style={inputStyle}>
                  {processorOptions.map((processor) => <option key={processor} value={processor}>{processor}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Statement Descriptor
                <input name="statementName" value={settings.statementName} onChange={(event) => update("statementName", event.target.value)} style={inputStyle} />
              </label>
              <label style={fieldLabel}>Public Key
                <input name="publicKey" value={settings.publicKey} onChange={(event) => update("publicKey", event.target.value)} placeholder="pk_live_..." style={inputStyle} />
              </label>
              <label style={fieldLabel}>Webhook Endpoint
                <input name="webhookEndpoint" value={settings.webhookEndpoint} onChange={(event) => update("webhookEndpoint", event.target.value)} style={inputStyle} />
              </label>
              <label style={fieldLabel}>Default Payment Frequency
                <select name="frequency" value={settings.frequency} onChange={(event) => update("frequency", event.target.value)} style={inputStyle}>
                  {frequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                </select>
              </label>
              <label style={fieldLabel}>Failed Payment Retry Days
                <input name="retryDays" type="number" min="0" value={settings.retryDays} onChange={(event) => update("retryDays", event.target.value)} style={inputStyle} />
              </label>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 18 }}>
            <section style={panel}>
              <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Client Payment Options</h2>
              {[
                ["Enable card processing", settings.enabled, "enabled"],
                ["Allow portal payments", settings.portalPayments, "portalPayments"],
                ["Send automatic receipts", settings.autoReceipts, "autoReceipts"],
              ].map(([label, value, key]) => (
                <label key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, color: "#334155", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  {String(label)}
                  <input type="checkbox" checked={Boolean(value)} onChange={(event) => update(key as keyof CardSettings, event.target.checked)} style={{ width: 18, height: 18, accentColor: "#1e3a5f" }} />
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
              <button type="button" onClick={resetSettings} style={secondaryButton}>Reset</button>
              <button type="submit" style={primaryButton}>Save Card Setup</button>
            </div>
          </aside>
        </form>

        {modal && (
          <Modal title={modal === "new" ? "Add Payment Processor" : "Edit Payment Processor"} onClose={() => setModal(null)}>
            <ProcessorForm record={modal === "new" ? null : modal} onSave={saveProcessor} onCancel={() => setModal(null)} />
          </Modal>
        )}
      </main>
    </CDMLayout>
  );
}

function ProcessorForm({ record, onSave, onCancel }: { record: ProcessorRecord | null; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSave} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
      <label style={fieldLabel}>Payment Processor Name
        <input name="name" defaultValue={record?.name || "Stripe"} required style={inputStyle} />
      </label>
      <label style={fieldLabel}>API Key
        <input name="apiKey" defaultValue={record?.apiKey || "pk_test_local"} style={inputStyle} />
      </label>
      <label style={fieldLabel}>Transaction Key
        <input name="transactionKey" defaultValue={record?.transactionKey || "txn_test_local"} style={inputStyle} />
      </label>
      <label style={fieldLabel}>Default Method
        <select name="defaultMethod" defaultValue={record?.defaultMethod || "Credit Card"} style={inputStyle}>
          {["Credit Card", "ACH", "PayPal", "Manual"].map((method) => <option key={method} value={method}>{method}</option>)}
        </select>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#334155", fontSize: 14, fontWeight: 700 }}>
        <input name="testMode" type="checkbox" defaultChecked={record?.testMode ?? true} style={{ width: 18, height: 18, accentColor: "#1e3a5f" }} />
        Test Mode
      </label>
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={onCancel} style={secondaryButton}>Cancel</button>
        <button type="submit" style={primaryButton}>Save</button>
      </div>
    </form>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(event) => event.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: 680, maxWidth: "100%", maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{title}</h2>
          <button aria-label="Close" onClick={onClose} style={{ ...smallButton, fontSize: 18, lineHeight: 1 }}>x</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

const th = { padding: "11px 14px", textAlign: "left" as const, color: "#64748b", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" as const };
const td = { padding: "12px 14px", color: "#334155", verticalAlign: "top" as const, whiteSpace: "nowrap" as const };
