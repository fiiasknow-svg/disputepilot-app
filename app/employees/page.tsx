"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const ROLES = ["Admin", "Manager", "Dispute Specialist", "Sales Rep", "Support Agent", "Accountant"];
const ROLE_C: Record<string, string> = { Admin: "#1e3a5f", Manager: "#8b5cf6", "Dispute Specialist": "#3b82f6", "Sales Rep": "#10b981", "Support Agent": "#f59e0b", Accountant: "#64748b" };

export default function Page() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "Dispute Specialist", status: "active" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setEmployees(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.first_name || !form.email) return;
    setSaving(true);
    await supabase.from("employees").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ first_name: "", last_name: "", email: "", phone: "", role: "Dispute Specialist", status: "active" });
    load();
  }

  async function del(id: string) {
    await supabase.from("employees").delete().eq("id", id);
    setDeleteId(null);
    setEmployees(e => e.filter(x => x.id !== id));
  }

  async function toggleStatus(id: string, current: string) {
    const status = current === "active" ? "inactive" : "active";
    await supabase.from("employees").update({ status }).eq("id", id);
    setEmployees(e => e.map(x => x.id === id ? { ...x, status } : x));
  }

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Employees</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{employees.filter(e => e.status === "active").length} active staff</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Employee</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {ROLES.map(role => {
            const count = employees.filter(e => e.role === role).length;
            if (!count) return null;
            return (
              <div key={role} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 8, padding: "8px 14px", display: "flex", gap: 8, alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ROLE_C[role] || "#94a3b8" }} />
                <span style={{ fontSize: 13, color: "#475569" }}>{role}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ROLE_C[role] || "#94a3b8" }}>{count}</span>
              </div>
            );
          })}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add Employee</h2>
              {[["First Name", "first_name"], ["Last Name", "last_name"], ["Email", "email"], ["Phone", "phone"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Add"}</button>
              </div>
            </div>
          </div>
        )}

        {deleteId && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 340 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700 }}>Remove Employee?</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => del(deleteId)} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Remove</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}><tr>
              {["Employee", "Email", "Phone", "Role", "Status", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                : employees.length === 0 ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No employees yet.</td></tr>
                : employees.map(emp => (
                  <tr key={emp.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.first_name} {emp.last_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(emp.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{emp.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{emp.phone || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: (ROLE_C[emp.role] || "#94a3b8") + "22", color: ROLE_C[emp.role] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{emp.role}</span></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: emp.status === "active" ? "#dcfce7" : "#f1f5f9", color: emp.status === "active" ? "#166534" : "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{emp.status}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleStatus(emp.id, emp.status)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff" }}>{emp.status === "active" ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => setDeleteId(emp.id)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444" }}>Remove</button>
                      </div>
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
