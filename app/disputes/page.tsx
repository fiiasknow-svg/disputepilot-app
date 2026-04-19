"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", sent: "#8b5cf6", responded: "#3b82f6", resolved: "#10b981", deleted: "#ef4444" };
const BUREAU_COLORS: Record<string, string> = { equifax: "#e53e3e", experian: "#2b6cb0", transunion: "#276749" };

export default function Page() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bureauFilter, setBureauFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({ client_id: "", account_name: "", account_number: "", bureau: "equifax", reason: "", status: "pending", round: 1 });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("disputes").select("*, clients(first_name, last_name)").order("created_at", { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.from("clients").select("id, first_name, last_name").order("first_name").then(({ data }) => setClients(data || []));
  }, []);

  useEffect(() => {
    let out = disputes;
    if (statusFilter !== "all") out = out.filter(d => d.status === statusFilter);
    if (bureauFilter !== "all") out = out.filter(d => d.bureau === bureauFilter);
    if (search) out = out.filter(d => `${d.account_name} ${d.clients?.first_name} ${d.clients?.last_name} ${d.reason}`.toLowerCase().includes(search.toLowerCase()));
    setFiltered(out);
  }, [disputes, statusFilter, bureauFilter, search]);

  async function save() {
    if (!form.client_id || !form.account_name) return;
    setSaving(true);
    await supabase.from("disputes").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ client_id: "", account_name: "", account_number: "", bureau: "equifax", reason: "", status: "pending", round: 1 });
    load();
  }

  const selectStyle = { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Disputes</h1>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Dispute</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search account or client…"
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Statuses</option>
            {["pending", "sent", "responded", "resolved", "deleted"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={bureauFilter} onChange={e => setBureauFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Bureaus</option>
            {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Add Dispute Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Dispute</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Client</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={{ ...selectStyle, width: "100%" }}>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              {[["Account Name", "account_name"], ["Account Number", "account_number"], ["Reason / Item", "reason"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bureau</label>
                  <select value={form.bureau} onChange={e => setForm(f => ({ ...f, bureau: e.target.value }))} style={{ ...selectStyle, width: "100%" }}>
                    {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Round</label>
                  <input type="number" min={1} value={form.round} onChange={e => setForm(f => ({ ...f, round: parseInt(e.target.value) || 1 }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Create Dispute"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>{["Client", "Account", "Bureau", "Reason", "Round", "Status", "Date"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No disputes found.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} onClick={() => router.push(`/disputes/${d.id}`)} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#1e3a5f" }}>{d.clients?.first_name} {d.clients?.last_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>{d.account_name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (BUREAU_COLORS[d.bureau] || "#94a3b8") + "22", color: BUREAU_COLORS[d.bureau] || "#64748b", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{d.bureau}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 180 }}>{d.reason || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>R{d.round || 1}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (STATUS_COLORS[d.status] || "#94a3b8") + "22", color: STATUS_COLORS[d.status] || "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{d.status || "pending"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>{filtered.length} of {disputes.length} disputes</p>
      </div>
    </CDMLayout>
  );
}
