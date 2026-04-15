"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function BulkPrintPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("letters").select("*, clients(name)").order("created_at", { ascending: false })
      .then(({ data }) => { setLetters(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === letters.length ? [] : letters.map(l => l.id));

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Bulk Print</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Bulk Print</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Select multiple letters and send to print/export in one batch.</p>
          </div>
          <button onClick={() => window.print()} disabled={selected.length === 0} style={{ padding: "8px 18px", border: "none", borderRadius: "6px", background: selected.length > 0 ? "#2563eb" : "#9ca3af", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: selected.length > 0 ? "pointer" : "not-allowed" }}>
            Print Selected ({selected.length})
          </button>
        </div>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && letters.length === 0 && <p style={{ color: "#6b7280" }}>No letters yet</p>}
        {!loading && letters.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", width: "40px" }}>
                  <input type="checkbox" checked={selected.length === letters.length && letters.length > 0} onChange={toggleAll} />
                </th>
                {["Document ID","Customer","Type","Created"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {letters.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6", background: selected.includes(l.id) ? "#eff6ff" : "transparent" }}>
                    <td style={{ padding: "12px 16px" }}><input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} /></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "monospace", color: "#6b7280" }}>LTR-{(l.id || "").slice(0,6).toUpperCase()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.clients?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.type || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && <p style={{ marginTop: "12px", fontSize: "13px", color: "#6b7280" }}>{selected.length} selected</p>}
      </div>
    </CDMLayout>
  );
}
