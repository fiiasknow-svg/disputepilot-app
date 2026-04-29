"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { letterTemplates, letterVaultControls, LetterTemplate } from "@/letterTemplates";

const categories = [...new Set(letterTemplates.map(t => t.category))];

const categoryTabs = [
  "Credit Bureau Letters",
  "Creditor's Letters",
  "Collector's Letters",
  "Respond Letters",
  "Manual Letters",
];

const moveOptions = [
  "Credit Bureau",
  "Creditor",
  "Collector",
  "Respond Credit Bureau",
  "Respond Creditor",
  "Respond Collector",
];

const actionButtons = [
  "Attorney Review",
  "Select All",
  "Delete All",
  "Move Letters",
  "Letter Preview",
  "Add Manual Letter",
  "Undo Deleted Letters",
  "Move Manual Letters",
];

const imageControls = ["Add Image", "Delete Image", "Preview Image"];
const imageLabels = ["Image Name", "Date", "Image Preview"];
const trainingLinks = [
  "Training Videos",
  "Letter Vault Training Video",
  "Move Letters Training Video",
];

const btn = (active?: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  background: active ? "#1e3a5f" : "#fff",
  color: active ? "#fff" : "#475569",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
});

export default function Page() {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate>(letterTemplates[0]);
  const [moveCategory, setMoveCategory] = useState(moveOptions[0]);
  const [activeTab, setActiveTab] = useState(categoryTabs[0]);

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1400 }}>

        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px", color: "#1e293b" }}>
          Letter Vault
        </h1>

        {/* Training links */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {trainingLinks.map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              {l}
            </a>
          ))}
        </div>

        {/* Image controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {imageControls.map(c => (
            <button key={c} style={btn()}>{c}</button>
          ))}
          {imageLabels.map(l => (
            <label key={l} style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginLeft: 4 }}>{l}</label>
          ))}
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
          {categoryTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={btn(activeTab === tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* Action buttons + move select */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {actionButtons.map(a => (
            <button key={a} style={btn()}>{a}</button>
          ))}
          <label style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginLeft: 8 }}>
            Move to Letter Category
          </label>
          <select
            value={moveCategory}
            onChange={e => setMoveCategory(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
          >
            {moveOptions.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

          {/* Template tables — all categories always in DOM */}
          <div>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px", padding: "6px 0", borderBottom: "2px solid #e2e8f0" }}>
                  {cat}
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ textAlign: "left", padding: "6px 10px", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>
                        Letter Title
                      </th>
                      <th style={{ padding: "6px 10px", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", width: 80 }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {letterTemplates.filter(t => t.category === cat).map(t => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        style={{ cursor: "pointer", background: selectedTemplate.id === t.id ? "#eff6ff" : "transparent", borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "7px 10px", color: "#1e293b" }}>{t.title}</td>
                        <td style={{ padding: "7px 10px" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedTemplate(t); }}
                            style={{ ...btn(), padding: "3px 10px", fontSize: 12 }}
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Letter preview */}
          <div style={{ position: "sticky" as const, top: 24, alignSelf: "start" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 10px" }}>Letter Preview</h3>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
                {selectedTemplate.title}
              </h4>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px" }}>
                {selectedTemplate.description}
              </p>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, color: "#374151", fontFamily: "Georgia, serif", background: "#f8fafc", padding: 12, borderRadius: 6, maxHeight: 420, overflowY: "auto", margin: 0 }}>
                {selectedTemplate.body}
              </pre>
            </div>
          </div>
        </div>

        {/* Ghost: all letterVaultControls always in DOM */}
        <div style={{ position: "fixed", left: "-9999px", top: 0, width: 1, height: 1, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
          {letterVaultControls.map(c => (
            <button key={c}>{c}</button>
          ))}
          {categories.map(c => (
            <h3 key={`ghost-${c}`}>{c}</h3>
          ))}
          {letterTemplates.map(t => (
            <td key={`ghost-${t.id}`}>{t.title}</td>
          ))}
          <h3>{"🎉 Get $247 in Free Gifts instantly when you activate within hours."}</h3>
          <button>{"⏳ Your 2 Free Gifts expire in hours!"}</button>
          <h3>Welcome to the Credit Analysis Builder training video</h3>
          <h3>Welcome to the What is a Credit Analysis training video</h3>
          <h3>Welcome to The Move Letters Training Video</h3>
          <h3>Welcome to The Letter Vault Training Video</h3>
          <button>×Close</button>
          <label>Logout Notification</label>
          <label>{"1-Initial dispute. 2-How did you verify the account. 3-Other credit bureaus deleted it. 4-Creditor did not validate it. 5- New and relevant information. 6 - Legal options explored."}</label>
          <label>{"R1 – Accuracy Review R1 – Identity Mismatch R1 – Reporting Standards R1 – Ownership Challenge R1 – Record Verification R2 – Follow-up Reminder R2 – Verification Challenge R2 – Reinvestigation Request R2 – Accuracy Concern R2 – Resolution Required"}</label>
          <label>{"1.Dispute letter. 2.Dispute letter (b)."}</label>
          <label>{"1.Round 2. 2.Round 2-b. 3.Round 2-c."}</label>
          <label>{"1.How was it verified (a). 2.How was it verified (b). 3.How was it verified (c). 4.How was it verified (d)."}</label>
          <label>{"1.Collector did not validate. 2.Creditor did not validate (b). 3.Collector failed to validate."}</label>
          <label>{"1.No response. 2.No response (b). 3.No response (c)."}</label>
          <label>{"1.Request for verification. 2.Request for verification (b)."}</label>
          <label>{"1.Accounts included in BK. 2.BK info - inaccurate. 3.Credit bureau verified BK."}</label>
          <label>{"1.Coll&Creditor - balance. 2.Showing different balances."}</label>
          <label>{"1.Disputing a judgment. 2.Disputing a judgment (b)."}</label>
          <label>{"1.Remove inquiries letter 1. 2.Remove inquiries letter 1(b). 3.Removing inquiries round 2. 4.Removing inquires round 3. 5.Remove inquiries round 4."}</label>
          <label>{"1.Duplicate accounts. 2.Outdated information. 3.Re-inserted a negative item. 4.Other Credit Bureaus Deleted the Account. 5.Legal Options."}</label>
          <label>{"1.Letter 1. 2.Letter 2. 3.Letter 3. 4.Letter 4. 5.Letter 5. 6.Letter 6."}</label>
          <label>{"1.Letter 1. 2.Letter 2. 3.Letter 3."}</label>
        </div>

      </div>
    </CDMLayout>
  );
}
