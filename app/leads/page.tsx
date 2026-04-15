"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("web_leads").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Leads</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Leads</h2>
          <button onClick={() => router.push("/leads/new")} style={{ padding: "8px 18px", border: "none", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>+ Add New Lead</button>
        </div>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && leads.length === 0 && <p style={{ color: "#6b7280" }}>No leads yet</p>}
        {!loading && leads.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Name","Email","Phone","Source","Date",""].map((h,i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.email || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.phone || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{l.source || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 16px" }}><a href={"/leads/" + l.id} style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px" }}>View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
