"use client";

import CDMLayout from "@/components/CDMLayout";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <CDMLayout>
      <PageHeader 
        title="Furnisher Addresses" 
        description="Manage creditor and collector addresses"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Furnisher Addresses" }]}
      />
      <div style={{ padding: "24px" }}>
        <div style={{ 
          backgroundColor: "#fff", 
          padding: "40px", 
          borderRadius: "8px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <p style={{ color: "#64748b", fontSize: "16px" }}>Furnisher Addresses page content coming soon.</p>
          <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "8px" }}>This feature is under development.</p>
        </div>
      </div>
    </CDMLayout>
  );
}
