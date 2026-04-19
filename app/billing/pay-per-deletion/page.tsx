"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const ITEMS = [
  { label: "Late Payment", price: 25 },
  { label: "Collection Account", price: 50 },
  { label: "Charge-off", price: 75 },
  { label: "Bankruptcy", price: 150 },
  { label: "Repossession", price: 100 },
  { label: "Judgment", price: 125 },
  { label: "Tax Lien", price: 100 },
  { label: "Inquiry", price: 10 },
  { label: "Student Loan Default", price: 75 },
  { label: "Medical Debt", price: 50 },
];

export default function Page() {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  function toggle(label: string) {
    setSelected(prev => {
      const next = { ...prev };
      if (next[label]) delete next[label];
      else next[label] = 1;
      return next;
    });
  }

  function setQty(label: string, qty: number) {
    if (qty < 1) return;
    setSelected(prev => ({ ...prev, [label]: qty }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setHtmlFile(f);
    if (f) {
      setParsing(true);
      setTimeout(() => { setParsing(false); setParsed(true); }, 1200);
    }
  }

  const estimate = Object.entries(selected).reduce((sum, [label, qty]) => {
    const item = ITEMS.find(i => i.label === label);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Pay Per Deletion</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Select deleted items to calculate client billing based on successful removals.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>Upload Credit Report (HTML)</h2>
              <div style={{ border: "2px dashed #e2e8f0", borderRadius: 8, padding: 24, textAlign: "center", marginBottom: 12 }}>
                <input type="file" accept=".html,.htm" onChange={handleFile} id="html-upload" style={{ display: "none" }} />
                <label htmlFor="html-upload" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    {htmlFile ? htmlFile.name : "Click to upload HTML credit report"}
                  </div>
                  <span style={{ fontSize: 12, background: "#1e3a5f", color: "#fff", padding: "6px 16px", borderRadius: 6, fontWeight: 600 }}>
                    {parsing ? "Parsing…" : parsed ? "Re-upload" : "Browse File"}
                  </span>
                </label>
              </div>
              {parsed && (
                <div style={{ background: "#dcfce7", borderRadius: 7, padding: "10px 14px", fontSize: 13, color: "#166534", fontWeight: 600 }}>
                  Report parsed — items detected below. Review and confirm selections.
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Select Deleted Items</h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["", "Item Type", "Price Each", "Qty", "Subtotal"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.map(item => {
                    const checked = !!selected[item.label];
                    const qty = selected[item.label] || 1;
                    return (
                      <tr key={item.label} style={{ borderTop: "1px solid #f1f5f9", background: checked ? "#eff6ff" : "#fff" }}>
                        <td style={{ padding: "10px 16px" }}>
                          <input type="checkbox" checked={checked} onChange={() => toggle(item.label)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{item.label}</td>
                        <td style={{ padding: "10px 16px", fontSize: 14, color: "#64748b" }}>${item.price}</td>
                        <td style={{ padding: "10px 16px" }}>
                          {checked ? (
                            <input
                              type="number"
                              value={qty}
                              min={1}
                              onChange={e => setQty(item.label, parseInt(e.target.value) || 1)}
                              style={{ width: 60, padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 14 }}
                            />
                          ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: checked ? 700 : 400, color: checked ? "#10b981" : "#cbd5e1" }}>
                          {checked ? `$${(item.price * qty).toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 24, position: "sticky", top: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 20px", color: "#1e293b" }}>Estimate Summary</h2>
            {Object.keys(selected).length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No items selected yet.</p>
            ) : (
              Object.entries(selected).map(([label, qty]) => {
                const item = ITEMS.find(i => i.label === label);
                if (!item) return null;
                return (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc", fontSize: 14 }}>
                    <span style={{ color: "#475569" }}>{label} x{qty}</span>
                    <span style={{ fontWeight: 600 }}>${(item.price * qty).toFixed(2)}</span>
                  </div>
                );
              })
            )}
            <div style={{ borderTop: "2px solid #e2e8f0", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>${estimate.toFixed(2)}</span>
            </div>
            <button
              disabled={estimate === 0}
              style={{ width: "100%", marginTop: 20, padding: "11px", background: estimate === 0 ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: estimate === 0 ? "not-allowed" : "pointer" }}
            >
              Generate Invoice
            </button>
            <button
              style={{ width: "100%", marginTop: 10, padding: "10px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              onClick={() => setSelected({})}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
