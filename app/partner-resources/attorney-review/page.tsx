"use client";

import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

export default function Page() {
  const router = useRouter();

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 960 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 18 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Attorney Review</h1>
          <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.6 }}>
            Use Attorney Review when a client file needs legal review before escalation, settlement discussion, or a more formal consumer-rights response. This page keeps the sidebar destination dedicated and visible while backend intake or attorney scheduling is not connected.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>When to Use It</h2>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              Request review for repeated verification failures, possible FDCPA/FCRA violations, escalated client complaints, or files where an attorney should evaluate next steps.
            </p>
          </section>
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>What to Prepare</h2>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              Collect credit reports, dispute letters, bureau responses, collector correspondence, client notes, and a short timeline of what happened.
            </p>
          </section>
        </div>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "16px 18px", marginBottom: 18 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#1e40af" }}>Local placeholder CTA</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
            Attorney intake is not wired to a backend in this app yet. Use this page as the visible resource destination and return to Partner Resources to continue with connected partner tools.
          </p>
        </div>

        <button type="button" onClick={() => router.push("/partner-resources")} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
          Back to Partner Resources
        </button>
      </div>
    </CDMLayout>
  );
}
