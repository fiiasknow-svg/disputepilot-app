"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["Active Workflows", "Templates"];

type Workflow = { id: number; name: string; trigger: string; actions: string[]; active: boolean; lastRun: string | null; runs: number };

const TRIGGERS = ["New Client Added", "New Dispute Filed", "Invoice Created", "Invoice Overdue", "Bureau Response Received", "Client Anniversary", "Client Birthday", "Dispute Resolved", "Lead Added", "Scheduled (Daily)", "Scheduled (Weekly)", "Scheduled (Monthly)"];
const ACTIONS = ["Send Email to Client", "Send Email to Team", "Create Dispute", "Update Dispute Status", "Generate Dispute Letter", "Send Portal Notification", "Create Invoice", "Add to Lead Pipeline", "Assign to Employee", "Log Activity Note"];

const TEMPLATES: Omit<Workflow, "id" | "active" | "lastRun" | "runs">[] = [
  { name: "Client Onboarding", trigger: "New Client Added", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"] },
  { name: "Dispute Filed Notification", trigger: "New Dispute Filed", actions: ["Send Email to Client", "Generate Dispute Letter", "Log Activity Note"] },
  { name: "Payment Reminder", trigger: "Invoice Overdue", actions: ["Send Email to Client", "Send Portal Notification"] },
  { name: "Bureau Response Alert", trigger: "Bureau Response Received", actions: ["Send Email to Client", "Update Dispute Status", "Send Email to Team"] },
  { name: "Monthly Progress Email", trigger: "Scheduled (Monthly)", actions: ["Send Email to Client"] },
  { name: "Happy Birthday", trigger: "Client Birthday", actions: ["Send Email to Client"] },
  { name: "Dispute Won — Remove & Notify", trigger: "Dispute Resolved", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"] },
  { name: "New Lead Welcome", trigger: "Lead Added", actions: ["Send Email to Client", "Assign to Employee"] },
];

const TRIGGER_C: Record<string, string> = {
  "New Client Added": "#10b981", "New Dispute Filed": "#3b82f6", "Invoice Created": "#f59e0b",
  "Invoice Overdue": "#ef4444", "Bureau Response Received": "#8b5cf6", "Dispute Resolved": "#10b981",
  "Client Birthday": "#f59e0b", "Client Anniversary": "#f59e0b", "Lead Added": "#3b82f6",
  "Scheduled (Daily)": "#64748b", "Scheduled (Weekly)": "#64748b", "Scheduled (Monthly)": "#64748b",
};

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function Page() {
  const [tab, setTab] = useState("Active Workflows");
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: 1, name: "Client Onboarding", trigger: "New Client Added", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"], active: true, lastRun: "2026-04-18", runs: 3 },
    { id: 2, name: "Payment Reminder", trigger: "Invoice Overdue", actions: ["Send Email to Client", "Send Portal Notification"], active: true, lastRun: "2026-04-15", runs: 7 },
    { id: 3, name: "Monthly Progress Email", trigger: "Scheduled (Monthly)", actions: ["Send Email to Client"], active: false, lastRun: "2026-03-01", runs: 2 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", trigger: TRIGGERS[0], actions: [] as string[] });

  function toggle(id: number) {
    setWorkflows(ws => ws.map(w => w.id === id ? { ...w, active: !w.active } : w));
  }

  function addFromTemplate(t: typeof TEMPLATES[0]) {
    setWorkflows(ws => [...ws, { id: Date.now(), ...t, active: true, lastRun: null, runs: 0 }]);
    setTab("Active Workflows");
  }

  function saveWorkflow() {
    if (!form.name || form.actions.length === 0) return;
    setWorkflows(ws => [...ws, { id: Date.now(), name: form.name, trigger: form.trigger, actions: form.actions, active: true, lastRun: null, runs: 0 }]);
    setForm({ name: "", trigger: TRIGGERS[0], actions: [] });
    setShowForm(false);
  }

  function toggleAction(action: string) {
    setForm(f => ({ ...f, actions: f.actions.includes(action) ? f.actions.filter(a => a !== action) : [...f.actions, action] }));
  }

  const active = workflows.filter(w => w.active).length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Automation</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Automate repetitive tasks and client communication workflows.</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Workflow</button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Workflows", val: workflows.length, color: "#1e3a5f" },
            { label: "Active", val: active, color: "#10b981" },
            { label: "Inactive", val: workflows.length - active, color: "#94a3b8" },
            { label: "Total Runs", val: workflows.reduce((s, w) => s + w.runs, 0), color: "#3b82f6" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{t}</button>
          ))}
        </div>

        {tab === "Active Workflows" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Workflow Name", "Trigger", "Actions", "Last Run", "Runs", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {workflows.length === 0
                  ? <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>No workflows yet. Create one or use a template.</td></tr>
                  : workflows.map(w => (
                    <tr key={w.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{w.name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: (TRIGGER_C[w.trigger] || "#94a3b8") + "22", color: TRIGGER_C[w.trigger] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" as const }}>{w.trigger}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569" }}>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                          {w.actions.map((a, i) => <span key={i} style={{ display: "block" }}>→ {a}</span>)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{w.lastRun ? new Date(w.lastRun).toLocaleDateString() : "Never"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{w.runs}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => toggle(w.id)}
                          style={{ width: 42, height: 23, borderRadius: 12, border: "none", background: w.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative" as const }}>
                          <div style={{ position: "absolute" as const, top: 3, left: w.active ? 21 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => setDeleteId(w.id)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Remove</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Templates" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {TEMPLATES.map(t => {
              const alreadyAdded = workflows.some(w => w.name === t.name);
              return (
                <div key={t.name} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{t.name}</h3>
                    <span style={{ display: "inline-block", marginTop: 6, background: (TRIGGER_C[t.trigger] || "#94a3b8") + "22", color: TRIGGER_C[t.trigger] || "#64748b", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>⚡ {t.trigger}</span>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>Actions</p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {t.actions.map((a, i) => (
                        <span key={i} style={{ fontSize: 13, color: "#475569" }}>→ {a}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => !alreadyAdded && addFromTemplate(t)} disabled={alreadyAdded}
                    style={{ padding: "8px 16px", background: alreadyAdded ? "#f1f5f9" : "#1e3a5f", color: alreadyAdded ? "#94a3b8" : "#fff", border: "none", borderRadius: 7, cursor: alreadyAdded ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, marginTop: "auto" }}>
                    {alreadyAdded ? "✓ Already Added" : "Use This Template"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* New Workflow Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Workflow</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Workflow Name</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. New Client Welcome" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Trigger</label>
                <select style={inp} value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                  {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Actions <span style={{ fontWeight: 400, color: "#94a3b8" }}>(select all that apply)</span></label>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, maxHeight: 220, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 7, padding: 12 }}>
                  {ACTIONS.map(a => (
                    <label key={a} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#374151" }}>
                      <input type="checkbox" checked={form.actions.includes(a)} onChange={() => toggleAction(a)} style={{ accentColor: "#1e3a5f" }} />
                      {a}
                    </label>
                  ))}
                </div>
                {form.actions.length === 0 && <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>Select at least one action.</p>}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveWorkflow} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Create Workflow</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteId !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 340 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700 }}>Remove Workflow?</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>This automation will stop running immediately.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { setWorkflows(ws => ws.filter(w => w.id !== deleteId)); setDeleteId(null); }} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
