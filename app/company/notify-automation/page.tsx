"use client";
import { useState, useMemo } from "react";
import CDMLayout from "@/components/CDMLayout";

type NotifEvent = {
  id: string; category: string; event: string; description: string;
  email: boolean; sms: boolean; portal: boolean; delay: number; triggers: number;
};

type AutoRule = {
  id: number; name: string; trigger: string; action: string; delay: string; channel: string; active: boolean;
};

const DEFAULT_EVENTS: NotifEvent[] = [
  { id: "1",  category: "Client",        event: "New Client Added",          description: "Notify when a new client is created",                email: true,  sms: false, portal: true,  delay: 0,  triggers: 142 },
  { id: "2",  category: "Client",        event: "Client Status Changed",      description: "Notify when a client's status is updated",            email: true,  sms: false, portal: true,  delay: 0,  triggers: 67  },
  { id: "3",  category: "Dispute",       event: "Dispute Round Started",      description: "Notify when a new dispute round is initiated",         email: true,  sms: true,  portal: true,  delay: 0,  triggers: 89  },
  { id: "4",  category: "Dispute",       event: "Bureau Response Received",   description: "Notify when a bureau responds to a dispute",           email: true,  sms: true,  portal: true,  delay: 0,  triggers: 54  },
  { id: "5",  category: "Dispute",       event: "Dispute Item Deleted",       description: "Notify when a negative item is successfully removed",  email: true,  sms: true,  portal: true,  delay: 0,  triggers: 31  },
  { id: "6",  category: "Invoice",       event: "Invoice Created",            description: "Notify when a new invoice is generated",               email: true,  sms: false, portal: false, delay: 0,  triggers: 210 },
  { id: "7",  category: "Invoice",       event: "Payment Received",           description: "Notify when a client payment is processed",            email: true,  sms: false, portal: true,  delay: 0,  triggers: 175 },
  { id: "8",  category: "Invoice",       event: "Payment Past Due",           description: "Remind client when an invoice is overdue",             email: true,  sms: true,  portal: false, delay: 3,  triggers: 28  },
  { id: "9",  category: "Client Portal", event: "Client Logs In",             description: "Notify when a client accesses their portal",           email: false, sms: false, portal: false, delay: 0,  triggers: 340 },
  { id: "10", category: "Client Portal", event: "Client Uploads Document",    description: "Notify when a client uploads a file to the portal",    email: true,  sms: false, portal: true,  delay: 0,  triggers: 44  },
  { id: "11", category: "Lead",          event: "New Lead Captured",          description: "Notify when a new lead is submitted via your funnel",  email: true,  sms: true,  portal: false, delay: 0,  triggers: 58  },
  { id: "12", category: "Lead",          event: "Lead Converted to Client",   description: "Notify when a lead becomes a paying client",           email: true,  sms: false, portal: false, delay: 0,  triggers: 19  },
];

const DEFAULT_RULES: AutoRule[] = [
  { id: 1, name: "Welcome Email Series",     trigger: "New client added",              action: "Send welcome email sequence",          delay: "Immediately",    channel: "Email",  active: true  },
  { id: 2, name: "Dispute Round Follow-up",  trigger: "Dispute round sent",            action: "Send status update to client",         delay: "After 7 days",   channel: "Email",  active: true  },
  { id: 3, name: "Overdue Invoice Reminder", trigger: "Invoice unpaid after 3 days",   action: "Send payment reminder + SMS",          delay: "After 3 days",   channel: "Email + SMS", active: true  },
  { id: 4, name: "Score Update Alert",       trigger: "Credit score changes",          action: "Notify client via portal + email",     delay: "Immediately",    channel: "Portal", active: false },
  { id: 5, name: "30-Day Check-in",          trigger: "30 days after onboarding",      action: "Send progress update email",           delay: "After 30 days",  channel: "Email",  active: true  },
  { id: 6, name: "Lead Nurture Drip",        trigger: "New lead captured",             action: "Start 5-email drip campaign",          delay: "Immediately",    channel: "Email",  active: false },
];

