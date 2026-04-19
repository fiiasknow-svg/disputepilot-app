"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REPORT_TYPES = ["Standard Report", "3-Bureau Report", "Single Bureau"];
const CHECKS = ["Credit Analysis", "Personal Information", "Return Item"];

export default function Page() {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [reportType, setReportType] = useState("Standard Report");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [building, setBuilding] = useState(false);
  const [estimates, setEstimates] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name").then(({ data }) => setClients(data || []));
  }, []);

  function toggle(k: string) { setChecked(p => ({ ...p, [k]: !p[k] })); }

  async function buildEstimate() {
    if (!clientId) return;
    setBuilding(true);
    await new Promise(r => setTimeout(r, 900));
    const c = clients.find(x => x.id === clientId);
    const parts = (c?.full_name || "").split(" ");
    setEstimates(prev => [...prev, {
      id: Date.now(),
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || "",
      email: "—",
      date: new Date().toLocaleDateString(),
      preview: Object.keys(checked).filter(k => checked[k]).join(", ") || "None",
      report_type: reportType,
    }]);
    setBuilding(false);
  }

  const sel = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff", boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "#1e293b" }}>Pay Per Deletion</h1>

        {/* Controls */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>

            {/* Checkboxes */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 14px" }}>Include Sections</p>
              {CHECKS.map(label => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!checked[label]} onChange={() => toggle(label)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1e3a5f" }} />
                  <span style={{ fontSize: 14, color: "#1e293b" }}>{label}</span>
                </label>
              ))}
            </div>

            {/* Client + Report Type */}
            <div style={{ flex: 1, minWidth: 200, maxWidth: 280 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...sel, marginBottom: 16 }}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={sel}>
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Upload + Build */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>HTML Credit Report</p>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {htmlFile ? htmlFile.name.slice(0, 22) : "Browse HTML File"}
                  <input type="file" accept=".html,.htm" onChange={e => setHtmlFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                </label>
              </div>
              <button onClick={buildEstimate} disabled={building || !clientId}
                style={{ padding: "11px 28px", background: !clientId ? "#cbd5e1" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: !clientId ? "not-allowed" : "pointer" }}>
                {building ? "Building…" : "Build Estimate"}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 28 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["First Name", "Last Name", "Email", "Date", "Estimation Preview", "Report Type", "Send Email", "Downloads", "Send a Contract", "Action"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estimates.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 44, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                    Select a client and click Build Estimate to generate a preview.
                  </td>
                </tr>
              ) : estimates.map(e => (
                <tr key={e.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{e.first_name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 14, color: "#475569" }}>{e.last_name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{e.email}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>{e.date}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{e.preview}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{e.report_type}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <button style={{ fontSize: 12, padding: "5px 12px", background: "#eff6ff", border: "none", borderRadius: 5, cursor: "pointer", color: "#3b82f6", fontWeight: 700 }}>Send</button>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <button style={{ fontSize: 12, padding: "5px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", color: "#475569", fontWeight: 600 }}>Download</button>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <button style={{ fontSize: 12, padding: "5px 12px", background: "#f0fdf4", border: "none", borderRadius: 5, cursor: "pointer", color: "#16a34a", fontWeight: 700 }}>Contract</button>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={() => setEstimates(x => x.filter(r => r.id !== e.id))}
                      style={{ fontSize: 12, padding: "5px 10px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { title: "Cover and Welcome", desc: "Personalized cover letter and welcome message included with the client estimate package." },
            { title: "Good Faith Estimate", desc: "Itemized breakdown of services and projected deletion fees sent directly to the client." },
            { title: "Final Preview", desc: "Combined preview of all sections before sending the full estimate to the client." },
          ].map(card => (
            <div key={card.title} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24, borderTop: "3px solid #1e3a5f" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: "#1e293b" }}>{card.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, marginBottom: 20 }}>{card.desc}</p>
              <button style={{ width: "100%", padding: "9px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>
    </CDMLayout>
  );
}
