"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["Active Workflows", "Templates", "Email Templates", "Campaigns"];

type Workflow = {
  id: number; name: string; trigger: string; actions: string[];
  conditions: string[]; active: boolean; lastRun: string | null; runs: number;
};

type EmailTemplate = {
  id: number; name: string; subject: string; trigger: string; body: string; active: boolean;
};

type Campaign = {
  id: number; name: string; status: "active" | "paused" | "draft";
  steps: number; enrolled: number; completed: number; trigger: string;
};

const TRIGGERS = [
  "New Client Added", "New Dispute Filed", "Invoice Created", "Invoice Overdue",
  "Bureau Response Received", "Client Anniversary", "Client Birthday",
  "Dispute Resolved", "Lead Added", "Scheduled (Daily)", "Scheduled (Weekly)", "Scheduled (Monthly)",
  "Credit Score Improved", "Client Portal Login", "Document Signed",
];

const ACTIONS = [
  "Send Email to Client", "Send Email to Team", "Create Dispute", "Update Dispute Status",
  "Generate Dispute Letter", "Send Portal Notification", "Create Invoice", "Add to Lead Pipeline",
  "Assign to Employee", "Log Activity Note", "Send SMS to Client", "Add Client Tag",
];

const CONDITIONS = [
  "Client score < 600", "Client score 600–650", "Client score > 650",
  "Client has active disputes", "Invoice amount > $200", "Client enrolled > 90 days",
  "Client enrolled < 30 days", "Bureau = Equifax", "Bureau = Experian", "Bureau = TransUnion",
];

const TRIGGER_C: Record<string, string> = {
  "New Client Added": "#10b981", "New Dispute Filed": "#3b82f6", "Invoice Created": "#f59e0b",
  "Invoice Overdue": "#ef4444", "Bureau Response Received": "#8b5cf6", "Dispute Resolved": "#10b981",
  "Client Birthday": "#f59e0b", "Client Anniversary": "#f59e0b", "Lead Added": "#3b82f6",
  "Scheduled (Daily)": "#64748b", "Scheduled (Weekly)": "#64748b", "Scheduled (Monthly)": "#64748b",
  "Credit Score Improved": "#10b981", "Client Portal Login": "#3b82f6", "Document Signed": "#8b5cf6",
};

