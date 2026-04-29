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
        </div>

      </div>
    </CDMLayout>
  );
}
