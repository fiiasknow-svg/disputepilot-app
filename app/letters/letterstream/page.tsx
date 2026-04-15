"use client";

import CDMLayout from "@/components/CDMLayout";

const jobs = [
  { batchId: "LS-5001", letters: 42, status: "Queued", started: "2026-03-12 09:30" },
  { batchId: "LS-5000", letters: 31, status: "Completed", started: "2026-03-11 16:05" },
  { batchId: "LS-4999", letters: 18, status: "Completed", started: "2026-03-10 14:20" },
];

export default function LetterStreamPage() {
  return (
    <CDMLayout>
      <div style={container}>
        <h1 style={title}>LetterStream</h1>
        <p style={subtitle}>Queue, track, and monitor mail batch processing.</p>

        <div style={row}>
          <button style={primaryBtn}>Create Batch</button>
          <button style={secondaryBtn}>Sync Status</button>
        </div>

        <div style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Batch ID</th>
                <th style={th}>Letters</th>
                <th style={th}>Status</th>
                <th style={th}>Started</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.batchId}>
                  <td style={td}>{j.batchId}</td>
                  <td style={td}>{j.letters}</td>
                  <td style={td}>{j.status}</td>
                  <td style={td}>{j.started}</td>
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
const row: React.CSSProperties = { display: "flex", gap: 10, marginBottom: 12 };
const card: React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = { textAlign: "left", background: "#f8fafc", color: "#334155", padding: 12, fontSize: 13, borderBottom: "1px solid #e2e8f0" };
const td: React.CSSProperties = { padding: 12, borderBottom: "1px solid #f1f5f9", color: "#0f172a", fontSize: 14 };
const primaryBtn: React.CSSProperties = { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600 };
const secondaryBtn: React.CSSProperties = { background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600 };
