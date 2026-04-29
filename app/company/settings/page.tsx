"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#1e293b", outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20, border: "1px solid #f1f5f9" };
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid #f1f5f9" };

const TABS = ["Company Info", "Branding", "Notifications", "Integrations", "Security"];

const TIMEZONES = ["Eastern Time (ET)", "Central Time (CT)", "Mountain Time (MT)", "Pacific Time (PT)", "Alaska Time (AKT)", "Hawaii Time (HT)"];
const BUSINESS_TYPES = ["Credit Repair Agency", "Law Firm", "Financial Coaching", "Mortgage Broker", "Freelance Consultant", "Other"];

export default function Page() {
  const [tab, setTab] = useState("Company Info");
  const [saved, setSaved] = useState(false);

  const [info, setInfo] = useState({
    company_name: "", email: "", phone: "", website: "", address: "", city: "", state: "", zip: "",
    description: "", timezone: "Eastern Time (ET)", business_type: "Credit Repair Agency",
    facebook: "", twitter: "", linkedin: "",
  });

  const [brand, setBrand] = useState({
    brand_color: "#1e3a5f", secondary_color: "#10b981", logo_url: "", tagline: "",
    email_signature: "", portal_message: "",
  });

  const [notifs, setNotifs] = useState({
    new_client: true, new_dispute: true, payment_received: true, dispute_resolved: false,
    weekly_summary: true, client_portal_activity: false, letter_printed: true, score_update: false,
  });
  const [smsNotifs, setSmsNotifs] = useState({
    sms_new_client: false, sms_payment: false, sms_dispute: false,
  });

  const [security, setSecurity] = useState({
    two_factor: false, login_alerts: true, session_timeout: "30 minutes",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("company_settings");
      if (stored) {
        const p = JSON.parse(stored);
        if (p.info) setInfo(p.info);
        if (p.brand) setBrand(p.brand);
        if (p.notifs) setNotifs(p.notifs);
        if (p.smsNotifs) setSmsNotifs(p.smsNotifs);
        if (p.security) setSecurity(p.security);
      }
    } catch {}
  }, []);

  function save() {
    try {
      localStorage.setItem("company_settings", JSON.stringify({ info, brand, notifs, smsNotifs, security }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const notifMeta: Record<string, { label: string; desc: string }> = {
    new_client:             { label: "New client added",          desc: "Notify when a new client is created" },
    new_dispute:            { label: "New dispute filed",          desc: "Notify when a dispute round is initiated" },
    payment_received:       { label: "Payment received",           desc: "Notify when a client makes a payment" },
    dispute_resolved:       { label: "Dispute resolved",           desc: "Notify when an item is removed or resolved" },
    weekly_summary:         { label: "Weekly summary email",       desc: "Receive a weekly overview every Monday" },
    client_portal_activity: { label: "Client portal activity",     desc: "Notify when a client logs in or uploads a document" },
    letter_printed:         { label: "Letter printed",             desc: "Notify when a bulk print job completes" },
    score_update:           { label: "Credit score update",        desc: "Notify when a monitored score changes" },
  };

  const smsMeta: Record<string, { label: string; desc: string }> = {
    sms_new_client: { label: "New client SMS",   desc: "Text alert when a new client signs up" },
    sms_payment:    { label: "Payment SMS",       desc: "Text alert when a payment is received" },
    sms_dispute:    { label: "Dispute filed SMS", desc: "Text alert when a new dispute starts" },
  };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Company Settings</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Manage your company profile, branding, notifications, and security.</p>
          </div>
          <button onClick={save} style={{ background: saved ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "background 0.2s" }}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Company Info ── */}
        {tab === "Company Info" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Business Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>Company Name</label>
                  <input style={inp} value={info.company_name} placeholder="My Credit Repair Co." onChange={e => setInfo(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Business Type</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={info.business_type} onChange={e => setInfo(f => ({ ...f, business_type: e.target.value }))}>
                    {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Time Zone</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={info.timezone} onChange={e => setInfo(f => ({ ...f, timezone: e.target.value }))}>
                    {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input style={inp} type="email" value={info.email} placeholder="hello@mycompany.com" onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Phone Number</label>
                  <input style={inp} type="tel" value={info.phone} placeholder="(555) 000-0000" onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>Website</label>
                  <input style={inp} value={info.website} placeholder="https://mycompany.com" onChange={e => setInfo(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>Company Description</label>
                  <textarea style={{ ...inp, height: 80, resize: "vertical" } as React.CSSProperties} value={info.description} placeholder="Describe your credit repair business…" onChange={e => setInfo(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Business Address</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>Street Address</label>
                  <input style={inp} value={info.address} placeholder="123 Main St, Suite 100" onChange={e => setInfo(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>City</label>
                  <input style={inp} value={info.city} placeholder="Atlanta" onChange={e => setInfo(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>State</label>
                    <input style={inp} value={info.state} placeholder="GA" maxLength={2} onChange={e => setInfo(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <label style={lbl}>ZIP Code</label>
                    <input style={inp} value={info.zip} placeholder="30301" onChange={e => setInfo(f => ({ ...f, zip: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Social Media</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { key: "facebook",  label: "Facebook Page URL",  placeholder: "https://facebook.com/mycompany" },
                  { key: "twitter",   label: "Twitter / X Handle",  placeholder: "@mycompany" },
                  { key: "linkedin",  label: "LinkedIn Company URL", placeholder: "https://linkedin.com/company/mycompany" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input style={inp} value={(info as Record<string,string>)[f.key]} placeholder={f.placeholder}
                      onChange={e => setInfo(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Branding ── */}
        {tab === "Branding" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Logo & Colors</p>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Company Logo</label>
                <div style={{ border: "2px dashed #e2e8f0", borderRadius: 10, padding: 32, textAlign: "center", background: "#f8fafc", cursor: "pointer" }}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt="Logo" style={{ maxHeight: 80, maxWidth: 200, objectFit: "contain" }} />
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                      <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Click to upload your company logo</p>
                      <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>PNG, JPG or SVG — max 2MB</p>
                    </>
                  )}
                </div>
                <input type="text" style={{ ...inp, marginTop: 10 }} value={brand.logo_url} placeholder="Or paste image URL…" onChange={e => setBrand(b => ({ ...b, logo_url: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lbl}>Primary Brand Color</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="color" value={brand.brand_color} onChange={e => setBrand(b => ({ ...b, brand_color: e.target.value }))}
                      style={{ width: 48, height: 40, padding: 2, border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer" }} />
                    <input style={{ ...inp, flex: 1 }} value={brand.brand_color} onChange={e => setBrand(b => ({ ...b, brand_color: e.target.value }))} placeholder="#1e3a5f" />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Accent Color</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="color" value={brand.secondary_color} onChange={e => setBrand(b => ({ ...b, secondary_color: e.target.value }))}
                      style={{ width: 48, height: 40, padding: 2, border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer" }} />
                    <input style={{ ...inp, flex: 1 }} value={brand.secondary_color} onChange={e => setBrand(b => ({ ...b, secondary_color: e.target.value }))} placeholder="#10b981" />
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={lbl}>Tagline</label>
                  <input style={inp} value={brand.tagline} placeholder="Your credit repair partner" onChange={e => setBrand(b => ({ ...b, tagline: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Email & Portal Customization</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={lbl}>Email Signature</label>
                  <textarea style={{ ...inp, height: 90, resize: "vertical" } as React.CSSProperties} value={brand.email_signature}
                    placeholder="Best regards,&#10;[Your Name]&#10;[Company Name]&#10;[Phone]"
                    onChange={e => setBrand(b => ({ ...b, email_signature: e.target.value }))} />
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Appended to all automated emails sent from your account.</p>
                </div>
                <div>
                  <label style={lbl}>Client Portal Welcome Message</label>
                  <textarea style={{ ...inp, height: 70, resize: "vertical" } as React.CSSProperties} value={brand.portal_message}
                    placeholder="Welcome! We're working hard to improve your credit. Check this portal for updates…"
                    onChange={e => setBrand(b => ({ ...b, portal_message: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Brand Preview</p>
              <div style={{ background: brand.brand_color || "#1e3a5f", borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                {brand.logo_url
                  ? <img src={brand.logo_url} alt="Logo" style={{ height: 44, objectFit: "contain" }} />
                  : <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 18 }}>DP</div>
                }
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{info.company_name || "Your Company Name"}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{brand.tagline || "Credit Repair CRM"}</div>
                </div>
                <div style={{ marginLeft: "auto", background: brand.secondary_color, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Get Started
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Notifications ── */}
        {tab === "Notifications" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Email Notifications</p>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Choose which events trigger email notifications to your account.</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {Object.entries(notifs).map(([key, val], i, arr) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{notifMeta[key].label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{notifMeta[key].desc}</div>
                    </div>
                    <button onClick={() => setNotifs(n => ({ ...n, [key]: !val }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: val ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>SMS Notifications</p>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Receive text alerts for critical events. Requires Twilio integration.</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {Object.entries(smsNotifs).map(([key, val], i, arr) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{smsMeta[key].label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{smsMeta[key].desc}</div>
                    </div>
                    <button onClick={() => setSmsNotifs(n => ({ ...n, [key]: !val }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: val ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Integrations ── */}
        {tab === "Integrations" && (
          <>
            {[
              {
                title: "Payments",
                items: [
                  { name: "Stripe", desc: "Accept credit card payments from clients", icon: "💳", env: process.env.NEXT_PUBLIC_STRIPE_KEY },
                  { name: "PayPal", desc: "Accept PayPal payments", icon: "🅿️", env: undefined },
                ],
              },
              {
                title: "Communication",
                items: [
                  { name: "Mailgun", desc: "Transactional email delivery", icon: "📧", env: process.env.NEXT_PUBLIC_MAILGUN_KEY },
                  { name: "Twilio", desc: "SMS notifications to clients", icon: "📱", env: process.env.NEXT_PUBLIC_TWILIO_SID },
                  { name: "SendGrid", desc: "Email marketing and delivery", icon: "✉️", env: undefined },
                ],
              },
              {
                title: "Platform",
                items: [
                  { name: "Supabase", desc: "Database and authentication provider", icon: "🗄️", env: process.env.NEXT_PUBLIC_SUPABASE_URL },
                  { name: "OpenAI", desc: "AI-powered dispute letter generation", icon: "🤖", env: process.env.NEXT_PUBLIC_OPENAI_KEY },
                  { name: "DocuSign", desc: "Electronic signature integration", icon: "✍️", env: process.env.NEXT_PUBLIC_DOCUSIGN_KEY },
                  { name: "Google Drive", desc: "Store and sync client documents", icon: "📁", env: undefined },
                ],
              },
            ].map(group => (
              <div key={group.title} style={card}>
                <p style={cardTitle}>{group.title}</p>
                {group.items.map((s, i) => {
                  const connected = !!s.env;
                  const color = connected ? "#10b981" : "#94a3b8";
                  return (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < group.items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ width: 44, height: 44, background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{s.desc}</div>
                      </div>
                      <span style={{ background: color + "22", color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {connected ? "Connected" : "Not Connected"}
                      </span>
                      <button style={{ fontSize: 13, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", flexShrink: 0 }}>
                        {connected ? "Configure" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* ── Security ── */}
        {tab === "Security" && (
          <>
            <div style={card}>
              <p style={cardTitle}>Change Password</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
                {[
                  { key: "current", label: "Current Password",  placeholder: "Enter current password" },
                  { key: "next",    label: "New Password",       placeholder: "At least 8 characters" },
                  { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input type="password" style={inp} value={(pw as Record<string,string>)[f.key]} placeholder={f.placeholder}
                      onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <button style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14, alignSelf: "flex-start" }}>
                  Update Password
                </button>
              </div>
            </div>

            <div style={card}>
              <p style={cardTitle}>Security Settings</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  {
                    key: "two_factor", val: security.two_factor,
                    label: "Two-Factor Authentication",
                    desc: "Require a verification code on every login",
                  },
                  {
                    key: "login_alerts", val: security.login_alerts,
                    label: "Login Alerts",
                    desc: "Receive an email when a new device signs in",
                  },
                ].map((item, i) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === 0 ? "1px solid #f1f5f9" : "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <button onClick={() => setSecurity(s => ({ ...s, [item.key]: !item.val }))}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: item.val ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: item.val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>
                ))}
                <div style={{ paddingTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>Session Timeout</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Automatically log out after inactivity</div>
                  </div>
                  <select value={security.session_timeout} onChange={e => setSecurity(s => ({ ...s, session_timeout: e.target.value }))}
                    style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", cursor: "pointer", color: "#374151" }}>
                    {["15 minutes", "30 minutes", "1 hour", "4 hours", "Never"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ ...card, borderColor: "#fee2e2" }}>
              <p style={{ ...cardTitle, color: "#dc2626", borderBottomColor: "#fee2e2" }}>Danger Zone</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>Delete Account</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Permanently delete your account and all associated data. This cannot be undone.</div>
                </div>
                <button style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  Delete Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </CDMLayout>
  );
}
