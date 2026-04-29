"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const STRATEGIES = [
  {
    title: "Choose Your Dispute System",
    desc: "Select the dispute method that best fits your client's credit profile and goals.",
    color: "#3b82f6",
    options: [
      { label: "Online Dispute Portal", detail: "Submit disputes directly through bureau websites — fastest for simple inaccuracies." },
      { label: "Certified Mail Dispute", detail: "Send written disputes via USPS certified mail for full legal documentation." },
    ],
  },
  {
    title: "Run Your Standard Dispute Form",
    desc: "Use your default dispute letter template targeting each negative item by type.",
    color: "#8b5cf6",
    options: [
      { label: "Round 1 Standard Letter", detail: "Initial dispute requesting verification of all negative accounts simultaneously." },
      { label: "Account-Specific Letter", detail: "Targeted letter for a single account with detailed dispute reason and law citations." },
    ],
  },
  {
    title: "Apply Multi Party Pressure",
    desc: "Contact both the credit bureau and the original creditor at the same time.",
    color: "#10b981",
    options: [
      { label: "Dual Bureau + Creditor", detail: "Simultaneously dispute with the bureau and send a direct validation letter to the furnisher." },
      { label: "CFPB Complaint", detail: "File a complaint with the Consumer Financial Protection Bureau to add regulatory pressure." },
    ],
  },
  {
    title: "Escalate the Dispute",
    desc: "Increase pressure with escalation letters when initial disputes are ignored or verified.",
    color: "#f59e0b",
    options: [
      { label: "Method of Verification Letter", detail: "Demand the bureau provide exact method and source used to verify the disputed item." },
      { label: "FTC Complaint + Demand Letter", detail: "File FTC complaint and send attorney-grade demand letter citing FCRA Section 611." },
    ],
  },
  {
    title: "Respond to Verification Attempts",
    desc: "Handle bureau responses that claim the item was verified as accurate.",
    color: "#ef4444",
    options: [
      { label: "Updated Dispute with Evidence", detail: "Resubmit the dispute with supporting documents: payment records, court docs, ID proof." },
      { label: "Frivolous Dispute Rebuttal", detail: "Counter a frivolous label with a detailed, law-based response citing FCRA 611(a)(3)." },
    ],
  },
  {
    title: "Prepare for Arbitration",
    desc: "When all dispute avenues are exhausted, prepare the client for legal action.",
    color: "#1e3a5f",
    options: [
      { label: "Pre-Litigation Demand", detail: "Send a final demand letter from an attorney threatening FCRA lawsuit within 30 days." },
      { label: "File in Small Claims Court", detail: "Guide the client through filing a pro se small claims case for FCRA statutory damages." },
    ],
  },
];

export default function Page() {
  const [selected, setSelected] = useState<Record<number, number | null>>({});

  function pick(cardIndex: number, optIndex: number) {
    setSelected(prev => ({ ...prev, [cardIndex]: prev[cardIndex] === optIndex ? null : optIndex }));
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1060 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Dispute Playbook</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Step-by-step strategies to resolve any credit dispute scenario.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {STRATEGIES.map((card, ci) => (
            <div key={ci} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", borderTop: `3px solid ${card.color}` }}>
              <div style={{ padding: "18px 20px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: card.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: card.color }}>{ci + 1}</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{card.title}</h2>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px", lineHeight: 1.55 }}>{card.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {card.options.map((opt, oi) => (
                    <button key={oi} onClick={() => pick(ci, oi)}
                      style={{ padding: "12px 14px", border: `2px solid ${selected[ci] === oi ? card.color : "#e2e8f0"}`, borderRadius: 8, cursor: "pointer", background: selected[ci] === oi ? card.color + "11" : "#f8fafc", textAlign: "left" as const }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: selected[ci] === oi ? card.color : "#1e293b", marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{opt.detail}</div>
                    </button>
                  ))}
                </div>
              </div>
              {selected[ci] !== null && selected[ci] !== undefined && (
                <div style={{ padding: "10px 20px", background: card.color + "11", borderTop: `1px solid ${card.color}33` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: card.color }}>Selected: {card.options[selected[ci]!].label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CDMLayout>
  );
}
