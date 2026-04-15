"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function NewDisputePage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [bureaus, setBureaus] = useState<string[]>([]);
  const [form, setForm] = useState({ client_id: "", creditor: "", account_number: "", reason: "", notes: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = { border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", width: "100%", boxSizing: "border-box" as any };
  const lbl = { fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" };

  useEffect(() => { supabase.from("clients").select("id, name").then(({ data }) => setClients(data || [])); }, []);
  const toggleBureau = (b: string) => setBureaus(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  async function save() {
    if (!form.client_id || !form.creditor || !form.reason) return alert("Client, creditor and reason required.");
    setSaving(true);
    try {
      const { error } = await supabase.from("disputes").insert([{ ...form, bureaus, status: "pending" }]);
      if (error) throw error;
      router.push("/disputes");
    } catch { alert("Error saving."); } finally { setSaving(false); }
  }

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/disputes" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Disputes</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>New Dispute</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px", maxWidth: "640px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>New Dispute</h2>
        <div style={{ display: "grid", gap: "16px" }}>
          <div><label style={lbl}>Client *</label>
            <select style={inp} value={form.client_id} onChange={e => set("client_id", e.target.value)}>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={lbl}>Creditor *</label><input style={inp} value={form.creditor} onChange={e => set("creditor", e.target.value)} /></div>
            <div><label style={lbl}>Account #</label><input style={inp} value={form.account_number} onChange={e => set("account_number", e.target.value)} /></div>
          </div>
          <div><label style={lbl}>Reason *</label>
            <select style={inp} value={form.reason} onChange={e => set("reason", e.target.value)}>
              <option value="">Select reason...</option>
              <option>Not Mine</option><option>Incorrect Balance</option><option>Incorrect Status</option><option>Duplicate</option><option>Other</option>
            </select>
          </div>
          <div><label style={lbl}>Bureaus</label>
            <div style={{ display: "flex", gap: "20px" }}>
              {["Equifax","Experian","TransUnion"].map(b => (
                <label key={b} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                  <input type="checkbox" checked={bureaus.includes(b)} onChange={() => toggleBureau(b)} />{b}
                </label>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Notes</label><textarea style={{ ...inp, height: "80px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button onClick={() => router.push("/disputes")} style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "8px 20px", border: "none", borderRadius: "6px", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>{saving ? "Saving..." : "Save Dispute"}</button>
        </div>
      </div>
    </CDMLayout>
  );
}
