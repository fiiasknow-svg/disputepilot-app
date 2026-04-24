"use client";

import React, { useState, useEffect } from "react";
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
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  MessageSquare: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const navGroups = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Icons.Dashboard, isSingle: true },
  {
    key: "company", label: "Company", icon: Icons.Building,
    items: [
      { label: "Company Settings", href: "/company/settings", icon: Icons.Settings },
      { label: "Portals/Mobile App", href: "/company/portals", icon: Icons.Company },
      { label: "Manage Portal Content", href: "/company/manage-portal-content", icon: Icons.FileText },
      { label: "Credit Monitoring", href: "/company/credit-monitoring", icon: Icons.BarChart },
      { label: "Digital Contracts", href: "/company/digital-contracts", icon: Icons.FileText },
      { label: "Self Service Signup", href: "/company/self-service-signup", icon: Icons.UserPlus },
      { label: "Client Auto Signup", href: "/company/client-auto-signup", icon: Icons.Zap },
      { label: "Images/Documents", href: "/company/images-documents", icon: Icons.Image },
      { label: "Manage Emails", href: "/company/manage-emails", icon: Icons.Mail },
      { label: "Dispute Status", href: "/disputes/status", icon: Icons.BarChart },
      { label: "Notify/Automation", href: "/company/notify-automation", icon: Icons.Zap },
      { label: "Employees", href: "/employees", icon: Icons.Users },
      { label: "Team Messages", href: "/company/team-messages", icon: Icons.MessageSquare },
      { label: "Letter Vault", href: "/letters/vault", icon: Icons.FileText },
      { label: "Calendar", href: "/calendar", icon: Icons.Calendar },
      { label: "Configuration", href: "/settings/configuration", icon: Icons.Settings },
    ]
  },
  { key: "customers", label: "Customers", href: "/clients", icon: Icons.Users, isSingle: true },
  { key: "credit-analysis", label: "Credit Analysis/Analyzer", href: "/credit-analysis", icon: Icons.BarChart, isSingle: true },
  { key: "dispute-manager", label: "Dispute Manager", href: "/disputes", icon: Icons.FileText, isSingle: true },
  { key: "bulk-print", label: "Bulk Print", href: "/bulk-print", icon: Icons.Printer, isSingle: true },
  { key: "billing", label: "Billing", href: "/billing", icon: Icons.DollarSign, isSingle: true },
  { key: "leads", label: "Leads/Affiliates", href: "/leads", icon: Icons.Mail, isSingle: true },
  {
    key: "academy", label: "CRB Academy", icon: Icons.GraduationCap,
    items: [
      { label: "Credit Repair Specialist", href: "/academy/credit-repair", icon: Icons.GraduationCap },
      { label: "FCRA Specialist", href: "/academy/fcra", icon: Icons.FileText },
      { label: "FDCPA Specialist", href: "/academy/fdcpa", icon: Icons.FileText },
      { label: "FCBA Specialist", href: "/academy/fcba", icon: Icons.FileText },
      { label: "Compliance Specialist", href: "/academy/compliance", icon: Icons.Settings },
      { label: "Rebuild Credit Specialist", href: "/academy/rebuild", icon: Icons.BarChart },
      { label: "FICO Score Specialist", href: "/academy/fico", icon: Icons.BarChart },
      { label: "Automation Specialist", href: "/academy/automation", icon: Icons.Zap },
      { label: "Funding Specialist", href: "/academy/funding", icon: Icons.DollarSign },
    ]
  },
  { key: "automation", label: "Automation", href: "/automation", icon: Icons.Zap, isSingle: true },
  {
    key: "get-customers", label: "Get Customers", icon: Icons.UserPlus,
    items: [
      { label: "Overview", href: "/get-customers", icon: Icons.UserPlus },
      { label: "Start - Run - Grow", href: "/get-customers/start-run-grow", icon: Icons.BarChart },
      { label: "Business Strategies", href: "/get-customers/business-strategies", icon: Icons.FileText },
      { label: "Get Customers", href: "/get-customers/get-customers", icon: Icons.UserPlus },
    ]
  },
  {
    key: "partner", label: "Partner Resources", icon: Icons.Users,
    items: [
      { label: "Partner Resources", href: "/partner-resources", icon: Icons.Users },
      { label: "Merchant Accounts", href: "/partner-resources/merchant-accounts", icon: Icons.Building },
      { label: "Monitoring Commissions", href: "/partner-resources/monitoring-commissions", icon: Icons.BarChart },
      { label: "Dispute Outsourcing", href: "/partner-resources/dispute-outsourcing", icon: Icons.FileText },
      { label: "Rebuild Credit Affiliate", href: "/partner-resources/rebuild-credit-affiliate", icon: Icons.Users },
      { label: "Partner and Earn", href: "/partner-resources/partner-and-earn", icon: Icons.UserPlus },
      { label: "Save and Annual Plan", href: "/partner-resources/save-and-annual-plan", icon: Icons.FileText },
      { label: "Offer Free Vacations", href: "/partner-resources/offer-free-vacations", icon: Icons.FileText },
      { label: "Offer Business Funding", href: "/partner-resources/offer-business-funding", icon: Icons.FileText },
      { label: "Credit Repair Class", href: "/partner-resources/credit-repair-class", icon: Icons.FileText },
      { label: "Community", href: "/partner-resources/community", icon: Icons.Users },
    ]
  },
];

