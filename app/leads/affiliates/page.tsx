"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  "https://wrjgjxltgpksjgifqszt.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAIN_TABS = ["Manage Affiliate", "Documents & Commissions"];
const FILTER_TABS = ["Active", "Lead", "Inactive", "Pending Messages", "Pending Referrals"];
const STATUS_C: Record<string, string> = { Active: "#10b981", Lead: "#3b82f6", Inactive: "#94a3b8", "Pending Messages": "#f59e0b", "Pending Referrals": "#8b5cf6" };

export default function Page() {
  const [mainTab, setMainTab] = useState("Manage Affiliate");
  const [filterTab, setFilterTab] = useState("Active");
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", company_name: "", office_phone: "", cell_phone: "", email: "", status: "Active", start_date: "", end_date: "", commission: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false });
    setAffiliates(data || []);
    setLoading(false);
  }

  async function save() {
    if (!form.name || !form.email) return;
    setSaving(true);
    await supabase.from("affiliates").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", company_name: "", office_phone: "", cell_phone: "", email: "", status: "Active", start_date: "", end_date: "", commission: "" });
    load();
  }

  async function remove(id: string) {
    await supabase.from("affiliates").delete().eq("id", id);
    setAffiliates(a => a.filter(x => x.id !== id));
  }

  const filtered = affiliates.filter(a => a.status === filterTab);
  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Affiliates</h1>
          <button onClick={() => setShowForm(true)}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Add New
          </button>
        </div>

        {/* Main Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setMainTab(t)}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: mainTab === t ? 700 : 500, color: mainTab === t ? "#1e3a5f" : "#64748b", borderBottom: mainTab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        {mainTab === "Manage Affiliate" ? (
          <>
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 6, padding: "14px 0", flexWrap: "wrap" }}>
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setFilterTab(t)}
                  style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: filterTab === t ? 700 : 500, background: filterTab === t ? (STATUS_C[t] || "#1e3a5f") : "#f1f5f9", color: filterTab === t ? "#fff" : "#64748b" }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["Name", "Company Name", "Office Phone", "Cell Phone", "Email", "Status", "Start", "End", "Commission", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>No {filterTab.toLowerCase()} affiliates.</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{a.name}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{a.company_name || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{a.office_phone || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{a.cell_phone || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{a.email}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: (STATUS_C[a.status] || "#94a3b8") + "22", color: STATUS_C[a.status] || "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.status}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#94a3b8" }}>{a.start_date || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#94a3b8" }}>{a.end_date || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#10b981" }}>{a.commission ? `${a.commission}%` : "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <button onClick={() => remove(a.id)}
                          style={{ fontSize: 12, padding: "4px 10px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", color: "#ef4444", fontWeight: 600 }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ padding: "32px 0", color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
            No documents or commission records yet.
          </div>
        )}

        {/* Add Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add New Affiliate</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {[["Name *", "name"], ["Company Name", "company_name"], ["Office Phone", "office_phone"], ["Cell Phone", "cell_phone"], ["Email *", "email"], ["Commission (%)", "commission"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    {FILTER_TABS.slice(0, 3).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Add Affiliate"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
