import pathlib
content = """\"use client\";
import Link from \"next/link\";
import { usePathname } from \"next/navigation\";

export default function CDMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Customers", href: "/clients" },
    { label: "Add New Customer", href: "/clients/new" },
    { label: "Credit Monitoring", href: "/clients/credit-monitoring" },
    { label: "Dispute Manager", href: "/disputes" },
    { label: "Dispute Status", href: "/disputes/status" },
    { label: "Dispute Strategies", href: "/disputes/strategies" },
    { label: "Bulk Print", href: "/bulk-print" },
    { label: "Creditors & Collectors", href: "/creditors-collectors" },
    { label: "Billing", href: "/billing/invoices" },
    { label: "Invoicing", href: "/billing/invoicing" },
    { label: "Payment Processor", href: "/billing/payment-processor" },
    { label: "Payment", href: "/billing/payment" },
    { label: "Payment History", href: "/billing/payment-history" },
    { label: "Leads", href: "/leads" },
    { label: "Affiliates", href: "/affiliates" },
    { label: "Letters", href: "/letters" },
    { label: "LetterStream", href: "/letters/letterstream" },
    { label: "Credit Analysis", href: "/credit-analysis" },
    { label: "Tasks", href: "/tasks" },
    { label: "Employees", href: "/employees" },
    { label: "Reports", href: "/reports" },
    { label: "Automation", href: "/automation" },
    { label: "Academy", href: "/academy" },
    { label: "Messages", href: "/company/messages" },
    { label: "Emails", href: "/company/emails" },
    { label: "Reminders", href: "/company/reminders" },
    { label: "Portals", href: "/company/portals" },
    { label: "Digital Signatures", href: "/company/digital-signature" },
    { label: "Settings", href: "/company/settings" },
  ];
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 220, background: "#1a1a2e", color: "#fff", padding: "20px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, overflowY: "auto" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #333", marginBottom: 8 }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>DisputePilot</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>Credit Repair CRM</div>
        </div>
        {nav.map(item => (
          <Link key={item.href} href={item.href} style={{ display: "block", padding: "8px 20px", color: pathname === item.href ? "#4fc3f7" : "#ccc", textDecoration: "none", fontSize: 13, background: pathname === item.href ? "rgba(255,255,255,0.1)" : "transparent" }}>
            {item.label}
          </Link>
        ))}
      </div>
      <div style={{ marginLeft: 220, flex: 1, background: "#f5f7fa", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
"""
pathlib.Path("components/CDMLayout.tsx").write_text(content, encoding="utf-8")
print("done")
