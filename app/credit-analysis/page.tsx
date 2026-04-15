"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function CreditAnalysisPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, negative: 0, in_dispute: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.from("clients").select("id, name").then(({ data }) => setClients(data || [])); }, []);

  async function loadAccounts(id: string) {
    setSelected(id);
    if (!id) { setAccounts([]); setStats({ total: 0, negative: 0, in_dispute: 0 }); return; }
    setLoading(true);
    const { data } = await supabase.from("credit_accounts").select("*").eq("client_id", id);
    const rows = data || [];
    setAccounts(rows);
    setStats({ total: rows.length, negative: rows.filter((r: any) => r.negative).length, in_dispute: rows.filter((r: any) => r.in_dispute).length });
    setLoading(false);
  }

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Credit Analysis</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Credit Analysis</h2>
        <div style={{ marginBottom: "20px", maxWidth: "360px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Select Client</label>
          <select value={selected} onChange={e => loadAccounts(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", width: "100%" }}>
            <option value="">Choose a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selected && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[["Total Accounts", stats.total, "#2563eb"],["Negative Items", stats.negative, "#dc2626"],["In Dispute", stats.in_dispute, "#d97706"]].map(([l,v,c]) => (
              <div key={l as string} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px 24px", flex: 1, minWidth: "120px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: c as string }}>{v as number}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{l as string}</div>
              </div>
            ))}
          </div>
        )}
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && selected && accounts.length === 0 && <p style={{ color: "#6b7280" }}>No accounts imported yet for this client</p>}
        {!loading && accounts.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Creditor","Account #","Balance","Status","Negative","In Dispute"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{a.creditor || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "monospace" }}>{a.account_number || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{a.balance || 0}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{a.status || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "12px", background: a.negative ? "#fee2e2" : "#f0fdf4", color: a.negative ? "#991b1b" : "#166534" }}>{a.negative ? "Yes" : "No"}</span></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "12px", background: a.in_dispute ? "#fef9c3" : "#f3f4f6", color: a.in_dispute ? "#854d0e" : "#374151" }}>{a.in_dispute ? "Yes" : "No"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!selected && <p style={{ color: "#9ca3af", fontSize: "14px" }}>Select a client above to view their credit accounts</p>}
      </div>
    </CDMLayout>
  );
}
