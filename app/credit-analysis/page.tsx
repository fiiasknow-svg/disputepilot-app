"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import CDMLayout from "@/components/CDMLayout";

// ── score helpers ─────────────────────────────────────────────────────────────
const BUREAU_COLORS: Record<string, string> = {
  Equifax: "#ef4444",
  Experian: "#3b82f6",
  TransUnion: "#10b981",
};

function scoreLabel(s: number) {
  return s >= 800 ? "Exceptional" : s >= 740 ? "Very Good" : s >= 670 ? "Good" : s >= 580 ? "Fair" : "Poor";
}
function scoreColor(s: number) {
  return s >= 800 ? "#10b981" : s >= 740 ? "#3b82f6" : s >= 670 ? "#eab308" : s >= 580 ? "#f59e0b" : "#ef4444";
}

// ── ScoreGauge SVG ────────────────────────────────────────────────────────────
function ScoreGauge({ score, bureau }: { score: number; bureau: string }) {
  const f = Math.min(1, Math.max(0, (score - 300) / 550));
  const angle = Math.PI * (1 - f);
  const px = 100 + 78 * Math.cos(angle);
  const py = 100 - 78 * Math.sin(angle);
  const large = f > 0.5 ? 1 : 0;
  const col = scoreColor(score);
  const bc = BUREAU_COLORS[bureau];
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 200 115" width="100%" style={{ maxWidth: 200, display: "block", margin: "0 auto" }}>
        <path d="M 22 100 A 78 78 0 0 1 178 100" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        {f > 0.02 && (
          <path d={`M 22 100 A 78 78 0 ${large} 1 ${px.toFixed(1)} ${py.toFixed(1)}`}
            fill="none" stroke={col} strokeWidth="14" strokeLinecap="round" />
        )}
        <line x1="100" y1="100" x2={(100 + 58 * Math.cos(angle)).toFixed(1)} y2={(100 - 58 * Math.sin(angle)).toFixed(1)}
          stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="5" fill="#1e293b" />
        <text x="16" y="114" fontSize="9" fill="#94a3b8">300</text>
        <text x="168" y="114" fontSize="9" fill="#94a3b8">850</text>
        <text x="100" y="85" fontSize="7" fill={bc} textAnchor="middle" fontWeight="bold">{bureau.toUpperCase()}</text>
      </svg>
      <div style={{ fontSize: 42, fontWeight: 900, color: col, lineHeight: 1, marginTop: 4 }}>{score}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: col, marginTop: 2 }}>{scoreLabel(score)}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>300 – 850 FICO Range</div>
    </div>
  );
}

