"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Message: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Book: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

const portalNav = [
  { label: "Dashboard", href: "/portal", icon: Icons.Dashboard },
  { label: "My Disputes", href: "/portal/disputes", icon: Icons.FileText },
  { label: "Documents", href: "/portal/documents", icon: Icons.Upload },
  { label: "Messages", href: "/portal/messages", icon: Icons.Message },
  { label: "Education", href: "/portal/education", icon: Icons.Book },
];

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const clearAuthStorage = () => {
    const clearMatching = (storage: Storage) => {
      Object.keys(storage).forEach((key) => {
        if (key.includes("supabase") || key.includes("auth") || key.startsWith("sb-")) {
          storage.removeItem(key);
        }
      });
    };
    clearMatching(window.localStorage);
    clearMatching(window.sessionStorage);
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuthStorage();
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Client Sidebar */}
      <aside style={{ width: "240px", backgroundColor: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "fixed", height: "100vh" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: 0 }}>My Portal</h2>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>Client Dashboard</p>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {portalNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px",
                color: active ? "#4f46e5" : "#64748b", backgroundColor: active ? "#eef2ff" : "transparent",
                textDecoration: "none", fontSize: "14px", fontWeight: active ? "500" : "400",
                borderLeft: active ? "3px solid #4f46e5" : "3px solid transparent"
              }}>
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0" }}>
          <button onClick={handleSignOut} style={{ width: "100%", padding: "10px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "240px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
