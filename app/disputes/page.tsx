"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", sent: "#8b5cf6", responded: "#3b82f6", resolved: "#10b981", deleted: "#ef4444" };
const BUREAU_COLORS: Record<string, string> = { equifax: "#e53e3e", experian: "#2b6cb0", transunion: "#276749" };
const ITEM_TYPES = ["Late Payment", "Collection", "Charge-Off", "Inquiry", "Bankruptcy", "Judgment", "Repossession", "Foreclosure", "Identity Theft", "Duplicate Account", "Other"];
const ACCOUNT_TYPES = ["Credit Card", "Auto Loan", "Mortgage", "Student Loan", "Medical", "Personal Loan", "Retail/Store Card", "Collection", "Public Record", "Installment Loan", "Other"];
const RESPONSES = ["No Response", "Deleted", "Updated", "Verified", "Remains"];
const STATUSES = ["pending", "sent", "responded", "resolved", "deleted"];
const PAGE_SIZES = [25, 50, 100];
const RESPONSE_COLORS: Record<string, string> = { Deleted: "#10b981", Updated: "#3b82f6", Verified: "#f59e0b", Remains: "#ef4444", "No Response": "#94a3b8" };

const sel: React.CSSProperties = { padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", color: "#1e293b" };
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 };

const EMPTY_FORM = { client_id: "", account_name: "", account_number: "", bureau: "equifax", reason: "", status: "pending", round: 1, item_type: "", account_type: "", letter_id: "", letter_title: "", response: "No Response", response_date: "" };

