"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const SAMPLE_ROWS = [
  { id: 1, user: "Maria Johnson", org: "CreditFix Pro", campaign: "Round 1 Equifax", letter: "Standard Dispute Letter", date: "2024-11-01" },
  { id: 2, user: "James Williams", org: "CreditFix Pro", campaign: "Round 1 TransUnion", letter: "Medical Debt Dispute", date: "2024-11-02" },
  { id: 3, user: "Sophia Davis", org: "CreditFix Pro", campaign: "Round 2 Experian", letter: "Method of Verification", date: "2024-11-03" },
  { id: 4, user: "Liam Brown", org: "CreditFix Pro", campaign: "Round 1 Equifax", letter: "Collections Dispute", date: "2024-11-04" },
  { id: 5, user: "Olivia Martinez", org: "CreditFix Pro", campaign: "Creditor Direct", letter: "Debt Validation Letter", date: "2024-11-05" },
  { id: 6, user: "Noah Garcia", org: "CreditFix Pro", campaign: "Round 3 All Bureaus", letter: "Escalation Letter", date: "2024-11-06" },
  { id: 7, user: "Emma Wilson", org: "CreditFix Pro", campaign: "Round 1 TransUnion", letter: "Late Payment Dispute", date: "2024-11-07" },
  { id: 8, user: "Aiden Thompson", org: "CreditFix Pro", campaign: "Round 2 Equifax", letter: "Identity Theft Letter", date: "2024-11-08" },
];

const BUREAU_ADDRESSES = [
  {
    bureau: "Equifax",
    icon: "🟥",
    color: "#ef4444",
    dispute: "Equifax Information Services LLC\nPO Box 740256\nAtlanta, GA 30374",
    fraud: "Equifax Consumer Fraud Division\nPO Box 105069\nAtlanta, GA 30348",
    online: "equifax.com/personal/disputes",
  },
  {
    bureau: "Experian",
    icon: "🟦",
    color: "#3b82f6",
    dispute: "Experian National Consumer Assistance Center\nPO Box 4500\nAllen, TX 75013",
    fraud: "Experian Fraud Department\nPO Box 9554\nAllen, TX 75013",
    online: "experian.com/disputes/main.html",
  },
  {
    bureau: "TransUnion",
    icon: "🟧",
    color: "#f59e0b",
    dispute: "TransUnion Consumer Solutions\nPO Box 2000\nChester, PA 19016",
    fraud: "TransUnion Fraud Victim Assistance\nPO Box 6790\nFullerton, CA 92834",
    online: "transunion.com/credit-disputes",
  },
];

const AUTOMATION_RULES = [
  { id: 1, name: "Auto-Print on New Dispute Round", trigger: "When a new dispute round starts", action: "Generate & queue all letters for printing", active: true },
  { id: 2, name: "Monthly Batch Print", trigger: "1st of every month at 8:00 AM", action: "Print all pending letters for active clients", active: false },
  { id: 3, name: "Bureau Response Follow-up", trigger: "30 days after dispute round sent", action: "Queue follow-up letters for unresolved items", active: true },
];

type MainTab = "Print Queue" | "Credit Bureau Addresses" | "Print Automation";
type QueueTab = "current" | "archive";

