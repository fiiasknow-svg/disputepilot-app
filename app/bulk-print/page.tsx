"use client";
import { useState, useMemo, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const BUREAU_ADDRESSES = [
  {
    bureau: "Equifax", color: "#ef4444",
    dispute: "Equifax Information Services LLC\nPO Box 740256\nAtlanta, GA 30374",
    fraud: "Equifax Consumer Fraud Division\nPO Box 105069\nAtlanta, GA 30348",
    online: "equifax.com/personal/disputes",
  },
  {
    bureau: "Experian", color: "#3b82f6",
    dispute: "Experian National Consumer Assistance Center\nPO Box 4500\nAllen, TX 75013",
    fraud: "Experian Fraud Department\nPO Box 9554\nAllen, TX 75013",
    online: "experian.com/disputes/main.html",
  },
  {
    bureau: "TransUnion", color: "#f59e0b",
    dispute: "TransUnion Consumer Solutions\nPO Box 2000\nChester, PA 19016",
    fraud: "TransUnion Fraud Victim Assistance\nPO Box 6790\nFullerton, CA 92834",
    online: "transunion.com/credit-disputes",
  },
];

const AUTOMATION_RULES = [
  { id: 1, name: "Auto-Print on New Dispute Round", trigger: "When a new dispute round starts", action: "Generate & queue all letters for printing", active: true },
  { id: 2, name: "Monthly Batch Print", trigger: "1st of every month at 8:00 AM", action: "Print all pending letters for active clients", active: false },
  { id: 3, name: "Bureau Response Follow-up", trigger: "30 days after dispute round sent", action: "Queue follow-up letters for unresolved items", active: true },
];

const PAGE_SIZE = 15;
type MainTab = "Print Queue" | "Credit Bureau Addresses" | "Print Automation";
type QueueTab = "current" | "archive";

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending:   { background: "#fef9c3", color: "#854d0e" },
  sent:      { background: "#dbeafe", color: "#1e40af" },
  printed:   { background: "#dcfce7", color: "#166534" },
  archived:  { background: "#f1f5f9", color: "#64748b" },
  resolved:  { background: "#dcfce7", color: "#166534" },
  responded: { background: "#ede9fe", color: "#6d28d9" },
};

const btn: React.CSSProperties = { border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14, padding: "9px 18px" };

