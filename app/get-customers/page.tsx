"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const SECTIONS = [
  {
    slug: "start-run-grow", icon: "🚀", title: "Start, Run & Grow", color: "#3b82f6",
    desc: "Step-by-step guidance for launching and scaling your credit repair business from scratch.",
    tags: ["Business Setup", "Legal", "Scaling"],
    highlights: ["How to legally structure your business", "CROA compliance checklist", "Pricing & service packages", "First 12 steps to launch"],
  },
  {
    slug: "business-strategies", icon: "📈", title: "Business Strategies", color: "#10b981",
    desc: "Proven marketing and outreach strategies to attract a steady stream of credit repair clients.",
    tags: ["Social Media", "Referrals", "Networking"],
    highlights: ["Social media content strategy", "Referral partner system", "Content marketing & SEO", "Email nurture sequences"],
  },
  {
    slug: "get-customers", icon: "🎯", title: "Get Customers", color: "#8b5cf6",
    desc: "Specific client acquisition tactics, lead generation funnels, and word-for-word sales scripts.",
    tags: ["Lead Gen", "Funnels", "Scripts"],
    highlights: ["Top 4 lead sources compared", "6-step conversion funnel", "Sales scripts that close", "Objection handling"],
  },
];

const QUICK_WINS = [
  { icon: "💬", title: "Free Consultation Offer", tip: "Lower the barrier with a free 15-minute consultation. Most prospects convert after one real conversation." },
  { icon: "📱", title: "Daily Social Posts", tip: "Post 3–5 times per week on Facebook and Instagram. Before/after credit score transformations get massive organic reach." },
  { icon: "🤝", title: "Referral Partnerships", tip: "Partner with mortgage brokers, auto dealers, and realtors — they lose deals daily due to bad credit and will send you everyone who isn't ready." },
  { icon: "📧", title: "Email List from Day 1", tip: "A monthly newsletter with credit tips keeps you top-of-mind. Most clients come from someone who knew you for 30–90 days before signing." },
  { icon: "⭐", title: "Ask for Reviews", tip: "Ask every satisfied client for a Google review and a Facebook testimonial. Social proof closes more deals than any ad ever will." },
  { icon: "🎁", title: "Referral Incentive", tip: "Give clients $25–$50 account credit for every friend they refer who signs up. Your best clients become your best marketers." },
];

const STATS = [
  { label: "Avg Leads per Week", val: "8–12", sub: "with a solid referral network", color: "#3b82f6" },
  { label: "Avg Close Rate", val: "30–45%", sub: "on consultation calls", color: "#10b981" },
  { label: "Avg Revenue Per Client", val: "$1,800/yr", sub: "at $149/month", color: "#8b5cf6" },
  { label: "Months to Profitability", val: "2–4 mo", sub: "for most new practitioners", color: "#f59e0b" },
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24 };
  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Get Customers</h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Resources, strategies, and tools to grow your credit repair client base.</p>
        </div>

        {/* Key Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ ...card, padding: "16px 20px", borderTop: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Section Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
          {SECTIONS.map(s => (
            <div key={s.slug} onClick={() => router.push(`/get-customers/${s.slug}`)}
              style={{ ...card, cursor: "pointer", borderTop: `4px solid ${s.color}`, transition: "box-shadow 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)")}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>{s.title}</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>{s.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {s.tags.map(t => <span key={t} style={{ background: s.color + "18", color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{t}</span>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                {s.highlights.map(h => <div key={h} style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: s.color, fontWeight: 700 }}>→</span>{h}</div>)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>Explore →</div>
            </div>
          ))}
        </div>

        {/* Quick Wins */}
        <div style={{ ...card, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "#1e293b" }}>Quick Wins for Getting More Credit Repair Clients</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {QUICK_WINS.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "16px 18px", background: "#f8fafc", borderRadius: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.4 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{t.title}</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{t.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", borderRadius: 12, padding: "28px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>Add extra revenue streams to your practice</h3>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Partner programs let you earn commissions on monitoring, funding, and more — alongside your core service.</p>
          </div>
          <button onClick={() => router.push("/partner-resources")} style={{ padding: "11px 24px", background: "#fff", color: "#1e3a5f", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            View Partner Resources →
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