export default function CDMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["company", "dispute-manager", "billing", "leads", "academy", "get-customers", "partner"]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const toggleExpand = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ position: "fixed", top: 12, left: 12, zIndex: 200, background: "#1e293b", border: "none", borderRadius: 8, width: 40, height: 40, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}
          aria-label="Toggle menu"
        >
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, transition: "transform 0.2s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, transition: "transform 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      )}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} />
      )}
      <aside style={{ width: "280px", backgroundColor: "#1e293b", color: "#94a3b8", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", overflowY: "auto", fontSize: "13px", zIndex: 100, transform: isMobile && !mobileOpen ? "translateX(-280px)" : "translateX(0)", transition: "transform 0.25s ease" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", backgroundColor: "#3b82f6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff", fontSize: "18px" }}>DP</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "600", fontSize: "16px" }}>DisputePilot</div>
            <div style={{ color: "#64748b", fontSize: "11px" }}>Credit Repair CRM</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            if ((group as any).isSingle) {
              const active = isActive((group as any).href);
              return (
                <Link key={group.key} href={(group as any).href} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", color: active ? "#fff" : "#94a3b8", backgroundColor: active ? "#3b82f6" : "transparent", textDecoration: "none", borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent", cursor: "pointer" }}>
                  <GroupIcon /><span style={{ flex: 1 }}>{group.label}</span>
                </Link>
              );
            }
            const isExpanded = expanded.includes(group.key);
            const hasActiveChild = (group as any).items?.some((item: any) => isActive(item.href));
            return (
              <div key={group.key}>
                <button onClick={() => toggleExpand(group.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", color: hasActiveChild ? "#fff" : "#94a3b8", backgroundColor: hasActiveChild ? "#3b82f6" : "transparent", border: "none", borderLeft: hasActiveChild ? "3px solid #60a5fa" : "3px solid transparent", cursor: "pointer", fontSize: "13px", textAlign: "left" as const }}>
                  <GroupIcon /><span style={{ flex: 1 }}>{group.label}</span>
                  {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                </button>
                {isExpanded && (group as any).items && (
                  <div style={{ backgroundColor: "#0f172a" }}>
                    {(group as any).items.map((item: any) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px 8px 44px", color: active ? "#fff" : "#64748b", backgroundColor: active ? "#1e40af" : "transparent", textDecoration: "none", fontSize: "12px", borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent" }}>
                          <ItemIcon />{item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: "16px", borderTop: "1px solid #334155" }}>
          <button onClick={() => setHelpOpen(true)} style={{ width: "100%", padding: "10px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Need Help?
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : "280px", minHeight: "100vh", paddingTop: isMobile ? 56 : 0 }}>{children}</main>

      {helpOpen && (
        <div onClick={() => setHelpOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Need Help?</h2>
              <button onClick={() => setHelpOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>
              Our support team is here to help you get the most out of DisputePilot.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="mailto:support@disputepilot.com" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f0f9ff", borderRadius: 8, textDecoration: "none", color: "#0369a1", fontWeight: 600, fontSize: 14 }}>
                <Icons.Mail />Email Support — support@disputepilot.com
              </a>
              <a href="https://docs.disputepilot.com" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f8fafc", borderRadius: 8, textDecoration: "none", color: "#1e293b", fontWeight: 600, fontSize: 14 }}>
                <Icons.FileText />Documentation &amp; Guides
              </a>
              <a href="https://disputepilot.com/schedule" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fef9c3", borderRadius: 8, textDecoration: "none", color: "#92400e", fontWeight: 600, fontSize: 14 }}>
                <Icons.Calendar />Schedule a 1-on-1 Onboarding Call
              </a>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 20, textAlign: "center" as const }}>
              Support hours: Mon–Fri, 9am–6pm EST
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CDMBtn({ children, onClick, variant = "primary", style = {} }: any) {
  const base = { padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", ...style };
  const variants: any = { primary: { background: "#2563eb", color: "#fff" }, secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }, danger: { background: "#ef4444", color: "#fff" }, success: { background: "#16a34a", color: "#fff" } };
  return <button onClick={onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

export function CDMTable({ columns, data, emptyMessage = "No data yet" }: any) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            {columns.map((c: any) => <th key={c.key} style={{ padding: "12px 16px", textAlign: "left" as const, fontWeight: 600, color: "#374151", fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {!data?.length ? (
            <tr><td colSpan={columns.length} style={{ padding: "32px", textAlign: "center" as const, color: "#888" }}>{emptyMessage}</td></tr>
          ) : data.map((row: any, i: number) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
              {columns.map((c: any) => <td key={c.key} style={{ padding: "12px 16px", color: "#374151" }}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
