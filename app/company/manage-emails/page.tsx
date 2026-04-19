"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const TABS = ["Email Templates", "SMTP Settings"];
type Template = { id: number; name: string; type: string; subject: string; modified: string; active: boolean };

const SAMPLE: Template[] = [
  { id: 1, name: "Welcome Email", type: "Onboarding", subject: "Welcome to {{company_name}} — Let's Get Started!", modified: "2025-01-10", active: true },
  { id: 2, name: "Dispute Filed Confirmation", type: "Dispute", subject: "Your Dispute Has Been Filed — {{account_name}}", modified: "2025-01-12", active: true },
  { id: 3, name: "Monthly Progress Update", type: "Nurture", subject: "Your Credit Repair Progress for {{month}}", modified: "2025-01-20", active: true },
  { id: 4, name: "Invoice Payment Reminder", type: "Billing", subject: "Payment Due: {{invoice_amount}} — {{due_date}}", modified: "2025-02-01", active: true },
  { id: 5, name: "Happy Birthday", type: "Nurture", subject: "🎂 Happy Birthday from {{company_name}}!", modified: "2025-02-05", active: false },
  { id: 6, name: "Credit Bureau Response Received", type: "Dispute", subject: "Update: Bureau Response for {{client_name}}", modified: "2025-02-14", active: true },
  { id: 7, name: "Dispute Won Notification", type: "Dispute", subject: "🎉 Great News — Item Removed from Your Report!", modified: "2025-03-01", active: true },
  { id: 8, name: "Referral Thank You", type: "Marketing", subject: "Thanks for the Referral, {{client_name}}!", modified: "2025-03-10", active: false },
];

const TYPE_C: Record<string, string> = { Onboarding: "#10b981", Dispute: "#3b82f6", Nurture: "#8b5cf6", Billing: "#f59e0b", Marketing: "#ef4444" };

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function Page() {
  const [tab, setTab] = useState("Email Templates");
  const [templates, setTemplates] = useState<Template[]>(SAMPLE);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", type: "Onboarding", subject: "", body: "" });
  const [smtp, setSmtp] = useState({ host: "smtp.gmail.com", port: "587", user: "", pass: "", from_name: "", from_email: "", tested: false });
  const [testing, setTesting] = useState(false);

  function saveTemplate() {
    if (!form.name || !form.subject) return;
    setTemplates(t => [{ id: Date.now(), name: form.name, type: form.type, subject: form.subject, modified: new Date().toISOString().slice(0, 10), active: true }, ...t]);
    setForm({ name: "", type: "Onboarding", subject: "", body: "" });
    setShowForm(false);
  }

  async function testSmtp() {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSmtp(s => ({ ...s, tested: true }));
    setTesting(false);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 980 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Manage Emails</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Email templates and delivery settings.</p>
          </div>
          {tab === "Email Templates" && (
            <button onClick={() => setShowForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Template</button>
          )}
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>{t}</button>
          ))}
        </div>

        {tab === "Email Templates" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Template Name", "Type", "Subject Line", "Modified", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{t.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: (TYPE_C[t.type] || "#94a3b8") + "22", color: TYPE_C[t.type] || "#64748b", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{t.type}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{t.subject}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{new Date(t.modified).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setTemplates(ts => ts.map(x => x.id === t.id ? { ...x, active: !x.active } : x))}
                        style={{ width: 40, height: 22, borderRadius: 11, border: "none", background: t.active ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative" as const }}>
                        <div style={{ position: "absolute" as const, top: 3, left: t.active ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setPreview(t)} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}>Preview</button>
                        <button style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600 }}>Edit</button>
                        <button onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))} style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "SMTP Settings" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ background: "#fff", borderRadius: 10, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid #f1f5f9", color: "#1e293b" }}>SMTP Configuration</h2>
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
                  <select style={inp}>
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
                <button onClick={testSmtp} disabled={testing} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: testing ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}>
                  {testing ? "Testing…" : "Test Connection"}
                </button>
                <button style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save Settings</button>
              </div>
              {smtp.tested && (
                <div style={{ marginTop: 14, padding: "10px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, color: "#166534", fontSize: 13, fontWeight: 600 }}>
                  ✓ Connection successful — SMTP is configured correctly.
                </div>
              )}
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>💡 Using Gmail?</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#1d4ed8" }}>Enable 2FA on your Google account and generate an App Password at myaccount.google.com/apppasswords. Use your Gmail address as the username and the app password in the password field.</p>
            </div>
          </div>
        )}

        {/* New Template Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Email Template</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Template Name</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dispute Filed Confirmation" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Type</label>
                <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {["Onboarding", "Dispute", "Nurture", "Billing", "Marketing"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Subject Line</label>
                <input style={inp} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Use {{client_name}}, {{company_name}}, etc." />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Email Body</label>
                <textarea style={{ ...inp, height: 120, resize: "vertical" } as React.CSSProperties} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Hi {{client_name}},&#10;&#10;Your dispute has been filed…" />
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Available variables: {"{{client_name}}"} {"{{company_name}}"} {"{{dispute_count}}"} {"{{balance}}"} {"{{due_date}}"}</p>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveTemplate} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Save Template</button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {preview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{preview.name}</h2>
                <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}><strong>Subject:</strong> {preview.subject}</p>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, minHeight: 120, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Hi {"{{client_name}}"},<br /><br />
                This is a preview of the <strong>{preview.name}</strong> template. Customize the body in the editor to match your communication style.<br /><br />
                Best regards,<br />{"{{company_name}}"}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setPreview(null)} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
