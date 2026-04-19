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
  { bureau: "Equifax", address: "PO Box 740256, Atlanta, GA 30374" },
  { bureau: "Experian", address: "PO Box 4500, Allen, TX 75013" },
  { bureau: "TransUnion", address: "PO Box 2000, Chester, PA 19016" },
];

export default function Page() {
  const [tab, setTab] = useState<"current" | "archive">("current");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [printImages, setPrintImages] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [printing, setPrinting] = useState(false);

  function toggleAll() {
    const allChecked = SAMPLE_ROWS.every(r => checked[r.id]);
    if (allChecked) setChecked({});
    else setChecked(Object.fromEntries(SAMPLE_ROWS.map(r => [r.id, true])));
  }

  function toggle(id: number) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function autoPrint() {
    setPrinting(true);
    await new Promise(r => setTimeout(r, 1500));
    setPrinting(false);
    window.print();
  }

  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Bulk Print</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#475569" }}>
              <input type="checkbox" checked={printImages} onChange={e => setPrintImages(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
              Print Images
            </label>
            <button onClick={() => setShowAddresses(true)}
              style={{ padding: "9px 18px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
              Credit Bureau Addresses
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {(["current", "archive"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, textTransform: "capitalize" as const }}>
              {t === "current" ? "Current" : "Archive"}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {tab === "current" ? (
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
                      <input type="checkbox" checked={!!checked[row.id]} onChange={() => toggle(row.id)}
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

        {/* Print button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button onClick={autoPrint} disabled={printing || selectedCount === 0}
            style={{ padding: "13px 48px", background: selectedCount === 0 ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: selectedCount === 0 ? "not-allowed" : "pointer" }}>
            {printing ? "Processing…" : `Print Automation${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </button>
        </div>
      </div>

      {/* Bureau Addresses Modal */}
      {showAddresses && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Credit Bureau Addresses</h2>
              <button onClick={() => setShowAddresses(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>x</button>
            </div>
            {BUREAU_ADDRESSES.map(b => (
              <div key={b.bureau} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{b.bureau}</div>
                <div style={{ fontSize: 13, color: "#475569" }}>{b.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
