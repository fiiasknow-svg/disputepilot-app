"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6", contacted: "#f59e0b", qualified: "#8b5cf6",
  converted: "#10b981", lost: "#94a3b8",
};
const AVATAR_COLORS = ["#1e3a5f","#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
const SOURCES = ["Website","Referral","Social Media","Cold Call","Email Campaign","Walk-in","Other"];
const AGENTS = ["Alice Johnson","Bob Smith","Carol Davis","David Lee","Eve Martinez"];
const SERVICE_PLANS = ["Basic ($99/mo)","Standard ($149/mo)","Premium ($199/mo)","Elite ($299/mo)"];
const PAGE_SIZES = [25, 50, 100];
const STATUSES = Object.keys(STATUS_COLORS);

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", phone: "",
  address: "", city: "", state: "", zip: "",
  source: "Website", status: "new", notes: "",
  credit_score: "", service_plan_interest: "", monthly_budget: "",
  assigned_agent: "", tags: "", follow_up_date: "", lead_score: "",
};

function initials(name: string) {
  const p = name.trim().split(" ");
  return (p[0]?.[0] || "") + (p[1]?.[0] || "");
}
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xfffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function tagList(t: string) { return t ? t.split(",").map(s => s.trim()).filter(Boolean) : []; }
function scoreColor(s: number) { return s >= 700 ? "#10b981" : s >= 620 ? "#f59e0b" : "#ef4444"; }

