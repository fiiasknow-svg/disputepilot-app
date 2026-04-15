"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("disputes").select("*, clients(name)").order("created_at", { ascending: false })
      .then(({ data }) => { setDisputes(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusStyle = (s: string) => s === "pending" ? { background: "#fef9c3", color: "#854d0e" } : s === "resolved" ? { background: "#dcfce7", color: "#166534" } : { background: "#e0e7ff", color: "#3730a3" };

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>All Disputes</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>All Disputes</h2>
          <button onClick={() => router.push("/disputes/new")} style={{ padding: "8px 18px", border: "none", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>+ New Dispute</button>
        </div>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && disputes.length === 0 && <p style={{ color: "#6b7280" }}>No disputes yet</p>}
        {!loading && disputes.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Client","Creditor","Reason","Bureaus","Status","Date",""].map((h,i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{d.clients?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{d.creditor || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{d.reason || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{Array.isArray(d.bureaus) ? d.bureaus.join(", ") : d.bureaus || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "12px", ...statusStyle(d.status) }}>{d.status || "—"}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 16px" }}><a href={"/disputes/" + d.id} style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px" }}>View</a></td>
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
