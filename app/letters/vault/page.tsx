"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const TABS = ["All Letters", "Campaign Letters", "Dispute Flow Letters"];
const TYPE_C: Record<string, string> = { dispute: "#8b5cf6", campaign: "#3b82f6", template: "#10b981", metro2: "#f59e0b" };

export default function Page() {
  const [tab, setTab] = useState("All Letters");
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "template", bureau: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("letters").select("*").order("created_at", { ascending: false });
    setLetters(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title || !form.content) return;
    setSaving(true);
    await supabase.from("letters").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", content: "", type: "template", bureau: "" });
    load();
  }

  async function del(id: string) {
    await supabase.from("letters").delete().eq("id", id);
    setLetters(l => l.filter(x => x.id !== id));
  }

  const filtered = letters.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.content?.toLowerCase().includes(search.toLowerCase());
    if (tab === "Campaign Letters") return matchSearch && l.type === "campaign";
    if (tab === "Dispute Flow Letters") return matchSearch && (l.type === "dispute" || l.type === "metro2");
    return matchSearch;
  });

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Letter Vault</h1>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Letter</button>
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{t}</button>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search letters…"
          style={{ width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />

        {/* Add Letter Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "85vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Letter</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    {["template", "dispute", "campaign", "metro2"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bureau (optional)</label>
                  <select value={form.bureau} onChange={e => setForm(f => ({ ...f, bureau: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    <option value="">All Bureaus</option>
                    {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Letter Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your letter template here. Use [CLIENT_NAME], [DATE], [ACCOUNT_NAME] as placeholders."
                  style={{ width: "100%", minHeight: 200, padding: 12, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, resize: "vertical", boxSizing: "border-box" as const, fontFamily: "monospace" }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Letter"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {preview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 620, maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{preview.title}</h2>
                <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span style={{ background: (TYPE_C[preview.type] || "#94a3b8") + "22", color: TYPE_C[preview.type] || "#64748b", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{preview.type}</span>
                {preview.bureau && <span style={{ background: "#f1f5f9", borderRadius: 5, padding: "2px 10px", fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{preview.bureau}</span>}
              </div>
              <pre style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#1e293b", fontFamily: "Georgia, serif", background: "#fafafa", padding: 16, borderRadius: 8 }}>{preview.content}</pre>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={() => { navigator.clipboard.writeText(preview.content); }} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600 }}>Copy</button>
                <button onClick={() => setPreview(null)} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Letters Grid */}
        {loading ? <p style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>Loading letters…</p>
          : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 15 }}>No letters in this category yet.</p>
              <button onClick={() => setShowForm(true)} style={{ marginTop: 8, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700 }}>Create Your First Letter</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map(letter => (
                <div key={letter.id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{letter.title}</h3>
                      <span style={{ background: (TYPE_C[letter.type] || "#94a3b8") + "22", color: TYPE_C[letter.type] || "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: 8, flexShrink: 0, textTransform: "capitalize" }}>{letter.type}</span>
                    </div>
                    {letter.bureau && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, textTransform: "capitalize" }}>{letter.bureau}</div>}
                  </div>
                  <div style={{ padding: "10px 16px", background: "#fafafa" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{letter.content}</p>
                  </div>
                  <div style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
                    <button onClick={() => setPreview(letter)} style={{ flex: 1, fontSize: 13, padding: "6px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Preview</button>
                    <button onClick={() => { navigator.clipboard.writeText(letter.content); }} style={{ fontSize: 13, padding: "6px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer" }}>Copy</button>
                    <button onClick={() => del(letter.id)} style={{ fontSize: 13, padding: "6px 12px", background: "#fff", border: "1px solid #fee2e2", borderRadius: 6, cursor: "pointer", color: "#ef4444" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </CDMLayout>
  );
}
