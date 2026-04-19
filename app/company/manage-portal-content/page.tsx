"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const SAMPLE_ARTICLES = [
  { id: 1, name: "How to Read Your Credit Report", status: "Published", type: "Educational" },
  { id: 2, name: "Understanding Credit Score Factors", status: "Published", type: "Educational" },
  { id: 3, name: "Disputing Errors on Your Credit Report", status: "Published", type: "Guide" },
  { id: 4, name: "What is the FCRA and How It Protects You", status: "Published", type: "Legal" },
  { id: 5, name: "How Collections Affect Your Credit Score", status: "Draft", type: "Educational" },
  { id: 6, name: "Building Credit from Scratch", status: "Published", type: "Guide" },
  { id: 7, name: "Secured Credit Cards Explained", status: "Published", type: "Educational" },
  { id: 8, name: "Pay-for-Delete: What You Need to Know", status: "Published", type: "Strategy" },
  { id: 9, name: "Goodwill Letters: How to Write One", status: "Draft", type: "Strategy" },
  { id: 10, name: "Understanding Charge-Offs and Your Rights", status: "Published", type: "Legal" },
  { id: 11, name: "How Long Negative Items Stay on Your Report", status: "Published", type: "Educational" },
  { id: 12, name: "Credit Utilization: The 30% Rule Explained", status: "Published", type: "Educational" },
  { id: 13, name: "Statute of Limitations on Debt by State", status: "Draft", type: "Legal" },
  { id: 14, name: "How Bankruptcy Affects Your Credit", status: "Published", type: "Educational" },
  { id: 15, name: "Rebuilding Credit After a Foreclosure", status: "Published", type: "Guide" },
];

const TYPE_C: Record<string, string> = { Educational: "#3b82f6", Guide: "#10b981", Legal: "#8b5cf6", Strategy: "#f59e0b" };
const STATUS_C: Record<string, string> = { Published: "#10b981", Draft: "#f59e0b" };

export default function Page() {
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Educational" });

  function add() {
    if (!form.name) return;
    setArticles(prev => [...prev, { id: Date.now(), name: form.name, status: "Draft", type: form.type }]);
    setForm({ name: "", type: "Educational" });
    setShowForm(false);
  }

  function toggleStatus(id: number) {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "Published" ? "Draft" : "Published" } : a));
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>Manage Portal Content</h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Articles and resources displayed in your client portal.</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Create New
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Name", "Status", "Type", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{a.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (STATUS_C[a.status] || "#94a3b8") + "22", color: STATUS_C[a.status] || "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{a.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: (TYPE_C[a.type] || "#94a3b8") + "22", color: TYPE_C[a.type] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}>Edit</button>
                      <button onClick={() => toggleStatus(a.id)}
                        style={{ fontSize: 12, padding: "4px 10px", border: `1px solid ${STATUS_C[a.status] || "#94a3b8"}44`, borderRadius: 5, cursor: "pointer", background: "#fff", color: STATUS_C[a.status] || "#64748b", fontWeight: 600 }}>
                        {a.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => setArticles(prev => prev.filter(x => x.id !== a.id))}
                        style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>{articles.length} articles</p>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Article</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Article Title</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                  {Object.keys(TYPE_C).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={add} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
