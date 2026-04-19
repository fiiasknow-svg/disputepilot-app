"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };
const section: React.CSSProperties = { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 };
const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid #f1f5f9" };

const TABS = ["Company Info", "Branding", "Notifications", "Integrations"];

export default function Page() {
  const [tab, setTab] = useState("Company Info");
  const [saved, setSaved] = useState(false);
  const [info, setInfo] = useState({
    company_name: "", email: "", phone: "", website: "", address: "", city: "", state: "", zip: "", description: "",
  });
  const [brand, setBrand] = useState({ brand_color: "#1e3a5f", logo_url: "", tagline: "" });
  const [notifs, setNotifs] = useState({
    new_client: true, new_dispute: true, payment_received: true, dispute_resolved: false,
    weekly_summary: true, client_portal_activity: false,
  });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const notifLabels: Record<string, string> = {
    new_client: "New client added",
    new_dispute: "New dispute filed",
    payment_received: "Payment received",
    dispute_resolved: "Dispute resolved",
    weekly_summary: "Weekly summary email",
    client_portal_activity: "Client portal activity",
  };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 860 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Company Settings</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Manage your company profile, branding, and preferences.</p>
          </div>
          <button onClick={save} style={{ background: saved ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "background 0.2s" }}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e293b" : "#64748b", fontSize: 14, borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "Company Info" && (
          <>
            <div style={section}>
              <p style={sectionTitle}>Business Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={label}>Company Name</label>
                  <input style={inp} value={info.company_name} placeholder="My Credit Repair Co." onChange={e => setInfo(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div>
                  <label style={label}>Business Email</label>
                  <input style={inp} type="email" value={info.email} placeholder="hello@mycompany.com" onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={label}>Phone Number</label>
                  <input style={inp} type="tel" value={info.phone} placeholder="(555) 000-0000" onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={label}>Website</label>
                  <input style={inp} value={info.website} placeholder="https://mycompany.com" onChange={e => setInfo(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={label}>Company Description</label>
                  <textarea style={{ ...inp, height: 80, resize: "vertical" } as React.CSSProperties} value={info.description} placeholder="Describe your credit repair business…" onChange={e => setInfo(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={section}>
              <p style={sectionTitle}>Business Address</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={label}>Street Address</label>
                  <input style={inp} value={info.address} placeholder="123 Main St, Suite 100" onChange={e => setInfo(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label style={label}>City</label>
                  <input style={inp} value={info.city} placeholder="Atlanta" onChange={e => setInfo(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={label}>State</label>
                    <input style={inp} value={info.state} placeholder="GA" maxLength={2} onChange={e => setInfo(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <label style={label}>ZIP Code</label>
                    <input style={inp} value={info.zip} placeholder="30301" onChange={e => setInfo(f => ({ ...f, zip: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "Branding" && (
          <>
            <div style={section}>
              <p style={sectionTitle}>Logo & Colors</p>
              <div style={{ marginBottom: 20 }}>
                <label style={label}>Company Logo</label>
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
                  <label style={label}>Brand Color</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="color" value={brand.brand_color} onChange={e => setBrand(b => ({ ...b, brand_color: e.target.value }))}
                      style={{ width: 48, height: 40, padding: 2, border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer" }} />
                    <input style={{ ...inp, flex: 1 }} value={brand.brand_color} onChange={e => setBrand(b => ({ ...b, brand_color: e.target.value }))} placeholder="#1e3a5f" />
                  </div>
                </div>
                <div>
                  <label style={label}>Tagline</label>
                  <input style={inp} value={brand.tagline} placeholder="Your credit repair partner" onChange={e => setBrand(b => ({ ...b, tagline: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={section}>
              <p style={sectionTitle}>Preview</p>
              <div style={{ background: brand.brand_color || "#1e3a5f", borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                {brand.logo_url
                  ? <img src={brand.logo_url} alt="Logo" style={{ height: 44, objectFit: "contain" }} />
                  : <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 18 }}>DP</div>
                }
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{info.company_name || "Your Company Name"}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{brand.tagline || "Credit Repair CRM"}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "Notifications" && (
          <div style={section}>
            <p style={sectionTitle}>Email Notifications</p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Choose which events trigger email notifications to your account.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {Object.entries(notifs).map(([key, val], i) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < Object.keys(notifs).length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{notifLabels[key]}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Send an email when this event occurs</div>
                  </div>
                  <button onClick={() => setNotifs(n => ({ ...n, [key]: !val }))}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: val ? "#10b981" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Integrations" && (
          <div style={section}>
            <p style={sectionTitle}>Connected Services</p>
            {[
              { name: "Stripe", desc: "Accept credit card payments from clients", icon: "💳", status: process.env.NEXT_PUBLIC_STRIPE_KEY ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_STRIPE_KEY ? "#10b981" : "#f59e0b" },
              { name: "Supabase", desc: "Database and authentication provider", icon: "🗄️", status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_SUPABASE_URL ? "#10b981" : "#f59e0b" },
              { name: "OpenAI", desc: "AI-powered dispute letter generation", icon: "🤖", status: process.env.NEXT_PUBLIC_OPENAI_KEY ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_OPENAI_KEY ? "#10b981" : "#f59e0b" },
              { name: "Twilio", desc: "SMS notifications to clients", icon: "📱", status: process.env.NEXT_PUBLIC_TWILIO_SID ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_TWILIO_SID ? "#10b981" : "#f59e0b" },
              { name: "Mailgun", desc: "Transactional email delivery", icon: "📧", status: process.env.NEXT_PUBLIC_MAILGUN_KEY ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_MAILGUN_KEY ? "#10b981" : "#f59e0b" },
              { name: "DocuSign", desc: "Electronic signature integration", icon: "✍️", status: process.env.NEXT_PUBLIC_DOCUSIGN_KEY ? "connected" : "not connected", color: process.env.NEXT_PUBLIC_DOCUSIGN_KEY ? "#10b981" : "#f59e0b" },
            ].map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: 44, height: 44, background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.desc}</div>
                </div>
                <span style={{ background: s.color + "22", color: s.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{s.status}</span>
                <button style={{ fontSize: 13, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600 }}>
                  {s.status === "connected" ? "Configure" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
