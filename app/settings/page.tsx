"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [notifs, setNotifs] = useState({ email_alerts: false, sms_alerts: false, dispute_updates: false });
  const [saved, setSaved] = useState(false);
  const inp = { border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", width: "100%", boxSizing: "border-box" as any };
  const lbl = { fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" };
  const box = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "20px" };

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Settings</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px", maxWidth: "600px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Settings</h2>
        <div style={box}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>Profile</h3>
          <div style={{ display: "grid", gap: "14px" }}>
            <div><label style={lbl}>Name</label><input style={inp} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={lbl}>Email</label><input style={inp} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label style={lbl}>Phone</label><input style={inp} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
        </div>
        <div style={box}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>Notifications</h3>
          {([["email_alerts","Email Alerts"],["sms_alerts","SMS Alerts"],["dispute_updates","Dispute Updates"]] as [string,string][]).map(([k,label]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", marginBottom: "12px" }}>
              <input type="checkbox" checked={notifs[k as keyof typeof notifs]} onChange={() => setNotifs(n => ({ ...n, [k]: !n[k as keyof typeof notifs] }))} style={{ width: "16px", height: "16px" }} />
              {label}
            </label>
          ))}
        </div>
        <button onClick={save} style={{ padding: "8px 24px", border: "none", borderRadius: "6px", background: saved ? "#16a34a" : "#2563eb", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </CDMLayout>
  );
}