const TEMPLATES: Omit<Workflow, "id" | "active" | "lastRun" | "runs">[] = [
  { name: "Client Onboarding", trigger: "New Client Added", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"], conditions: [] },
  { name: "Dispute Filed Notification", trigger: "New Dispute Filed", actions: ["Send Email to Client", "Generate Dispute Letter", "Log Activity Note"], conditions: [] },
  { name: "Payment Reminder", trigger: "Invoice Overdue", actions: ["Send Email to Client", "Send Portal Notification"], conditions: [] },
  { name: "Bureau Response Alert", trigger: "Bureau Response Received", actions: ["Send Email to Client", "Update Dispute Status", "Send Email to Team"], conditions: [] },
  { name: "Monthly Progress Email", trigger: "Scheduled (Monthly)", actions: ["Send Email to Client"], conditions: [] },
  { name: "Happy Birthday", trigger: "Client Birthday", actions: ["Send Email to Client"], conditions: [] },
  { name: "Dispute Won — Remove & Notify", trigger: "Dispute Resolved", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"], conditions: [] },
  { name: "New Lead Welcome", trigger: "Lead Added", actions: ["Send Email to Client", "Assign to Employee"], conditions: [] },
  { name: "Credit Score Milestone", trigger: "Credit Score Improved", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"], conditions: ["Client score > 650"] },
  { name: "Referral Request", trigger: "Client Anniversary", actions: ["Send Email to Client"], conditions: ["Client enrolled > 90 days"] },
];

const EMAIL_TEMPLATE_DATA: EmailTemplate[] = [
  { id: 1, name: "Welcome Email", subject: "Welcome to [Business Name] — Let's Fix Your Credit!", trigger: "New Client Added", body: "Hi [First Name],\n\nWelcome aboard! We're excited to start this journey with you...", active: true },
  { id: 2, name: "Dispute Filed Confirmation", subject: "We Filed Your Dispute — Here's What Happens Next", trigger: "New Dispute Filed", body: "Hi [First Name],\n\nGreat news — we just filed a dispute on your behalf...", active: true },
  { id: 3, name: "Invoice Overdue Reminder", subject: "Payment Reminder — Account Update Needed", trigger: "Invoice Overdue", body: "Hi [First Name],\n\nThis is a friendly reminder that your payment is past due...", active: true },
  { id: 4, name: "Bureau Response Received", subject: "🎉 Bureau Response Received — Update Inside", trigger: "Bureau Response Received", body: "Hi [First Name],\n\nWe received a response from the credit bureau regarding your dispute...", active: true },
  { id: 5, name: "Monthly Progress Update", subject: "Your Monthly Credit Progress Report", trigger: "Scheduled (Monthly)", body: "Hi [First Name],\n\nHere's your monthly progress update. Here's what we accomplished this month...", active: false },
  { id: 6, name: "Happy Birthday", subject: "Happy Birthday [First Name]! 🎂", trigger: "Client Birthday", body: "Hi [First Name],\n\nWishing you a very happy birthday from our entire team...", active: true },
  { id: 7, name: "Dispute Won — Congratulations", subject: "🏆 Item Removed! Your Score Just Improved", trigger: "Dispute Resolved", body: "Hi [First Name],\n\nExcellent news — we successfully removed a negative item from your credit report...", active: true },
  { id: 8, name: "Referral Request", subject: "Know Someone Who Needs Credit Repair?", trigger: "Client Anniversary", body: "Hi [First Name],\n\nYou've been with us for a while and we appreciate your trust...", active: false },
];

const CAMPAIGN_DATA: Campaign[] = [
  { id: 1, name: "New Client Onboarding Sequence", status: "active", steps: 5, enrolled: 24, completed: 18, trigger: "New Client Added" },
  { id: 2, name: "Lead Nurture (30 Days)", status: "active", steps: 8, enrolled: 47, completed: 31, trigger: "Lead Added" },
  { id: 3, name: "Re-engagement Campaign", status: "paused", steps: 4, enrolled: 12, completed: 5, trigger: "Scheduled (Monthly)" },
  { id: 4, name: "Credit Score Milestone Drip", status: "draft", steps: 3, enrolled: 0, completed: 0, trigger: "Credit Score Improved" },
];

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

const STATUS_C: Record<string, string> = { active: "#10b981", paused: "#f59e0b", draft: "#94a3b8" };

export default function Page() {
  const [tab, setTab] = useState("Active Workflows");
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: 1, name: "Client Onboarding", trigger: "New Client Added", actions: ["Send Email to Client", "Send Portal Notification", "Log Activity Note"], conditions: [], active: true, lastRun: "2026-04-18", runs: 3 },
    { id: 2, name: "Payment Reminder", trigger: "Invoice Overdue", actions: ["Send Email to Client", "Send Portal Notification"], conditions: ["Invoice amount > $200"], active: true, lastRun: "2026-04-15", runs: 7 },
    { id: 3, name: "Monthly Progress Email", trigger: "Scheduled (Monthly)", actions: ["Send Email to Client"], conditions: [], active: false, lastRun: "2026-03-01", runs: 2 },
  ]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(EMAIL_TEMPLATE_DATA);
  const [campaigns] = useState<Campaign[]>(CAMPAIGN_DATA);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: "", trigger: TRIGGERS[0], actions: [] as string[], conditions: [] as string[] });

  function toggle(id: number) {
    setWorkflows(ws => ws.map(w => w.id === id ? { ...w, active: !w.active } : w));
  }

  function toggleTemplate(id: number) {
    setEmailTemplates(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t));
  }

  function addFromTemplate(t: typeof TEMPLATES[0]) {
    setWorkflows(ws => [...ws, { id: Date.now(), ...t, active: true, lastRun: null, runs: 0 }]);
    setTab("Active Workflows");
  }

  function saveWorkflow() {
    if (!form.name || form.actions.length === 0) return;
    setWorkflows(ws => [...ws, { id: Date.now(), name: form.name, trigger: form.trigger, actions: form.actions, conditions: form.conditions, active: true, lastRun: null, runs: 0 }]);
    setForm({ name: "", trigger: TRIGGERS[0], actions: [], conditions: [] });
    setShowForm(false);
  }

  function toggleAction(action: string) {
    setForm(f => ({ ...f, actions: f.actions.includes(action) ? f.actions.filter(a => a !== action) : [...f.actions, action] }));
  }

  function toggleCondition(cond: string) {
    setForm(f => ({ ...f, conditions: f.conditions.includes(cond) ? f.conditions.filter(c => c !== cond) : [...f.conditions, cond] }));
  }

  const active = workflows.filter(w => w.active).length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Automation</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Automate repetitive tasks, client communication, and drip campaigns.</p>
          </div>
          {tab === "Active Workflows" && (
            <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Workflow</button>
          )}
          {tab === "Campaigns" && (
            <button style={{ background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Campaign</button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Workflows", val: workflows.length, color: "#1e3a5f" },
            { label: "Active", val: active, color: "#10b981" },
            { label: "Inactive", val: workflows.length - active, color: "#94a3b8" },
            { label: "Total Runs", val: workflows.reduce((s, w) => s + w.runs, 0), color: "#3b82f6" },
            { label: "Email Templates", val: emailTemplates.length, color: "#f59e0b" },
            { label: "Active Campaigns", val: campaigns.filter(c => c.status === "active").length, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{t}</button>
          ))}
        </div>

        {/* Active Workflows Tab */}
        {tab === "Active Workflows" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Workflow Name", "Trigger", "Conditions", "Actions", "Last Run", "Runs", "Status", ""].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {workflows.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center" as const, color: "#94a3b8" }}>No workflows yet. Create one or use a template.</td></tr>
                  : workflows.map(w => (
                    <tr key={w.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{w.name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: (TRIGGER_C[w.trigger] || "#94a3b8") + "22", color: TRIGGER_C[w.trigger] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" as const }}>{w.trigger}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>
                        {w.conditions.length > 0 ? w.conditions.map((c, i) => <div key={i} style={{ background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "2px 6px", fontSize: 11, marginBottom: 2 }}>IF {c}</div>) : <span style={{ color: "#cbd5e1" }}>None</span>}
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

        {/* Templates Tab */}
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
                  {t.conditions.length > 0 && (
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>Conditions</p>
                      {t.conditions.map((c, i) => <div key={i} style={{ fontSize: 12, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "2px 8px", display: "inline-block", marginRight: 4 }}>IF {c}</div>)}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const }}>Actions</p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {t.actions.map((a, i) => <span key={i} style={{ fontSize: 13, color: "#475569" }}>→ {a}</span>)}
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

        {/* Email Templates Tab */}
        {tab === "Email Templates" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Pre-built email templates for each trigger event. Toggle them on/off or click to preview and edit.</div>
              <button style={{ padding: "7px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ New Template</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Template Name", "Subject Line", "Trigger", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {emailTemplates.map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{t.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 260 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{t.subject}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: (TRIGGER_C[t.trigger] || "#94a3b8") + "22", color: TRIGGER_C[t.trigger] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" as const }}>{t.trigger}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => toggleTemplate(t.id)}
                        style={{ width: 42, height: 23, borderRadius: 12, border: "none", background: t.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative" as const }}>
                        <div style={{ position: "absolute" as const, top: 3, left: t.active ? 21 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setEditingTemplate(t)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#3b82f6", fontWeight: 600, marginRight: 6 }}>Edit</button>
                      <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#64748b", fontWeight: 600 }}>Preview</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === "Campaigns" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#1d4ed8" }}>
              💡 <strong>Campaigns</strong> are multi-step drip sequences automatically sent to clients over time. Each step can be an email, portal notification, or task. Enroll clients in a campaign based on a trigger.
            </div>
            {CAMPAIGN_DATA.map(c => (
              <div key={c.id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{c.name}</h3>
                      <span style={{ background: STATUS_C[c.status] + "20", color: STATUS_C[c.status], borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" as const }}>{c.status}</span>
                    </div>
                    <span style={{ background: (TRIGGER_C[c.trigger] || "#94a3b8") + "22", color: TRIGGER_C[c.trigger] || "#64748b", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>⚡ {c.trigger}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ fontSize: 12, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#3b82f6", fontWeight: 600 }}>Edit</button>
                    <button style={{ fontSize: 12, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: c.status === "active" ? "#fff7ed" : "#f0fdf4", color: c.status === "active" ? "#c2410c" : "#166534", fontWeight: 600 }}>
                      {c.status === "active" ? "Pause" : "Activate"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {[
                    { label: "Steps", val: c.steps },
                    { label: "Enrolled", val: c.enrolled },
                    { label: "Completed", val: c.completed },
                    { label: "Completion Rate", val: c.enrolled > 0 ? `${Math.round((c.completed / c.enrolled) * 100)}%` : "—" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", textAlign: "center" as const }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {c.enrolled > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>{Math.round((c.completed / c.enrolled) * 100)}% complete</span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(c.completed / c.enrolled) * 100}%`, background: STATUS_C[c.status], borderRadius: 10, transition: "width 0.3s" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Workflow Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Workflow</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Workflow Name</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. New Client Welcome" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Trigger Event</label>
                <select style={inp} value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                  {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Conditions <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional — IF these are true)</span></label>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, maxHeight: 140, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 7, padding: 10 }}>
                  {CONDITIONS.map(c => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                      <input type="checkbox" checked={form.conditions.includes(c)} onChange={() => toggleCondition(c)} style={{ accentColor: "#f59e0b" }} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Actions <span style={{ fontWeight: 400, color: "#94a3b8" }}>(select all that apply)</span></label>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, maxHeight: 200, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 7, padding: 12 }}>
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

        {/* Email Template Editor Modal */}
        {editingTemplate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "90vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Edit Email Template</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Template Name</label>
                <input style={inp} value={editingTemplate.name} onChange={e => setEditingTemplate(t => t ? { ...t, name: e.target.value } : t)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Subject Line</label>
                <input style={inp} value={editingTemplate.subject} onChange={e => setEditingTemplate(t => t ? { ...t, subject: e.target.value } : t)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Trigger</label>
                <div style={{ ...inp, background: "#f8fafc", color: "#64748b" }}>{editingTemplate.trigger}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Available Variables</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {["[First Name]", "[Last Name]", "[Business Name]", "[Date]", "[Score]", "[Bureau]"].map(v => (
                    <span key={v} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{v}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Email Body</label>
                <textarea rows={8} style={{ ...inp, resize: "vertical" as const, fontFamily: "inherit" }}
                  value={editingTemplate.body}
                  onChange={e => setEditingTemplate(t => t ? { ...t, body: e.target.value } : t)} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setEditingTemplate(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => {
                  setEmailTemplates(ts => ts.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                  setEditingTemplate(null);
                }} style={{ padding: "9px 22px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Save Template</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
