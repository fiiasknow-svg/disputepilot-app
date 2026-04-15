"use client";

import CDMLayout from "@/components/CDMLayout";

const strategies = [
  { name: "Identity Verification", useWhen: "Unknown account or mixed file", successRate: "78%" },
  { name: "FCRA 611 Reinvestigation", useWhen: "Inaccurate reporting details", successRate: "65%" },
  { name: "Debt Validation", useWhen: "Collection account disputes", successRate: "71%" },
  { name: "Goodwill Deletion", useWhen: "Paid account, late history", successRate: "42%" },
];

export default function DisputeStrategiesPage() {
  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Dispute Strategies</h1>
        <p style={subtitle}>Select and apply strategy templates based on account context.</p>
        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Strategy</th>
                <th style={th}>Use When</th>
                <th style={th}>Historical Success</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s) => (
                <tr key={s.name}>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.useWhen}</td>
                  <td style={td}>{s.successRate}</td>
                  <td style={td}><button style={btn}>Apply</button></td>
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
const btn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 600 };
