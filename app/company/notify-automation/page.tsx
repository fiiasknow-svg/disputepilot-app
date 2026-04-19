"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type NotifEvent = {
  id: string;
  category: string;
  event: string;
  description: string;
  email: boolean;
  sms: boolean;
  portal: boolean;
};

const DEFAULT_EVENTS: NotifEvent[] = [
  { id: "1", category: "Client", event: "New Client Added", description: "Notify when a new client is created in the system", email: true, sms: false, portal: true },
  { id: "2", category: "Client", event: "Client Status Changed", description: "Notify when a client's status is updated", email: true, sms: false, portal: true },
  { id: "3", category: "Dispute", event: "Dispute Round Started", description: "Notify when a new dispute round is initiated", email: true, sms: true, portal: true },
  { id: "4", category: "Dispute", event: "Bureau Response Received", description: "Notify when a bureau responds to a dispute", email: true, sms: true, portal: true },
  { id: "5", category: "Dispute", event: "Dispute Item Deleted", description: "Notify when a negative item is successfully removed", email: true, sms: true, portal: true },
  { id: "6", category: "Invoice", event: "Invoice Created", description: "Notify when a new invoice is generated", email: true, sms: false, portal: false },
  { id: "7", category: "Invoice", event: "Payment Received", description: "Notify when a client payment is processed", email: true, sms: false, portal: true },
  { id: "8", category: "Invoice", event: "Payment Past Due", description: "Remind client when an invoice is overdue", email: true, sms: true, portal: false },
  { id: "9", category: "Client Portal", event: "Client Logs In", description: "Notify when a client accesses their portal", email: false, sms: false, portal: false },
  { id: "10", category: "Client Portal", event: "Client Uploads Document", description: "Notify when a client uploads a file to the portal", email: true, sms: false, portal: true },
  { id: "11", category: "Lead", event: "New Lead Captured", description: "Notify when a new lead is submitted via your funnel", email: true, sms: true, portal: false },
  { id: "12", category: "Lead", event: "Lead Converted to Client", description: "Notify when a lead becomes a paying client", email: true, sms: false, portal: false },
];

const CATEGORIES = ["All", ...Array.from(new Set(DEFAULT_EVENTS.map(e => e.category)))];
const CHANNELS: { key: "email" | "sms" | "portal"; label: string; color: string }[] = [
  { key: "email", label: "Email", color: "#3b82f6" },
  { key: "sms", label: "SMS", color: "#10b981" },
  { key: "portal", label: "Portal", color: "#8b5cf6" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? "#10b981" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

export default function Page() {
  const [events, setEvents] = useState<NotifEvent[]>(DEFAULT_EVENTS);
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(false);

  function toggle(id: string, channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, [channel]: !e[channel] } : e));
  }

  function enableAll(channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => ({ ...e, [channel]: true })));
  }

  function disableAll(channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => ({ ...e, [channel]: false })));
  }

  async function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const filtered = category === "All" ? events : events.filter(e => e.category === category);
  const grouped: Record<string, NotifEvent[]> = {};
  for (const ev of filtered) {
    if (!grouped[ev.category]) grouped[ev.category] = [];
    grouped[ev.category].push(ev);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 960 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Notify & Automation</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Control which events trigger email, SMS, and portal notifications.</p>
          </div>
          <button onClick={save} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>

        {saved && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#15803d", fontSize: 14, fontWeight: 600 }}>
            Notification settings saved successfully.
          </div>
        )}

        {/* Bulk Controls */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Bulk Toggle:</span>
          {CHANNELS.map(ch => (
            <div key={ch.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{ch.label}:</span>
              <button onClick={() => enableAll(ch.key)} style={{ fontSize: 12, padding: "4px 10px", background: ch.color + "22", color: ch.color, border: `1px solid ${ch.color}44`, borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>All On</button>
              <button onClick={() => disableAll(ch.key)} style={{ fontSize: 12, padding: "4px 10px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>All Off</button>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: category === cat ? "#1e3a5f" : "#f1f5f9", color: category === cat ? "#fff" : "#64748b" }}>{cat}</button>
          ))}
        </div>

        {/* Event Groups */}
        {Object.entries(grouped).map(([cat, catEvents]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>{cat}</h2>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px", gap: 0, padding: "10px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Event</span>
                {CHANNELS.map(ch => (
                  <span key={ch.key} style={{ fontSize: 12, fontWeight: 700, color: ch.color, textAlign: "center" }}>{ch.label}</span>
                ))}
              </div>
              {catEvents.map((ev, i) => (
                <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px", alignItems: "center", padding: "14px 18px", borderBottom: i < catEvents.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{ev.event}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{ev.description}</div>
                  </div>
                  {CHANNELS.map(ch => (
                    <div key={ch.key} style={{ display: "flex", justifyContent: "center" }}>
                      <Toggle on={ev[ch.key]} onChange={() => toggle(ev.id, ch.key)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* SMS Note */}
        <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
          <strong>SMS Notifications:</strong> SMS delivery requires a connected Twilio account. Configure your Twilio credentials in <a href="/company/settings" style={{ color: "#1e3a5f", fontWeight: 600 }}>Company Settings → Integrations</a>.
        </div>
      </div>
    </CDMLayout>
  );
}
