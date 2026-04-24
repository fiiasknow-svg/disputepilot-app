"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const RESOURCES = [
  { slug: "merchant-accounts", icon: "💳", title: "Merchant Accounts", color: "#3b82f6", badge: "Setup Required", badgeColor: "#3b82f6", desc: "Accept credit cards from clients with our preferred payment processors built for credit repair.", highlight: "PayHQ, Payroc, Stripe, Square — credit repair compliant" },
  { slug: "monitoring-commissions", icon: "📊", title: "Monitoring Commissions", color: "#10b981", badge: "Earn Money", badgeColor: "#10b981", desc: "Earn $10–$15/month per client by enrolling them in credit monitoring services.", highlight: "Up to $12,000+/year with 100 enrolled clients" },
  { slug: "dispute-outsourcing", icon: "📤", title: "Dispute Outsourcing", color: "#8b5cf6", badge: "Save Time", badgeColor: "#8b5cf6", desc: "Scale without hiring — outsource dispute processing to our certified dispute specialists.", highlight: "Plans from $15/dispute to unlimited at custom pricing" },
  { slug: "rebuild-credit-affiliate", icon: "🔄", title: "Rebuild Credit Affiliate", color: "#f59e0b", badge: "Earn Money", badgeColor: "#f59e0b", desc: "Offer clients secured cards and credit builder loans and earn recurring commissions.", highlight: "Credit Strong, Kikoff, Chime, OpenSky, Self Lender" },
  { slug: "partner-and-earn", icon: "💰", title: "Partner & Earn", color: "#10b981", badge: "Referral", badgeColor: "#10b981", desc: "Refer other credit repair businesses to DisputePilot and earn up to $100/month per referral.", highlight: "Bronze $25 → Platinum $100 per referral per month" },
  { slug: "save-and-annual-plan", icon: "🏷️", title: "Save with Annual Plan", color: "#3b82f6", badge: "Save Money", badgeColor: "#3b82f6", desc: "Switch to annual billing and save up to 20% on your DisputePilot subscription.", highlight: "Save $192–$600/year depending on your plan" },
  { slug: "offer-free-vacations", icon: "✈️", title: "Offer Free Vacations", color: "#ec4899", badge: "Client Incentive", badgeColor: "#ec4899", desc: "Use free vacation packages as a client incentive — close more deals and improve enrollment.", highlight: "Las Vegas, Orlando, Cancún, NYC — $0 cost to you" },
  { slug: "offer-business-funding", icon: "🏦", title: "Offer Business Funding", color: "#f59e0b", badge: "High Value", badgeColor: "#ef4444", desc: "Help your clients access business funding and earn referral fees of $200–$2,000 per deal.", highlight: "SBA loans, lines of credit, equipment financing" },
  { slug: "credit-repair-class", icon: "🎓", title: "Credit Repair Class", color: "#14b8a6", badge: "White Label", badgeColor: "#14b8a6", desc: "White-label our credit education course and sell it to clients as an additional service.", highlight: "6 modules, 34 lessons, 4.5 hrs — fully branded as yours" },
  { slug: "community", icon: "👥", title: "Community", color: "#64748b", badge: "Free", badgeColor: "#64748b", desc: "Join thousands of credit repair professionals sharing strategies, wins, and resources.", highlight: "1,200+ members across 6 topic channels" },
];

const INCOME_STREAMS = [
  { label: "Monitoring Commissions", amount: "$120/client/yr", color: "#10b981" },
  { label: "Rebuild Credit Referrals", amount: "$10–$20/client", color: "#f59e0b" },
  { label: "Business Funding Referrals", amount: "$200–$2,000/deal", color: "#3b82f6" },
  { label: "Partner & Earn Referrals", amount: "$25–$100/ref/mo", color: "#8b5cf6" },
  { label: "White-Label Course Sales", amount: "$97–$297/sale", color: "#14b8a6" },
];

export default function Page() {
  const router = useRouter();
  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Partner Resources</h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Tools, programs, and opportunities to add revenue streams and value to your credit repair business.</p>
        </div>

        {/* Income Streams Banner */}
        <div style={{ background: "linear-gradient(135deg,#1e3a5f,#10b981)", borderRadius: 12, padding: "20px 28px", color: "#fff", marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.85, marginBottom: 12 }}>💡 Stack These Revenue Streams Alongside Your Core Credit Repair Service</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {INCOME_STREAMS.map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 16px" }}>
                <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{s.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 28 }}>
          {RESOURCES.map(r => (
            <div key={r.slug} onClick={() => router.push(`/partner-resources/${r.slug}`)}
              style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 22, cursor: "pointer", borderTop: `4px solid ${r.color}`, position: "relative" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)")}>
              <div style={{ position: "absolute", top: 14, right: 14, background: r.badgeColor + "18", color: r.badgeColor, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700 }}>{r.badge}</div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{r.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>{r.title}</h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.6 }}>{r.desc}</p>
              <div style={{ fontSize: 11, color: r.color, fontWeight: 600, background: r.color + "10", borderRadius: 6, padding: "5px 10px", marginBottom: 12 }}>✓ {r.highlight}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>Learn more →</span>
            </div>
          ))}
        </div>

        {/* Pro Tip */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "18px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{ fontSize: 28 }}>💡</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 4 }}>Pro Tip: Stack your revenue streams</div>
            <div style={{ fontSize: 13, color: "#15803d", lineHeight: 1.6 }}>
              Credit repair businesses that combine their core service with monitoring commissions, rebuild credit affiliates, and business funding referrals earn 2–3x more per client. Start with <strong>monitoring commissions</strong> — it requires zero extra work after the initial setup. Then add <strong>business funding referrals</strong> for your small business owner clients once you have results to share.
            </div>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
