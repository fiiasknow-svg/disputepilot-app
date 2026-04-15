"use client";

import CDMLayout from "@/components/CDMLayout";

export default function Page() {
  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Import Credit Reports</h1>
        <p>Import credit reports from SmartCredit, IdentityIQ, or upload manually.</p>
      </div>
    </CDMLayout>
  );
}
