"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981", inactive: "#94a3b8", pending: "#f59e0b", cancelled: "#ef4444",
};

export default function Page() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(clients.filter(c =>
      `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase().includes(q)
    ));
  }, [search, clients]);

  async function save() {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    await supabase.from("clients").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ first_name: "", last_name: "", email: "", phone: "", status: "active" });
    load();
  }

  async function del(id: string) {
    await supabase.from("clients").delete().eq("id", id);
    setDeleteId(null);
    load();
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Clients</h1>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Client</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone…"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Add Client Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add New Client</h2>
              {[
                ["First Name", "first_name"], ["Last Name", "last_name"],
                ["Email", "email"], ["Phone", "phone"],
              ].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                  {["active", "pending", "inactive", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{saving ? "Saving…" : "Save Client"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Delete Client?</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => del(deleteId)} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>{["Name", "Email", "Phone", "Status", "Created", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading clients…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>{search ? "No clients match your search." : "No clients yet. Add your first client!"}</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => router.push(`/clients/${c.id}`)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#1e3a5f", padding: 0 }}>
                      {c.first_name} {c.last_name}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{c.email || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (STATUS_COLORS[c.status] || "#94a3b8") + "22", color: STATUS_COLORS[c.status] || "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{c.status || "active"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => router.push(`/clients/${c.id}`)} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff" }}>View</button>
                      <button onClick={() => setDeleteId(c.id)} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>{filtered.length} of {clients.length} clients</p>
      </div>
    </CDMLayout>
  );
}
