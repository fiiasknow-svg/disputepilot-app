"use client";
import { useState, useMemo } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["Email Templates", "SMTP Settings", "Email Log"];
type Template = { id: number; name: string; type: string; subject: string; modified: string; active: boolean; sends: number };

const SAMPLE: Template[] = [
  { id: 1, name: "Welcome Email",                  type: "Onboarding", subject: "Welcome to {{company_name}} — Let's Get Started!",       modified: "2025-01-10", active: true,  sends: 142 },
  { id: 2, name: "Dispute Filed Confirmation",      type: "Dispute",    subject: "Your Dispute Has Been Filed — {{account_name}}",          modified: "2025-01-12", active: true,  sends: 87  },
  { id: 3, name: "Monthly Progress Update",         type: "Nurture",    subject: "Your Credit Repair Progress for {{month}}",               modified: "2025-01-20", active: true,  sends: 210 },
  { id: 4, name: "Invoice Payment Reminder",        type: "Billing",    subject: "Payment Due: {{invoice_amount}} — {{due_date}}",          modified: "2025-02-01", active: true,  sends: 63  },
  { id: 5, name: "Happy Birthday",                  type: "Nurture",    subject: "Happy Birthday from {{company_name}}!",                   modified: "2025-02-05", active: false, sends: 31  },
  { id: 6, name: "Credit Bureau Response Received", type: "Dispute",    subject: "Update: Bureau Response for {{client_name}}",             modified: "2025-02-14", active: true,  sends: 55  },
  { id: 7, name: "Dispute Won Notification",        type: "Dispute",    subject: "Great News — Item Removed from Your Report!",             modified: "2025-03-01", active: true,  sends: 29  },
  { id: 8, name: "Referral Thank You",              type: "Marketing",  subject: "Thanks for the Referral, {{client_name}}!",               modified: "2025-03-10", active: false, sends: 18  },
  { id: 9, name: "Score Improvement Alert",         type: "Nurture",    subject: "Your Credit Score Just Improved, {{client_name}}!",       modified: "2025-03-15", active: true,  sends: 44  },
];

const EMAIL_LOG = [
  { id: 1, to: "maria.johnson@email.com", template: "Monthly Progress Update",    status: "delivered", sent: "2025-04-01 08:00" },
  { id: 2, to: "james.williams@email.com", template: "Invoice Payment Reminder",  status: "delivered", sent: "2025-04-01 08:02" },
  { id: 3, to: "sophia.davis@email.com",   template: "Dispute Filed Confirmation",status: "failed",    sent: "2025-04-01 08:05" },
  { id: 4, to: "liam.brown@email.com",     template: "Welcome Email",             status: "delivered", sent: "2025-04-02 09:10" },
  { id: 5, to: "olivia.m@email.com",       template: "Score Improvement Alert",   status: "opened",    sent: "2025-04-02 10:30" },
  { id: 6, to: "noah.garcia@email.com",    template: "Dispute Won Notification",  status: "opened",    sent: "2025-04-03 11:00" },
];

