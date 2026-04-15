"use client";

import CDMLayout from "@/components/CDMLayout";

const rows = [
  { name: "ABC Collections", type: "Collector", phone: "(555) 111-0101", email: "support@abccollect.com" },
  { name: "North Bank", type: "Creditor", phone: "(555) 111-0102", email: "care@northbank.com" },
  { name: "Metro Loan", type: "Creditor", phone: "(555) 111-0103", email: "help@metroloan.com" },
];

export default function CreditorsCollectorsPage() {
  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Creditors &amp; Collectors</h1>
        <p style={subtitle}>Directory of contacts used in dispute workflows.</p>
        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Organization</th>
                <th style={th}>Type</th>
                <th style={th}>Phone</th>
                <th style={th}>Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.phone}</td>
                  <td style={td}>{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CDMLayout>
  );
}

const container: React.CSSProperties = { padding: 24, minHeight: "100vh", background: "#ffffff" };
const title: React.CSSProperties = { margin: 0, color: "#0f172a", fontSize: 28 };
const subtitle: React.CSSProperties = { color: "#64748b", margin: "8px 0 16px" };
const card: React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = { textAlign: "left", background: "#f8fafc", color: "#334155", padding: 12, fontSize: 13, borderBottom: "1px solid #e2e8f0" };
const td: React.CSSProperties = { padding: 12, borderBottom: "1px solid #f1f5f9", color: "#0f172a", fontSize: 14 };
