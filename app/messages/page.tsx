"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function MessagesPage() {
  const [tab, setTab] = useState("customer");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("messages").select("*, clients(name)").eq("type", tab).order("created_at", { ascending: false })
      .then(({ data }) => { setMessages(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const activeBtn = { background: "#2563eb", color: "#fff", border: "1px solid #2563eb", padding: "7px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
  const inactiveBtn = { background: "#fff", color: "#374151", border: "1px solid #d1d5db", padding: "7px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 };

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Messages</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Messages</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button onClick={() => setTab("customer")} style={tab === "customer" ? activeBtn : inactiveBtn}>CUSTOMER</button>
          <button onClick={() => setTab("affiliate")} style={tab === "affiliate" ? activeBtn : inactiveBtn}>AFFILIATE</button>
          <button onClick={() => setTab("text")} style={tab === "text" ? activeBtn : inactiveBtn}>TEXT</button>
        </div>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && messages.length === 0 && <p style={{ color: "#6b7280" }}>No messages yet</p>}
        {!loading && messages.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["From","Subject","Date","Status"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {messages.map(m => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{m.clients?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{m.subject || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "12px", background: m.status === "unread" ? "#fef9c3" : "#f0fdf4", color: m.status === "unread" ? "#854d0e" : "#166534" }}>{m.status || "—"}</span></td>
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
