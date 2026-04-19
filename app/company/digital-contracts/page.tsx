"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["Contracts", "Digital Signature Records"];

const SAMPLE_CONTRACTS = [
  { id: "CON-001", name: "Credit Repair Service Agreement", type: "Service", created_by: "Admin", last_edited: "2024-10-15" },
  { id: "CON-002", name: "Monthly Billing Authorization", type: "Billing", created_by: "Admin", last_edited: "2024-10-20" },
  { id: "CON-003", name: "CROA Disclosure Agreement", type: "Compliance", created_by: "Admin", last_edited: "2024-11-01" },
];

export default function Page() {
  const [tab, setTab] = useState("Contracts");
  const [contracts, setContracts] = useState(SAMPLE_CONTRACTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Service" });

  function add() {
    if (!form.name) return;
    const id = "CON-" + String(contracts.length + 1).padStart(3, "0");
    setContracts(prev => [...prev, { id, name: form.name, type: form.type, created_by: "Admin", last_edited: new Date().toISOString().slice(0, 10) }]);
    setForm({ name: "", type: "Service" });
    setShowForm(false);
  }

  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Digital Contracts</h1>
          <button onClick={() => setShowForm(true)}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Add New Contract
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {tab === "Contracts" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Contract ID", "Name", "Type", "Created By", "Last Edited", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{c.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{c.type}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{c.created_by}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{c.last_edited}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#1e3a5f", fontWeight: 600 }}>Edit</button>
                        <button onClick={() => setContracts(prev => prev.filter(x => x.id !== c.id))}
                          style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              No digital signature records yet.
            </div>
          )}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Contract</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Contract Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ ...inp }}>
                  {["Service", "Billing", "Compliance", "Disclosure", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={add} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Add Contract</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
