"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const DEFAULT_CLIENT_STATUSES = [
  { name: "Active", color: "#10b981", type: "client" },
  { name: "Pending", color: "#f59e0b", type: "client" },
  { name: "Inactive", color: "#94a3b8", type: "client" },
  { name: "Cancelled", color: "#ef4444", type: "client" },
];

const DEFAULT_DISPUTE_STATUSES = [
  { name: "Pending", color: "#f59e0b", type: "dispute" },
  { name: "Sent", color: "#8b5cf6", type: "dispute" },
  { name: "Responded", color: "#3b82f6", type: "dispute" },
  { name: "Resolved", color: "#10b981", type: "dispute" },
  { name: "Deleted", color: "#ef4444", type: "dispute" },
];

const COLOR_OPTIONS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#94a3b8", "#1e3a5f", "#ec4899", "#14b8a6", "#f97316"];

export default function Page() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<"client" | "dispute" | null>(null);
  const [form, setForm] = useState({ name: "", color: "#3b82f6", type: "client" });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "dispute">("client");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("statuses").select("*").order("name");
    setStatuses(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name) return;
    setSaving(true);
    await supabase.from("statuses").insert([form]);
    setSaving(false);
    setShowForm(null);
    setForm({ name: "", color: "#3b82f6", type: activeTab });
    load();
  }

  async function del(id: string) {
    await supabase.from("statuses").delete().eq("id", id);
    setStatuses(s => s.filter(x => x.id !== id));
  }

  const customStatuses = statuses.filter(s => s.type === activeTab);
  const defaults = activeTab === "client" ? DEFAULT_CLIENT_STATUSES : DEFAULT_DISPUTE_STATUSES;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 700 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>Configuration</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Customize statuses, settings, and system preferences.</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {[["client", "Client Statuses"], ["dispute", "Dispute Statuses"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as "client" | "dispute")}
              style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? "#1e3a5f" : "#64748b", borderBottom: activeTab === key ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{label}</button>
          ))}
        </div>

        {/* Default Statuses */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Default Statuses</h3>
          </div>
          {defaults.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid #f8fafc" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.name}</span>
              <span style={{ background: s.color + "22", color: s.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{s.name}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", background: "#f8fafc", borderRadius: 5, padding: "2px 8px" }}>Built-in</span>
            </div>
          ))}
        </div>

        {/* Custom Statuses */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Custom Statuses</h3>
            <button onClick={() => { setShowForm(activeTab); setForm(f => ({ ...f, type: activeTab })); }}
              style={{ fontSize: 12, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 5, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>+ Add Status</button>
          </div>
          {loading ? <p style={{ padding: 16, color: "#94a3b8", fontSize: 14 }}>Loading…</p>
            : customStatuses.length === 0 ? <p style={{ padding: 16, color: "#94a3b8", fontSize: 14 }}>No custom statuses yet.</p>
            : customStatuses.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: "1px solid #f8fafc" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                <span style={{ background: s.color + "22", color: s.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{s.name}</span>
                <button onClick={() => del(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))}
        </div>

        {/* Add Status Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 380 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add Custom Status</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. On Hold"
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #1e293b" : "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: form.color }} />
                  <span style={{ fontSize: 13, background: form.color + "22", color: form.color, borderRadius: 20, padding: "2px 12px", fontWeight: 700 }}>{form.name || "Preview"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Add Status"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Company Settings */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Environment & Integrations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Supabase", "NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
              ["OpenAI", "OPENAI_API_KEY", "Set in server env"],
              ["Stripe", "STRIPE_SECRET_KEY", "Set in server env"],
            ].map(([name, key, val]) => (
              <div key={key as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{key}</div>
                </div>
                <span style={{ fontSize: 12, background: val ? "#dcfce7" : "#fee2e2", color: val ? "#166534" : "#991b1b", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>{val ? "Configured" : "Missing"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