export default function Page() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bureauFilter, setBureauFilter] = useState("all");
  const [roundTab, setRoundTab] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // View / pagination
  const [view, setView] = useState<"table" | "card">("table");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("sent");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: disp }, { data: ltr }, { data: cli }] = await Promise.all([
      supabase.from("disputes").select("*, clients(first_name, last_name)").order("created_at", { ascending: false }),
      supabase.from("letters").select("id, title, type").order("title"),
      supabase.from("clients").select("id, first_name, last_name").order("first_name"),
    ]);
    setDisputes(disp || []);
    setLetters(ltr || []);
    setClients(cli || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Derived filtered list ──
  const filtered = disputes.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search || [
      d.account_name, d.account_number, d.reason, d.item_type, d.account_type,
      d.letter_title, d.response, d.bureau,
      d.clients?.first_name, d.clients?.last_name,
    ].some(v => v?.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchBureau = bureauFilter === "all" || d.bureau === bureauFilter;
    const matchRoundTab = roundTab === "all" || String(d.round) === roundTab;
    const matchRoundFilter = roundFilter === "all" || String(d.round) === roundFilter;
    const matchType = typeFilter === "all" || d.item_type === typeFilter;
    return matchSearch && matchStatus && matchBureau && matchRoundTab && matchRoundFilter && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ── Stats ──
  const stats = {
    total: disputes.length,
    active: disputes.filter(d => ["pending", "sent", "responded"].includes(d.status)).length,
    resolved: disputes.filter(d => d.status === "resolved").length,
    equifax: disputes.filter(d => d.bureau === "equifax").length,
    experian: disputes.filter(d => d.bureau === "experian").length,
    transunion: disputes.filter(d => d.bureau === "transunion").length,
  };

  // ── CRUD ──
  function sanitizeDispute(f: typeof EMPTY_FORM) {
    return {
      ...f,
      letter_id: f.letter_id || null,
      response_date: f.response_date || null,
    };
  }

  async function saveNew() {
    if (!form.client_id || !form.account_name) return;
    setSaving(true);
    await supabase.from("disputes").insert([sanitizeDispute(form)]);
    setSaving(false);
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const { client_id: _c, ...rest } = sanitizeDispute(form);
    await supabase.from("disputes").update(rest).eq("id", editing.id);
    setSaving(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("disputes").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    setDisputes(ds => ds.filter(d => d.id !== deleteTarget.id));
    setSelected(s => { const n = new Set(s); n.delete(deleteTarget.id); return n; });
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("disputes").update({ status }).eq("id", id);
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status } : d));
  }

  async function assignLetter(dispute: any, letter: any) {
    await supabase.from("disputes").update({ letter_id: letter.id, letter_title: letter.title }).eq("id", dispute.id);
    setDisputes(ds => ds.map(d => d.id === dispute.id ? { ...d, letter_id: letter.id, letter_title: letter.title } : d));
    setAssignTarget(null);
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    await supabase.from("disputes").delete().in("id", ids);
    setDisputes(ds => ds.filter(d => !selected.has(d.id)));
    setSelected(new Set());
  }

  async function bulkUpdateStatus() {
    const ids = Array.from(selected);
    await supabase.from("disputes").update({ status: bulkStatus }).in("id", ids);
    setDisputes(ds => ds.map(d => selected.has(d.id) ? { ...d, status: bulkStatus } : d));
    setSelected(new Set());
    setBulkStatusOpen(false);
  }

  function openEdit(d: any) {
    setEditing(d);
    setForm({ client_id: d.client_id || "", account_name: d.account_name || "", account_number: d.account_number || "", bureau: d.bureau || "equifax", reason: d.reason || "", status: d.status || "pending", round: d.round || 1, item_type: d.item_type || "", account_type: d.account_type || "", letter_id: d.letter_id || "", letter_title: d.letter_title || "", response: d.response || "No Response", response_date: d.response_date || "" });
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    selected.size === paged.length ? setSelected(new Set()) : setSelected(new Set(paged.map((d: any) => d.id)));
  }

  function exportCSV() {
    const headers = ["Client", "Account Name", "Account #", "Item Type", "Account Type", "Bureau", "Round", "Status", "Letter", "Response", "Response Date", "Reason", "Created"];
    const rows = filtered.map(d => [
      `${d.clients?.first_name || ""} ${d.clients?.last_name || ""}`.trim(),
      d.account_name || "", d.account_number || "", d.item_type || "", d.account_type || "",
      d.bureau || "", d.round || 1, d.status || "", d.letter_title || "",
      d.response || "", d.response_date || "", d.reason || "",
      new Date(d.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "disputes.csv" });
    a.click();
  }

  const allPageSelected = paged.length > 0 && paged.every((d: any) => selected.has(d.id));
  const maxRound = disputes.length ? Math.max(...disputes.map(d => d.round || 1)) : 3;
  const roundTabs = ["all", ...Array.from({ length: Math.max(maxRound, 3) }, (_, i) => String(i + 1))];

  // ── Dispute form fields shared between New + Edit ──
  function DisputeFormFields() {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={lbl}>Account Name</label>
            <input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Account Number</label>
            <input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Round</label>
            <input type="number" min={1} value={form.round} onChange={e => setForm(f => ({ ...f, round: parseInt(e.target.value) || 1 }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Item Type</label>
            <select value={form.item_type} onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))} style={{ ...inp }}>
              <option value="">Select…</option>
              {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Account Type</label>
            <select value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))} style={{ ...inp }}>
              <option value="">Select…</option>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Bureau</label>
            <select value={form.bureau} onChange={e => setForm(f => ({ ...f, bureau: e.target.value }))} style={{ ...inp }}>
              {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...inp }}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={lbl}>Reason / Dispute Notes</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              style={{ ...inp, minHeight: 72, resize: "vertical" as const }} />
          </div>
          <div>
            <label style={lbl}>Bureau Response</label>
            <select value={form.response} onChange={e => setForm(f => ({ ...f, response: e.target.value }))} style={{ ...inp }}>
              {RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Response Date</label>
            <input type="date" value={form.response_date} onChange={e => setForm(f => ({ ...f, response_date: e.target.value }))} style={inp} />
          </div>
        </div>
      </>
    );
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1300 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Dispute Manager</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportCSV} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
              ↓ Export CSV
            </button>
            <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }}
              style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              + New Dispute
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: stats.total, color: "#1e3a5f" },
            { label: "Active", value: stats.active, color: "#f59e0b" },
            { label: "Resolved", value: stats.resolved, color: "#10b981" },
            { label: "Equifax", value: stats.equifax, color: "#e53e3e" },
            { label: "Experian", value: stats.experian, color: "#2b6cb0" },
            { label: "TransUnion", value: stats.transunion, color: "#276749" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 4 }}>{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Round Tabs ── */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {roundTabs.map(r => {
            const count = r === "all" ? disputes.length : disputes.filter(d => String(d.round) === r).length;
            return (
              <button key={r} onClick={() => { setRoundTab(r); setPage(1); setSelected(new Set()); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: roundTab === r ? 700 : 500, color: roundTab === r ? "#1e3a5f" : "#64748b", borderBottom: roundTab === r ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" as const }}>
                {r === "all" ? "All Rounds" : `Round ${r}`}
                <span style={{ background: roundTab === r ? "#1e3a5f22" : "#f1f5f9", color: roundTab === r ? "#1e3a5f" : "#94a3b8", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Filters toolbar ── */}
        <div style={{ display: "flex", gap: 8, padding: "14px 0 12px", flexWrap: "wrap" as const, alignItems: "center" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search all fields…"
            style={{ flex: 1, minWidth: 180, padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none" }} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={sel}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={bureauFilter} onChange={e => { setBureauFilter(e.target.value); setPage(1); }} style={sel}>
            <option value="all">All Bureaus</option>
            {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={roundFilter} onChange={e => { setRoundFilter(e.target.value); setPage(1); }} style={sel}>
            <option value="all">All Rounds</option>
            {Array.from({ length: Math.max(maxRound, 3) }, (_, i) => <option key={i + 1} value={String(i + 1)}>Round {i + 1}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={sel}>
            <option value="all">All Types</option>
            {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden", marginLeft: "auto" }}>
            {(["table", "card"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "7px 14px", border: "none", background: view === v ? "#1e3a5f" : "#fff", color: view === v ? "#fff" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                {v === "table" ? "☰ Table" : "⊞ Cards"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bulk actions toolbar ── */}
        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>{selected.size} selected</span>
            <button onClick={() => router.push("/bulk-print")} style={{ fontSize: 12, padding: "5px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>🖨 Send to Print</button>
            <button onClick={() => { router.push("/bulk-print"); }} style={{ fontSize: 12, padding: "5px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✉ Send Letters</button>
            <button onClick={() => setBulkStatusOpen(true)} style={{ fontSize: 12, padding: "5px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✎ Update Status</button>
            <button onClick={bulkDelete} style={{ fontSize: 12, padding: "5px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontWeight: 600, color: "#dc2626" }}>🗑 Delete</button>
            <button onClick={() => setSelected(new Set())} style={{ marginLeft: "auto", fontSize: 12, padding: "5px 10px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>✕ Clear</button>
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {view === "table" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ padding: "10px 12px", textAlign: "left" as const }}>
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} style={{ width: 14, height: 14, accentColor: "#1e3a5f", cursor: "pointer" }} />
                  </th>
                  {["Client", "Account", "Item Type", "Acct Type", "Bureau", "Letter", "Response", "Resp. Date", "Rnd", "Status", "Date", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left" as const, padding: "10px 10px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={13} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={13} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No disputes found.</td></tr>
                ) : paged.map((d: any) => (
                  <tr key={d.id} style={{ borderTop: "1px solid #f1f5f9", background: selected.has(d.id) ? "#eff6ff" : "#fff" }}>
                    {/* Checkbox */}
                    <td style={{ padding: "10px 12px" }}>
                      <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} style={{ width: 14, height: 14, accentColor: "#1e3a5f", cursor: "pointer" }} />
                    </td>
                    {/* Client */}
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: "#1e3a5f", whiteSpace: "nowrap" as const, cursor: "pointer" }} onClick={() => router.push(`/disputes/${d.id}`)}>
                      {d.clients?.first_name} {d.clients?.last_name}
                    </td>
                    {/* Account */}
                    <td style={{ padding: "10px 10px", maxWidth: 130 }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{d.account_name || "—"}</div>
                      {d.account_number && <div style={{ fontSize: 11, color: "#94a3b8" }}>#{d.account_number}</div>}
                    </td>
                    {/* Item Type */}
                    <td style={{ padding: "10px 10px", color: "#475569", whiteSpace: "nowrap" as const }}>{d.item_type || "—"}</td>
                    {/* Account Type */}
                    <td style={{ padding: "10px 10px", color: "#475569", whiteSpace: "nowrap" as const }}>{d.account_type || "—"}</td>
                    {/* Bureau */}
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ background: (BUREAU_COLORS[d.bureau] || "#94a3b8") + "20", color: BUREAU_COLORS[d.bureau] || "#64748b", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const, whiteSpace: "nowrap" as const }}>{d.bureau}</span>
                    </td>
                    {/* Letter */}
                    <td style={{ padding: "10px 10px", maxWidth: 120 }}>
                      {d.letter_title ? (
                        <div style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, marginBottom: 3 }}>{d.letter_title}</div>
                      ) : null}
                      <button onClick={() => setAssignTarget(d)}
                        style={{ fontSize: 11, padding: "3px 9px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" as const }}>
                        {d.letter_title ? "Change" : "Assign Letter"}
                      </button>
                    </td>
                    {/* Response */}
                    <td style={{ padding: "10px 10px" }}>
                      {d.response && d.response !== "No Response" ? (
                        <span style={{ background: (RESPONSE_COLORS[d.response] || "#94a3b8") + "22", color: RESPONSE_COLORS[d.response] || "#64748b", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" as const }}>{d.response}</span>
                      ) : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                    </td>
                    {/* Response Date */}
                    <td style={{ padding: "10px 10px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" as const }}>{d.response_date ? new Date(d.response_date).toLocaleDateString() : "—"}</td>
                    {/* Round */}
                    <td style={{ padding: "10px 10px", color: "#64748b", fontWeight: 600, textAlign: "center" as const }}>R{d.round || 1}</td>
                    {/* Status — inline dropdown */}
                    <td style={{ padding: "10px 6px" }}>
                      <select value={d.status || "pending"} onChange={e => updateStatus(d.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ padding: "3px 6px", borderRadius: 5, border: `1.5px solid ${STATUS_COLORS[d.status] || "#94a3b8"}`, fontSize: 11, fontWeight: 700, color: STATUS_COLORS[d.status] || "#64748b", background: (STATUS_COLORS[d.status] || "#94a3b8") + "18", cursor: "pointer", outline: "none" }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    {/* Date */}
                    <td style={{ padding: "10px 10px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" as const }}>{new Date(d.created_at).toLocaleDateString()}</td>
                    {/* Actions */}
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button title="Send Letter" onClick={() => router.push("/bulk-print")}
                          style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer" }}>✉</button>
                        <button title="Print" onClick={() => router.push("/bulk-print")}
                          style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer" }}>🖨</button>
                        <button title="Edit" onClick={() => openEdit(d)}
                          style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #bfdbfe", borderRadius: 5, background: "#eff6ff", cursor: "pointer" }}>✎</button>
                        <button title="Delete" onClick={() => setDeleteTarget(d)}
                          style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", cursor: "pointer", color: "#dc2626" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CARD VIEW ── */}
        {view === "card" && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {paged.length === 0 ? (
              <p style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", padding: 32 }}>No disputes found.</p>
            ) : paged.map((d: any) => (
              <div key={d.id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: selected.has(d.id) ? "2px solid #1e3a5f" : "1px solid #f1f5f9", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} style={{ width: 14, height: 14, accentColor: "#1e3a5f", cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{d.account_name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.clients?.first_name} {d.clients?.last_name}</div>
                  </div>
                  <select value={d.status || "pending"} onChange={e => updateStatus(d.id, e.target.value)}
                    style={{ padding: "3px 6px", borderRadius: 5, border: `1.5px solid ${STATUS_COLORS[d.status] || "#94a3b8"}`, fontSize: 11, fontWeight: 700, color: STATUS_COLORS[d.status] || "#64748b", background: (STATUS_COLORS[d.status] || "#94a3b8") + "18", cursor: "pointer", outline: "none", flexShrink: 0 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  <span style={{ background: (BUREAU_COLORS[d.bureau] || "#94a3b8") + "20", color: BUREAU_COLORS[d.bureau] || "#64748b", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const }}>{d.bureau}</span>
                  {d.item_type && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{d.item_type}</span>}
                  {d.account_type && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{d.account_type}</span>}
                  <span style={{ background: "#f1f5f9", color: "#64748b", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>R{d.round || 1}</span>
                </div>
                {(d.letter_title || d.response) && (
                  <div style={{ padding: "0 14px 10px", fontSize: 12, color: "#64748b" }}>
                    {d.letter_title && <div>📄 {d.letter_title}</div>}
                    {d.response && d.response !== "No Response" && (
                      <div style={{ marginTop: 3 }}>
                        <span style={{ background: (RESPONSE_COLORS[d.response] || "#94a3b8") + "22", color: RESPONSE_COLORS[d.response] || "#64748b", borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{d.response}</span>
                        {d.response_date && <span style={{ marginLeft: 6, color: "#94a3b8" }}>{new Date(d.response_date).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 6 }}>
                  <button onClick={() => setAssignTarget(d)} style={{ fontSize: 11, padding: "4px 9px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>
                    {d.letter_title ? "Change Letter" : "Assign Letter"}
                  </button>
                  <button onClick={() => openEdit(d)} style={{ fontSize: 11, padding: "4px 9px", border: "1px solid #bfdbfe", borderRadius: 5, background: "#eff6ff", cursor: "pointer", color: "#1d4ed8", fontWeight: 600 }}>Edit</button>
                  <button onClick={() => router.push(`/disputes/${d.id}`)} style={{ fontSize: 11, padding: "4px 9px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600 }}>View</button>
                  <button onClick={() => setDeleteTarget(d)} style={{ fontSize: 11, padding: "4px 9px", border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", cursor: "pointer", color: "#dc2626", fontWeight: 600, marginLeft: "auto" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap" as const, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Rows per page:</span>
            {PAGE_SIZES.map(ps => (
              <button key={ps} onClick={() => { setPageSize(ps); setPage(1); }}
                style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: pageSize === ps ? "#1e3a5f" : "#fff", color: pageSize === ps ? "#fff" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {ps}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            {filtered.length === 0 ? "0" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`} of {filtered.length} disputes
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(1)} disabled={safePage === 1} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: safePage === 1 ? "not-allowed" : "pointer", color: safePage === 1 ? "#cbd5e1" : "#475569", fontSize: 12, fontWeight: 600 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: safePage === 1 ? "not-allowed" : "pointer", color: safePage === 1 ? "#cbd5e1" : "#475569", fontSize: 12 }}>‹</button>
            <span style={{ padding: "4px 12px", fontSize: 12, color: "#64748b" }}>Page {safePage} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: safePage === totalPages ? "not-allowed" : "pointer", color: safePage === totalPages ? "#cbd5e1" : "#475569", fontSize: 12 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: safePage === totalPages ? "not-allowed" : "pointer", color: safePage === totalPages ? "#cbd5e1" : "#475569", fontSize: 12, fontWeight: 600 }}>»</button>
          </div>
        </div>
      </div>

      {/* ══ NEW DISPUTE MODAL ══ */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>New Dispute</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Client</label>
              <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={{ ...inp }}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <DisputeFormFields />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveNew} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Create Dispute"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT DISPUTE MODAL ══ */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Edit Dispute</h2>
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f8fafc", borderRadius: 7, fontSize: 13, color: "#475569" }}>
              <strong>{editing.clients?.first_name} {editing.clients?.last_name}</strong> — {editing.account_name}
            </div>
            <DisputeFormFields />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700 }}>Delete Dispute?</h2>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
              Delete <strong>{deleteTarget.account_name}</strong> for <strong>{deleteTarget.clients?.first_name} {deleteTarget.clients?.last_name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ padding: "9px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ASSIGN LETTER MODAL ══ */}
      {assignTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Assign Letter</h2>
              <button onClick={() => setAssignTarget(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px" }}>
              Assigning to: <strong>{assignTarget.account_name}</strong> ({assignTarget.bureau})
            </p>
            {letters.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No letters in vault. <a href="/letters/vault" style={{ color: "#1e3a5f" }}>Add letters first.</a></p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {letters.map(l => (
                  <button key={l.id} onClick={() => assignLetter(assignTarget, l)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", border: assignTarget.letter_id === l.id ? "2px solid #1e3a5f" : "1px solid #e2e8f0", borderRadius: 8, background: assignTarget.letter_id === l.id ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "left" as const }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{l.title}</span>
                    <span style={{ fontSize: 11, background: "#f1f5f9", borderRadius: 4, padding: "2px 8px", color: "#64748b", textTransform: "capitalize" as const }}>{l.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ BULK STATUS MODAL ══ */}
      {bulkStatusOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>Update Status ({selected.size} disputes)</h2>
            <label style={lbl}>New Status</label>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} style={{ ...inp, marginBottom: 20 }}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setBulkStatusOpen(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={bulkUpdateStatus} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
