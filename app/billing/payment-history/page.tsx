"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYMENT_TYPES = ["ALL", "Single Payment", "Recurring", "Installment"];
const TABS = ["Payment History", "Interval Billing History"];

export default function Page() {
  const [tab, setTab] = useState("Payment History");
  const [clients, setClients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientFilter, setClientFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name").then(({ data }) => setClients(data || []));
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    const { data } = await supabase.from("payments").select("*, clients(full_name)").order("created_at", { ascending: false });
    setPayments(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function search() {
    let result = payments;
    if (clientFilter) result = result.filter(p => p.client_id === clientFilter);
    if (typeFilter !== "ALL") result = result.filter(p => p.payment_type === typeFilter);
    if (dateFrom) result = result.filter(p => new Date(p.created_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter(p => new Date(p.created_at) <= new Date(dateTo + "T23:59:59"));
    setFiltered(result);
  }

  function reset() {
    setClientFilter("");
    setTypeFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setFiltered(payments);
  }

  const selStyle = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff", minWidth: 160 };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "#1e293b" }}>Payment History</h1>

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Select Client</label>
              <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={selStyle}>
                <option value="">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Payment Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selStyle}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={selStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={selStyle} />
            </div>
            <button onClick={search} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer", height: 40 }}>Search</button>
            <button onClick={reset} style={{ padding: "9px 22px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, fontWeight: 600, fontSize: 14, cursor: "pointer", height: 40 }}>Reset</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{t}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {tab === "Payment History" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Name", "Date Created", "Method", "Service", "Setup Status", "Description", "Amount", "Payment", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No payment records found.</td></tr>
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
                    <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "#10b981" }}>${parseFloat(p.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{p.status || "paid"}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#1e3a5f", fontWeight: 600 }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
              <p style={{ fontSize: 15 }}>No interval billing history yet.</p>
            </div>
          )}
        </div>
        {tab === "Payment History" && (
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>
    </CDMLayout>
  );
}
