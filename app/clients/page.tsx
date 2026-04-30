"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

// ── Constants ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = { active: "#10b981", inactive: "#94a3b8", pending: "#f59e0b", cancelled: "#ef4444" };
const CONTRACT_COLORS: Record<string, string> = { signed: "#10b981", pending: "#f59e0b", unsigned: "#94a3b8" };
const PAYMENT_COLORS: Record<string, string> = { current: "#10b981", past_due: "#ef4444", no_card: "#94a3b8" };
const AVATAR_COLORS = ["#1e3a5f", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
const PLANS = ["", "Basic", "Standard", "Premium", "Custom"];
const SOURCES = ["", "Walk-in", "Referral", "Facebook", "Google", "TikTok", "Instagram", "YouTube", "Partner", "Other"];
const STATUSES = ["active", "pending", "inactive", "cancelled"];
const PAGE_SIZES = [25, 50, 100];

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", phone: "", status: "active",
  address: "", city: "", state: "", zip: "", dob: "", ssn_last4: "",
  credit_score: "", service_plan: "", monthly_charge: "", referral_source: "",
  assigned_agent: "", tags: "", contract_status: "unsigned", payment_status: "current",
  portal_access: false as boolean,
};

// ── Helpers ────────────────────────────────────────────────
function clientName(c: any) {
  if (c.first_name || c.last_name) return `${c.first_name || ""} ${c.last_name || ""}`.trim();
  return c.full_name || "—";
}