export default function Page() {
  const [tab, setTab] = useState<MainTab>("Print Queue");
  const [queueTab, setQueueTab] = useState<QueueTab>("current");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [printImages, setPrintImages] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [rules, setRules] = useState(AUTOMATION_RULES);
  const [copiedBureau, setCopiedBureau] = useState<string | null>(null);

  function toggleAll() {
    const allChecked = SAMPLE_ROWS.every(r => checked[r.id]);
    setChecked(allChecked ? {} : Object.fromEntries(SAMPLE_ROWS.map(r => [r.id, true])));
  }

  function toggleRow(id: number) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function autoPrint() {
    setPrinting(true);
    await new Promise(r => setTimeout(r, 1500));
    setPrinting(false);
    window.print();
  }

  function copyAddress(bureau: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedBureau(bureau);
    setTimeout(() => setCopiedBureau(null), 2000);
  }

  function toggleRule(id: number) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }

  const selectedCount = Object.values(checked).filter(Boolean).length;

  const MAIN_TABS: MainTab[] = ["Print Queue", "Credit Bureau Addresses", "Print Automation"];

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Bulk Print</h1>
          {tab === "Print Queue" && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#475569" }}>
              <input type="checkbox" checked={printImages} onChange={e => setPrintImages(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
              Print Images
            </label>
          )}
        </div>

        {/* Main Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" as const }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Print Queue Tab ── */}
        {tab === "Print Queue" && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 2, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", marginBottom: 0 }}>
              {(["current", "archive"] as const).map(t => (
                <button key={t} onClick={() => setQueueTab(t)}
                  style={{ padding: "8px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: queueTab === t ? 700 : 500, color: queueTab === t ? "#1e3a5f" : "#64748b", borderBottom: queueTab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -1, textTransform: "capitalize" as const }}>
                  {t === "current" ? "Current" : "Archive"}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              {queueTab === "current" ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "11px 16px", textAlign: "left" as const }}>
                        <input type="checkbox" checked={SAMPLE_ROWS.every(r => checked[r.id])} onChange={toggleAll}
                          style={{ width: 16, height: 16, accentColor: "#1e3a5f", cursor: "pointer" }} />
                      </th>
                      {["Status", "User Name", "Organization", "Campaign", "Letter Name", "Date", "Action"].map(h => (
                        <th key={h} style={{ textAlign: "left" as const, padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map(row => (
                      <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9", background: checked[row.id] ? "#eff6ff" : "#fff" }}>
                        <td style={{ padding: "11px 16px" }}>
                          <input type="checkbox" checked={!!checked[row.id]} onChange={() => toggleRow(row.id)}
                            style={{ width: 16, height: 16, accentColor: "#1e3a5f", cursor: "pointer" }} />
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Active</span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{row.user}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{row.org}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{row.campaign}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{row.letter}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "#94a3b8" }}>{row.date}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No archived print jobs.</div>
              )}
            </div>

            {selectedCount > 0 && (
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected</p>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button onClick={autoPrint} disabled={printing || selectedCount === 0}
                style={{ padding: "13px 48px", background: selectedCount === 0 ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: selectedCount === 0 ? "not-allowed" : "pointer" }}>
                {printing ? "Processing…" : `Print Selected${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
              </button>
            </div>
          </>
        )}

        {/* ── Credit Bureau Addresses Tab ── */}
        {tab === "Credit Bureau Addresses" && (
          <div style={{ paddingTop: 24 }}>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>Official mailing addresses for dispute and fraud letters to each credit bureau.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {BUREAU_ADDRESSES.map(b => (
                <div key={b.bureau} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                  <div style={{ background: b.color + "15", borderBottom: `3px solid ${b.color}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{b.bureau}</span>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Dispute Address</div>
                      <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontFamily: "monospace", background: "#f8fafc", borderRadius: 6, padding: "8px 10px", whiteSpace: "pre-line" as const }}>{b.dispute}</div>
                      <button onClick={() => copyAddress(b.bureau + "-dispute", b.dispute)}
                        style={{ marginTop: 6, fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#475569" }}>
                        {copiedBureau === b.bureau + "-dispute" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Fraud Address</div>
                      <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontFamily: "monospace", background: "#f8fafc", borderRadius: 6, padding: "8px 10px", whiteSpace: "pre-line" as const }}>{b.fraud}</div>
                      <button onClick={() => copyAddress(b.bureau + "-fraud", b.fraud)}
                        style={{ marginTop: 6, fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#475569" }}>
                        {copiedBureau === b.bureau + "-fraud" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Online Disputes</div>
                      <div style={{ fontSize: 13, color: b.color, fontWeight: 600 }}>{b.online}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Print Automation Tab ── */}
        {tab === "Print Automation" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Automate when letters are generated and queued for printing.</p>
              <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Rule</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{rule.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, color: "#64748b" }}>Trigger:</span> {rule.trigger}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      <span style={{ fontWeight: 600, color: "#64748b" }}>Action:</span> {rule.action}
                    </div>
                  </div>
                  <span style={{ background: rule.active ? "#dcfce722" : "#f1f5f9", color: rule.active ? "#166534" : "#94a3b8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => toggleRule(rule.id)}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: rule.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative" as const, flexShrink: 0 }}>
                    <span style={{ position: "absolute" as const, top: 3, left: rule.active ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                  <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#475569", flexShrink: 0 }}>Edit</button>
                </div>
              ))}
            </div>

            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "12px 16px", marginTop: 20, fontSize: 13, color: "#0369a1" }}>
              <strong>Tip:</strong> Print automation rules run in the background. Letters are queued in the Print Queue tab and printed in batches based on your schedule.
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
