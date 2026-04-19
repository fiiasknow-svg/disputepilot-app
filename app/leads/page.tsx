"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = { new: "#3b82f6", contacted: "#f59e0b", qualified: "#8b5cf6", converted: "#10b981", lost: "#94a3b8" };
const SOURCES = ["Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Walk-in", "Other"];

export default function Page() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", source: "Website", status: "new", notes: "" });
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let out = leads;
    if (statusFilter !== "all") out = out.filter(l => l.status === statusFilter);
    if (search) out = out.filter(l => `${l.first_name} ${l.last_name} ${l.email} ${l.phone} ${l.source}`.toLowerCase().includes(search.toLowerCase()));
    setFiltered(out);
  }, [leads, statusFilter, search]);

  async function save() {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    await supabase.from("leads").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ first_name: "", last_name: "", email: "", phone: "", source: "Website", status: "new", notes: "" });
    load();
  }

  async function convertToClient(lead: any) {
    setConverting(lead.id);
    const { data } = await supabase.from("clients").insert([{
      first_name: lead.first_name, last_name: lead.last_name,
      email: lead.email, phone: lead.phone, status: "active",
    }]).select().single();
    await supabase.from("leads").update({ status: "converted" }).eq("id", lead.id);
    setConverting(null);
    if (data) router.push(`/clients/${data.id}`);
    else load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x));
  }

  const selectStyle = { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Leads</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{leads.length} leads in pipeline</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Lead</button>
        </div>

        {/* Status Summary */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => {
            const count = leads.filter(l => l.status === status).length;
            return (
              <button key={status} onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                style={{ background: statusFilter === status ? color + "22" : "#fff", border: `1px solid ${statusFilter === status ? color : "#e2e8f0"}`, borderRadius: 7, padding: "6px 14px", cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", textTransform: "capitalize" }}>{status}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…"
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, outline: "none" }} />
        </div>

        {/* Add Lead Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add New Lead</h2>
              {[["First Name", "first_name"], ["Last Name", "last_name"], ["Email", "email"], ["Phone", "phone"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Source</label>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={{ ...selectStyle, width: "100%" }}>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...selectStyle, width: "100%" }}>
                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, minHeight: 60, resize: "vertical", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Add Lead"}</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}><tr>
              {["Name", "Contact", "Source", "Status", "Date", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No leads found.</td></tr>
                : filtered.map(lead => (
                  <tr key={lead.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>{lead.first_name} {lead.last_name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, color: "#475569" }}>{lead.email || "—"}</div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>{lead.phone || ""}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{lead.source || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                        style={{ fontSize: 12, padding: "3px 8px", border: `1px solid ${STATUS_COLORS[lead.status] || "#e2e8f0"}`, borderRadius: 20, background: (STATUS_COLORS[lead.status] || "#94a3b8") + "22", color: STATUS_COLORS[lead.status] || "#64748b", fontWeight: 700, cursor: "pointer" }}>
                        {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {lead.status !== "converted" && (
                        <button onClick={() => convertToClient(lead)} disabled={converting === lead.id}
                          style={{ fontSize: 12, padding: "5px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, cursor: "pointer", color: "#166534", fontWeight: 600 }}>
                          {converting === lead.id ? "Converting…" : "→ Convert"}
                        </button>
                      )}
                      {lead.status === "converted" && <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>✓ Converted</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </CDMLayout>
  );
}
