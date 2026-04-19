"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BUREAU_C: Record<string, string> = { equifax: "#e53e3e", experian: "#2b6cb0", transunion: "#276749" };

function BarChart({ data, color, max }: { data: { label: string; value: number }[]; color: string; max: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, paddingLeft: 32, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, width: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {[max, Math.round(max * 0.5), 0].map((v, i) => <span key={i} style={{ fontSize: 10, color: "#cbd5e1", textAlign: "right" }}>{v}</span>)}
      </div>
      <div style={{ position: "absolute", left: 32, right: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
        {[0, 1, 2].map(i => <div key={i} style={{ borderBottom: "1px dashed #f1f5f9", width: "100%" }} />)}
      </div>
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{d.value > 0 ? d.value : ""}</span>
            <div style={{ width: "80%", height: `${pct}%`, minHeight: pct > 0 ? 3 : 0, background: color, borderRadius: "3px 3px 0 0" }} />
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0, disputes: 0, resolved: 0, revenue: 0, leads: 0 });
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
  const [disputeData, setDisputeData] = useState<{ label: string; value: number }[]>([]);
  const [clientData, setClientData] = useState<{ label: string; value: number }[]>([]);
  const [bureauBreakdown, setBureauBreakdown] = useState<Record<string, number>>({});
  const [period, setPeriod] = useState("6m");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const months = period === "6m" ? 6 : period === "12m" ? 12 : 3;
      const now = new Date();
      const monthLabels = Array.from({ length: months }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
        return { label: MONTHS_SHORT[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
      });

      const [clients, disputes, invoices, leads] = await Promise.all([
        supabase.from("clients").select("id, created_at"),
        supabase.from("disputes").select("id, created_at, status, bureau"),
        supabase.from("invoices").select("id, amount, status, created_at"),
        supabase.from("leads").select("id"),
      ]);

      const aC = clients.data || [], aD = disputes.data || [], aI = invoices.data || [];
      const totalRevenue = aI.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
      setStats({ clients: aC.length, disputes: aD.length, resolved: aD.filter(d => d.status === "resolved").length, revenue: totalRevenue, leads: (leads.data || []).length });

      setRevenueData(monthLabels.map(({ label, year, month }) => ({
        label, value: aI.filter(i => { const d = new Date(i.created_at); return d.getFullYear() === year && d.getMonth() === month && i.status === "paid"; }).reduce((s, i) => s + (i.amount || 0), 0),
      })));
      setDisputeData(monthLabels.map(({ label, year, month }) => ({
        label, value: aD.filter(d => { const dt = new Date(d.created_at); return dt.getFullYear() === year && dt.getMonth() === month; }).length,
      })));
      setClientData(monthLabels.map(({ label, year, month }) => ({
        label, value: aC.filter(c => { const d = new Date(c.created_at); return d.getFullYear() === year && d.getMonth() === month; }).length,
      })));

      const bm: Record<string, number> = {};
      aD.forEach(d => { bm[d.bureau] = (bm[d.bureau] || 0) + 1; });
      setBureauBreakdown(bm);
      setLoading(false);
    }
    load();
  }, [period]);

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Reports</h1>
          <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {[["3m", "3 Mo"], ["6m", "6 Mo"], ["12m", "12 Mo"]].map(([val, label]) => (
              <button key={val} onClick={() => setPeriod(val)} style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, background: period === val ? "#fff" : "transparent", color: period === val ? "#1e293b" : "#64748b", boxShadow: period === val ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {[["Clients", stats.clients, "#3b82f6"], ["Disputes", stats.disputes, "#8b5cf6"], ["Resolved", stats.resolved, "#10b981"], ["Revenue", `$${stats.revenue.toLocaleString()}`, "#f59e0b"], ["Leads", stats.leads, "#94a3b8"]].map(([label, value, color]) => (
            <div key={label as string} style={{ flex: 1, minWidth: 130, background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: color as string }}>{loading ? "—" : value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "18px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Revenue (Paid Invoices)</h2>
            {loading ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading…</div>
              : <BarChart data={revenueData} color="#10b981" max={Math.max(...revenueData.map(d => d.value), 1)} />}
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "18px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Disputes Filed</h2>
            {loading ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading…</div>
              : <BarChart data={disputeData} color="#8b5cf6" max={Math.max(...disputeData.map(d => d.value), 1)} />}
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "18px 18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>New Clients / Month</h2>
            {loading ? <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading…</div>
              : <BarChart data={clientData} color="#3b82f6" max={Math.max(...clientData.map(d => d.value), 1)} />}
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Disputes by Bureau</h2>
            {loading ? <p style={{ color: "#94a3b8" }}>Loading…</p>
              : Object.keys(bureauBreakdown).length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No dispute data yet.</p>
              : Object.entries(bureauBreakdown).sort((a, b) => b[1] - a[1]).map(([bureau, count]) => {
                const total = Object.values(bureauBreakdown).reduce((s, v) => s + v, 0);
                const pct = Math.round((count / total) * 100);
                const color = BUREAU_C[bureau] || "#94a3b8";
                return (
                  <div key={bureau} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{bureau}</span>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 5 }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Dispute Resolution Rate</h2>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: 110, height: 110, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.2"
                  strokeDasharray={`${stats.disputes > 0 ? (stats.resolved / stats.disputes) * 100 : 0} 100`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{stats.disputes > 0 ? Math.round((stats.resolved / stats.disputes) * 100) : 0}%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[["Resolved", stats.resolved, "#10b981"], ["Active / Pending", stats.disputes - stats.resolved, "#f59e0b"], ["Total Disputes", stats.disputes, "#1e3a5f"]].map(([label, value, color]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: color as string, display: "inline-block" }} />{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
