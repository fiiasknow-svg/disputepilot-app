"use client";

import { useState } from "react";

export default function CreditAnalyzerPage() {
  const [scores, setScores] = useState({ equifax: "", experian: "", transunion: "" });
  const [results, setResults] = useState<any>(null);

  const analyze = () => {
    setResults({
      items: [
        { type: "Late Payment", account: "Credit Card #1234", severity: "High" },
        { type: "Collection", account: "Medical Debt", severity: "Medium" }
      ]
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Credit Analyzer</h1>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        {["equifax", "experian", "transunion"].map((bureau) => (
          <div key={bureau}>
            <label style={{ display: "block", textTransform: "capitalize" }}>{bureau}:</label>
            <input
              type="number"
              value={scores[bureau as keyof typeof scores]}
              onChange={(e) => setScores({ ...scores, [bureau]: e.target.value })}
              placeholder="600"
              style={{ padding: 10, width: 100 }}
            />
          </div>
        ))}
      </div>
      <button onClick={analyze} style={{ padding: "15px 30px", background: "#0070f3", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
        Run AI Analysis
      </button>
      {results && (
        <div style={{ marginTop: 30, padding: 20, background: "#f5f5f5", borderRadius: 10 }}>
          <h2>Disputable Items:</h2>
          {results.items.map((item: any, i: number) => (
            <div key={i} style={{ padding: 10, margin: "10px 0", background: "white", borderRadius: 5 }}>
              <strong>{item.type}</strong> - {item.account}
              <span style={{ marginLeft: 10, padding: "2px 8px", background: item.severity === "High" ? "#dc3545" : "#ffc107", color: "white", borderRadius: 3, fontSize: 12 }}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}