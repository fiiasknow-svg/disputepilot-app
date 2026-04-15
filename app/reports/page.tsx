"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ReportsPage() {
  const [stats, setStats] = useState({ clients: 0, disputes: 0, letters: 0, leads: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("letters").select("*", { count: "exact", head: true }),
      supabase.from("web_leads").select("*", { count: "exact", head: true }),
      supabase.from("clients").select("name, email, status, created_at").order("created_at", { ascending: false }).limit(10),
    ]).then(([c, d, l, w, r]) => {
      setStats({ clients: c.count || 0, disputes: d.count || 0, letters: l.count || 0, leads: w.count || 0 });
      setRecent(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const card = (label: string, val: number, color: string) => (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", flex: 1, minWidth: "140px" }}>
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "32px", fontWeight: 700, color }}>{val}</div>
    </div>
  );

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Reports</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Reports & Analytics</h2>
        {loading ? <p style={{ color: "#6b7280" }}>Loading...</p> : <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {card("Total Clients", stats.clients, "#2563eb")}
            {card("Active Disputes", stats.disputes, "#d97706")}
            {card("Letters Sent", stats.letters, "#16a34a")}
            {card("Total Leads", stats.leads, "#9333ea")}
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", fontWeight: 700, fontSize: "15px" }}>Recent Clients</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Name","Email","Status","Date Added"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {recent.length === 0 ? <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No clients yet</td></tr> :
                  recent.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 16px", fontSize: "14px" }}>{c.name || "—"}</td>
                      <td style={{ padding: "10px 16px", fontSize: "14px" }}>{c.email || "—"}</td>
                      <td style={{ padding: "10px 16px" }}><span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "12px", background: c.status === "active" ? "#dcfce7" : "#f3f4f6", color: c.status === "active" ? "#166534" : "#374151" }}>{c.status || "—"}</span></td>
                      <td style={{ padding: "10px 16px", fontSize: "13px", color: "#6b7280" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>}
      </div>
    </CDMLayout>
  );
}
