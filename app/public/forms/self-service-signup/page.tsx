"use client";

import { FormEvent, useEffect, useState } from "react";

const SETTINGS_KEY = "dp_self_service_signup_wizard";
const SUBMISSIONS_KEY = "dp_self_service_signup_submissions";

export default function SelfServiceSignupPublicPage() {
  const [settings, setSettings] = useState<any>({});
  const [form, setForm] = useState({ name: "", email: "", plan: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      setSettings(parsed);
      setForm((f) => ({ ...f, plan: parsed.plan || "Starter" }));
    } catch {
      setStatus("Local self-service signup settings could not be loaded.");
    }
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus("Enter name and email before saving this local self-service signup.");
      return;
    }
    const record = { ...form, companyName: settings.companyName || "Local company", createdAt: new Date().toISOString() };
    const current = JSON.parse(window.localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([record, ...current]));
    setStatus("Self-service signup saved locally. Stripe, portal hosting, email, and e-signature delivery are not connected.");
    setForm({ name: "", email: "", plan: settings.plan || "Starter" });
  }

  return (
    <main style={{ minHeight: "100vh", background: settings.bgColor || "#1e3a5f", padding: 24 }}>
      <section style={{ maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 10, padding: 28 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, color: "#0f172a" }}>{settings.companyName || "Self-Service Signup"}</h1>
        <p style={{ margin: "0 0 18px", color: "#64748b", lineHeight: 1.6 }}>Local signup intake hydrated from the saved self-service wizard in this browser.</p>
        <p style={{ margin: "0 0 20px", color: "#475569", fontWeight: 700 }}>Contact: {settings.contactEmail || "Not configured"} / Plan: {settings.plan || "Starter"}</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <label style={label}>Name<input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={input} /></label>
          <label style={label}>Email<input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={input} /></label>
          <label style={label}>Plan<select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))} style={input}><option>Starter</option><option>Professional</option><option>Agency</option></select></label>
          <button type="submit" style={{ padding: "11px 18px", background: settings.bgColor || "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 800 }}>Save Local Signup</button>
        </form>
        {status && <p role="status" style={{ margin: "16px 0 0", color: status.startsWith("Enter") ? "#b45309" : "#166534", fontWeight: 700 }}>{status}</p>}
      </section>
    </main>
  );
}

const label = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "#334155" };
const input = { width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: 7, padding: "10px 12px", fontSize: 14 };
