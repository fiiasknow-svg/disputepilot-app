"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const MAIN_TABS = ["Client Auto Signup", "Signup Basic Settings", "Single Credit Card Authorization"];
const CONTRACTS = ["Standard Service Agreement", "Monthly Billing Authorization", "CROA Disclosure", "Custom Contract v1"];

export default function Page() {
  const [tab, setTab] = useState("Client Auto Signup");
  const [contract, setContract] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requirePhone, setRequirePhone] = useState(true);
  const [requireAddress, setRequireAddress] = useState(false);
  const [allowSelf, setAllowSelf] = useState(true);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [status, setStatus] = useState("");

  const signupUrl = "https://portal.disputepilot.com/signup/auto";

  function copy() {
    navigator.clipboard.writeText(signupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function saveSettings() {
    window.localStorage.setItem("dp_client_auto_signup_settings", JSON.stringify({ contract, enabled, requirePhone, requireAddress, allowSelf }));
    setStatus(`Signup settings saved locally. Contract: ${contract || "None selected"}.`);
  }
  function authorizeCard() {
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      setStatus("Enter cardholder name, card number, expiry, and CVV before local authorization.");
      return;
    }
    setStatus(`Local card authorization recorded for ${cardName}. No payment was charged.`);
  }

  const inp = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 860 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "#1e293b" }}>Client Auto Signup</h1>

        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 32 }}>

          {tab === "Client Auto Signup" && (
            <div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.65 }}>
                Enable client auto signup to let clients register and onboard themselves. Select a contract, copy the signup link, and toggle it live.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Select Contract</label>
                <select value={contract} onChange={e => setContract(e.target.value)}
                  style={{ width: "100%", maxWidth: 420, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" }}>
                  <option value="">-- Select a Contract --</option>
                  {CONTRACTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Signup URL</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 500 }}>
                  <input readOnly value={signupUrl}
                    style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#f8fafc", color: "#64748b" }} />
                  <button onClick={copy}
                    style={{ padding: "10px 18px", background: copied ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Build Signup Form</label>
                <button onClick={() => setBuilderOpen(true)} style={{ padding: "10px 24px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                  Build Signup Form
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Client Auto Signup</span>
                <span style={{ flex: 1, fontSize: 13, color: "#64748b" }}>Allow new clients to self-register through the portal</span>
                <button onClick={() => setEnabled(e => !e)}
                  style={{ position: "relative", width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: enabled ? "#1e3a5f" : "#cbd5e1", padding: 0, flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: enabled ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: enabled ? "#1e3a5f" : "#94a3b8", minWidth: 30 }}>{enabled ? "ON" : "OFF"}</span>
              </div>
            </div>
          )}

          {tab === "Signup Basic Settings" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: "#1e293b" }}>Basic Settings</h2>
              {[
                { label: "Require Phone Number", state: requirePhone, set: setRequirePhone },
                { label: "Require Address", state: requireAddress, set: setRequireAddress },
                { label: "Allow Clients to Self-Select Plan", state: allowSelf, set: setAllowSelf },
              ].map(({ label, state, set }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 14, color: "#1e293b" }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => set((s: boolean) => !s)}
                      style={{ position: "relative", width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: state ? "#1e3a5f" : "#cbd5e1", padding: 0 }}>
                      <span style={{ position: "absolute", top: 2, left: state ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 700, color: state ? "#1e3a5f" : "#94a3b8" }}>{state ? "ON" : "OFF"}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button onClick={saveSettings} style={{ padding: "10px 24px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {tab === "Single Credit Card Authorization" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "#1e293b" }}>Credit Card Authorization</h2>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>Save a single card on file for recurring billing authorization.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Cardholder Name</label>
                  <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name on card" style={inp} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Card Number</label>
                  <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="**** **** **** ****" maxLength={19} style={inp} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Expiry (MM/YY)</label>
                  <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} style={inp} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>CVV</label>
                  <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="***" maxLength={4} style={inp} type="password" />
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <button onClick={authorizeCard} style={{ padding: "10px 28px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  Authorize Card
                </button>
              </div>
            </div>
          )}
          {status && <div role="status" style={{ marginTop: 20, padding: "10px 16px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: status.startsWith("Enter") ? "#b45309" : "#1d4ed8", fontSize: 13, fontWeight: 700 }}>{status}</div>}
        </div>
        {builderOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ width: 560, background: "#fff", borderRadius: 12, padding: 28 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>Signup Form Builder</h2>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Configure visible fields for the client signup form. Current contract: {contract || "None selected"}.</p>
              <div style={{ marginTop: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, fontSize: 13, color: "#1e293b" }}>
                Fields: Name, Email{requirePhone ? ", Phone" : ""}{requireAddress ? ", Address" : ""}{allowSelf ? ", Plan Selection" : ""}.
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setBuilderOpen(false)} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
