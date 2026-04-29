"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_C: Record<string, string> = { pending: "#f59e0b", sent: "#3b82f6", responded: "#8b5cf6", resolved: "#10b981", deleted: "#ef4444" };
const BUREAU_C: Record<string, string> = { equifax: "#ef4444", experian: "#3b82f6", transunion: "#10b981" };
const BUREAUS = ["equifax", "experian", "transunion"];
const STATUSES = ["pending", "sent", "responded", "resolved", "deleted"];
const VIEWS = ["All Disputes", "By Bureau", "By Round"];

export default function Page() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBureau, setFilterBureau] = useState("all");
  const [filterRound, setFilterRound] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [view, setView] = useState("All Disputes");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState("sent");
  const [showBatchModal, setShowBatchModal] = useState(false);

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

  async function batchUpdateStatus() {
    const ids = Array.from(checkedIds);
    await Promise.all(ids.map(id => supabase.from("disputes").update({ status: batchStatus }).eq("id", id)));
    setDisputes(ds => ds.map(d => checkedIds.has(d.id) ? { ...d, status: batchStatus } : d));
    setCheckedIds(new Set());
    setShowBatchModal(false);
  }

  function exportCSV() {
    const rows = [["Client", "Account", "Bureau", "Round", "Status", "Filed Date"]];
    filtered.forEach(d => {
      rows.push([
        d.clients ? `${d.clients.first_name} ${d.clients.last_name}` : "",
        d.account_name || "",
        d.bureau || "",
        `Round ${d.round || 1}`,
        d.status || "",
        new Date(d.created_at).toLocaleDateString(),
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "disputes-status.csv";
    a.click();
  }

  function toggleCheck(id: string) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (checkedIds.size === filtered.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map((d: any) => d.id)));
  }

  const filtered = disputes.filter(d => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (filterBureau !== "all" && d.bureau !== filterBureau) return false;
    if (filterRound !== "all" && String(d.round || 1) !== filterRound) return false;
    if (search) {
      const s = search.toLowerCase();
      const client = `${d.clients?.first_name || ""} ${d.clients?.last_name || ""}`.toLowerCase();
      return client.includes(s) || (d.account_name || "").toLowerCase().includes(s);
    }
    return true;
  });

  const rounds = [...new Set(disputes.map(d => d.round || 1))].sort();

  const stats = {
    total: disputes.length,
    active: disputes.filter(d => ["pending", "sent"].includes(d.status)).length,
    responded: disputes.filter(d => d.status === "responded").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
  };

  const bureauStats = BUREAUS.map(b => ({
    bureau: b,
    total: disputes.filter(d => d.bureau === b).length,
    pending: disputes.filter(d => d.bureau === b && d.status === "pending").length,
    sent: disputes.filter(d => d.bureau === b && d.status === "sent").length,
    responded: disputes.filter(d => d.bureau === b && d.status === "responded").length,
    resolved: disputes.filter(d => d.bureau === b && d.status === "resolved").length,
  }));

  const roundStats = rounds.map(r => ({
    round: r,
    total: disputes.filter(d => (d.round || 1) === r).length,
    resolved: disputes.filter(d => (d.round || 1) === r && d.status === "resolved").length,
    pending: disputes.filter(d => (d.round || 1) === r && d.status === "pending").length,
    sent: disputes.filter(d => (d.round || 1) === r && d.status === "sent").length,
  }));

  const sel: React.CSSProperties = { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" };
  const card: React.CSSProperties = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "14px 18px" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Dispute Status</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Track and manage all active disputes across all bureaus.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {checkedIds.size > 0 && (
              <button onClick={() => setShowBatchModal(true)} style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                Update {checkedIds.size} Selected
              </button>
            )}
            <button onClick={exportCSV} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↓ Export CSV</button>
            <button onClick={load} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↻ Refresh</button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" as const }}>
          {[
            { label: "Total Disputes", val: stats.total, color: "#1e3a5f" },
            { label: "Active (Pending / Sent)", val: stats.active, color: "#3b82f6" },
            { label: "Awaiting Response", val: stats.responded, color: "#8b5cf6" },
            { label: "Resolved", val: stats.resolved, color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 160, ...card, borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>{loading ? "—" : s.val}</p>
            </div>
          ))}
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: view === v ? 700 : 500, color: view === v ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: view === v ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{v}</button>
          ))}
        </div>

        {/* By Bureau View */}
        {view === "By Bureau" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {bureauStats.map(b => (
              <div key={b.bureau} style={{ ...card, borderTop: `4px solid ${BUREAU_C[b.bureau] || "#94a3b8"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ background: (BUREAU_C[b.bureau] || "#94a3b8") + "20", color: BUREAU_C[b.bureau] || "#64748b", borderRadius: 5, padding: "3px 12px", fontSize: 13, fontWeight: 800, textTransform: "capitalize" as const }}>{b.bureau}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{b.total}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>disputes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Pending", val: b.pending, color: "#f59e0b" },
                    { label: "Sent", val: b.sent, color: "#3b82f6" },
                    { label: "Responded", val: b.responded, color: "#8b5cf6" },
                    { label: "Resolved", val: b.resolved, color: "#10b981" },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}</span>
                      </div>
                      {b.total > 0 && (
                        <div style={{ height: 5, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(s.val / b.total) * 100}%`, background: s.color, borderRadius: 10 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* By Round View */}
        {view === "By Round" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {roundStats.length === 0 && !loading && (
              <div style={{ ...card, textAlign: "center", color: "#94a3b8", padding: 40 }}>No dispute data yet.</div>
            )}
            {roundStats.map(r => (
              <div key={r.round} style={{ ...card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#1e3a5f", color: "#fff", borderRadius: 8, padding: "4px 14px", fontSize: 14, fontWeight: 800 }}>Round {r.round}</div>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{r.total} disputes</span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ background: "#f59e0b20", color: "#f59e0b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Pending: {r.pending}</span>
                    <span style={{ background: "#3b82f620", color: "#3b82f6", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Sent: {r.sent}</span>
                    <span style={{ background: "#10b98120", color: "#10b981", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Resolved: {r.resolved}</span>
                  </div>
                </div>
                {r.total > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                      <span>Resolution Rate</span>
                      <span>{Math.round((r.resolved / r.total) * 100)}%</span>
                    </div>
                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(r.resolved / r.total) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#10b981)", borderRadius: 10 }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All Disputes Table View */}
        {view === "All Disputes" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" as const, alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or account…" style={{ ...sel, width: 220 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={filterBureau} onChange={e => setFilterBureau(e.target.value)} style={sel}>
                <option value="all">All Bureaus</option>
                {BUREAUS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
              </select>
              <select value={filterRound} onChange={e => setFilterRound(e.target.value)} style={sel}>
                <option value="all">All Rounds</option>
                {rounds.map(r => <option key={r} value={String(r)}>Round {r}</option>)}
              </select>
              {(filterStatus !== "all" || filterBureau !== "all" || filterRound !== "all" || search) && (
                <button onClick={() => { setFilterStatus("all"); setFilterBureau("all"); setFilterRound("all"); setSearch(""); }} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }}>Clear</button>
              )}
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{filtered.length} dispute{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc" }}><tr>
                    <th style={{ padding: "12px 16px", width: 40 }}>
                      <input type="checkbox" checked={checkedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: "pointer" }} />
                    </th>
                    {["Client", "Account", "Bureau", "Round", "Status", "Filed", "Update Status"].map(h => (
                      <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {loading
                      ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>Loading…</td></tr>
                      : filtered.length === 0
                        ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>No disputes found.</td></tr>
                        : filtered.map(d => (
                          <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)}
                            style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", background: selected?.id === d.id ? "#eff6ff" : checkedIds.has(d.id) ? "#f0fdf4" : "transparent" }}>
                            <td style={{ padding: "11px 16px" }} onClick={e => { e.stopPropagation(); toggleCheck(d.id); }}>
                              <input type="checkbox" checked={checkedIds.has(d.id)} onChange={() => toggleCheck(d.id)} style={{ cursor: "pointer" }} />
                            </td>
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
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Detail Panel */}
              {selected && (
                <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>Dispute Detail</h3>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
                  </div>
                  {/* Bureau badge */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ background: (BUREAU_C[selected.bureau] || "#94a3b8") + "20", color: BUREAU_C[selected.bureau] || "#64748b", borderRadius: 5, padding: "4px 12px", fontSize: 13, fontWeight: 800, textTransform: "capitalize" as const }}>{selected.bureau}</span>
                    <span style={{ background: (STATUS_C[selected.status] || "#94a3b8") + "20", color: STATUS_C[selected.status] || "#64748b", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" as const }}>{selected.status}</span>
                  </div>
                  {[
                    ["Client", selected.clients ? `${selected.clients.first_name} ${selected.clients.last_name}` : "—"],
                    ["Email", selected.clients?.email || "—"],
                    ["Account", selected.account_name || "—"],
                    ["Account #", selected.account_number || "—"],
                    ["Item Type", selected.item_type || "—"],
                    ["Round", `Round ${selected.round || 1}`],
                    ["Reason", selected.reason || "—"],
                    ["Filed", new Date(selected.created_at).toLocaleDateString()],
                    ["Response Date", selected.response_date ? new Date(selected.response_date).toLocaleDateString() : "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{k}</span>
                      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, textAlign: "right" as const, maxWidth: 180 }}>{v}</span>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, margin: "8px 0 8px" }}>Update Status</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                      {["pending", "sent", "responded", "resolved"].map(s => (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: selected.status === s ? STATUS_C[s] : STATUS_C[s] + "22", color: selected.status === s ? "#fff" : STATUS_C[s], transition: "all 0.15s" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selected.reason && (
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 6 }}>Dispute Reason</div>
                      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{selected.reason}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Batch Update Modal */}
        {showBatchModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 380 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Update {checkedIds.size} Disputes</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>Set the status for all selected disputes:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["pending", "sent", "responded", "resolved"].map(s => (
                  <button key={s} onClick={() => setBatchStatus(s)}
                    style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: batchStatus === s ? STATUS_C[s] : STATUS_C[s] + "22", color: batchStatus === s ? "#fff" : STATUS_C[s] }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowBatchModal(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={batchUpdateStatus} style={{ padding: "9px 22px", background: STATUS_C[batchStatus], color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  Set All to "{batchStatus}"
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