export default function Page() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailBody, setBulkEmailBody] = useState("");
  const [bulkEmailSending, setBulkEmailSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Filtered + sorted
  const filtered = (() => {
    let out = [...leads];
    if (statusFilter !== "all") out = out.filter(l => l.status === statusFilter);
    if (sourceFilter !== "all") out = out.filter(l => l.source === sourceFilter);
    if (dateFrom) out = out.filter(l => l.created_at >= dateFrom);
    if (dateTo) out = out.filter(l => l.created_at <= dateTo + "T23:59:59");
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(l =>
        `${l.first_name} ${l.last_name} ${l.email} ${l.phone} ${l.source} ${l.assigned_agent} ${l.tags} ${l.city} ${l.state}`.toLowerCase().includes(q)
      );
    }
    if (sortBy === "az") out.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    else if (sortBy === "status") out.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    else if (sortBy === "source") out.sort((a, b) => (a.source || "").localeCompare(b.source || ""));
    else if (sortBy === "score") out.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
    // default: date (already sorted desc from DB)
    return out;
  })();

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(l => l.id)));
  }

  function sanitizeLead(f: typeof EMPTY_FORM) {
    return {
      ...f,
      credit_score: f.credit_score || null,
      monthly_budget: f.monthly_budget || null,
      lead_score: f.lead_score || null,
      follow_up_date: f.follow_up_date || null,
    };
  }

  async function save() {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    if (editing) {
      await supabase.from("leads").update(sanitizeLead(form)).eq("id", editing.id);
    } else {
      await supabase.from("leads").insert([sanitizeLead(form)]);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    load();
  }

  function openEdit(lead: any) {
    setEditing(lead);
    setForm({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      address: lead.address || "",
      city: lead.city || "",
      state: lead.state || "",
      zip: lead.zip || "",
      source: lead.source || "Website",
      status: lead.status || "new",
      notes: lead.notes || "",
      credit_score: lead.credit_score || "",
      service_plan_interest: lead.service_plan_interest || "",
      monthly_budget: lead.monthly_budget || "",
      assigned_agent: lead.assigned_agent || "",
      tags: lead.tags || "",
      follow_up_date: lead.follow_up_date || "",
      lead_score: lead.lead_score || "",
    });
    setShowForm(true);
  }

  async function deleteLead(id: string) {
    await supabase.from("leads").delete().eq("id", id);
    setLeads(l => l.filter(x => x.id !== id));
    setDeleteTarget(null);
  }

  async function bulkDelete() {
    const ids = [...selected];
    await supabase.from("leads").delete().in("id", ids);
    setLeads(l => l.filter(x => !ids.includes(x.id)));
    setSelected(new Set());
  }

  async function bulkUpdateStatus(status: string) {
    const ids = [...selected];
    await supabase.from("leads").update({ status }).in("id", ids);
    setLeads(l => l.map(x => ids.includes(x.id) ? { ...x, status } : x));
    setSelected(new Set());
    setBulkStatusOpen(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x));
  }

  async function convertToClient(lead: any) {
    setConverting(lead.id);
    const { data } = await supabase.from("clients").insert([{
      first_name: lead.first_name, last_name: lead.last_name,
      full_name: `${lead.first_name} ${lead.last_name}`,
      email: lead.email, phone: lead.phone, status: "active",
      address: lead.address, city: lead.city, state: lead.state, zip: lead.zip,
      credit_score: lead.credit_score, assigned_agent: lead.assigned_agent,
    }]).select().single();
    await supabase.from("leads").update({ status: "converted" }).eq("id", lead.id);
    setConverting(null);
    if (data) router.push(`/clients`);
    else load();
  }

  function exportCSV() {
    const headers = ["First Name","Last Name","Email","Phone","Source","Status","Score","Agent","Tags","City","State","Credit Score","Budget","Follow-up","Notes"];
    const rows = filtered.map(l => [
      l.first_name, l.last_name, l.email, l.phone, l.source, l.status,
      l.lead_score, l.assigned_agent, l.tags, l.city, l.state,
      l.credit_score, l.monthly_budget, l.follow_up_date, l.notes,
    ].map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "leads.csv"; a.click();
  }

  function importCSV() {
    const lines = importText.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/ /g, "_"));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",");
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/^"|"$/g, "").trim(); });
      return { first_name: obj.first_name || obj.name || "", last_name: obj.last_name || "", email: obj.email || "", phone: obj.phone || "", source: obj.source || "Other", status: obj.status || "new" };
    }).filter(r => r.first_name);
    supabase.from("leads").insert(rows).then(() => { setShowImport(false); setImportText(""); load(); });
  }

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };
  const sel: React.CSSProperties = { ...inp, background: "#fff" };

  function FormFields() {
    return (
      <>
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Basic Info</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["First Name *", "first_name"], ["Last Name *", "last_name"], ["Email", "email"], ["Phone", "phone"]].map(([label, key]) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Address</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Street Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={inp} placeholder="123 Main St" />
            </div>
            <div><label style={lbl}>City</label><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={lbl}>State</label><input value={form.state} maxLength={2} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} style={inp} /></div>
              <div><label style={lbl}>ZIP</label><input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} style={inp} /></div>
            </div>
          </div>
        </div>
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Lead Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={sel}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={sel}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Lead Score (0–100)</label>
              <input type="number" min={0} max={100} value={form.lead_score} onChange={e => setForm(f => ({ ...f, lead_score: e.target.value }))} style={inp} placeholder="75" />
            </div>
            <div>
              <label style={lbl}>Credit Score</label>
              <input type="number" value={form.credit_score} onChange={e => setForm(f => ({ ...f, credit_score: e.target.value }))} style={inp} placeholder="640" />
            </div>
            <div>
              <label style={lbl}>Service Plan Interest</label>
              <select value={form.service_plan_interest} onChange={e => setForm(f => ({ ...f, service_plan_interest: e.target.value }))} style={sel}>
                <option value="">— Select —</option>
                {SERVICE_PLANS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Monthly Budget ($)</label>
              <input type="number" value={form.monthly_budget} onChange={e => setForm(f => ({ ...f, monthly_budget: e.target.value }))} style={inp} placeholder="150" />
            </div>
            <div>
              <label style={lbl}>Assigned Agent</label>
              <select value={form.assigned_agent} onChange={e => setForm(f => ({ ...f, assigned_agent: e.target.value }))} style={sel}>
                <option value="">— Unassigned —</option>
                {AGENTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Follow-up Date</label>
              <input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} style={inp} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inp} placeholder="hot lead, no collections, homeowner" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inp, minHeight: 60, resize: "vertical" } as React.CSSProperties} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const TAG_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
  function tagColor(t: string) {
    let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) & 0xfffffff;
    return TAG_COLORS[h % TAG_COLORS.length];
  }

  // Kanban columns
  function KanbanView() {
    return (
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {STATUSES.map(status => {
          const col = filtered.filter(l => l.status === status);
          const color = STATUS_COLORS[status];
          return (
            <div key={status} style={{ minWidth: 240, flex: "0 0 240px" }}>
              <div style={{ background: color + "22", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color, textTransform: "capitalize" }}>{status}</span>
                <span style={{ background: color, color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 12, fontWeight: 700 }}>{col.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.map(lead => {
                  const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
                  const ac = avatarColor(name);
                  return (
                    <div key={lead.id} style={{ background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: ac, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {initials(name) || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{lead.source || "—"}</div>
                        </div>
                      </div>
                      {lead.email && <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{lead.email}</div>}
                      {lead.lead_score && <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600 }}>Score: {lead.lead_score}</div>}
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => openEdit(lead)} style={{ flex: 1, fontSize: 11, padding: "4px 0", border: "1px solid #e2e8f0", borderRadius: 5, background: "#f8fafc", cursor: "pointer" }}>Edit</button>
                        {lead.status !== "converted" && (
                          <button onClick={() => convertToClient(lead)} style={{ flex: 1, fontSize: 11, padding: "4px 0", border: "1px solid #86efac", borderRadius: 5, background: "#f0fdf4", cursor: "pointer", color: "#166534" }}>Convert</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {col.length === 0 && <div style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", padding: "12px 0" }}>No leads</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1300 }}>
        {/* Page tabs: Leads / Affiliates */}
        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 24 }}>
          {["Leads", "Affiliates"].map(t => (
            <button key={t} onClick={() => { if (t === "Affiliates") router.push("/leads/affiliates"); }}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: t === "Leads" ? 700 : 500, color: t === "Leads" ? "#1e293b" : "#64748b", borderBottom: t === "Leads" ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Leads</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{leads.length} leads in pipeline</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setShowImport(true)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>⬆ Import CSV</button>
            <button onClick={exportCSV} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>⬇ Export CSV</button>
            <button onClick={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}
              style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Lead</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total", count: leads.length, color: "#1e3a5f", filter: "all" },
            ...STATUSES.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), count: leads.filter(l => l.status === s).length, color: STATUS_COLORS[s], filter: s })),
          ].map(card => (
            <button key={card.label} onClick={() => { setStatusFilter(card.filter); setPage(1); }}
              style={{ background: statusFilter === card.filter ? card.color + "11" : "#fff", border: `1px solid ${statusFilter === card.filter ? card.color : "#e2e8f0"}`, borderRadius: 10, padding: "14px 12px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: 2 }}>{card.label}</div>
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search leads…"
            style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, outline: "none" }} />
          <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff" }}>
            <option value="all">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff" }}>
            <option value="date">Sort: Date</option>
            <option value="az">Sort: A–Z</option>
            <option value="status">Sort: Status</option>
            <option value="source">Sort: Source</option>
            <option value="score">Sort: Score</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13 }} title="From date" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13 }} title="To date" />
          <div style={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
            {(["table","kanban"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: view === v ? 700 : 500, background: view === v ? "#1e3a5f" : "#fff", color: view === v ? "#fff" : "#64748b" }}>
                {v === "table" ? "☰ Table" : "⬛ Pipeline"}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selected.size > 0 && (
          <div style={{ background: "#1e3a5f", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{selected.size} selected</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowBulkEmail(true)} style={{ padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✉ Send Email</button>
            <button onClick={exportCSV} style={{ padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>⬇ Export</button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setBulkStatusOpen(o => !o)} style={{ padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Update Status ▾</button>
              {bulkStatusOpen && (
                <div style={{ position: "absolute", top: "110%", right: 0, background: "#fff", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 150, overflow: "hidden" }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => bulkUpdateStatus(s)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: STATUS_COLORS[s], fontWeight: 600, textTransform: "capitalize" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={bulkDelete} style={{ padding: "6px 14px", border: "1px solid #fca5a5", borderRadius: 6, background: "transparent", color: "#fca5a5", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>🗑 Delete</button>
            <button onClick={() => setSelected(new Set())} style={{ padding: "6px 14px", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕ Clear</button>
          </div>
        )}

        {/* Main Content */}
        {view === "kanban" ? <KanbanView /> : (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th style={{ padding: "12px 12px", width: 36 }}>
                      <input type="checkbox" checked={paged.length > 0 && selected.size === paged.length} onChange={toggleSelectAll} />
                    </th>
                    {["Name","Contact","Source","Score","Status","Agent","Tags","Last Activity","Date","Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 12px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                  ) : paged.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                      <div style={{ fontWeight: 600 }}>No leads found</div>
                      <div style={{ fontSize: 13 }}>Try adjusting your filters or add a new lead.</div>
                    </td></tr>
                  ) : paged.map(lead => {
                    const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
                    const ac = avatarColor(name);
                    const color = STATUS_COLORS[lead.status] || "#94a3b8";
                    const tags = tagList(lead.tags || "");
                    return (
                      <tr key={lead.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "11px 12px" }}>
                          <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: ac, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {initials(name) || "?"}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", whiteSpace: "nowrap" }}>{name || "—"}</div>
                          </div>
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <div style={{ fontSize: 13, color: "#475569" }}>{lead.email || "—"}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{lead.phone || ""}</div>
                        </td>
                        <td style={{ padding: "11px 12px", fontSize: 13, color: "#64748b" }}>{lead.source || "—"}</td>
                        <td style={{ padding: "11px 12px" }}>
                          {lead.lead_score ? (
                            <span style={{ fontWeight: 700, fontSize: 13, color: Number(lead.lead_score) >= 70 ? "#10b981" : Number(lead.lead_score) >= 40 ? "#f59e0b" : "#ef4444" }}>
                              {lead.lead_score}
                            </span>
                          ) : <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>}
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                            style={{ fontSize: 12, padding: "3px 8px", border: `1px solid ${color}`, borderRadius: 20, background: color + "22", color, fontWeight: 700, cursor: "pointer" }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "11px 12px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{lead.assigned_agent || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                        <td style={{ padding: "11px 12px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 140 }}>
                            {tags.slice(0, 2).map(t => (
                              <span key={t} style={{ background: tagColor(t) + "22", color: tagColor(t), borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{t}</span>
                            ))}
                            {tags.length > 2 && <span style={{ fontSize: 11, color: "#94a3b8" }}>+{tags.length - 2}</span>}
                          </div>
                        </td>
                        <td style={{ padding: "11px 12px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "11px 12px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(lead.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "11px 12px" }}>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            <button onClick={() => openEdit(lead)} title="Edit"
                              style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", cursor: "pointer", fontSize: 13 }}>✏️</button>
                            {lead.status !== "converted" && (
                              <button onClick={() => convertToClient(lead)} disabled={converting === lead.id}
                                style={{ fontSize: 11, padding: "4px 8px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, cursor: "pointer", color: "#166534", fontWeight: 600, whiteSpace: "nowrap" }}>
                                {converting === lead.id ? "…" : "→ Convert"}
                              </button>
                            )}
                            {lead.status === "converted" && <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>✓</span>}
                            <button onClick={() => setDeleteTarget(lead.id)} title="Delete"
                              style={{ width: 28, height: 28, border: "1px solid #fecaca", borderRadius: 6, background: "#fff5f5", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Rows per page:</span>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                    {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {Math.min((safePage - 1) * pageSize + 1, filtered.length)}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setPage(1)} disabled={safePage === 1} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: safePage === 1 ? "default" : "pointer", opacity: safePage === 1 ? 0.4 : 1, fontSize: 13 }}>«</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: safePage === 1 ? "default" : "pointer", opacity: safePage === 1 ? 0.4 : 1, fontSize: 13 }}>‹</button>
                  <span style={{ padding: "4px 12px", background: "#1e3a5f", color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{safePage}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: safePage === totalPages ? "default" : "pointer", opacity: safePage === totalPages ? 0.4 : 1, fontSize: 13 }}>›</button>
                  <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: safePage === totalPages ? "default" : "pointer", opacity: safePage === totalPages ? 0.4 : 1, fontSize: 13 }}>»</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Lead Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 580, maxHeight: "92vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>{editing ? "Edit Lead" : "Add New Lead"}</h2>
              <FormFields />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...EMPTY_FORM }); }}
                  style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving}
                  style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Lead"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteTarget && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 380 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700 }}>Delete Lead?</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteTarget(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => deleteLead(deleteTarget)} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {showImport && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Import Leads (CSV)</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>Expected columns: first_name, last_name, email, phone, source, status</p>
              <input type="file" ref={fileRef} accept=".csv" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImportText(ev.target?.result as string); r.readAsText(f); } }} />
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "10px", border: "2px dashed #e2e8f0", borderRadius: 8, background: "#f8fafc", cursor: "pointer", fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                📂 Click to upload CSV file
              </button>
              <textarea value={importText} onChange={e => setImportText(e.target.value)}
                placeholder="Or paste CSV content here…"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, minHeight: 100, resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={importCSV} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Import</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bulk Email Modal ── */}
      {showBulkEmail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:500, maxWidth:"95vw" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:17, fontWeight:800 }}>Send Email to {selected.size} Lead{selected.size!==1?"s":""}</h3>
            <p style={{ margin:"0 0 16px", fontSize:13, color:"#64748b" }}>
              {leads.filter(l=>selected.has(l.id)&&l.email).length} of {selected.size} have an email address.
            </p>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:5 }}>Subject</label>
              <input value={bulkEmailSubject} onChange={e=>setBulkEmailSubject(e.target.value)} placeholder="Email subject…"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:14, boxSizing:"border-box" as const }} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, marginBottom:5 }}>Message</label>
              <textarea value={bulkEmailBody} onChange={e=>setBulkEmailBody(e.target.value)} rows={5} placeholder="Write your message…"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:14, resize:"vertical" as const, boxSizing:"border-box" as const }} />
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowBulkEmail(false)} style={{ padding:"9px 20px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:7, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button
                type="button"
                disabled={bulkEmailSending||!bulkEmailSubject}
                onClick={async()=>{
                  setBulkEmailSending(true);
                  const targets = leads.filter(l=>selected.has(l.id)&&l.email);
                  const results = await Promise.all(targets.map(l=>
                    fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({to:l.email,subject:bulkEmailSubject,body:bulkEmailBody})})
                    .then(async r=>({ ok:r.ok, email:l.email, err: r.ok ? null : (await r.json().catch(()=>({}))).error || r.statusText }))
                  ));
                  setBulkEmailSending(false);
                  setShowBulkEmail(false);
                  setBulkEmailSubject(""); setBulkEmailBody("");
                  const failed = results.filter(r=>!r.ok);
                  if (failed.length) alert(`${results.length-failed.length} sent, ${failed.length} failed:\n${failed.map(f=>`${f.email}: ${f.err}`).join("\n")}`);
                  else alert(`Email sent to ${targets.length} lead${targets.length!==1?"s":""}.`);
                }}
                style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, fontWeight:700, cursor:"pointer", opacity:bulkEmailSending?0.6:1 }}>
                {bulkEmailSending?"Sending…":"Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
