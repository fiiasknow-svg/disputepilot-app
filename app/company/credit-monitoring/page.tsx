"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const PROVIDERS = [
  { key: "smartcredit", name: "SmartCredit", color: "#3b82f6", defaultUrl: "https://www.smartcredit.com" },
  { key: "myfreescore", name: "MyFreeScore360", color: "#10b981", defaultUrl: "https://www.myfreescore360.com" },
  { key: "identityiq", name: "IdentityIQ", color: "#8b5cf6", defaultUrl: "https://www.identityiq.com" },
  { key: "myscoreiq", name: "mySCOREIQ", color: "#f59e0b", defaultUrl: "https://www.myscoreiq.com" },
  { key: "privacyguard", name: "PrivacyGuard", color: "#ef4444", defaultUrl: "https://www.privacyguard.com" },
];

export default function Page() {
  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(PROVIDERS.map(p => [p.key, p.defaultUrl]))
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(PROVIDERS.map(p => [p.key, false]))
  );
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, "ok" | null>>({});

  async function test(key: string) {
    setTesting(key);
    await new Promise(r => setTimeout(r, 1200));
    setTestResult(prev => ({ ...prev, [key]: "ok" }));
    setTesting(null);
    setTimeout(() => setTestResult(prev => ({ ...prev, [key]: null })), 3000);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 860 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Credit Monitoring</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Configure credit monitoring providers for your clients.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PROVIDERS.map(p => (
            <div key={p.key} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", minWidth: 148 }}>{p.name}</span>
                <input value={urls[p.key]} onChange={e => setUrls(prev => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder="Affiliate URL"
                  style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }} />
                <button onClick={() => test(p.key)} disabled={testing === p.key}
                  style={{ padding: "8px 18px", background: testResult[p.key] === "ok" ? "#10b981" : "#f1f5f9", color: testResult[p.key] === "ok" ? "#fff" : "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {testing === p.key ? "Testing…" : testResult[p.key] === "ok" ? "Connected" : "Test"}
                </button>
                <button onClick={() => setEnabled(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                  style={{ position: "relative", width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: enabled[p.key] ? p.color : "#cbd5e1", padding: 0, flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: enabled[p.key] ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: enabled[p.key] ? p.color : "#94a3b8", minWidth: 30 }}>{enabled[p.key] ? "ON" : "OFF"}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button style={{ padding: "10px 28px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Save Settings
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
