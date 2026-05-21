"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const LOCAL_KEY = "disputepilot.ai-metro-2-drafts";

const TEMPLATES = [
  "Metro 2 Compliance Dispute",
  "FCRA Reinvestigation Request",
  "Method of Verification",
  "Furnisher Direct Dispute",
];

type Draft = {
  id: string;
  template: string;
  client: string;
  account: string;
  bureau: string;
  reason: string;
  content: string;
  createdAt: string;
};

export default function Page() {
  const router = useRouter();
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [client, setClient] = useState("");
  const [account, setAccount] = useState("");
  const [bureau, setBureau] = useState("Experian");
  const [reason, setReason] = useState("");
  const [facts, setFacts] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");

  const canGenerate = useMemo(() => client.trim() && account.trim() && bureau.trim() && reason.trim(), [client, account, bureau, reason]);

  function generateDraft() {
    if (!canGenerate) {
      setStatus("Enter client, account, bureau, and reason before generating.");
      return;
    }

    const body = [
      `${template}`,
      "",
      `Client: ${client.trim()}`,
      `Recipient: ${bureau.trim()}`,
      `Account/Furnisher: ${account.trim()}`,
      `Dispute Reason: ${reason.trim()}`,
      "",
      `I am disputing the reporting of ${account.trim()} because ${reason.trim()}. The reporting must be complete, accurate, and verifiable across all applicable Metro 2 fields, including account status, payment history, balance, dates, ownership, and compliance condition codes.`,
      facts.trim() ? `\nSupporting facts:\n${facts.trim()}` : "",
      "",
      "Please conduct a reasonable reinvestigation, provide the method used to verify the information, and delete or correct any item that cannot be verified with competent documentation.",
      "",
      "Sincerely,",
      client.trim(),
    ].filter(Boolean).join("\n");

    setDraft(body);
    setStatus("Draft generated.");
  }

  async function copyDraft() {
    if (!draft) {
      setStatus("Generate a draft before copying.");
      return;
    }
    await navigator.clipboard.writeText(draft);
    setStatus("Draft copied to clipboard.");
  }

  function saveDraft() {
    if (!draft) {
      setStatus("Generate a draft before saving.");
      return;
    }

    const item: Draft = {
      id: `metro-${Date.now()}`,
      template,
      client,
      account,
      bureau,
      reason,
      content: draft,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(window.localStorage.getItem(LOCAL_KEY) || "[]");
      const rows = Array.isArray(existing) ? existing : [];
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify([item, ...rows]));
      setStatus(`Saved locally: ${template} for ${client.trim()}.`);
    } catch {
      setStatus("Draft is visible, but local save failed in this browser.");
    }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", background: "#fff" };
  const card: React.CSSProperties = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 22 };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1120 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>AI / Metro 2 Letters</h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Generate AI-powered and Metro 2 compliant dispute letters.</p>
        </div>

        {status && (
          <div role="status" aria-live="polite" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
            {status}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: 20, alignItems: "start" }}>
          <section style={card} aria-label="Metro 2 draft inputs">
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label htmlFor="letter-template" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Letter Type / Template</label>
                <select id="letter-template" value={template} onChange={e => setTemplate(e.target.value)} style={inp}>
                  {TEMPLATES.map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="client-name" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Client Name</label>
                <input id="client-name" value={client} onChange={e => setClient(e.target.value)} style={inp} />
              </div>
              <div>
                <label htmlFor="account-name" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Account / Furnisher</label>
                <input id="account-name" value={account} onChange={e => setAccount(e.target.value)} style={inp} />
              </div>
              <div>
                <label htmlFor="bureau-name" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Bureau / Recipient</label>
                <select id="bureau-name" value={bureau} onChange={e => setBureau(e.target.value)} style={inp}>
                  {["Equifax", "Experian", "TransUnion", "Furnisher"].map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reason" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Dispute Reason</label>
                <input id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Incorrect balance, not mine, duplicate account..." style={inp} />
              </div>
              <div>
                <label htmlFor="facts" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Facts / Evidence</label>
                <textarea id="facts" value={facts} onChange={e => setFacts(e.target.value)} style={{ ...inp, minHeight: 120, resize: "vertical" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button onClick={generateDraft} style={{ padding: "9px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, cursor: "pointer" }}>Generate Draft</button>
              <button onClick={copyDraft} style={{ padding: "9px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, fontWeight: 700, cursor: "pointer", color: "#334155" }}>Copy Draft</button>
              <button onClick={saveDraft} style={{ padding: "9px 16px", background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 7, fontWeight: 700, cursor: "pointer", color: "#166534" }}>Save/Queue Locally</button>
              <button onClick={()=>router.push("/letters/ai-rewriter")} style={{ padding: "9px 16px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 7, fontWeight: 700, cursor: "pointer", color: "#334155" }}>Open AI Rewriter</button>
            </div>
          </section>

          <section style={card} aria-label="Generated draft preview">
            <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>Generated Draft</h2>
            {draft ? (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, minHeight: 420, fontSize: 14, lineHeight: 1.6, color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
                {draft}
              </pre>
            ) : (
              <div style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}>
                Your generated draft will appear here.
              </div>
            )}
          </section>
        </div>
      </div>
    </CDMLayout>
  );
}
