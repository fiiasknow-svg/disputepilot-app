"use client";

import Link from "next/link";

const Icons = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Video: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
};

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumb?: { label: string; href?: string }[];
  actionButton?: React.ReactNode;
  showTrainingVideos?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  backHref = "/dashboard", 
  backLabel = "BACK",
  breadcrumb,
  actionButton,
  showTrainingVideos = true 
}: PageHeaderProps) {
  return (
    <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      {/* Top Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #f1f5f9"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link 
            href={backHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#f97316",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            <Icons.ArrowLeft />
            {backLabel}
          </Link>
          
          {breadcrumb && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
              {breadcrumb.map((item, index) => (
                <span key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {index > 0 && <Icons.ChevronRight />}
                  {item.href ? (
                    <Link href={item.href} style={{ color: "#3b82f6", textDecoration: "none" }}>
                      {item.label}
                    </Link>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {showTrainingVideos && (
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer"
            }}>
              <Icons.Video />
              Training Videos
            </button>
          )}
          
          <button style={{
            padding: "8px 16px",
            backgroundColor: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            ACTIVATE MEMBERSHIP
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h1 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            color: "#1e293b",
            margin: 0 
          }}>
            {title}
          </h1>
          <Icons.Info />
        </div>
        {description && (
          <p style={{ 
            fontSize: "13px", 
            color: "#64748b", 
            margin: 0 
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
