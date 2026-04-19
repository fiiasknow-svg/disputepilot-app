"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REPORT_TYPES = ["Standard Analysis", "3-Bureau Report", "Single Bureau", "Score Simulator", "Dispute Summary"];
const TABS = ["Credit Analysis Template", "Process Report Template"];

export default function Page() {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [reportType, setReportType] = useState("Standard Analysis");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [building, setBuilding] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState("Credit Analysis Template");

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name")
      .then(({ data }) => setClients(data || []));
  }, []);

  async function buildReport() {
    if (!clientId) return;
    setBuilding(true);
    await new Promise(r => setTimeout(r, 1000));
    const client = clients.find(c => c.id === clientId);
    const parts = (client?.full_name || "").split(" ");
    setReports(prev => [...prev, {
      id: Date.now(),
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || "",
      email: "—",
      date: new Date().toLocaleDateString(),
      build_type: reportType,
      client_id: clientId,
    }]);
    setBuilding(false);
  }

  const sel = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff", boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "#1e293b" }}>Credit Analysis / Analyzer</h1>

        {/* Controls */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={sel}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={sel}>
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>HTML Credit Report</label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {htmlFile ? htmlFile.name.slice(0, 20) : "Browse HTML File"}
                <input type="file" accept=".html,.htm" onChange={e => setHtmlFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
              </label>
            </div>
            <button onClick={buildReport} disabled={building || !clientId}
              style={{ padding: "10px 28px", background: !clientId ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: !clientId ? "not-allowed" : "pointer" }}>
              {building ? "Building…" : "Build Report"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Status", "First Name", "Last Name", "Email", "Date", "Build Type", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 44, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  Select a client and click Build Report to generate an analysis.
                </td></tr>
              ) : reports.map(r => (
                <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Active</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{r.first_name}</td>
                  <td style={{ padding: "11px 16px", fontSize: 14, color: "#475569" }}>{r.last_name}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#64748b" }}>{r.email}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>{r.date}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{r.build_type}</span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ fontSize: 12, padding: "4px 10px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Analysis</button>
                      <button style={{ fontSize: 12, padding: "4px 10px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Analyzer</button>
                      <button style={{ fontSize: 12, padding: "4px 10px", background: "#10b981", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Progress</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CDMLayout>
  );
}
