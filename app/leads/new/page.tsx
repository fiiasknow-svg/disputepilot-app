"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", source: "", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", width: "100%", boxSizing: "border-box" as any };
  const lbl = { fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" };

  async function save() {
    if (!form.first_name || !form.last_name || !form.email) return alert("First name, last name and email required.");
    setSaving(true);
    try {
      const { error } = await supabase.from("web_leads").insert([form]);
      if (error) throw error;
      router.push("/leads");
    } catch { alert("Error saving."); } finally { setSaving(false); }
  }

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/leads" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Leads</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Add New Lead</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px", maxWidth: "640px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Add New Lead</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div><label style={lbl}>First Name *</label><input style={inp} value={form.first_name} onChange={e => set("first_name", e.target.value)} /></div>
          <div><label style={lbl}>Last Name *</label><input style={inp} value={form.last_name} onChange={e => set("last_name", e.target.value)} /></div>
          <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><label style={lbl}>Source</label>
            <select style={inp} value={form.source} onChange={e => set("source", e.target.value)}>
              <option value="">Select...</option>
              <option>Website</option><option>Referral</option><option>Social Media</option><option>Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}><label style={lbl}>Notes</label><textarea style={{ ...inp, height: "80px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button onClick={() => router.push("/leads")} style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "8px 20px", border: "none", borderRadius: "6px", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>{saving ? "Saving..." : "Save Lead"}</button>
        </div>
      </div>
    </CDMLayout>
  );
}
