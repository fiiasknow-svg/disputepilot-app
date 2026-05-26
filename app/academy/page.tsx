"use client";

import Link from "next/link";
import CDMLayout from "@/components/CDMLayout";

const COURSES = [
  { title: "Credit Repair", href: "/academy/credit-repair", description: "Core client intake, credit report review, dispute strategy, and business basics." },
  { title: "FDCPA", href: "/academy/fdcpa", description: "Debt collector rules, consumer rights, violations, and dispute workflows." },
  { title: "FCRA", href: "/academy/fcra", description: "Credit reporting accuracy, investigations, furnisher duties, and compliance timelines." },
  { title: "FCBA", href: "/academy/fcba", description: "Billing error rights, creditor response requirements, and client dispute support." },
  { title: "Compliance", href: "/academy/compliance", description: "CROA, TCPA, GLBA, recordkeeping, and risk controls for credit repair teams." },
  { title: "Rebuild Credit", href: "/academy/rebuild", description: "Secured cards, utilization, credit-builder products, and score rebuilding plans." },
  { title: "FICO Score", href: "/academy/fico", description: "Score factors, optimization levers, and client education for better outcomes." },
  { title: "Automation", href: "/academy/automation", description: "Client onboarding, notifications, letter workflows, and reporting automation." },
  { title: "Funding", href: "/academy/funding", description: "Business funding readiness, offers, documentation, and partner opportunities." },
];

export default function Page() {
  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1120 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#1e293b" }}>CRB Academy</h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#475569", maxWidth: 820 }}>
            Use this catalog to start or continue training across credit repair operations, legal compliance, client credit rebuilding, automation, and funding resources. Each course includes modules, lesson progress, and a local certificate workflow.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          {COURSES.map(course => (
            <Link
              key={course.href}
              href={course.href}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, textDecoration: "none", color: "#1e293b", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "block" }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>{course.title}</h2>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{course.description}</p>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#2563eb" }}>Open course -&gt;</span>
            </Link>
          ))}
        </div>
      </div>
    </CDMLayout>
  );
}