// ── LineChart ─────────────────────────────────────────────────────────────────
function LineChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const W = 280, H = 70, pad = 8;
  const mn = Math.min(...data) - 10, mx = Math.max(...data) + 10;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map(v => H - pad - ((v - mn) / (mx - mn)) * (H - pad * 2));
  const poly = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const fillPts = `${xs[0].toFixed(1)},${H} ${poly} ${xs[xs.length - 1].toFixed(1)},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height: 70 }}>
      <polygon points={fillPts} fill={color + "18"} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} />)}
    </svg>
  );
}

// ── mock bureau data ──────────────────────────────────────────────────────────
type Factor = { label: string; impact: "positive" | "negative" | "neutral"; desc: string };
type Tradeline = { name: string; type: string; balance: number; limit: number; status: string; opened: string; impact: "positive" | "negative" | "neutral" };
type Inquiry = { creditor: string; date: string; type: "Hard" | "Soft" };
type BureauData = { score: number; history: number[]; histLabels: string[]; factors: Factor[]; tradelines: Tradeline[]; inquiries: Inquiry[] };

const MOCK: Record<string, BureauData> = {
  Equifax: {
    score: 624,
    history: [590, 598, 605, 612, 619, 624],
    histLabels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    factors: [
      { label: "Payment History", impact: "negative", desc: "2 late payments in the last 24 months" },
      { label: "Credit Utilization", impact: "negative", desc: "73% utilization — high" },
      { label: "Credit Age", impact: "neutral", desc: "Average account age 4.2 years" },
      { label: "Credit Mix", impact: "positive", desc: "Good mix of revolving and installment accounts" },
      { label: "New Credit", impact: "negative", desc: "3 hard inquiries in last 12 months" },
    ],
    tradelines: [
      { name: "Chase Sapphire", type: "Credit Card", balance: 4800, limit: 6500, status: "Current", opened: "2020-03-01", impact: "negative" },
      { name: "Capital One", type: "Credit Card", balance: 2100, limit: 2500, status: "Current", opened: "2019-07-15", impact: "negative" },
      { name: "Wells Fargo Auto", type: "Auto Loan", balance: 12400, limit: 18000, status: "Current", opened: "2022-01-10", impact: "positive" },
      { name: "Federal Student Loan", type: "Student Loan", balance: 28000, limit: 35000, status: "Current", opened: "2016-09-01", impact: "positive" },
      { name: "Discover Card", type: "Credit Card", balance: 1950, limit: 3000, status: "30 Days Late", opened: "2018-05-20", impact: "negative" },
      { name: "Old Navy Credit", type: "Credit Card", balance: 0, limit: 500, status: "Closed", opened: "2017-02-11", impact: "neutral" },
      { name: "Citi Double Cash", type: "Credit Card", balance: 800, limit: 4000, status: "Current", opened: "2021-08-30", impact: "positive" },
    ],
    inquiries: [
      { creditor: "Chase Bank", date: "2024-11-14", type: "Hard" },
      { creditor: "Capital One", date: "2024-09-02", type: "Hard" },
      { creditor: "Experian Monitoring", date: "2025-01-10", type: "Soft" },
      { creditor: "LendingClub", date: "2024-08-22", type: "Hard" },
    ],
  },
  Experian: {
    score: 638,
    history: [601, 608, 614, 622, 631, 638],
    histLabels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    factors: [
      { label: "Payment History", impact: "negative", desc: "1 late payment reported 18 months ago" },
      { label: "Credit Utilization", impact: "negative", desc: "68% utilization — high" },
      { label: "Credit Age", impact: "positive", desc: "Oldest account is 8 years old" },
      { label: "Credit Mix", impact: "positive", desc: "Good variety of account types" },
      { label: "New Credit", impact: "neutral", desc: "2 inquiries in the last 12 months" },
    ],
    tradelines: [
      { name: "Chase Sapphire", type: "Credit Card", balance: 4800, limit: 6500, status: "Current", opened: "2020-03-01", impact: "negative" },
      { name: "Capital One", type: "Credit Card", balance: 2100, limit: 2500, status: "Current", opened: "2019-07-15", impact: "negative" },
      { name: "Wells Fargo Auto", type: "Auto Loan", balance: 12400, limit: 18000, status: "Current", opened: "2022-01-10", impact: "positive" },
      { name: "Federal Student Loan", type: "Student Loan", balance: 28000, limit: 35000, status: "Current", opened: "2016-09-01", impact: "positive" },
      { name: "Discover Card", type: "Credit Card", balance: 1950, limit: 3000, status: "Current", opened: "2018-05-20", impact: "positive" },
      { name: "Bank of America CC", type: "Credit Card", balance: 3200, limit: 5000, status: "60 Days Late", opened: "2017-06-14", impact: "negative" },
    ],
    inquiries: [
      { creditor: "Chase Bank", date: "2024-11-14", type: "Hard" },
      { creditor: "Experian Monitoring", date: "2025-01-10", type: "Soft" },
      { creditor: "NMAC Auto", date: "2024-07-05", type: "Hard" },
    ],
  },
  TransUnion: {
    score: 611,
    history: [578, 585, 590, 597, 605, 611],
    histLabels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    factors: [
      { label: "Payment History", impact: "negative", desc: "Multiple late payments detected" },
      { label: "Credit Utilization", impact: "negative", desc: "79% utilization — very high" },
      { label: "Credit Age", impact: "neutral", desc: "Average account age 3.8 years" },
      { label: "Credit Mix", impact: "positive", desc: "Installment and revolving accounts present" },
      { label: "New Credit", impact: "negative", desc: "4 hard inquiries in last 12 months" },
    ],
    tradelines: [
      { name: "Chase Sapphire", type: "Credit Card", balance: 4800, limit: 6500, status: "Current", opened: "2020-03-01", impact: "negative" },
      { name: "Capital One", type: "Credit Card", balance: 2100, limit: 2500, status: "90 Days Late", opened: "2019-07-15", impact: "negative" },
      { name: "Wells Fargo Auto", type: "Auto Loan", balance: 12400, limit: 18000, status: "Current", opened: "2022-01-10", impact: "positive" },
      { name: "Federal Student Loan", type: "Student Loan", balance: 28000, limit: 35000, status: "Current", opened: "2016-09-01", impact: "positive" },
      { name: "Discover Card", type: "Credit Card", balance: 1950, limit: 3000, status: "30 Days Late", opened: "2018-05-20", impact: "negative" },
      { name: "Credit One Bank", type: "Credit Card", balance: 790, limit: 800, status: "Current", opened: "2021-03-12", impact: "negative" },
      { name: "Navient Student Loan", type: "Student Loan", balance: 8500, limit: 10000, status: "120 Days Late", opened: "2015-08-01", impact: "negative" },
    ],
    inquiries: [
      { creditor: "Chase Bank", date: "2024-11-14", type: "Hard" },
      { creditor: "LendingClub", date: "2024-08-22", type: "Hard" },
      { creditor: "Capital One", date: "2024-09-02", type: "Hard" },
      { creditor: "CreditKarma", date: "2025-02-01", type: "Soft" },
      { creditor: "NMAC Auto", date: "2024-07-05", type: "Hard" },
    ],
  },
};

const RECS = [
  { icon: "💳", title: "Reduce Credit Card Balances", desc: "Pay down revolving balances to below 30% utilization. High utilization is heavily hurting your score.", priority: "High" },
  { icon: "⚠️", title: "Dispute Late Payment Notations", desc: "Late payment items may be disputable if reporting is inaccurate or unverified. Use the Dispute button on each item.", priority: "High" },
  { icon: "✅", title: "Set Up Auto-Pay", desc: "Enroll all accounts in auto-pay to prevent future late payments — payment history is 35% of your FICO score.", priority: "High" },
  { icon: "🔍", title: "Limit New Credit Applications", desc: "Multiple recent hard inquiries are lowering your score. Avoid applying for new credit for 6–12 months.", priority: "Medium" },
  { icon: "📅", title: "Keep Old Accounts Open", desc: "Closing old accounts reduces average credit age. Keep unused accounts open with a zero balance.", priority: "Low" },
];

const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

// ── page ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [bureau, setBureau] = useState("Equifax");
  const [loaded, setLoaded] = useState(false);
  const [simPayOff, setSimPayOff] = useState(0);
  const [simDispute, setSimDispute] = useState(false);
  const [simScore, setSimScore] = useState<number | null>(null);
  const [showDispute, setShowDispute] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("Not My Account");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    supabase.from("clients").select("id, full_name").order("full_name")
      .then(({ data }) => setClients(data || []));
  }, []);

  const d = MOCK[bureau];
  const bc = BUREAU_COLORS[bureau];
  const negatives = d.tradelines.filter(t => t.impact === "negative" || t.status.includes("Late") || t.status === "120 Days Late");

  function calcSim() {
    let boost = Math.round(simPayOff * 0.04);
    if (simDispute) boost += 25;
    setSimScore(Math.min(850, d.score + boost));
  }

  function handleDispute() {
    setDisputeSuccess(true);
    setTimeout(() => { setShowDispute(null); setDisputeSuccess(false); setDisputeNotes(""); }, 1500);
  }

  function exportCSV() {
    const rows = [
      ["Account Name", "Type", "Balance", "Limit", "Status", "Opened", "Impact"],
      ...d.tradelines.map(t => [t.name, t.type, String(t.balance), String(t.limit), t.status, t.opened, t.impact]),
    ];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `credit_report_${bureau}.csv`; a.click();
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff", boxSizing: "border-box" };
  const card: React.CSSProperties = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20 };
  const TH: React.CSSProperties = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", background: "#f8fafc" };
  const TD: React.CSSProperties = { padding: "10px 14px", fontSize: 13, color: "#374151", borderTop: "1px solid #f1f5f9" };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Credit Analysis</h1>
          {loaded && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={exportCSV} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                ↓ Export CSV
              </button>
              <button onClick={() => window.print()} style={{ padding: "8px 16px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ↓ PDF Report
              </button>
            </div>
          )}
        </div>

        {/* Client selector */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Select Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={inp}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <button onClick={() => { if (clientId) { setLoaded(true); setSimScore(null); setSimPayOff(0); setSimDispute(false); } }}
              disabled={!clientId}
              style={{ padding: "10px 28px", background: !clientId ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: !clientId ? "not-allowed" : "pointer" }}>
              Load Credit Report
            </button>
          </div>
        </div>

        {!loaded ? (
          <div style={{ textAlign: "center", padding: 72, color: "#94a3b8", fontSize: 15 }}>
            Select a client above to load their 3-bureau credit analysis.
          </div>
        ) : (<>

          {/* 3-bureau score summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {(["Equifax", "Experian", "TransUnion"] as const).map(b => {
              const s = MOCK[b].score;
              const col = scoreColor(s);
              const active = bureau === b;
              return (
                <div key={b} onClick={() => setBureau(b)} style={{
                  ...card, cursor: "pointer", borderTop: `4px solid ${BUREAU_COLORS[b]}`,
                  outline: active ? `2px solid ${BUREAU_COLORS[b]}` : "none",
                  opacity: active ? 1 : 0.75, transition: "opacity 0.15s, outline 0.15s",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: BUREAU_COLORS[b], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{b}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: col, lineHeight: 1 }}>{s}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{scoreLabel(s)}</div>
                  <div style={{ fontSize: 11, color: "#10b981", marginTop: 6 }}>↑ +{s - MOCK[b].history[0]} pts since {MOCK[b].histLabels[0]}</div>
                </div>
              );
            })}
          </div>

          {/* Bureau tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 24 }}>
            {(["Equifax", "Experian", "TransUnion"] as const).map(b => (
              <button key={b} onClick={() => setBureau(b)} style={{
                padding: "10px 26px", background: "none", border: "none", cursor: "pointer", fontSize: 14,
                fontWeight: bureau === b ? 700 : 500, color: bureau === b ? bc : "#64748b",
                borderBottom: bureau === b ? `2px solid ${bc}` : "2px solid transparent", marginBottom: -2,
              }}>{b}</button>
            ))}
          </div>

          {/* Score gauge + factors + history row */}
          <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 1fr", gap: 16, marginBottom: 24 }}>

            {/* Gauge card */}
            <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ScoreGauge score={d.score} bureau={bureau} />
              <div style={{ padding: "4px 14px", borderRadius: 20, background: scoreColor(d.score) + "22", color: scoreColor(d.score), fontSize: 12, fontWeight: 700 }}>
                {scoreLabel(d.score)}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                {Math.round(((d.score - 300) / 550) * 100)}th percentile
              </div>
            </div>

            {/* Factors */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>Score Factors</div>
              {d.factors.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: f.impact === "positive" ? "#10b981" : f.impact === "negative" ? "#ef4444" : "#f59e0b" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{f.desc}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: f.impact === "positive" ? "#10b981" : f.impact === "negative" ? "#ef4444" : "#f59e0b", textTransform: "capitalize" }}>
                    {f.impact}
                  </span>
                </div>
              ))}
            </div>

            {/* Score history */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Score History (6 Months)</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                {d.histLabels.map((l, i) => <span key={i} style={{ fontSize: 10, color: "#94a3b8" }}>{l}</span>)}
              </div>
              <LineChart data={d.history} color={bc} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {d.history.map((v, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: i === d.history.length - 1 ? 700 : 400, color: i === d.history.length - 1 ? bc : "#94a3b8" }}>{v}</span>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "6px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#10b981", fontWeight: 700 }}>
                ↑ +{d.score - d.history[0]} pts over 6 months
              </div>
            </div>
          </div>

          {/* Tradelines table */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
              Tradelines — {bureau}
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#64748b" }}>({d.tradelines.length} accounts)</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Account Name", "Type", "Balance", "Credit Limit", "Utilization", "Status", "Opened", "Impact"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {d.tradelines.map((t, i) => {
                    const util = t.limit > 0 && t.type.includes("Card") ? Math.round((t.balance / t.limit) * 100) : null;
                    const sc = t.status === "Current" ? "#10b981" : t.status === "Closed" ? "#94a3b8" : "#ef4444";
                    const ic = t.impact === "positive" ? "#10b981" : t.impact === "negative" ? "#ef4444" : "#f59e0b";
                    return (
                      <tr key={i}>
                        <td style={{ ...TD, fontWeight: 600, color: "#1e293b" }}>{t.name}</td>
                        <td style={TD}>{t.type}</td>
                        <td style={TD}>${t.balance.toLocaleString()}</td>
                        <td style={TD}>{t.limit > 0 ? "$" + t.limit.toLocaleString() : "—"}</td>
                        <td style={TD}>
                          {util !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 56, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(util, 100)}%`, height: "100%", borderRadius: 3, background: util > 70 ? "#ef4444" : util > 30 ? "#f59e0b" : "#10b981" }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{util}%</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td style={TD}>
                          <span style={{ background: sc + "22", color: sc, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                        </td>
                        <td style={{ ...TD, whiteSpace: "nowrap" }}>{t.opened}</td>
                        <td style={TD}>
                          <span style={{ background: ic + "22", color: ic, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{t.impact}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Negative items + Recommendations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

            {/* Negative items */}
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
                Negative Items
                <span style={{ marginLeft: 8, background: "#fef2f2", color: "#ef4444", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{negatives.length}</span>
              </div>
              {negatives.length === 0 ? (
                <div style={{ color: "#10b981", fontSize: 13, fontWeight: 600, padding: "12px 0" }}>✅ No negative items found on {bureau}.</div>
              ) : negatives.map((t, i) => (
                <div key={i} style={{ padding: "12px 0", borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.type} · Opened {t.opened}</div>
                      <div style={{ marginTop: 5 }}>
                        <span style={{ background: "#fef2f2", color: "#ef4444", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                        <span style={{ marginLeft: 6, background: "#fff7ed", color: "#f59e0b", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{t.impact}</span>
                      </div>
                    </div>
                    <button onClick={() => { setShowDispute(t.name); setDisputeReason("Not My Account"); setDisputeNotes(""); }}
                      style={{ padding: "6px 12px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                      Dispute
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>Recommendations</div>
              {RECS.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i > 0 ? "1px solid #f1f5f9" : "none", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, lineHeight: 1, marginTop: 1 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{r.title}</span>
                      <span style={{ background: PRIORITY_COLOR[r.priority] + "22", color: PRIORITY_COLOR[r.priority], borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{r.priority}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiries */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
              Credit Inquiries — {bureau}
              <span style={{ marginLeft: 8, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                {d.inquiries.filter(i => i.type === "Hard").length} hard
              </span>
              <span style={{ marginLeft: 6, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                · {d.inquiries.filter(i => i.type === "Soft").length} soft
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Creditor", "Date", "Type", "Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {d.inquiries.map((inq, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, fontWeight: 600, color: "#1e293b" }}>{inq.creditor}</td>
                    <td style={TD}>{inq.date}</td>
                    <td style={TD}>
                      <span style={{ background: inq.type === "Hard" ? "#fef2f2" : "#f0fdf4", color: inq.type === "Hard" ? "#ef4444" : "#10b981", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{inq.type}</span>
                    </td>
                    <td style={TD}>
                      {inq.type === "Hard" && (
                        <button onClick={() => { setShowDispute(inq.creditor + " (inquiry)"); setDisputeReason("Inquiry Not Authorized"); setDisputeNotes(""); }}
                          style={{ padding: "4px 10px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          Dispute
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Score Simulator */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Score Simulator</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Estimate how actions could improve your {bureau} score of {d.score}.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 24, alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Pay Down Credit Cards: <strong style={{ color: "#1e3a5f" }}>${simPayOff.toLocaleString()}</strong>
                </label>
                <input type="range" min={0} max={10000} step={500} value={simPayOff}
                  onChange={e => { setSimPayOff(Number(e.target.value)); setSimScore(null); }}
                  style={{ width: "100%", accentColor: "#1e3a5f" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                  <span>$0</span><span>$5,000</span><span>$10,000</span>
                </div>
              </div>
              <div style={{ paddingBottom: 24 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                  <input type="checkbox" checked={simDispute} onChange={e => { setSimDispute(e.target.checked); setSimScore(null); }}
                    style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                  Remove all negative items (+~25 pts)
                </label>
              </div>
              <div>
                <button onClick={calcSim} style={{ padding: "10px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "block", marginBottom: 12 }}>
                  Simulate
                </button>
                {simScore !== null && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Estimated Score</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: scoreColor(simScore), lineHeight: 1 }}>{simScore}</div>
                    <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>↑ +{simScore - d.score} pts</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{scoreLabel(simScore)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </>)}
      </div>

      {/* Dispute modal */}
      {showDispute && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 480, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            {disputeSuccess ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>Dispute Added Successfully</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>The item has been added to your disputes queue.</div>
              </div>
            ) : (<>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#1e293b" }}>Add Dispute Item</h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px" }}>
                Creating a dispute for: <strong style={{ color: "#1e293b" }}>{showDispute}</strong>
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Dispute Reason</label>
                <select value={disputeReason} onChange={e => setDisputeReason(e.target.value)} style={{ ...inp }}>
                  <option>Not My Account</option>
                  <option>Account Paid in Full</option>
                  <option>Incorrect Balance</option>
                  <option>Incorrect Late Payment</option>
                  <option>Account Closed — Still Reporting</option>
                  <option>Incorrect Personal Information</option>
                  <option>Inquiry Not Authorized</option>
                  <option>Duplicate Account</option>
                  <option>Fraud / Identity Theft</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notes (optional)</label>
                <textarea rows={3} value={disputeNotes} onChange={e => setDisputeNotes(e.target.value)}
                  style={{ ...inp, resize: "vertical" }} placeholder="Add supporting details..." />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowDispute(null)} style={{ padding: "9px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151" }}>
                  Cancel
                </button>
                <button onClick={handleDispute} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Add to Disputes
                </button>
              </div>
            </>)}
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
