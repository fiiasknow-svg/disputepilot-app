"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const LETTER_TYPES = [
  "Standard Dispute Letter", "Method of Verification (MOV)", "Collections Dispute",
  "Medical Debt Dispute", "Late Payment Dispute", "Identity Theft / Fraud",
  "Inquiry Removal Request", "Pay-for-Delete Letter", "Goodwill Adjustment Letter",
  "Debt Validation Letter", "Cease & Desist Letter", "FCRA Violation Notice",
  "Escalation Letter", "Creditor Direct Dispute",
];

const TONES = [
  { value: "firm and professional", label: "Firm & Professional" },
  { value: "assertive and legal", label: "Assertive & Legal" },
  { value: "polite but urgent", label: "Polite but Urgent" },
  { value: "aggressive and demanding", label: "Aggressive & Demanding" },
];

const FOCUSES = [
  { value: "FCRA violations and consumer rights", label: "FCRA Violations" },
  { value: "inaccurate information and verification failure", label: "Inaccurate Information" },
  { value: "debt validation and legal standing", label: "Debt Validation" },
  { value: "identity theft and fraud protection", label: "Identity Theft / Fraud" },
  { value: "goodwill and relationship-based resolution", label: "Goodwill Adjustment" },
];

const SAMPLE_LETTERS: Record<string, string> = {
  "Standard Dispute Letter": `I am writing to dispute the following information in my credit file. The item listed below is inaccurate and should be removed from my credit report immediately.

Account Name: XYZ Collections
Account Number: XXXX-1234
Reason: This account does not belong to me. I have no knowledge of this debt.

Please investigate this matter and remove this inaccurate information from my credit file within 30 days as required by the Fair Credit Reporting Act.`,

  "Late Payment Dispute": `I am disputing a late payment notation on my credit report. The late payment reported for account ending in 4567 in March 2023 is inaccurate. I have always paid this account on time and have bank statements to prove it.

Please investigate this error and correct my credit report accordingly. Failure to correct accurate information is a violation of the Fair Credit Reporting Act.`,

  "Collections Dispute": `I am disputing a collection account appearing on my credit report. This collection for $850 from ABC Collectors does not belong to me and I have no knowledge of the underlying debt.

Under 15 U.S.C. § 1681i, I request that you investigate this item and provide verification or remove it from my credit file immediately.`,
};

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 };

export default function Page() {
  const [letterType, setLetterType] = useState(LETTER_TYPES[0]);
  const [tone, setTone] = useState(TONES[0].value);
  const [focus, setFocus] = useState(FOCUSES[0].value);
  const [original, setOriginal] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  function loadSample() {
    const sample = SAMPLE_LETTERS[letterType] || SAMPLE_LETTERS["Standard Dispute Letter"];
    setOriginal(sample);
    setCharCount(sample.length);
  }

  function clearAll() {
    setOriginal("");
    setRewritten("");
    setError("");
    setCharCount(0);
  }

  async function rewrite() {
    if (!original.trim()) { setError("Please paste or type a letter to rewrite."); return; }
    setLoading(true);
    setError("");
    setRewritten("");
    try {
      const res = await fetch("/api/rewrite-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter: original, tone, focus, letterType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRewritten(data.rewritten);
    } catch (e: any) {
      setError(e.message || "Failed to rewrite. Please try again.");
    }
    setLoading(false);
  }

  function copy() {
    if (!rewritten) return;
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function swapToOriginal() {
    if (!rewritten) return;
    setOriginal(rewritten);
    setCharCount(rewritten.length);
    setRewritten("");
  }

  const improvements = rewritten ? [
    "Legal citations (FCRA/FDCPA) added",
    "Clear 30-day response deadline set",
    "Tone calibrated to selected style",
    "Professional structure applied",
    "Consumer rights explicitly stated",
  ] : [];

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>AI Letter Rewriter</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Paste any dispute letter and AI will rewrite it to be more effective, legally precise, and professional.</p>
        </div>

        {/* Settings Row */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <div>
              <label style={lbl}>Letter Type</label>
              <select value={letterType} onChange={e => setLetterType(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {LETTER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Focus / Strategy</label>
              <select value={focus} onChange={e => setFocus(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {FOCUSES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left — Original */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ background: "#1e293b", borderRadius: "10px 10px 0 0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Original Letter</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={loadSample} style={{ fontSize: 12, padding: "4px 10px", background: "#334155", color: "#94a3b8", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Load Sample</button>
                <button onClick={clearAll} style={{ fontSize: 12, padding: "4px 10px", background: "#334155", color: "#94a3b8", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Clear</button>
              </div>
            </div>
            <textarea
              value={original}
              onChange={e => { setOriginal(e.target.value); setCharCount(e.target.value.length); }}
              placeholder="Paste your existing dispute letter here, or click 'Load Sample' to try an example…"
              style={{ flex: 1, minHeight: 360, padding: 16, border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#374151" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{charCount} characters · ~{Math.max(1, Math.round(charCount / 250))} page{Math.round(charCount / 250) !== 1 ? "s" : ""}</span>
              <button onClick={rewrite} disabled={loading || !original.trim()}
                style={{ padding: "10px 28px", background: loading ? "#94a3b8" : original.trim() ? "#1e3a5f" : "#cbd5e1", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: loading || !original.trim() ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
                {loading ? "✦ Rewriting…" : "✦ Rewrite with AI →"}
              </button>
            </div>
          </div>

          {/* Right — Rewritten */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ background: rewritten ? "#10b981" : "#64748b", borderRadius: "10px 10px 0 0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {loading ? "✦ AI is rewriting…" : rewritten ? "✦ Rewritten Letter (AI)" : "Rewritten Letter"}
              </span>
              {rewritten && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={swapToOriginal} style={{ fontSize: 12, padding: "4px 10px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Use as Original</button>
                  <button onClick={copy} style={{ fontSize: 12, padding: "4px 10px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>{copied ? "✓ Copied!" : "Copy"}</button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 360, padding: 16, border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", fontSize: 13, lineHeight: 1.7, background: loading ? "#f8fafc" : "#fff", overflow: "auto", position: "relative" }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: "#94a3b8" }}>
                  <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>✦</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>AI is analyzing and rewriting your letter…</div>
                  <div style={{ fontSize: 12 }}>This takes about 5–10 seconds</div>
                </div>
              ) : rewritten ? (
                <div style={{ color: "#374151", whiteSpace: "pre-wrap" }}>{rewritten}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", textAlign: "center", gap: 8 }}>
                  <div style={{ fontSize: 36 }}>✦</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Your rewritten letter will appear here</div>
                  <div style={{ fontSize: 12 }}>Paste a letter on the left and click "Rewrite with AI"</div>
                </div>
              )}
            </div>
            {rewritten && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>✦ AI Improvements Applied:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {improvements.map(i => <span key={i} style={{ background: "#f0fdf4", color: "#166534", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>✓ {i}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 16, background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#dc2626" }}>
            ⚠ {error}
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: 24, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>💡 Tips for best results</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              ["Include account details", "Add the account name, number, and bureau in your original for more specific output."],
              ["Use multiple rewrites", "Try different tones and focuses to find the most effective version for each situation."],
              ["Layer your strategy", "Start with 'Firm & Professional', escalate to 'Aggressive & Demanding' if the first round fails."],
            ].map(([title, tip]) => (
              <div key={title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#3b82f6" }}>{tip}</div>
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </CDMLayout>
  );
}
