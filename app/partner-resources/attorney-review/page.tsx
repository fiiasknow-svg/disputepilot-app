"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

export default function Page() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [request, setRequest] = useState({ clientName: "", issueType: "FCRA verification", urgency: "Standard", notes: "" });
  function saveRequest() {
    if (!request.clientName.trim()) {
      setStatus("Enter a client name before saving the attorney review request.");
      return;
    }
    const existing = JSON.parse(window.localStorage.getItem("disputepilot.attorneyReviewRequests") || "[]");
    window.localStorage.setItem("disputepilot.attorneyReviewRequests", JSON.stringify([{ ...request, savedAt: new Date().toISOString() }, ...existing]));
    setStatus("Local attorney review request saved. Backend scheduling is not connected.");
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 960 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 18 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Attorney Review</h1>
          <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.6 }}>
            Use Attorney Review when a client file needs legal review before escalation, settlement discussion, or a more formal consumer-rights response. This page keeps the sidebar destination dedicated and visible while backend intake or attorney scheduling is not connected.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>When to Use It</h2>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              Request review for repeated verification failures, possible FDCPA/FCRA violations, escalated client complaints, or files where an attorney should evaluate next steps.
            </p>
          </section>
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>What to Prepare</h2>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              Collect credit reports, dispute letters, bureau responses, collector correspondence, client notes, and a short timeline of what happened.
            </p>
          </section>
        </div>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "16px 18px", marginBottom: 18 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#1e40af" }}>Local attorney request</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
            Attorney intake is not wired to a backend in this app yet. Save a local request with the file context until scheduling is connected.
          </p>
        </div>

        {status && <p role="status" style={{ margin: "0 0 14px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontWeight: 700 }}>{status}</p>}
        <button type="button" onClick={() => { setOpen(true); setStatus(""); }} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", cursor: "pointer", fontWeight: 700, marginRight: 10 }}>
          Request Attorney Review
        </button>
        <button type="button" onClick={() => router.push("/partner-resources")} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
          Back to Partner Resources
        </button>
      </div>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <section role="dialog" aria-modal="true" aria-labelledby="attorney-request-title" style={{ background: "#fff", borderRadius: 10, padding: 24, width: 520, maxWidth: "100%", boxShadow: "0 12px 40px rgba(15,23,42,0.22)" }}>
            <h2 id="attorney-request-title" style={{ fontSize: 20, fontWeight: 800, margin: "0 0 14px", color: "#1e293b" }}>Request Attorney Review</h2>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Client Name</label>
            <input aria-label="Client Name" value={request.clientName} onChange={(event) => setRequest((current) => ({ ...current, clientName: event.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 7, marginBottom: 10 }} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Issue Type</label>
            <select aria-label="Issue Type" value={request.issueType} onChange={(event) => setRequest((current) => ({ ...current, issueType: event.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 7, marginBottom: 10, background: "#fff" }}>
              <option>FCRA verification</option>
              <option>FDCPA collector conduct</option>
              <option>Escalated client complaint</option>
              <option>Settlement review</option>
            </select>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Urgency</label>
            <select aria-label="Urgency" value={request.urgency} onChange={(event) => setRequest((current) => ({ ...current, urgency: event.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 7, marginBottom: 10, background: "#fff" }}>
              <option>Standard</option>
              <option>Urgent</option>
              <option>Deadline pending</option>
            </select>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Notes</label>
            <textarea aria-label="Notes" value={request.notes} onChange={(event) => setRequest((current) => ({ ...current, notes: event.target.value }))} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 7, resize: "vertical", marginBottom: 12 }} />
            {status && <p role="status" style={{ margin: "0 0 14px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "9px 12px", fontSize: 13, fontWeight: 700 }}>{status}</p>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setOpen(false)} style={{ padding: "9px 16px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 7, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={saveRequest} style={{ padding: "9px 16px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 800, cursor: "pointer" }}>Save Request</button>
            </div>
          </section>
        </div>
      )}
    </CDMLayout>
  );
}
