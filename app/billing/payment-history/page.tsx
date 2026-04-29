"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYMENT_TYPES = ["ALL", "Single Payment", "Recurring", "Installment"];

export default function Page() {
  const [tab, setTab] = useState<"history" | "interval">("history");
  const [clients, setClients] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name")
      .then(({ data }) => setClients(data || []));
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*, clients(full_name)")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function handleSearch() {
    let r = rows;
    if (clientId) r = r.filter(p => p.client_id === clientId);
    if (type !== "ALL") r = r.filter(p => p.payment_type === type);
    if (from) r = r.filter(p => new Date(p.created_at) >= new Date(from));
    if (to) r = r.filter(p => new Date(p.created_at) <= new Date(to + "T23:59:59"));
    setFiltered(r);
  }

  function handleReset() {
    setClientId(""); setType("ALL"); setFrom(""); setTo("");
    setFiltered(rows);
  }

  const sel = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "#1e293b" }}>Payment History</h1>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>Select Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...sel, minWidth: 180 }}>
                <option value="">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>Payment Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ ...sel, minWidth: 150 }}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>From Date</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={sel} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>To Date</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={sel} />
            </div>
            <button onClick={handleSearch}
              style={{ padding: "9px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-end" }}>
              Search
            </button>
            <button onClick={handleReset}
              style={{ padding: "9px 22px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-end" }}>
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9" }}>
          {(["history", "interval"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t === "history" ? "Payment History" : "Interval Billing History"}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {tab === "history" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Name", "Date Created", "Method", "Service", "Setup Status", "Description", "Amount", "Payment", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>No records found.</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{p.clients?.full_name || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 5, padding: "3px 8px", fontSize: 12, fontWeight: 700 }}>{p.method || p.processor || "—"}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{p.service || "—"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Active</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{p.note || p.payment_type || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "#10b981", whiteSpace: "nowrap" }}>${parseFloat(p.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{p.status || "paid"}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <button style={{ fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#1e3a5f", fontWeight: 600 }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No interval billing history found.</div>
          )}
        </div>
        {tab === "history" && (
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>
    </CDMLayout>
  );
}
