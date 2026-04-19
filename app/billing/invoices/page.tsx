"use client";
import CDMLayout from "@/components/CDMLayout";
export default function Page() {
  return (
    <CDMLayout>
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Invoicing</h1>
        <p style={{ color: "#666", marginTop: 8 }}>Create and manage client invoices.</p>
      </div>
    </CDMLayout>
  );
}
