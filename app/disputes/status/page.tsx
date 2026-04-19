"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_C: Record<string, string> = { pending: "#f59e0b", sent: "#3b82f6", responded: "#8b5cf6", resolved: "#10b981", deleted: "#ef4444" };
const BUREAU_C: Record<string, string> = { equifax: "#ef4444", experian: "#3b82f6", transunion: "#10b981" };

export default function Page() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBureau, setFilterBureau] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("disputes")
      .select("*, clients(first_name, last_name, email)")
      .order("created_at", { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("disputes").update({ status }).eq("id", id);
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status } : d));
    if (selected?.id === id) setSelected((s: any) => ({ ...s, status }));
  }

  const filtered = disputes.filter(d => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (filterBureau !== "all" && d.bureau !== filterBureau) return false;
    if (search) {
      const s = search.toLowerCase();
      const client = `${d.clients?.first_name || ""} ${d.clients?.last_name || ""}`.toLowerCase();
      return client.includes(s) || (d.account_name || "").toLowerCase().includes(s) || (d.bureau || "").includes(s);
    }
    return true;
  });

  const stats = {
    total: disputes.length,
    active: disputes.filter(d => ["pending", "sent"].includes(d.status)).length,
    responded: disputes.filter(d => d.status === "responded").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
  };

  const sel: React.CSSProperties = { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Dispute Status</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Track and manage all active disputes across all bureaus.</p>
          </div>
          <button onClick={load} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" as const }}>
          {[
            { label: "Total Disputes", val: stats.total, color: "#1e3a5f" },
            { label: "Active (Pending / Sent)", val: stats.active, color: "#3b82f6" },
            { label: "Awaiting Response", val: stats.responded, color: "#8b5cf6" },
            { label: "Resolved", val: stats.resolved, color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 160, background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>{loading ? "—" : s.val}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" as const, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or account…" style={{ ...sel, width: 240 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
            <option value="all">All Statuses</option>
            {["pending", "sent", "responded", "resolved", "deleted"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={filterBureau} onChange={e => setFilterBureau(e.target.value)} style={sel}>
            <option value="all">All Bureaus</option>
            {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
          </select>
          {(filterStatus !== "all" || filterBureau !== "all" || search) && (
            <button onClick={() => { setFilterStatus("all"); setFilterBureau("all"); setSearch(""); }} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }}>Clear filters</button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{filtered.length} dispute{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Client", "Account", "Bureau", "Round", "Status", "Filed", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>Loading…</td></tr>
                  : filtered.length === 0
                    ? <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>No disputes found.</td></tr>
                    : filtered.map(d => (
                      <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", background: selected?.id === d.id ? "#eff6ff" : "transparent" }}>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{d.clients ? `${d.clients.first_name} ${d.clients.last_name}` : "—"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{d.clients?.email || ""}</div>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>{d.account_name || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ background: (BUREAU_C[d.bureau] || "#94a3b8") + "22", color: BUREAU_C[d.bureau] || "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" as const }}>{d.bureau}</span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#475569" }}>R{d.round || 1}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ background: (STATUS_C[d.status] || "#94a3b8") + "22", color: STATUS_C[d.status] || "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" as const }}>{d.status}</span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#64748b" }}>{new Date(d.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "11px 16px" }} onClick={e => e.stopPropagation()}>
                          <select value={d.status} onChange={e => updateStatus(d.id, e.target.value)}
                            style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff" }}>
                            {["pending", "sent", "responded", "resolved", "deleted"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>Dispute Detail</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              {[
                ["Client", selected.clients ? `${selected.clients.first_name} ${selected.clients.last_name}` : "—"],
                ["Account", selected.account_name || "—"],
                ["Account #", selected.account_number || "—"],
                ["Bureau", selected.bureau],
                ["Round", `Round ${selected.round || 1}`],
                ["Reason", selected.reason || "—"],
                ["Status", selected.status],
                ["Filed", new Date(selected.created_at).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, textAlign: "right" as const, maxWidth: 180 }}>{v}</span>
                </div>
              ))}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, margin: "8px 0 6px" }}>Update Status</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {["pending", "sent", "responded", "resolved"].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: selected.status === s ? STATUS_C[s] : STATUS_C[s] + "22", color: selected.status === s ? "#fff" : STATUS_C[s] }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CDMLayout>
  );
}
