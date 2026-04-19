"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const METHOD_C: Record<string, string> = {
  "Credit Card": "#3b82f6",
  "ACH / Bank Transfer": "#10b981",
  "Check": "#f59e0b",
  "Cash": "#8b5cf6",
  "Other": "#94a3b8",
};

export default function Page() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      setPayments(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = payments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.client_name?.toLowerCase().includes(q) || p.note?.toLowerCase().includes(q));
    }
    if (methodFilter !== "All") result = result.filter(p => p.method === methodFilter);
    if (dateFrom) result = result.filter(p => new Date(p.created_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter(p => new Date(p.created_at) <= new Date(dateTo + "T23:59:59"));
    setFiltered(result);
  }, [search, methodFilter, dateFrom, dateTo, payments]);

  const total = filtered.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Payment History</h1>
          <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 15 }}>
            Total: ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>View and filter all processed payments.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client or note…"
            style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
          />
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
          >
            <option value="All">All Methods</option>
            {Object.keys(METHOD_C).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Date", "Client", "Amount", "Method", "Note", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No payments found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{p.client_name || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#10b981" }}>
                    ${parseFloat(p.amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (METHOD_C[p.method] || "#94a3b8") + "22", color: METHOD_C[p.method] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                      {p.method || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{p.note || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                      {p.status || "paid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>{filtered.length} payment{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </CDMLayout>
  );
}