function initials(name: string) {
  const p = name.trim().split(" ").filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function tagList(tags: string): string[] {
  return (tags || "").split(",").map(t => t.trim()).filter(Boolean);
}

const inp: React.CSSProperties = { width: "100%", padding: "8px 11px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" };
const sel: React.CSSProperties = { padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff" };
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 3 };
const fieldSection: React.CSSProperties = { marginBottom: 18 };
const sectionHead: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" };

function FormFields({ form, setForm }: { form: typeof EMPTY_FORM; setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>> }) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  return (
    <>
      <div style={fieldSection}>
        <p style={sectionHead}>Basic Info</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>First Name *</label><input value={form.first_name} onChange={set("first_name")} style={inp} /></div>
          <div><label style={lbl}>Last Name *</label><input value={form.last_name} onChange={set("last_name")} style={inp} /></div>
          <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={set("email")} style={inp} /></div>
          <div><label style={lbl}>Phone</label><input type="tel" value={form.phone} onChange={set("phone")} style={inp} /></div>
          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={set("status")} style={{ ...inp }}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Credit Score</label>
            <input type="number" min={300} max={850} value={form.credit_score} onChange={set("credit_score")} style={inp} placeholder="e.g. 582" />
          </div>
        </div>
      </div>

      <div style={fieldSection}>
        <p style={sectionHead}>Personal</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Date of Birth</label><input type="date" value={form.dob} onChange={set("dob")} style={inp} /></div>
          <div><label style={lbl}>SSN Last 4</label><input maxLength={4} value={form.ssn_last4} onChange={set("ssn_last4")} style={inp} placeholder="####" /></div>
        </div>
      </div>

      <div style={fieldSection}>
        <p style={sectionHead}>Address</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ gridColumn: "span 2" }}><label style={lbl}>Street Address</label><input value={form.address} onChange={set("address")} style={inp} /></div>
          <div><label style={lbl}>City</label><input value={form.city} onChange={set("city")} style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><label style={lbl}>State</label><input maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} style={inp} placeholder="GA" /></div>
            <div><label style={lbl}>ZIP</label><input value={form.zip} onChange={set("zip")} style={inp} /></div>
          </div>
        </div>
      </div>

      <div style={fieldSection}>
        <p style={sectionHead}>Service & Billing</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={lbl}>Service Plan</label>
            <select value={form.service_plan} onChange={set("service_plan")} style={{ ...inp }}>
              {PLANS.map(p => <option key={p} value={p}>{p || "Select…"}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Monthly Charge ($)</label><input type="number" value={form.monthly_charge} onChange={set("monthly_charge")} style={inp} placeholder="0.00" /></div>
          <div>
            <label style={lbl}>Contract Status</label>
            <select value={form.contract_status} onChange={set("contract_status")} style={{ ...inp }}>
              {["unsigned", "pending", "signed"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Payment Status</label>
            <select value={form.payment_status} onChange={set("payment_status")} style={{ ...inp }}>
              {["current", "past_due", "no_card"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={fieldSection}>
        <p style={sectionHead}>Additional Info</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={lbl}>Referral Source</label>
            <select value={form.referral_source} onChange={set("referral_source")} style={{ ...inp }}>
              {SOURCES.map(s => <option key={s} value={s}>{s || "Select…"}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Assigned Agent</label><input value={form.assigned_agent} onChange={set("assigned_agent")} style={inp} placeholder="Agent name" /></div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={lbl}>Tags (comma-separated)</label>
            <input value={form.tags} onChange={set("tags")} style={inp} placeholder="VIP, New, At Risk" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="portal" checked={form.portal_access} onChange={set("portal_access")} style={{ width: 15, height: 15, accentColor: "#1e3a5f" }} />
            <label htmlFor="portal" style={{ fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Portal Access Enabled</label>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Component ──────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [clients, setClients] = useState<any[]>([]);
  const [disputeCounts, setDisputeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters / sort / view
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [sort, setSort] = useState("date");
  const [view, setView] = useState<"table" | "card">("table");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals / editing
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("active");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailBody, setBulkEmailBody] = useState("");
  const [bulkEmailSending, setBulkEmailSending] = useState(false);

  // ── Load ──
  async function load() {
    setLoading(true);
    const [{ data: cl }, { data: disp }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("disputes").select("client_id"),
    ]);
    setClients(cl || []);
    const counts: Record<string, number> = {};
    for (const d of disp || []) counts[d.client_id] = (counts[d.client_id] || 0) + 1;
    setDisputeCounts(counts);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function tabMatches(c: any, key: string) {
    if (key === "all")     return true;
    if (key === "current") return c.status === "active";
    if (key === "leads")   return c.status === "pending";
    if (key === "archive") return c.status === "inactive" || c.status === "cancelled";
    return c.status === key;
  }

  // ── Derived ──
  const filtered = clients
    .filter(c => {
      const name = clientName(c).toLowerCase();
      const q = search.toLowerCase();
      if (search && ![name, c.email, c.phone, c.city, c.state, c.service_plan, c.referral_source, c.assigned_agent, c.tags, c.status, c.payment_status, c.contract_status].some(v => v?.toLowerCase().includes(q))) return false;
      if (!tabMatches(c, statusTab)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return clientName(a).localeCompare(clientName(b));
      if (sort === "status") return (a.status || "").localeCompare(b.status || "");
      if (sort === "score") return (b.credit_score || 0) - (a.credit_score || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    inactive: clients.filter(c => c.status === "inactive").length,
    pending: clients.filter(c => c.status === "pending").length,
    cancelled: clients.filter(c => c.status === "cancelled").length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = paged.length > 0 && paged.every(c => selected.has(c.id));

  // ── CRUD ──
  function sanitizeClient(f: typeof EMPTY_FORM) {
    return {
      ...f,
      dob: f.dob || null,
      monthly_charge: f.monthly_charge || null,
    };
  }

  async function saveNew() {
    if (!form.first_name && !form.last_name) return;
    setSaving(true);
    const full_name = `${form.first_name} ${form.last_name}`.trim();
    await supabase.from("clients").insert([{ ...sanitizeClient(form), full_name }]);
    setSaving(false);
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const full_name = `${form.first_name} ${form.last_name}`.trim();
    await supabase.from("clients").update({ ...sanitizeClient(form), full_name }).eq("id", editing.id);
    setSaving(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    load();
  }

  function openEdit(c: any) {
    const nameParts = (c.full_name || "").trim().split(" ");
    setEditing(c);
    setForm({
      first_name: c.first_name || nameParts[0] || "",
      last_name: c.last_name || nameParts.slice(1).join(" ") || "",
      email: c.email || "", phone: c.phone || "", status: c.status || "active",
      address: c.address || "", city: c.city || "", state: c.state || "", zip: c.zip || "",
      dob: c.dob || "", ssn_last4: c.ssn_last4 || "", credit_score: c.credit_score || "",
      service_plan: c.service_plan || "", monthly_charge: c.monthly_charge || "",
      referral_source: c.referral_source || "", assigned_agent: c.assigned_agent || "",
      tags: c.tags || "", contract_status: c.contract_status || "unsigned",
      payment_status: c.payment_status || "current", portal_access: c.portal_access || false,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("clients").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    setClients(cs => cs.filter(c => c.id !== deleteTarget.id));
    setSelected(s => { const n = new Set(s); n.delete(deleteTarget.id); return n; });
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("clients").update({ status }).eq("id", id);
    setClients(cs => cs.map(c => c.id === id ? { ...c, status } : c));
  }

  async function bulkUpdateStatus() {
    const ids = Array.from(selected);
    await supabase.from("clients").update({ status: bulkStatus }).in("id", ids);
    setClients(cs => cs.map(c => selected.has(c.id) ? { ...c, status: bulkStatus } : c));
    setSelected(new Set()); setBulkStatusOpen(false);
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    await supabase.from("clients").delete().in("id", ids);
    setClients(cs => cs.filter(c => !selected.has(c.id)));
    setSelected(new Set());
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    selected.size === paged.length ? setSelected(new Set()) : setSelected(new Set(paged.map(c => c.id)));
  }

  // ── Export CSV ──
  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Credit Score", "Plan", "Monthly Charge", "Contract", "Payment", "Address", "City", "State", "ZIP", "DOB", "Source", "Agent", "Tags", "Portal", "Created"];
    const rows = filtered.map(c => {
      const name = clientName(c);
      const parts = name.split(" ");
      return [
        c.first_name || parts[0] || "", c.last_name || parts.slice(1).join(" ") || "",
        c.email || "", c.phone || "", c.status || "", c.credit_score || "",
        c.service_plan || "", c.monthly_charge || "", c.contract_status || "",
        c.payment_status || "", c.address || "", c.city || "", c.state || "", c.zip || "",
        c.dob || "", c.referral_source || "", c.assigned_agent || "", c.tags || "",
        c.portal_access ? "Yes" : "No", new Date(c.created_at).toLocaleDateString(),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "clients.csv" });
    a.click();
  }

  // ── Import CSV ──
  async function importCSV() {
    if (!importText.trim()) return;
    setSaving(true);
    try {
      const lines = importText.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase().replace(/\s+/g, "_"));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        obj.full_name = obj.full_name || `${obj.first_name || ""} ${obj.last_name || ""}`.trim();
        obj.status = obj.status || "active";
        return obj;
      }).filter(r => r.full_name || r.first_name);
      if (rows.length) await supabase.from("clients").insert(rows);
    } catch { }
    setSaving(false);
    setShowImport(false);
    setImportText("");
    setImportFile(null);
    load();
  }

  // ── Avatar ──
  function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const bg = avatarColor(name);
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
        {initials(name)}
      </div>
    );
  }

  // Tab definitions: label shown → status filter logic
  const STATUS_TABS = [
    { label: "All",     key: "all" },
    { label: "Current", key: "current" },
    { label: "Leads",   key: "leads" },
    { label: "Archive", key: "archive" },
    { label: "active",  key: "active" },
    { label: "pending", key: "pending" },
    { label: "inactive",key: "inactive" },
    { label: "cancelled",key:"cancelled" },
  ];

  const visibleTabs = ["All", "Current", "Leads", "Archive"];

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1400 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Clients</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>Customers</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowImport(true)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>↑ Import CSV</button>
            <button onClick={exportCSV} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>↓ Export CSV</button>
            <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }}
              style={{ background: "#fff", color: "#1e3a5f", border: "1px solid #1e3a5f", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Add New Customer
            </button>
            <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }}
              style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              + Add Client
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total",     value: stats.total,     color: "#1e3a5f", key: "all" },
            { label: "Active",    value: stats.active,    color: "#10b981", key: "current" },
            { label: "Pending",   value: stats.pending,   color: "#f59e0b", key: "leads" },
            { label: "Inactive",  value: stats.inactive,  color: "#94a3b8", key: "archive" },
            { label: "Cancelled", value: stats.cancelled, color: "#ef4444", key: "cancelled" },
          ].map(s => (
            <div key={s.label} onClick={() => { setStatusTab(s.key); setPage(1); setSelected(new Set()); }}
              style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${s.color}`, cursor: "pointer" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 4 }}>{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Customer Search ── */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 12 }}>Customer Search</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>First Name</label>
              <input
                placeholder="First name…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" as const }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Last Name</label>
              <input
                placeholder="Last name…"
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" as const }}
                readOnly
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Phone</label>
              <input
                placeholder="Phone…"
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" as const }}
                readOnly
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Email</label>
              <input
                placeholder="Email…"
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" as const }}
                readOnly
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setPage(1)}
                style={{ padding: "7px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
              >
                Search
              </button>
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                style={{ padding: "7px 14px", background: "#fff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ── Status Tabs ── */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {visibleTabs.map(label => {
            const key = STATUS_TABS.find(t => t.label === label)!.key;
            const count = clients.filter(c => tabMatches(c, key)).length;
            const active = statusTab === key;
            return (
              <button key={label} onClick={() => { setStatusTab(key); setPage(1); setSelected(new Set()); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#1e3a5f" : "#64748b", borderBottom: active ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" as const }}>
                {label}
                <span style={{ background: active ? "#1e3a5f22" : "#f1f5f9", color: active ? "#1e3a5f" : "#94a3b8", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Sort / View ── */}
        <div style={{ display: "flex", gap: 8, padding: "12px 0 10px", flexWrap: "wrap" as const, alignItems: "center" }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={sel}>
            <option value="date">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="status">By Status</option>
            <option value="score">By Score</option>
          </select>
          <div style={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
            {(["table", "card"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "7px 13px", border: "none", background: view === v ? "#1e3a5f" : "#fff", color: view === v ? "#fff" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                {v === "table" ? "☰ Table" : "⊞ Cards"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bulk Actions Toolbar ── */}
        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>{selected.size} selected</span>
            <button onClick={() => setShowBulkEmail(true)} style={{ fontSize: 12, padding: "5px 13px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✉ Send Email</button>
            <button onClick={exportCSV} style={{ fontSize: 12, padding: "5px 13px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>↓ Export</button>
            <button onClick={() => setBulkStatusOpen(true)} style={{ fontSize: 12, padding: "5px 13px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✎ Update Status</button>
            <button onClick={bulkDelete} style={{ fontSize: 12, padding: "5px 13px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontWeight: 600, color: "#dc2626" }}>🗑 Delete</button>
            <button onClick={() => setSelected(new Set())} style={{ marginLeft: "auto", fontSize: 12, padding: "5px 10px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>✕ Clear</button>
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {view === "table" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ padding: "10px 12px", textAlign: "left" as const }}>
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} style={{ width: 14, height: 14, accentColor: "#1e3a5f", cursor: "pointer" }} />
                  </th>
                  {["Client", "Status", "Email", "Phone", "Score", "Plan / $", "Disputes", "Contract", "Payment", "Portal", "Tags", "Agent", "Source", "Last Activity"].map(h => (
                    <th key={h} style={{ textAlign: "left" as const, padding: "10px 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                  <th style={{ textAlign: "left" as const, padding: "10px 8px", fontSize: 11, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" as const }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={16} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={16} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No clients found.</td></tr>
                ) : paged.map(c => {
                  const name = clientName(c);
                  const dCount = disputeCounts[c.id] || 0;
                  const tags = tagList(c.tags);
                  return (
                    <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9", background: selected.has(c.id) ? "#eff6ff" : "#fff" }}>
                      {/* Checkbox */}
                      <td style={{ padding: "10px 12px" }}>
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 14, height: 14, accentColor: "#1e3a5f", cursor: "pointer" }} />
                      </td>
                      {/* Avatar + Name */}
                      <td style={{ padding: "8px 8px", whiteSpace: "nowrap" as const }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={name} size={30} />
                          <button onClick={() => router.push(`/clients/${c.id}`)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#1e3a5f", padding: 0, textAlign: "left" as const }}>
                            {name}
                          </button>
                        </div>
                      </td>
                      {/* Status inline dropdown */}
                      <td style={{ padding: "8px 8px" }}>
                        <select value={c.status || "active"} onChange={e => updateStatus(c.id, e.target.value)}
                          style={{ padding: "3px 6px", borderRadius: 5, border: `1.5px solid ${STATUS_COLORS[c.status] || "#94a3b8"}`, fontSize: 11, fontWeight: 700, color: STATUS_COLORS[c.status] || "#64748b", background: (STATUS_COLORS[c.status] || "#94a3b8") + "18", cursor: "pointer", outline: "none" }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Email */}
                      <td style={{ padding: "8px 8px", color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{c.email || "—"}</td>
                      {/* Phone */}
                      <td style={{ padding: "8px 8px", color: "#475569", whiteSpace: "nowrap" as const }}>{c.phone || "—"}</td>
                      {/* Credit Score */}
                      <td style={{ padding: "8px 8px", textAlign: "center" as const }}>
                        {c.credit_score ? (
                          <span style={{ fontWeight: 800, fontSize: 13, color: c.credit_score >= 700 ? "#10b981" : c.credit_score >= 620 ? "#f59e0b" : "#ef4444" }}>{c.credit_score}</span>
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      {/* Plan / charge */}
                      <td style={{ padding: "8px 8px", whiteSpace: "nowrap" as const }}>
                        {c.service_plan ? <div style={{ fontWeight: 600, color: "#1e293b" }}>{c.service_plan}</div> : null}
                        {c.monthly_charge ? <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>${c.monthly_charge}/mo</div> : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      {/* Disputes */}
                      <td style={{ padding: "8px 8px", textAlign: "center" as const }}>
                        <span style={{ background: dCount > 0 ? "#8b5cf622" : "#f1f5f9", color: dCount > 0 ? "#8b5cf6" : "#94a3b8", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{dCount}</span>
                      </td>
                      {/* Contract */}
                      <td style={{ padding: "8px 8px" }}>
                        <span style={{ background: (CONTRACT_COLORS[c.contract_status] || "#94a3b8") + "22", color: CONTRACT_COLORS[c.contract_status] || "#94a3b8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const, whiteSpace: "nowrap" as const }}>
                          {c.contract_status || "unsigned"}
                        </span>
                      </td>
                      {/* Payment */}
                      <td style={{ padding: "8px 8px" }}>
                        <span style={{ background: (PAYMENT_COLORS[c.payment_status] || "#94a3b8") + "22", color: PAYMENT_COLORS[c.payment_status] || "#94a3b8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" as const }}>
                          {(c.payment_status || "no_card").replace("_", " ")}
                        </span>
                      </td>
                      {/* Portal */}
                      <td style={{ padding: "8px 8px", textAlign: "center" as const }}>
                        <span style={{ fontSize: 15 }}>{c.portal_access ? "✅" : "—"}</span>
                      </td>
                      {/* Tags */}
                      <td style={{ padding: "8px 8px", maxWidth: 120 }}>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" as const }}>
                          {tags.slice(0, 2).map((t, i) => (
                            <span key={i} style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + "22", color: AVATAR_COLORS[i % AVATAR_COLORS.length], borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{t}</span>
                          ))}
                          {tags.length > 2 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{tags.length - 2}</span>}
                        </div>
                      </td>
                      {/* Agent */}
                      <td style={{ padding: "8px 8px", color: "#475569", whiteSpace: "nowrap" as const }}>{c.assigned_agent || "—"}</td>
                      {/* Source */}
                      <td style={{ padding: "8px 8px", color: "#475569", whiteSpace: "nowrap" as const }}>{c.referral_source || "—"}</td>
                      {/* Last Activity */}
                      <td style={{ padding: "8px 8px", color: "#94a3b8", whiteSpace: "nowrap" as const, fontSize: 11 }}>
                        {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "8px 8px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => router.push(`/clients/${c.id}`)} title="View"
                            style={{ fontSize: 11, padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600 }}>View</button>
                          <button onClick={() => openEdit(c)} title="Edit"
                            style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #bfdbfe", borderRadius: 5, background: "#eff6ff", cursor: "pointer" }}>✎</button>
                          <button onClick={() => setDeleteTarget(c)} title="Delete"
                            style={{ fontSize: 13, padding: "4px 7px", border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", cursor: "pointer", color: "#dc2626" }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CARD VIEW ── */}
        {view === "card" && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {paged.length === 0 ? (
              <p style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", padding: 32 }}>No clients found.</p>
            ) : paged.map(c => {
              const name = clientName(c);
              const dCount = disputeCounts[c.id] || 0;
              const tags = tagList(c.tags);
              return (
                <div key={c.id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: selected.has(c.id) ? "2px solid #1e3a5f" : "1px solid #f1f5f9", overflow: "hidden" }}>
                  <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 14, height: 14, accentColor: "#1e3a5f", marginTop: 3, flexShrink: 0 }} />
                    <Avatar name={name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={() => router.push(`/clients/${c.id}`)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#1e3a5f", padding: 0, textAlign: "left" as const, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, width: "100%" }}>{name}</button>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{c.email || "—"}</div>
                    </div>
                    <select value={c.status || "active"} onChange={e => updateStatus(c.id, e.target.value)}
                      style={{ padding: "3px 5px", borderRadius: 5, border: `1.5px solid ${STATUS_COLORS[c.status] || "#94a3b8"}`, fontSize: 10, fontWeight: 700, color: STATUS_COLORS[c.status] || "#64748b", background: (STATUS_COLORS[c.status] || "#94a3b8") + "18", cursor: "pointer", outline: "none", flexShrink: 0 }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ padding: "0 14px 10px", display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    {c.credit_score && <span style={{ fontWeight: 800, fontSize: 12, color: c.credit_score >= 700 ? "#10b981" : c.credit_score >= 620 ? "#f59e0b" : "#ef4444" }}>Score: {c.credit_score}</span>}
                    {dCount > 0 && <span style={{ background: "#8b5cf622", color: "#8b5cf6", borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{dCount} dispute{dCount !== 1 ? "s" : ""}</span>}
                    {c.service_plan && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 4, padding: "1px 8px", fontSize: 11 }}>{c.service_plan}</span>}
                    {c.contract_status && <span style={{ background: (CONTRACT_COLORS[c.contract_status] || "#94a3b8") + "22", color: CONTRACT_COLORS[c.contract_status] || "#94a3b8", borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{c.contract_status}</span>}
                    {tags.map((t, i) => <span key={i} style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + "22", color: AVATAR_COLORS[i % AVATAR_COLORS.length], borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{t}</span>)}
                  </div>
                  <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 6 }}>
                    <button onClick={() => router.push(`/clients/${c.id}`)} style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer", fontWeight: 600 }}>View</button>
                    <button onClick={() => openEdit(c)} style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #bfdbfe", borderRadius: 5, background: "#eff6ff", cursor: "pointer", color: "#1d4ed8", fontWeight: 600 }}>Edit</button>
                    <button onClick={() => setDeleteTarget(c)} style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", cursor: "pointer", color: "#dc2626", fontWeight: 600, marginLeft: "auto" }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap" as const, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Rows per page:</span>
            {PAGE_SIZES.map(ps => (
              <button key={ps} onClick={() => { setPageSize(ps); setPage(1); }}
                style={{ padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: pageSize === ps ? "#1e3a5f" : "#fff", color: pageSize === ps ? "#fff" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{ps}</button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            {filtered.length === 0 ? "0" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`} of {filtered.length} clients
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

      {/* ══ ADD CLIENT MODAL ══ */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "92vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700 }}>Add New Client</h2>
            <FormFields form={form} setForm={setForm} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveNew} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Client"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT CLIENT MODAL ══ */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "92vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700 }}>Edit Client — {clientName(editing)}</h2>
            <FormFields form={form} setForm={setForm} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
            <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700 }}>Delete Client?</h2>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>Delete <strong>{clientName(deleteTarget)}</strong>? This will also remove all their disputes and invoices. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ padding: "9px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK STATUS ══ */}
      {bulkStatusOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>Update Status ({selected.size} clients)</h2>
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

      {/* ══ IMPORT CSV ══ */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 540, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Import Clients from CSV</h2>
              <button onClick={() => setShowImport(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>
              CSV should have headers: <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>first_name, last_name, email, phone, status, credit_score, service_plan, address, city, state, zip</code>
            </p>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImportFile(file);
                const reader = new FileReader();
                reader.onload = ev => setImportText(ev.target?.result as string || "");
                reader.readAsText(file);
              }} />
            <button onClick={() => fileRef.current?.click()} style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              📂 Choose File{importFile ? ` — ${importFile.name}` : ""}
            </button>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={"first_name,last_name,email,phone,status\nJohn,Smith,john@email.com,555-0001,active"}
              style={{ ...inp, minHeight: 140, fontFamily: "monospace", fontSize: 12, resize: "vertical" as const }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button onClick={() => setShowImport(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={importCSV} disabled={saving || !importText.trim()} style={{ padding: "9px 20px", background: importText.trim() ? "#1e3a5f" : "#94a3b8", color: "#fff", border: "none", borderRadius: 7, cursor: importText.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                {saving ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Email Modal ── */}
      {showBulkEmail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:500, maxWidth:"95vw" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:17, fontWeight:800 }}>Send Email to {selected.size} Client{selected.size!==1?"s":""}</h3>
            <p style={{ margin:"0 0 16px", fontSize:13, color:"#64748b" }}>
              {clients.filter(c=>selected.has(c.id)&&c.email).length} of {selected.size} have an email address.
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
                  const targets = clients.filter(c=>selected.has(c.id)&&c.email);
                  const results = await Promise.all(targets.map(c=>
                    fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({to:c.email,subject:bulkEmailSubject,body:bulkEmailBody})})
                    .then(async r=>({ ok:r.ok, email:c.email, err: r.ok ? null : (await r.json().catch(()=>({}))).error || r.statusText }))
                  ));
                  setBulkEmailSending(false);
                  setShowBulkEmail(false);
                  setBulkEmailSubject(""); setBulkEmailBody("");
                  const failed = results.filter(r=>!r.ok);
                  if (failed.length) alert(`${results.length-failed.length} sent, ${failed.length} failed:\n${failed.map(f=>`${f.email}: ${f.err}`).join("\n")}`);
                  else alert(`Email sent to ${targets.length} client${targets.length!==1?"s":""}.`);
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
