"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Icons = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Company: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  BarChart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Printer: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  DollarSign: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  GraduationCap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Zap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

const navGroups = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: Icons.Dashboard,
    isSingle: true
  },
  {
    key: "company",
    label: "Company",
    icon: Icons.Building,
    items: [
      { label: "Company Settings", href: "/company/settings", icon: Icons.Settings },
      { label: "Portals/Mobile App", href: "/company/portals", icon: Icons.Company },
      { label: "Manage Portal Content", href: "/company/portal-content", icon: Icons.FileText },
      { label: "Credit Monitoring", href: "/company/credit-monitoring", icon: Icons.BarChart },
      { label: "Digital Contracts", href: "/company/digital-contracts", icon: Icons.FileText },
      { label: "Self Service Signup", href: "/company/self-service-signup", icon: Icons.UserPlus },
      { label: "Client Auto Signup", href: "/company/client-auto-signup", icon: Icons.Zap },
    ]
  },
  {
    key: "customers",
    label: "Customers",
    href: "/clients",
    icon: Icons.Users,
    isSingle: true
  },
  {
    key: "credit-analysis",
    label: "Credit Analysis/Analyzer",
    href: "/credit-analysis",
    icon: Icons.BarChart,
    isSingle: true
  },
  {
    key: "dispute-manager",
    label: "Dispute Manager",
    icon: Icons.FileText,
    items: [
      { label: "All Disputes", href: "/disputes", icon: Icons.FileText },
      { label: "Dispute Status", href: "/disputes/status", icon: Icons.BarChart },
      { label: "Furnisher Addresses", href: "/disputes/furnisher-addresses", icon: Icons.Building },
    ]
  },
  {
    key: "bulk-print",
    label: "Bulk Print",
    href: "/bulk-print",
    icon: Icons.Printer,
    isSingle: true
  },
  {
    key: "billing",
    label: "Billing",
    icon: Icons.DollarSign,
    items: [
      { label: "Invoicing", href: "/billing/invoices", icon: Icons.FileText },
      { label: "Credit Card Setup", href: "/billing/credit-card-setup", icon: Icons.DollarSign },
      { label: "Services/Products", href: "/billing/services-products", icon: Icons.Settings },
      { label: "Payments", href: "/billing/payments", icon: Icons.DollarSign },
      { label: "Payment History", href: "/billing/payment-history", icon: Icons.BarChart },
      { label: "Pay Per Deletion", href: "/billing/pay-per-deletion", icon: Icons.DollarSign },
    ]
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/calendar",
    icon: Icons.Calendar,
    isSingle: true
  },
  {
    key: "leads",
    label: "Leads/Affiliates",
    icon: Icons.Mail,
    items: [
      { label: "Leads", href: "/leads", icon: Icons.Mail },
      { label: "Affiliates", href: "/affiliates", icon: Icons.UserPlus },
      { label: "Affiliate Website Form", href: "/affiliates/website-form", icon: Icons.Settings },
    ]
  },
  {
    key: "academy",
    label: "CRM Academy",
    icon: Icons.GraduationCap,
    items: [
      { label: "Credit Repair Specialist", href: "/academy/credit-repair", icon: Icons.GraduationCap },
      { label: "FCRA Specialist", href: "/academy/fcra", icon: Icons.FileText },
      { label: "FCBA Specialist", href: "/academy/fcba", icon: Icons.FileText },
      { label: "Compliance Specialist", href: "/academy/compliance", icon: Icons.Settings },
      { label: "Rebuild Credit Specialist", href: "/academy/rebuild", icon: Icons.BarChart },
      { label: "FICO Score Specialist", href: "/academy/fico", icon: Icons.BarChart },
      { label: "Automation Specialist", href: "/academy/automation", icon: Icons.Zap },
      { label: "Funding Specialist", href: "/academy/funding", icon: Icons.DollarSign },
    ]
  },
  {
    key: "automation",
    label: "Automation",
    href: "/automation",
    icon: Icons.Zap,
    isSingle: true
  },
  {
    key: "get-customers",
    label: "Get Customers",
    href: "/get-customers",
    icon: Icons.UserPlus,
    isSingle: true
  },
  {
    key: "partner",
    label: "Partner Resources",
    href: "/partner-resources",
    icon: Icons.Users,
    isSingle: true
  },
];

export default function CDMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["company", "dispute-manager", "billing", "leads", "academy"]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  
  const toggleExpand = (key: string) => {
    setExpanded(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <aside style={{ 
        width: "280px", 
        backgroundColor: "#1e293b", 
        color: "#94a3b8", 
        display: "flex", 
        flexDirection: "column", 
        position: "fixed", 
        height: "100vh",
        overflowY: "auto",
        fontSize: "13px",
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ 
          padding: "16px", 
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            backgroundColor: "#3b82f6", 
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#fff",
            fontSize: "18px"
          }}>
            DP
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: "600", fontSize: "16px" }}>DisputePilot</div>
            <div style={{ color: "#64748b", fontSize: "11px" }}>Credit Repair CRM</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            
            if (group.isSingle) {
              const active = isActive(group.href!);
              return (
                <Link 
                  key={group.key}
                  href={group.href!}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "10px 16px",
                    color: active ? "#fff" : "#94a3b8", 
                    backgroundColor: active ? "#3b82f6" : "transparent",
                    textDecoration: "none",
                    borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                >
                  <GroupIcon />
                  <span style={{ flex: 1 }}>{group.label}</span>
                </Link>
              );
            }

            const isExpanded = expanded.includes(group.key);
            const hasActiveChild = group.items?.some(item => isActive(item.href));
            
            return (
              <div key={group.key}>
                <button
                  onClick={() => toggleExpand(group.key)}
                  style={{ 
                    width: "100%",
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "10px 16px",
                    color: hasActiveChild ? "#fff" : "#94a3b8", 
                    backgroundColor: hasActiveChild ? "#3b82f6" : "transparent",
                    textDecoration: "none",
                    border: "none",
                    borderLeft: hasActiveChild ? "3px solid #60a5fa" : "3px solid transparent",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left"
                  }}
                >
                  <GroupIcon />
                  <span style={{ flex: 1 }}>{group.label}</span>
                  {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                </button>
                
                {isExpanded && group.items && (
                  <div style={{ backgroundColor: "#0f172a" }}>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link 
                          key={item.href}
                          href={item.href}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px", 
                            padding: "8px 16px 8px 44px",
                            color: active ? "#fff" : "#64748b", 
                            backgroundColor: active ? "#1e40af" : "transparent",
                            textDecoration: "none",
                            fontSize: "12px",
                            borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
                          }}
                        >
                          <ItemIcon />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Help Button */}
        <div style={{ padding: "16px", borderTop: "1px solid #334155" }}>
          <button style={{ 
            width: "100%",
            padding: "10px",
            backgroundColor: "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <span>💬</span>
            Need Help?
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: "280px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
