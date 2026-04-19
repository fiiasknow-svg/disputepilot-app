"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const PRIORITY_C: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export default function Page() {
  const [scores, setScores] = useState({ equifax: "", experian: "", transunion: "" });
  const [items, setItems] = useState([
    { name: "", type: "late_payment", balance: "", status: "", selected: false },
  ]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");

  useState(() => {
    supabase.from("clients").select("id, first_name, last_name").then(({ data }) => setClients(data || []));
  });

  function addItem() {
    setItems(i => [...i, { name: "", type: "late_payment", balance: "", status: "", selected: false }]);
  }

  function removeItem(idx: number) {
    setItems(i => i.filter((_, j) => j !== idx));
  }

  async function analyze() {
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, items }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
      setSelectedItems(data.analysis.filter((a: any) => a.disputable).map((a: any) => a.index));
    } catch (e: any) {
      setError("Analysis failed. Check your OpenAI API key in environment variables.");
    }
    setAnalyzing(false);
  }

  async function generateLetters() {
    if (!selectedClient || selectedItems.length === 0) return;
    setGenerating(true);
    const bureauGroups: Record<string, any[]> = {};
    selectedItems.forEach(idx => {
      const a = analysis.analysis[idx];
      (a.bureaus || ["equifax"]).forEach((bureau: string) => {
        if (!bureauGroups[bureau]) bureauGroups[bureau] = [];
        bureauGroups[bureau].push({ ...items[idx], ...a });
      });
    });
    for (const [bureau, disputed] of Object.entries(bureauGroups)) {
      await supabase.from("disputes").insert(disputed.map(d => ({
        client_id: selectedClient,
        account_name: d.name,
        bureau,
        reason: d.reason,
        status: "pending",
        round: 1,
      })));
    }
    setGenerating(false);
    alert(`Created ${selectedItems.length} disputes for ${Object.keys(bureauGroups).length} bureau(s)!`);
  }

  const inputStyle = { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>Credit Analysis / Analyzer</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Enter credit scores, add negative items, and run AI analysis to identify disputable items.</p>

        {/* Scores */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Credit Scores</h2>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Equifax", "equifax", "#e53e3e"], ["Experian", "experian", "#2b6cb0"], ["TransUnion", "transunion", "#276749"]].map(([label, key, color]) => (
              <div key={key} style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color, marginBottom: 6 }}>{label}</label>
                <input type="number" placeholder="e.g. 620" value={(scores as any)[key]}
                  onChange={e => setScores(s => ({ ...s, [key]: e.target.value }))}
                  style={{ ...inputStyle, width: "100%", fontSize: 20, fontWeight: 700, textAlign: "center", borderColor: color + "66" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Negative Items */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Negative Items</h2>
            <button onClick={addItem} style={{ fontSize: 13, padding: "5px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>+ Add Item</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr auto", gap: 8, marginBottom: 8 }}>
            {["Account / Creditor", "Type", "Balance", "Status", ""].map(h => (
              <div key={h} style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{h}</div>
            ))}
          </div>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={item.name} onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                placeholder="e.g. Capital One" style={{ ...inputStyle, width: "100%" }} />
              <select value={item.type} onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, type: e.target.value } : x))}
                style={{ ...inputStyle }}>
                {["late_payment", "collection", "charge_off", "inquiry", "public_record", "bankruptcy", "repossession"].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
              <input value={item.balance} onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, balance: e.target.value } : x))}
                placeholder="$0" style={{ ...inputStyle, width: "100%" }} />
              <input value={item.status} onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, status: e.target.value } : x))}
                placeholder="e.g. 30 days late" style={{ ...inputStyle, width: "100%" }} />
              <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>

        <button onClick={analyze} disabled={analyzing || items.every(i => !i.name)} style={{ background: analyzing ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 24 }}>
          {analyzing ? "⏳ Analyzing with AI…" : "🤖 Run AI Analysis"}
        </button>

        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>{error}</div>}

        {/* Analysis Results */}
        {analysis && (
          <div>
            {analysis.summary && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px", color: "#0369a1" }}>AI Summary</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#0c4a6e" }}>{analysis.summary}</p>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Disputable Items</h2>
                <span style={{ fontSize: 13, color: "#64748b" }}>{selectedItems.length} selected</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}><tr>
                  <th style={{ padding: "10px 16px", width: 40 }}><input type="checkbox" onChange={e => setSelectedItems(e.target.checked ? analysis.analysis.filter((a: any) => a.disputable).map((a: any) => a.index) : [])} /></th>
                  {["Account", "Type", "Dispute Reason", "Bureaus", "Priority", "Explanation"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#64748b" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {analysis.analysis.map((a: any) => {
                    const item = items[a.index];
                    if (!item || !a.disputable) return null;
                    return (
                      <tr key={a.index} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 16px" }}><input type="checkbox" checked={selectedItems.includes(a.index)} onChange={e => setSelectedItems(prev => e.target.checked ? [...prev, a.index] : prev.filter(i => i !== a.index))} /></td>
                        <td style={{ padding: "10px 16px", fontWeight: 600, fontSize: 14 }}>{item.name}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#475569" }}>{item.type.replace(/_/g, " ")}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13 }}>{a.reason}</td>
                        <td style={{ padding: "10px 16px" }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{(a.bureaus || []).map((b: string) => <span key={b} style={{ fontSize: 11, background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", textTransform: "capitalize" }}>{b}</span>)}</div></td>
                        <td style={{ padding: "10px 16px" }}><span style={{ background: (PRIORITY_C[a.priority] || "#94a3b8") + "22", color: PRIORITY_C[a.priority] || "#64748b", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{a.priority}</span></td>
                        <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b", maxWidth: 200 }}>{a.explanation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Generate Letters */}
            <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Generate Disputes</h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Select Client</label>
                  <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                    <option value="">Choose client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <button onClick={generateLetters} disabled={generating || !selectedClient || selectedItems.length === 0}
                  style={{ background: selectedClient && selectedItems.length > 0 ? "#1e3a5f" : "#94a3b8", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                  {generating ? "Creating…" : `✉ Create ${selectedItems.length} Dispute(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
