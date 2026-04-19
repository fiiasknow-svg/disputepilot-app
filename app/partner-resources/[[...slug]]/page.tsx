"use client";
import CDMLayout from "@/components/CDMLayout";

const SECTIONS: Record<string, { title: string; desc: string; icon: string }> = {
  "": { title: "Partner Resources", desc: "Tools, programs, and opportunities to grow your business through partnerships.", icon: "🤝" },
  "merchant-accounts": { title: "Merchant Accounts", desc: "Set up payment processing with our preferred merchant account partners.", icon: "💳" },
  "monitoring-commissions": { title: "Monitoring Commissions", desc: "Earn commissions by enrolling your clients in credit monitoring services.", icon: "📊" },
  "dispute-outsourcing": { title: "Dispute Outsourcing", desc: "Partner with our outsourcing team to scale your dispute processing.", icon: "📤" },
  "rebuild-credit-affiliate": { title: "Rebuild Credit Affiliate", desc: "Refer clients to rebuild credit products and earn recurring commissions.", icon: "🔄" },
  "partner-and-earn": { title: "Partner & Earn", desc: "Join our referral program and earn revenue by referring other businesses.", icon: "💰" },
  "save-and-annual-plan": { title: "Save with Annual Plan", desc: "Switch to an annual billing plan and save up to 20% on your subscription.", icon: "🏷️" },
  "offer-free-vacations": { title: "Offer Free Vacations", desc: "Add free vacation incentives to your service packages to attract more clients.", icon: "✈️" },
  "offer-business-funding": { title: "Offer Business Funding", desc: "Help clients access business funding and earn referral fees.", icon: "🏦" },
  "credit-repair-class": { title: "Credit Repair Class", desc: "Access our white-label credit education course to offer to your clients.", icon: "🎓" },
  "community": { title: "Community", desc: "Connect with other DisputePilot users to share strategies and best practices.", icon: "👥" },
};

export default function Page({ params }: { params: { slug?: string[] } }) {
  const key = params.slug?.join("/") ?? "";
  const section = SECTIONS[key] ?? { title: "Partner Resources", desc: "This section is coming soon.", icon: "🤝" };

  return (
    <CDMLayout>
      <div style={{ padding: 32, maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>{section.title}</h1>
        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32 }}>{section.desc}</p>
        <div style={{ background: "#fdf4ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "28px 32px", textAlign: "center" as const }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{section.icon}</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#7e22ce", margin: "0 0 8px" }}>Content Coming Soon</h2>
          <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.6 }}>
            This partner resource is being set up. Contact{" "}
            <a href="mailto:partners@disputepilot.com" style={{ color: "#7e22ce" }}>partners@disputepilot.com</a>{" "}
            for more information.
          </p>
        </div>
      </div>
    </CDMLayout>
  );
}
