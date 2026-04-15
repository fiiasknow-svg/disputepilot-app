"use client";

import CDMLayout from "@/components/CDMLayout";

const rows = [
  { client: "Leslie A.", score: 642, lastPull: "2026-03-12", alerts: 2, status: "Watch" },
  { client: "Monica R.", score: 701, lastPull: "2026-03-11", alerts: 0, status: "Stable" },
  { client: "Darren P.", score: 588, lastPull: "2026-03-10", alerts: 4, status: "High Risk" },
];

export default function CreditMonitoringPage() {
  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Credit Monitoring</h1>
        <p style={subtitle}>Track score changes, risk alerts, and latest report pulls.</p>
        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Customer</th>
                <th style={th}>Score</th>
                <th style={th}>Last Pull</th>
                <th style={th}>Alerts</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.client}>
                  <td style={td}>{r.client}</td>
                  <td style={td}>{r.score}</td>
                  <td style={td}>{r.lastPull}</td>
                  <td style={td}>{r.alerts}</td>
                  <td style={td}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CDMLayout>
  );
}

const container: React.CSSProperties = { padding: 24, background: "#ffffff", minHeight: "100vh" };
const title: React.CSSProperties = { margin: 0, fontSize: 28, color: "#0f172a" };
const subtitle: React.CSSProperties = { color: "#64748b", margin: "8px 0 16px" };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = { textAlign: "left", background: "#f8fafc", color: "#334155", padding: 12, fontSize: 13, borderBottom: "1px solid #e2e8f0" };
const td: React.CSSProperties = { padding: 12, borderBottom: "1px solid #f1f5f9", color: "#0f172a", fontSize: 14 };
