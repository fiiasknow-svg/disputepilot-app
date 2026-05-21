"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Membership = {
  plan: string;
  status: string;
  trialDays: number;
  renewalDate: string;
  message: string;
};

const LOCAL_SUBSCRIPTION_KEY = "disputepilot.billing.subscription";
const defaultMembership: Membership = {
  plan: "Trial Membership",
  status: "Trial active",
  trialDays: 14,
  renewalDate: "2026-06-04",
  message: "Trial membership is active. No payment will be charged from this local demo.",
};

const panel = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.06)" };
const primaryButton = { background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const secondaryButton = { background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const tabLink = { color: "#1e3a5f", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 12px", textDecoration: "none", fontWeight: 700, fontSize: 13 };

export default function Page() {
  const [membership, setMembership] = useState(defaultMembership);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);
      if (saved) setMembership(JSON.parse(saved));
    } catch {}
  }, []);

  function updateMembership(next: Membership) {
    setMembership(next);
    window.localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(next));
  }

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1120 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b" }}>Subscription</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>Manage billing and membership status without processing real payments.</p>
          </div>
          <span style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 800 }}>
            {membership.status}
          </span>
        </header>

        <nav aria-label="Billing sections" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            ["Overview", "/billing"],
            ["Invoices", "/billing/invoices"],
            ["Payments", "/billing/payments"],
            ["Services/Products", "/billing/services-products"],
            ["Subscription", "/billing/subscription"],
            ["Payment History", "/billing/payment-history"],
          ].map(([label, href]) => <Link key={label} href={href} style={tabLink}>{label}</Link>)}
        </nav>

        <section role="status" aria-live="polite" style={{ ...panel, borderColor: "#dbeafe", background: "#eff6ff", color: "#1e3a8a", fontWeight: 700, marginBottom: 18 }}>
          {membership.message}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 18 }}>
          <StatusCard label="Current Plan" value={membership.plan} note="Local membership plan" />
          <StatusCard label="Trial Days" value={String(membership.trialDays)} note="Days left in trial" />
          <StatusCard label="Billing Status" value={membership.status} note={`Next review ${membership.renewalDate}`} />
        </section>

        <section style={panel}>
          <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Membership Actions</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={primaryButton}
              onClick={() => updateMembership({ ...membership, plan: "Professional Membership", status: "Upgrade pending", trialDays: 0, message: "Upgrade selected. Connect a real checkout provider later to charge payments." })}
            >
              Upgrade/Manage Plan
            </button>
            <button
              type="button"
              style={secondaryButton}
              onClick={() => updateMembership({ ...membership, status: "Cancellation scheduled", message: "Cancellation scheduled locally. Membership access remains active until the billing period ends." })}
            >
              Cancel Plan
            </button>
            <button
              type="button"
              style={secondaryButton}
              onClick={() => updateMembership({ ...membership, status: "Membership active", message: "Plan kept active. Billing and membership status saved locally." })}
            >
              Keep Plan
            </button>
            <Link href="/billing/credit-card-setup" style={{ ...secondaryButton, textDecoration: "none", display: "inline-block" }}>Billing and membership settings</Link>
          </div>
        </section>
      </main>
    </CDMLayout>
  );
}

function StatusCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={panel}>
      <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
      <strong style={{ display: "block", fontSize: 22, color: "#0f172a" }}>{value}</strong>
      <span style={{ color: "#64748b", fontSize: 13 }}>{note}</span>
    </article>
  );
}
