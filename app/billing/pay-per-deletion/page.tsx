"use client";

import CDMLayout from "@/components/CDMLayout";

export default function Page() {
  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Pay Per Deletion</h1>
        <p>Invoice clients only when items are deleted.</p>
      </div>
    </CDMLayout>
  );
}