export default function Page() {
  const [tab, setTab] = useState<MainTab>("Print Queue");
  const [queueTab, setQueueTab] = useState<QueueTab>("current");
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [printing, setPrinting] = useState(false);
  const [rules, setRules] = useState(AUTOMATION_RULES);
  const [copiedBureau, setCopiedBureau] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterBureau, setFilterBureau] = useState("All Bureaus");
  const [filterRound, setFilterRound] = useState("All Rounds");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [viewDispute, setViewDispute] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("disputes")
        .select("*, clients(first_name, last_name, email)")
        .order("created_at", { ascending: false });
      setDisputes(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Normalize disputes to print rows
  const rows = useMemo(() => disputes.map(d => ({
    id: d.id,
    client: d.clients ? `${d.clients.first_name} ${d.clients.last_name}` : "Unknown Client",
    email: d.clients?.email || "",
    bureau: d.bureau ? d.bureau.charAt(0).toUpperCase() + d.bureau.slice(1) : "—",
    round: `Round ${d.round || 1}`,
    letter: d.letter_title || d.item_type || "Standard Dispute Letter",
    pages: 1 + Math.floor(Math.random() * 2), // estimate
    date: new Date(d.created_at).toLocaleDateString(),
    status: d.status || "pending",
    reason: d.reason || "",
    account_name: d.account_name || "",
    account_number: d.account_number || "",
    raw: d,
  })), [disputes]);

  const activeRows = rows.filter(r => r.status !== "archived" && r.status !== "deleted");
  const archiveRows = rows.filter(r => r.status === "archived" || r.status === "resolved");
  const rounds = [...new Set(rows.map(r => r.round))].sort();

  const filteredRows = useMemo(() => {
    const source = queueTab === "current" ? activeRows : archiveRows;
    return source.filter(r => {
      const matchSearch = !search || r.client.toLowerCase().includes(search.toLowerCase()) || r.letter.toLowerCase().includes(search.toLowerCase()) || r.account_name.toLowerCase().includes(search.toLowerCase());
      const matchBureau = filterBureau === "All Bureaus" || r.bureau.toLowerCase() === filterBureau.toLowerCase();
      const matchRound = filterRound === "All Rounds" || r.round === filterRound;
      const matchStatus = filterStatus === "All Statuses" || r.status.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchBureau && matchRound && matchStatus;
    });
  }, [search, filterBureau, filterRound, filterStatus, queueTab, activeRows, archiveRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleAll() {
    const allChecked = pageRows.every(r => checked[r.id]);
    setChecked(prev => {
      const next = { ...prev };
      pageRows.forEach(r => { next[r.id] = !allChecked; });
      return next;
    });
  }

  function toggleRow(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function doPrint() {
    setPrinting(true);
    await new Promise(r => setTimeout(r, 800));
    setPrinting(false);
    window.print();
  }

  function copyAddress(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedBureau(key);
    setTimeout(() => setCopiedBureau(null), 2000);
  }

  function toggleRule(id: number) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }

  const selectedCount = Object.values(checked).filter(Boolean).length;
  const selectedPages = filteredRows.filter(r => checked[r.id]).reduce((sum, r) => sum + r.pages, 0);
  const pendingCount = activeRows.filter(r => r.status === "pending" || r.status === "sent").length;

  const MAIN_TABS: MainTab[] = ["Print Queue", "Credit Bureau Addresses", "Print Automation"];

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Bulk Print</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Print dispute letters in bulk by client, bureau, or round.</p>
          </div>
          {tab === "Print Queue" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setChecked(Object.fromEntries(filteredRows.map(r => [r.id, true])))}
                style={{ ...btn, background: "#f1f5f9", color: "#1e293b", fontSize: 13, padding: "7px 14px" }}>
                Select All
              </button>
              <button onClick={doPrint} disabled={printing || selectedCount === 0}
                style={{ ...btn, background: selectedCount === 0 ? "#94a3b8" : "#1e3a5f", color: "#fff", cursor: selectedCount === 0 ? "not-allowed" : "pointer" }}>
                {printing ? "Processing…" : `Print Selected${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {tab === "Print Queue" && (
          <div style={{ display: "flex", gap: 16, marginBottom: 18, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "Pending / Sent", value: loading ? "—" : pendingCount, color: "#854d0e", bg: "#fef9c3" },
              { label: "Total in Queue", value: loading ? "—" : activeRows.length, color: "#1e3a5f", bg: "#eff6ff" },
              { label: "Selected Letters", value: selectedCount, color: "#166534", bg: "#dcfce7" },
              { label: "Selected Pages", value: selectedPages, color: "#6d28d9", bg: "#ede9fe" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Print Queue ── */}
        {tab === "Print Queue" && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 0, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {(["current", "archive"] as const).map(t => (
                <button key={t} onClick={() => { setQueueTab(t); setPage(1); setChecked({}); }}
                  style={{ padding: "8px 22px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: queueTab === t ? 700 : 500, color: queueTab === t ? "#1e3a5f" : "#64748b", borderBottom: queueTab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -1 }}>
                  {t === "current" ? "Current Queue" : "Archive"}
                  <span style={{ marginLeft: 6, background: queueTab === t ? "#1e3a5f" : "#e2e8f0", color: queueTab === t ? "#fff" : "#64748b", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                    {t === "current" ? activeRows.length : archiveRows.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, padding: "14px 0 12px", alignItems: "center", flexWrap: "wrap" }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search client or letter…"
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, width: 220, outline: "none" }} />
              <select value={filterBureau} onChange={e => { setFilterBureau(e.target.value); setPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer" }}>
                {["All Bureaus", "Equifax", "Experian", "Transunion"].map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={filterRound} onChange={e => { setFilterRound(e.target.value); setPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer" }}>
                <option>All Rounds</option>
                {rounds.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer" }}>
                {["All Statuses", "pending", "sent", "responded", "resolved"].map(o => <option key={o}>{o}</option>)}
              </select>
              {(search || filterBureau !== "All Bureaus" || filterRound !== "All Rounds" || filterStatus !== "All Statuses") && (
                <button onClick={() => { setSearch(""); setFilterBureau("All Bureaus"); setFilterRound("All Rounds"); setFilterStatus("All Statuses"); setPage(1); }}
                  style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                  Clear filters
                </button>
              )}
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{loading ? "Loading…" : `${filteredRows.length} letter${filteredRows.length !== 1 ? "s" : ""}`}</span>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th style={{ padding: "11px 16px", textAlign: "left", width: 40 }}>
                      <input type="checkbox" checked={pageRows.length > 0 && pageRows.every(r => checked[r.id])} onChange={toggleAll}
                        style={{ width: 15, height: 15, accentColor: "#1e3a5f", cursor: "pointer" }} />
                    </th>
                    {["Status", "Client", "Bureau", "Round", "Letter / Item", "Date Added", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading disputes…</td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                      {disputes.length === 0 ? "No disputes found. Add disputes in the Dispute Manager to print them here." : "No letters match your filters."}
                    </td></tr>
                  ) : pageRows.map(row => (
                    <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9", background: checked[row.id] ? "#eff6ff" : "#fff" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <input type="checkbox" checked={!!checked[row.id]} onChange={() => toggleRow(row.id)}
                          style={{ width: 15, height: 15, accentColor: "#1e3a5f", cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ ...(STATUS_STYLE[row.status] || STATUS_STYLE.pending), borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{row.status}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{row.client}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.email}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: "#f1f5f9", color: "#1e3a5f", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{row.bureau}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#475569" }}>{row.round}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#475569", maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.letter}</div>
                        {row.account_name && <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.account_name}</div>}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>{row.date}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setViewDispute(row)}
                            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#1e3a5f" }}>View</button>
                          <button onClick={() => { setChecked(p => ({ ...p, [row.id]: true })); setTimeout(doPrint, 50); }}
                            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#64748b" }}>Print</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {selectedCount > 0 && `${selectedCount} selected · ${selectedPages} pages · `}
                {selectedCount > 0 && <button onClick={() => setChecked({})} style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Deselect All</button>}
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#374151", fontSize: 13 }}>‹ Prev</button>
                <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#374151", fontSize: 13 }}>Next ›</button>
              </div>
            </div>

            {/* Print CTA */}
            {selectedCount > 0 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <button onClick={doPrint} disabled={printing}
                  style={{ ...btn, background: "#1e3a5f", color: "#fff", padding: "11px 40px", fontSize: 15 }}>
                  {printing ? "Processing…" : `🖨 Print ${selectedCount} Letter${selectedCount !== 1 ? "s" : ""} (${selectedPages} pages)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Credit Bureau Addresses ── */}
        {tab === "Credit Bureau Addresses" && (
          <div style={{ paddingTop: 24 }}>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>Official mailing addresses for dispute and fraud letters to each credit bureau.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {BUREAU_ADDRESSES.map(b => (
                <div key={b.bureau} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                  <div style={{ background: b.color + "15", borderBottom: `3px solid ${b.color}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color }} />
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{b.bureau}</span>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    {[{ label: "Dispute Address", key: "dispute", text: b.dispute }, { label: "Fraud Address", key: "fraud", text: b.fraud }].map(s => (
                      <div key={s.key} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontFamily: "monospace", background: "#f8fafc", borderRadius: 6, padding: "8px 10px", whiteSpace: "pre-line" }}>{s.text}</div>
                        <button onClick={() => copyAddress(b.bureau + s.key, s.text)}
                          style={{ marginTop: 6, fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#475569" }}>
                          {copiedBureau === b.bureau + s.key ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Online Disputes</div>
                      <div style={{ fontSize: 13, color: b.color, fontWeight: 600 }}>{b.online}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Print Automation ── */}
        {tab === "Print Automation" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>Print Automation Rules</p>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Automate when letters are generated and queued for printing.</p>
              </div>
              <button style={{ ...btn, background: "#1e3a5f", color: "#fff" }}>+ New Rule</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{rule.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}><span style={{ fontWeight: 600, color: "#64748b" }}>Trigger:</span> {rule.trigger}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}><span style={{ fontWeight: 600, color: "#64748b" }}>Action:</span> {rule.action}</div>
                  </div>
                  <span style={{ background: rule.active ? "#dcfce7" : "#f1f5f9", color: rule.active ? "#166534" : "#94a3b8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => toggleRule(rule.id)}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: rule.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 3, left: rule.active ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                  <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#475569", flexShrink: 0 }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dispute Detail Modal */}
      {viewDispute && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e293b" }}>Dispute Letter Preview</h3>
              <button onClick={() => setViewDispute(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            {[
              ["Client", viewDispute.client],
              ["Bureau", viewDispute.bureau],
              ["Round", viewDispute.round],
              ["Account", viewDispute.account_name || "—"],
              ["Account #", viewDispute.account_number || "—"],
              ["Letter Type", viewDispute.letter],
              ["Status", viewDispute.status],
              ["Date Added", viewDispute.date],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            {viewDispute.reason && (
              <div style={{ marginTop: 14, background: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Dispute Reason</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{viewDispute.reason}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setViewDispute(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Close</button>
              <button onClick={() => { setViewDispute(null); doPrint(); }}
                style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>🖨 Print This Letter</button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
