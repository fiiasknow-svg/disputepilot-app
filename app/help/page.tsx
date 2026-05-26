"use client";

import Link from "next/link";
import CDMLayout from "@/components/CDMLayout";

const supportOptions = [
  {
    title: "Get Support",
    desc: "Email support to start a ticket with the Client Dispute Manager team.",
    href: "mailto:support@clientdisputemanager.com",
  },
  {
    title: "Help Center",
    desc: "Browse product help articles and setup guidance.",
    href: "https://help.clientdisputemanager.com",
    external: true,
  },
  {
    title: "FAQ",
    desc: "Review answers to common billing, setup, and workflow questions.",
    href: "https://clientdisputemanager.com/faq",
    external: true,
  },
  {
    title: "Success Path",
    desc: "Follow the recommended walkthrough for getting your account operational.",
    href: "https://clientdisputemanager.com/success-path",
    external: true,
  },
  {
    title: "1-on-1 Coaching",
    desc: "Open the coaching scheduler page for implementation help.",
    href: "https://clientdisputemanager.com/coaching",
    external: true,
  },
  {
    title: "AI Credit Coach",
    desc: "Use the in-app AI Credit Coach for workflow and client guidance.",
    href: "/automation/ai-credit-coach",
  },
];

export default function Page() {
  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 980 }}>
        <header style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Help</h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
            Choose a support option, browse help resources, or open the in-app AI Credit Coach.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {supportOptions.map((option) => {
            const style = {
              display: "block",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 18,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            };
            const content = (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>{option.title}</h2>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{option.desc}</p>
                <span style={{ color: "#2563eb", fontSize: 13, fontWeight: 800 }}>Open {option.title}</span>
              </>
            );

            if (option.href.startsWith("/")) {
              return (
                <Link key={option.title} href={option.href} style={style}>
                  {content}
                </Link>
              );
            }

            return (
              <a
                key={option.title}
                href={option.href}
                target={option.external ? "_blank" : undefined}
                rel={option.external ? "noreferrer" : undefined}
                style={style}
              >
                {content}
              </a>
            );
          })}
        </section>
      </main>
    </CDMLayout>
  );
}
