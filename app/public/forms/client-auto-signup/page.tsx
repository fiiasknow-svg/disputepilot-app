"use client";

import { FormEvent, useEffect, useState } from "react";

const SETTINGS_KEY = "dp_client_auto_signup_settings";
const SUBMISSIONS_KEY = "dp_client_auto_signup_submissions";

export default function ClientAutoSignupPublicPage() {
  const [settings, setSettings] = useState<{ contract?: string; enabled?: boolean; requirePhone?: boolean; requireAddress?: boolean; allowSelf?: boolean } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", plan: "Starter" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_KEY);
      setSettings(saved ? JSON.parse(saved) : {});
    } catch {
      setStatus("Local signup settings could not be loaded. You can still save an intake record locally.");
      setSettings({});
    }
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus("Enter name and email before saving this local signup intake.");
      return;
    }
    if (settings?.requirePhone && !form.phone.trim()) {
      setStatus("Phone is required by the local auto signup settings.");
      return;
    }
    if (settings?.requireAddress && !form.address.trim()) {
      setStatus("Address is required by the local auto signup settings.");
      return;
    }
    const record = { ...form, contract: settings?.contract || "No contract selected", createdAt: new Date().toISOString() };
    const current = JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([record, ...current]));
    setStatus("Signup intake saved locally. No hosted portal account, billing charge, email, or e-signature was created.");
    setForm({ name: "", email: "", phone: "", address: "", plan: "Starter" });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: 24 }}>
      <section style={{ maxWidth: 680, margin: "0 auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, color: "#0f172a" }}>Client Auto Signup</h1>
        <p style={{ margin: "0 0 20px", color: "#64748b", lineHeight: 1.6 }}>Local public intake for this browser. Settings hydrate from Company &gt; Client Auto Signup when saved locally.</p>
        <p style={{ margin: "0 0 20px", color: "#475569", fontWeight: 700 }}>Contract: {settings?.contract || "No contract selected"} / Status: {settings?.enabled ? "enabled locally" : "not enabled locally"}</p>

        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <label style={label}>Name<input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={input} /></label>
          <label style={label}>Email<input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={input} /></label>
          <label style={label}>Phone{settings?.requirePhone ? " (required)" : ""}<input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={input} /></label>
          <label style={label}>Address{settings?.requireAddress ? " (required)" : ""}<input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={input} /></label>
          {settings?.allowSelf !== false && (
            <label style={label}>Plan<select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))} style={input}><option>Starter</option><option>Professional</option><option>Agency</option></select></label>
          )}
          <button type="submit" style={{ padding: "11px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 800 }}>Save Local Intake</button>
        </form>
        {status && <p role="status" style={{ margin: "16px 0 0", color: status.startsWith("Enter") || status.includes("required") ? "#b45309" : "#166534", fontWeight: 700 }}>{status}</p>}
      </section>
    </main>
  );
}

const label = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "#334155" };
const input = { width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 12px", fontSize: 14 };
