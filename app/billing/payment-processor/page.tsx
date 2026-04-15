"use client";

import CDMLayout from "@/components/CDMLayout";

const providers = [
  { name: "Stripe", status: "Connected", lastSync: "2026-03-12 09:15" },
  { name: "Authorize.Net", status: "Not Connected", lastSync: "—" },
  { name: "Square", status: "Connected", lastSync: "2026-03-11 18:42" },
];

export default function PaymentProcessorPage() {
  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>Payment Processor</h1>
        <p style={subtitle}>Manage payment gateway integrations and sync status.</p>

        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Provider</th>
                <th style={th}>Connection</th>
                <th style={th}>Last Sync</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.name}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.status}</td>
                  <td style={td}>{p.lastSync}</td>
                  <td style={td}>
                    <button style={btn}>{p.status === "Connected" ? "Manage" : "Connect"}</button>
                  </td>
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
const subtitle: React.CSSProperties = { margin: "8px 0 18px", color: "#64748b" };
const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = { textAlign: "left", background: "#f8fafc", color: "#334155", padding: 12, fontSize: 13, borderBottom: "1px solid #e2e8f0" };
const td: React.CSSProperties = { padding: 12, borderBottom: "1px solid #f1f5f9", color: "#0f172a", fontSize: 14 };
const btn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 600 };
