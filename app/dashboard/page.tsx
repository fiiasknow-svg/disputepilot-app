"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const card = (bg: string) => ({
  background: bg, borderRadius: 10, padding: "20px 24px", flex: 1, minWidth: 180, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
});
const statNum = { fontSize: 32, fontWeight: 800, color: "#1e293b", margin: 0 };
const statLabel = { fontSize: 13, color: "#64748b", marginBottom: 4 };

export default function Page() {
  const router = useRouter();
  const [stats, setStats] = useState({ clients: 0, disputes: 0, leads: 0, revenue: 0 });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentDisputes, setRecentDisputes] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, d, l, inv] = await Promise.all([
        supabase.from("clients").select("id, first_name, last_name, status, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("disputes").select("id, account_name, bureau, status, created_at, clients(first_name,last_name)", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("invoices").select("amount").eq("status", "paid"),
      ]);
      const revenue = (inv.data || []).reduce((s: number, r: any) => s + (r.amount || 0), 0);
      setStats({ clients: c.count || 0, disputes: d.count || 0, leads: l.count || 0, revenue });
      setRecentClients(c.data || []);
      setRecentDisputes(d.data || []);
      const acts: any[] = [
        ...(c.data || []).slice(0, 3).map((x: any) => ({ type: "client", text: `New client: ${x.first_name} ${x.last_name}`, time: x.created_at })),
        ...(d.data || []).slice(0, 3).map((x: any) => ({ type: "dispute", text: `Dispute filed: ${x.account_name || "Account"} (${x.bureau})`, time: x.created_at })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
      setActivity(acts);
      setLoading(false);
    }
    load();
  }, []);

  const statusColor: Record<string, string> = { active: "#10b981", pending: "#f59e0b", inactive: "#94a3b8", new: "#3b82f6", resolved: "#10b981", sent: "#8b5cf6" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b" }}>Dashboard</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Welcome back — here's your overview</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.push("/clients")} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ New Client</button>
            <button onClick={() => router.push("/disputes")} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ New Dispute</button>
            <button onClick={() => router.push("/letters")} style={{ background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 7, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ New Letter</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={card("#f0f9ff")}>
            <p style={statLabel}>Total Clients</p>
            <p style={{ ...statNum, color: "#0369a1" }}>{loading ? "—" : stats.clients}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Active in system</p>
          </div>
          <div style={card("#fef9c3")}>
            <p style={statLabel}>Active Disputes</p>
            <p style={{ ...statNum, color: "#92400e" }}>{loading ? "—" : stats.disputes}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Across all bureaus</p>
          </div>
          <div style={card("#f0fdf4")}>
            <p style={statLabel}>Revenue</p>
            <p style={{ ...statNum, color: "#166534" }}>${loading ? "—" : stats.revenue.toLocaleString()}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Paid invoices</p>
          </div>
          <div style={card("#fdf4ff")}>
            <p style={statLabel}>Leads</p>
            <p style={{ ...statNum, color: "#7e22ce" }}>{loading ? "—" : stats.leads}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>In pipeline</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Recent Clients */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Clients</h2>
              <button onClick={() => router.push("/clients")} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>View all →</button>
            </div>
            {loading ? <p style={{ color: "#94a3b8" }}>Loading…</p> : recentClients.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No clients yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Name", "Status"].map(h => <th key={h} style={{ textAlign: "left", fontSize: 12, color: "#64748b", paddingBottom: 8, fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>{recentClients.map((c: any) => (
                  <tr key={c.id} onClick={() => router.push(`/clients/${c.id}`)} style={{ cursor: "pointer", borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "8px 0", fontSize: 14 }}>{c.first_name} {c.last_name}</td>
                    <td style={{ padding: "8px 0" }}>
                      <span style={{ background: (statusColor[c.status] || "#94a3b8") + "22", color: statusColor[c.status] || "#64748b", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{c.status || "active"}</span>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Recent Disputes */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Disputes</h2>
              <button onClick={() => router.push("/disputes")} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>View all →</button>
            </div>
            {loading ? <p style={{ color: "#94a3b8" }}>Loading…</p> : recentDisputes.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No disputes yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Account", "Bureau", "Status"].map(h => <th key={h} style={{ textAlign: "left", fontSize: 12, color: "#64748b", paddingBottom: 8, fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>{recentDisputes.map((d: any) => (
                  <tr key={d.id} onClick={() => router.push(`/disputes/${d.id}`)} style={{ cursor: "pointer", borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "8px 0", fontSize: 14 }}>{d.account_name || "Unknown"}</td>
                    <td style={{ padding: "8px 0", fontSize: 13, color: "#64748b" }}>{d.bureau}</td>
                    <td style={{ padding: "8px 0" }}>
                      <span style={{ background: (statusColor[d.status] || "#94a3b8") + "22", color: statusColor[d.status] || "#64748b", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{d.status || "pending"}</span>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", gridColumn: "span 2" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Recent Activity</h2>
            {loading ? <p style={{ color: "#94a3b8" }}>Loading…</p> : activity.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No recent activity</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activity.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.type === "client" ? "#3b82f6" : "#8b5cf6", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(a.time).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