const TYPE_COLOR: Record<string, string> = {
  Onboarding: "#10b981", Dispute: "#3b82f6", Nurture: "#8b5cf6", Billing: "#f59e0b", Marketing: "#ef4444",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  delivered: { bg: "#dcfce7", text: "#166534" },
  opened:    { bg: "#dbeafe", text: "#1d4ed8" },
  failed:    { bg: "#fee2e2", text: "#dc2626" },
};

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#1e293b" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function Page() {
  const [tab, setTab] = useState("Email Templates");
  const [templates, setTemplates] = useState<Template[]>(SAMPLE);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", type: "Onboarding", subject: "", body: "" });
  const [filterType, setFilterType] = useState("All Types");
  const [search, setSearch] = useState("");
  const [smtp, setSmtp] = useState({ host: "smtp.gmail.com", port: "587", user: "", pass: "", from_name: "", from_email: "", encryption: "TLS", tested: false, success: false });
  const [testing, setTesting] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("All");

  const filteredTemplates = useMemo(() => templates.filter(t => {
    const matchType = filterType === "All Types" || t.type === filterType;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [templates, filterType, search]);

  const filteredLog = useMemo(() => EMAIL_LOG.filter(l => {
    const matchStatus = logStatus === "All" || l.status === logStatus.toLowerCase();
    const matchSearch = !logSearch || l.to.includes(logSearch) || l.template.toLowerCase().includes(logSearch.toLowerCase());
    return matchStatus && matchSearch;
  }), [logSearch, logStatus]);

  function saveTemplate() {
    if (!form.name || !form.subject) return;
    setTemplates(t => [{ id: Date.now(), name: form.name, type: form.type, subject: form.subject, modified: new Date().toISOString().slice(0, 10), active: true, sends: 0 }, ...t]);
    setForm({ name: "", type: "Onboarding", subject: "", body: "" });
    setShowForm(false);
  }

  function duplicate(t: Template) {
    setTemplates(ts => [{ ...t, id: Date.now(), name: t.name + " (Copy)", modified: new Date().toISOString().slice(0, 10), sends: 0 }, ...ts]);
  }

  async function testSmtp() {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSmtp(s => ({ ...s, tested: true, success: true }));
    setTesting(false);
  }

  const totalSends = templates.reduce((s, t) => s + t.sends, 0);
  const activeCount = templates.filter(t => t.active).length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1050 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Manage Emails</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Email templates, SMTP delivery settings, and send history.</p>
          </div>
          {tab === "Email Templates" && (
            <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              + New Template
            </button>
          )}
        </div>

        {/* Stats */}
        {tab === "Email Templates" && (
          <div style={{ display: "flex", gap: 12, marginBottom: 16, marginTop: 10 }}>
            {[
              { label: "Total Templates", value: templates.length, color: "#1e3a5f", bg: "#eff6ff" },
              { label: "Active",          value: activeCount,       color: "#166534", bg: "#dcfce7" },
              { label: "Total Sends",     value: totalSends,        color: "#854d0e", bg: "#fef9c3" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 0, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>{t}</button>
          ))}
        </div>

        {/* ── Email Templates ── */}
        {tab === "Email Templates" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, padding: "14px 0 12px", alignItems: "center", flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…"
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, width: 220, outline: "none" }} />
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer", color: "#374151" }}>
                {["All Types", "Onboarding", "Dispute", "Nurture", "Billing", "Marketing"].map(o => <option key={o}>{o}</option>)}
              </select>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["Template Name", "Type", "Subject Line", "Sends", "Modified", "Status", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No templates found.</td></tr>
                  ) : filteredTemplates.map(t => (
                    <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{t.name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: (TYPE_COLOR[t.type] || "#94a3b8") + "22", color: TYPE_COLOR[t.type] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{t.type}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>{t.sends}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{new Date(t.modified).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => setTemplates(ts => ts.map(x => x.id === t.id ? { ...x, active: !x.active } : x))}
                          style={{ width: 40, height: 22, borderRadius: 11, border: "none", background: t.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative" }}>
                          <div style={{ position: "absolute", top: 3, left: t.active ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setPreview(t)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#1e3a5f" }}>Preview</button>
                          <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#374151" }}>Edit</button>
                          <button onClick={() => duplicate(t)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#64748b" }}>Duplicate</button>
                          <button onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── SMTP Settings ── */}
        {tab === "SMTP Settings" && (
          <div style={{ maxWidth: 580, paddingTop: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20, border: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>SMTP Configuration</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>Configure your outgoing email server to send from your own domain.</p>

              {/* Provider quick-select */}
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Quick Setup</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { name: "Gmail",     host: "smtp.gmail.com",      port: "587" },
                    { name: "Outlook",   host: "smtp.office365.com",   port: "587" },
                    { name: "Mailgun",   host: "smtp.mailgun.org",     port: "587" },
                    { name: "SendGrid",  host: "smtp.sendgrid.net",    port: "587" },
                    { name: "Custom",    host: "",                      port: "" },
                  ].map(p => (
                    <button key={p.name} onClick={() => setSmtp(s => ({ ...s, host: p.host, port: p.port || s.port }))}
                      style={{ padding: "5px 12px", border: `1px solid ${smtp.host === p.host ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 6, background: smtp.host === p.host ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: smtp.host === p.host ? 700 : 500, color: smtp.host === p.host ? "#1e3a5f" : "#374151" }}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>SMTP Host</label>
                  <input style={inp} value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))} placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <label style={lbl}>Port</label>
                  <input style={inp} value={smtp.port} onChange={e => setSmtp(s => ({ ...s, port: e.target.value }))} placeholder="587" />
                </div>
                <div>
                  <label style={lbl}>Encryption</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={smtp.encryption} onChange={e => setSmtp(s => ({ ...s, encryption: e.target.value }))}>
                    <option>TLS (recommended)</option>
                    <option>SSL</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Username</label>
                  <input style={inp} value={smtp.user} onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))} placeholder="you@gmail.com" />
                </div>
                <div>
                  <label style={lbl}>Password / App Key</label>
                  <input style={inp} type="password" value={smtp.pass} onChange={e => setSmtp(s => ({ ...s, pass: e.target.value }))} placeholder="••••••••••••" />
                </div>
                <div>
                  <label style={lbl}>From Name</label>
                  <input style={inp} value={smtp.from_name} onChange={e => setSmtp(s => ({ ...s, from_name: e.target.value }))} placeholder="My Credit Repair Co." />
                </div>
                <div>
                  <label style={lbl}>From Email</label>
                  <input style={inp} value={smtp.from_email} onChange={e => setSmtp(s => ({ ...s, from_email: e.target.value }))} placeholder="noreply@mycompany.com" />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={testSmtp} disabled={testing}
                  style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: testing ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, color: "#374151" }}>
                  {testing ? "Testing…" : "Send Test Email"}
                </button>
                <button style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save Settings</button>
              </div>
              {smtp.tested && (
                <div style={{ marginTop: 14, padding: "10px 16px", background: smtp.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${smtp.success ? "#bbf7d0" : "#fecaca"}`, borderRadius: 7, color: smtp.success ? "#166534" : "#dc2626", fontSize: 13, fontWeight: 600 }}>
                  {smtp.success ? "✓ Connection successful — SMTP is configured correctly." : "✗ Connection failed — check your credentials and try again."}
                </div>
              )}
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>Using Gmail?</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>Enable 2FA on your Google account and generate an App Password at myaccount.google.com/apppasswords. Use your Gmail address as the username and the app password in the password field.</p>
            </div>
          </div>
        )}

        {/* ── Email Log ── */}
        {tab === "Email Log" && (
          <>
            <div style={{ display: "flex", gap: 10, padding: "14px 0 12px", alignItems: "center", flexWrap: "wrap" }}>
              <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search by recipient or template…"
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, width: 260, outline: "none" }} />
              <select value={logStatus} onChange={e => setLogStatus(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer", color: "#374151" }}>
                {["All", "Delivered", "Opened", "Failed"].map(o => <option key={o}>{o}</option>)}
              </select>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>{filteredLog.length} emails</span>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["Recipient", "Template", "Status", "Sent At", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No emails found.</td></tr>
                  ) : filteredLog.map(l => (
                    <tr key={l.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontSize: 14, color: "#1e293b", fontWeight: 500 }}>{l.to}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{l.template}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ ...STATUS_COLOR[l.status], borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{l.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{l.sent}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#64748b" }}>Resend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* New Template Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>New Email Template</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Template Name</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dispute Filed Confirmation" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Category</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {["Onboarding", "Dispute", "Nurture", "Billing", "Marketing"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Subject Line</label>
                <input style={inp} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Use {{client_name}}, {{company_name}}, etc." />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lbl}>Email Body</label>
                <textarea style={{ ...inp, height: 140, resize: "vertical" } as React.CSSProperties} value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder={"Hi {{client_name}},\n\nYour dispute has been filed with all three credit bureaus…\n\nBest regards,\n{{company_name}}"} />
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>
                Variables: {"{{client_name}}"} {"{{company_name}}"} {"{{dispute_count}}"} {"{{balance}}"} {"{{due_date}}"} {"{{month}}"}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>Cancel</button>
                <button onClick={saveTemplate} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Save Template</button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {preview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 580 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{preview.name}</h2>
                  <span style={{ background: (TYPE_COLOR[preview.type] || "#94a3b8") + "22", color: TYPE_COLOR[preview.type] || "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{preview.type}</span>
                </div>
                <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}><strong>Subject:</strong> {preview.subject}</p>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, minHeight: 130, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Hi <strong>{"{{client_name}}"}</strong>,<br /><br />
                This is a preview of the <strong>{preview.name}</strong> template. Customize the body in the editor to match your communication style.<br /><br />
                Best regards,<br />
                <strong>{"{{company_name}}"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{preview.sends} sent · Last modified {new Date(preview.modified).toLocaleDateString()}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", fontSize: 13 }}>Edit</button>
                  <button onClick={() => setPreview(null)} style={{ padding: "8px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
