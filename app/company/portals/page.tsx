"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const PORTALS = [
  {
    key: "client",
    title: "Client Tracking Portal",
    desc: "Give your clients 24/7 access to track their credit repair progress, view dispute statuses, upload documents, and communicate with your team.",
    url: "https://portal.disputepilot.com/client",
    faqs: [
      { q: "How do clients log in?", a: "Clients receive an email invitation with a secure link to create their password and access the portal." },
      { q: "Can clients upload documents?", a: "Yes. Clients have a dedicated Documents section where they can upload credit reports, IDs, and other files." },
      { q: "What can clients see in the portal?", a: "Clients can view their dispute status, round history, letters sent, and any notes left by your team." },
      { q: "How do I customize the portal branding?", a: "Go to Company Settings to upload your logo, set brand colors, and configure the welcome message shown to clients." },
      { q: "Can clients make payments through the portal?", a: "Yes, if you have a payment processor connected under Billing settings, clients can pay invoices directly in the portal." },
    ],
  },
  {
    key: "affiliate",
    title: "Affiliate Portal",
    desc: "Empower your affiliates with their own portal to submit referrals, track commissions, download marketing materials, and monitor lead conversion.",
    url: "https://portal.disputepilot.com/affiliate",
    faqs: [
      { q: "How do affiliates get access?", a: "You create an affiliate account under Leads > Affiliates. They receive a welcome email with login credentials." },
      { q: "What can affiliates see?", a: "Affiliates can see their submitted referrals, lead statuses, commission totals, and downloadable marketing assets." },
      { q: "How are commissions tracked?", a: "Commissions are calculated automatically based on the rate you set per affiliate and the services rendered." },
      { q: "Can affiliates submit leads directly?", a: "Yes. Affiliates have a lead submission form in their portal that routes directly to your Leads dashboard." },
      { q: "Can I white-label the affiliate portal?", a: "Yes. The portal uses your company branding set in Company Settings, giving it a fully white-labeled experience." },
    ],
  },
];

const VIDEO_IDS: Record<string, string> = {
  client: "dJ4vBsRbfpE",
  affiliate: "FTQbiNvZqaY",
};

export default function Page() {
  const [open, setOpen] = useState<Record<string, number | null>>({ client: null, affiliate: null });
  const [copied, setCopied] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<string | null>(null);

  function toggle(portalKey: string, i: number) {
    setOpen(prev => ({ ...prev, [portalKey]: prev[portalKey] === i ? null : i }));
  }

  function copy(url: string, key: string) {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Portals / Mobile App</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Manage client-facing and affiliate portals.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {PORTALS.map(portal => (
            <div key={portal.key} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "#1e3a5f", padding: "18px 24px" }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff" }}>{portal.title}</h2>
              </div>
              <div style={{ padding: 24, flex: 1 }}>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, marginBottom: 20 }}>{portal.desc}</p>
                <button onClick={() => setVideoModal(portal.key)} style={{ width: "100%", padding: "10px", background: "#1e3a5f", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  ▶ Watch Video
                </button>

                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Frequently Asked Questions</h3>
                <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
                  {portal.faqs.map((faq, i) => (
                    <div key={i} style={{ borderBottom: i < portal.faqs.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <button onClick={() => toggle(portal.key, i)}
                        style={{ width: "100%", padding: "13px 16px", background: open[portal.key] === i ? "#f8fafc" : "#fff", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" as const }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1, paddingRight: 12 }}>{faq.q}</span>
                        <span style={{ fontSize: 16, color: "#94a3b8", flexShrink: 0, fontWeight: 700 }}>{open[portal.key] === i ? "−" : "+"}</span>
                      </button>
                      {open[portal.key] === i && (
                        <div style={{ padding: "0 16px 14px", fontSize: 13, color: "#64748b", lineHeight: 1.65, background: "#f8fafc" }}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{portal.url}</span>
                <button onClick={() => copy(portal.url, portal.key)}
                  style={{ padding: "7px 16px", background: copied === portal.key ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {copied === portal.key ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {videoModal && (
        <div onClick={() => setVideoModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#000", borderRadius: 12, overflow: "hidden", width: "min(800px, 95vw)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#1e293b" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                {PORTALS.find(p => p.key === videoModal)?.title}
              </span>
              <button onClick={() => setVideoModal(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_IDS[videoModal]}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
