"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TasksPage() {
  const [tab, setTab] = useState("pending");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  function load() {
    setLoading(true);
    supabase.from("tasks").select("*, clients(name)").eq("status", tab).order("created_at", { ascending: false })
      .then(({ data }) => { setTasks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(() => { load(); }, [tab]);

  async function addTask() {
    if (!newTask.trim()) return;
    setAdding(true);
    await supabase.from("tasks").insert([{ title: newTask, status: "pending" }]);
    setNewTask("");
    setAdding(false);
    if (tab === "pending") load();
  }

  const activeBtn = { background: "#2563eb", color: "#fff", border: "1px solid #2563eb", padding: "7px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
  const inactiveBtn = { background: "#fff", color: "#374151", border: "1px solid #d1d5db", padding: "7px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 };

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Tasks</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Tasks</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button onClick={() => setTab("pending")} style={tab === "pending" ? activeBtn : inactiveBtn}>PENDING</button>
          <button onClick={() => setTab("completed")} style={tab === "completed" ? activeBtn : inactiveBtn}>COMPLETED</button>
        </div>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && tasks.length === 0 && <p style={{ color: "#6b7280" }}>No {tab} tasks</p>}
        {!loading && tasks.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Task","Client","Due Date","Status"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: "13px" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{t.title}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{t.clients?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{t.due_date || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "12px", background: t.status === "completed" ? "#dcfce7" : "#fef9c3", color: t.status === "completed" ? "#166534" : "#854d0e" }}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "flex", gap: "10px" }}>
          <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Add a task..." style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px" }} />
          <button onClick={addTask} disabled={adding} style={{ padding: "8px 20px", border: "none", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>ADD</button>
        </div>
      </div>
    </CDMLayout>
  );
}