const CATEGORIES = ["All", ...Array.from(new Set(DEFAULT_EVENTS.map(e => e.category)))];
const CHANNELS: { key: "email" | "sms" | "portal"; label: string; color: string }[] = [
  { key: "email",  label: "Email",  color: "#3b82f6" },
  { key: "sms",    label: "SMS",    color: "#10b981" },
  { key: "portal", label: "Portal", color: "#8b5cf6" },
];
const MAIN_TABS = ["Notification Settings", "Automation Rules"];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? "#10b981" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

export default function Page() {
  const [mainTab, setMainTab] = useState("Notification Settings");
  const [events, setEvents] = useState<NotifEvent[]>(DEFAULT_EVENTS);
  const [rules, setRules] = useState<AutoRule[]>(DEFAULT_RULES);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [masterEmail, setMasterEmail] = useState(true);
  const [masterSms, setMasterSms] = useState(true);
  const [masterPortal, setMasterPortal] = useState(true);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", action: "", delay: "Immediately", channel: "Email" });

  function toggle(id: string, channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, [channel]: !e[channel] } : e));
  }

  function setDelay(id: string, delay: number) {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, delay } : e));
  }

  function enableAll(channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => ({ ...e, [channel]: true })));
  }

  function disableAll(channel: "email" | "sms" | "portal") {
    setEvents(evs => evs.map(e => ({ ...e, [channel]: false })));
  }

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  function addRule() {
    if (!newRule.name || !newRule.trigger) return;
    setRules(rs => [{ id: Date.now(), ...newRule, active: true }, ...rs]);
    setNewRule({ name: "", trigger: "", action: "", delay: "Immediately", channel: "Email" });
    setShowNewRule(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const filtered = useMemo(() => {
    const bycat = category === "All" ? events : events.filter(e => e.category === category);
    return bycat.filter(e => !search || e.event.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()));
  }, [events, category, search]);

  const grouped = useMemo(() => {
    const g: Record<string, NotifEvent[]> = {};
    for (const ev of filtered) {
      if (!g[ev.category]) g[ev.category] = [];
      g[ev.category].push(ev);
    }
    return g;
  }, [filtered]);

  const totalEnabled = events.filter(e => e.email || e.sms || e.portal).length;
  const activeRules = rules.filter(r => r.active).length;

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#1e293b" };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Notify &amp; Automation</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Control which events trigger notifications and set up automated workflows.</p>
          </div>
          <button onClick={save} style={{ background: saved ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "background 0.2s" }}>
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>

        {saved && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "#15803d", fontSize: 14, fontWeight: 600 }}>
            Notification settings saved successfully.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Events Enabled",    value: totalEnabled,    color: "#1e3a5f", bg: "#eff6ff" },
            { label: "Active Auto Rules", value: activeRules,     color: "#166534", bg: "#dcfce7" },
            { label: "Total Events",      value: events.length,   color: "#64748b", bg: "#f1f5f9" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Main tabs */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setMainTab(t)} style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: mainTab === t ? 700 : 500, color: mainTab === t ? "#1e3a5f" : "#64748b", borderBottom: mainTab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>{t}</button>
          ))}
        </div>

        {/* ── Notification Settings ── */}
        {mainTab === "Notification Settings" && (
          <div style={{ paddingTop: 20 }}>
            {/* Master switches */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12 }}>Master Channel Switches</div>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { label: "All Email Notifications",  on: masterEmail,  set: setMasterEmail,  color: "#3b82f6" },
                  { label: "All SMS Notifications",    on: masterSms,    set: setMasterSms,    color: "#10b981" },
                  { label: "All Portal Notifications", on: masterPortal, set: setMasterPortal, color: "#8b5cf6" },
                ].map(m => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Toggle on={m.on} onChange={() => m.set(v => !v)} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.on ? m.color : "#94a3b8" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk controls */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Bulk Toggle:</span>
              {CHANNELS.map(ch => (
                <div key={ch.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 13, color: ch.color, fontWeight: 600 }}>{ch.label}:</span>
                  <button onClick={() => enableAll(ch.key)} style={{ fontSize: 12, padding: "3px 10px", background: ch.color + "18", color: ch.color, border: `1px solid ${ch.color}44`, borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>All On</button>
                  <button onClick={() => disableAll(ch.key)} style={{ fontSize: 12, padding: "3px 10px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>All Off</button>
                </div>
              ))}
            </div>

            {/* Filter row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
                style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, width: 220, outline: "none" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: category === cat ? "#1e3a5f" : "#f1f5f9", color: category === cat ? "#fff" : "#64748b" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event groups */}
            {Object.entries(grouped).map(([cat, catEvents]) => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{cat}</h2>
                <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px 80px", padding: "10px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>EVENT</span>
                    {CHANNELS.map(ch => <span key={ch.key} style={{ fontSize: 11, fontWeight: 700, color: ch.color, textAlign: "center" }}>{ch.label.toUpperCase()}</span>)}
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center" }}>DELAY (DAYS)</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center" }}>TRIGGERS</span>
                  </div>
                  {catEvents.map((ev, i) => (
                    <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px 80px", alignItems: "center", padding: "13px 18px", borderBottom: i < catEvents.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{ev.event}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{ev.description}</div>
                      </div>
                      {CHANNELS.map(ch => (
                        <div key={ch.key} style={{ display: "flex", justifyContent: "center" }}>
                          <Toggle on={ev[ch.key]} onChange={() => toggle(ev.id, ch.key)} />
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <input type="number" min={0} max={90} value={ev.delay}
                          onChange={e => setDelay(ev.id, parseInt(e.target.value) || 0)}
                          style={{ width: 54, padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, textAlign: "center", color: "#374151" }} />
                      </div>
                      <div style={{ textAlign: "center", fontSize: 13, color: "#64748b", fontWeight: 600 }}>{ev.triggers.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>No events match your search.</p>
            )}

            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400e", marginTop: 4 }}>
              <strong>SMS Notifications:</strong> Require a connected Twilio account. Configure in{" "}
              <a href="/company/settings" style={{ color: "#1e3a5f", fontWeight: 600 }}>Company Settings → Integrations</a>.
            </div>
          </div>
        )}

        {/* ── Automation Rules ── */}
        {mainTab === "Automation Rules" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Automation Rules</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Set up workflows that automatically trigger actions based on client events.</p>
              </div>
              <button onClick={() => setShowNewRule(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                + New Rule
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{rule.name}</span>
                      <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{rule.channel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}><span style={{ fontWeight: 700, color: "#475569" }}>Trigger:</span> {rule.trigger}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}><span style={{ fontWeight: 700, color: "#475569" }}>Action:</span> {rule.action}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}><span style={{ fontWeight: 700, color: "#475569" }}>Delay:</span> {rule.delay}</div>
                  </div>
                  <span style={{ background: rule.active ? "#dcfce7" : "#f1f5f9", color: rule.active ? "#166534" : "#94a3b8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                  <Toggle on={rule.active} onChange={() => setRules(rs => rs.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))} />
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", background: "#fff", fontWeight: 600, color: "#374151" }}>Edit</button>
                    <button onClick={() => setRules(rs => rs.filter(r => r.id !== rule.id))} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontSize: 14 }}>No automation rules yet. Create your first rule above.</p>
              )}
            </div>

            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "12px 16px", marginTop: 20, fontSize: 13, color: "#0369a1" }}>
              <strong>Tip:</strong> Automation rules run silently in the background. Use them to deliver timely follow-ups, reminders, and drip campaigns without manual effort.
            </div>
          </div>
        )}

        {/* New Rule Modal */}
        {showNewRule && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>New Automation Rule</h2>
                <button onClick={() => setShowNewRule(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              {[
                { key: "name",    label: "Rule Name",    placeholder: "e.g. Welcome Email Series" },
                { key: "trigger", label: "Trigger Event", placeholder: "e.g. New client added" },
                { key: "action",  label: "Action",        placeholder: "e.g. Send welcome email" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={lbl}>{f.label}</label>
                  <input style={inp} value={(newRule as Record<string, string>)[f.key]} placeholder={f.placeholder}
                    onChange={e => setNewRule(r => ({ ...r, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Delay</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={newRule.delay} onChange={e => setNewRule(r => ({ ...r, delay: e.target.value }))}>
                    {["Immediately", "After 1 day", "After 3 days", "After 7 days", "After 14 days", "After 30 days"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Channel</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={newRule.channel} onChange={e => setNewRule(r => ({ ...r, channel: e.target.value }))}>
                    {["Email", "SMS", "Portal", "Email + SMS", "Email + Portal"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowNewRule(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>Cancel</button>
                <button onClick={addRule} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Create Rule</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
