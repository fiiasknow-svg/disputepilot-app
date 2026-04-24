"use client";
import { useState, useMemo } from "react";
import CDMLayout from "@/components/CDMLayout";

type Reply = { from: string; role: string; body: string; date: string };
type Message = { id: number; from: string; role: string; to: string; subject: string; body: string; date: string; read: boolean; priority: "normal" | "high"; replies: Reply[] };

const SAMPLE: Message[] = [
  { id: 1, from: "Admin", role: "Admin", to: "All Staff", subject: "New client onboarded — Ana", body: "Just wanted to let the team know that Ana has been added as a new client. Please make sure her initial dispute is filed by end of week. She is in the priority queue and needs attention ASAP.", date: "2026-04-18T09:30:00", read: false, priority: "high", replies: [] },
  { id: 2, from: "Dispute Specialist", role: "Specialist", to: "Admin", subject: "Equifax response received for Tester", body: "We received a response from Equifax regarding the dispute filed for Tester Tester. The item has been updated. I'll update the status now and send the client an update.", date: "2026-04-17T14:15:00", read: true, priority: "normal", replies: [{ from: "Admin", role: "Admin", body: "Great work! Please also notify the client directly through the portal.", date: "2026-04-17T14:45:00" }] },
  { id: 3, from: "Admin", role: "Admin", to: "All Staff", subject: "Reminder: Monthly billing runs Friday", body: "Just a reminder that all recurring invoices will be processed this Friday. Please make sure all client billing information is up to date before EOD Thursday.", date: "2026-04-16T10:00:00", read: true, priority: "normal", replies: [] },
  { id: 4, from: "Sales Rep", role: "Sales", to: "Admin", subject: "New lead from referral — Leslie", body: "Got a new referral from one of our existing clients. Leslie is interested in the full credit repair package. I've added her to the leads pipeline and scheduled a call.", date: "2026-04-15T11:30:00", read: true, priority: "normal", replies: [{ from: "Admin", role: "Admin", body: "Nice! Follow up with her today if possible. Offer the intro consultation free.", date: "2026-04-15T12:00:00" }] },
  { id: 5, from: "Support Agent", role: "Support", to: "Admin", subject: "Client question about portal access", body: "Ana is having trouble logging into the client portal. She says the reset email isn't arriving. Can you check the email/SMTP settings?", date: "2026-04-14T16:20:00", read: false, priority: "high", replies: [] },
  { id: 6, from: "Admin", role: "Admin", to: "Dispute Specialist", subject: "TransUnion round 2 letters need review", body: "Before we send the Round 2 letters to TransUnion, can you do a final review of the template? I want to make sure the MOV language is correct per the updated FCRA guidelines.", date: "2026-04-13T08:00:00", read: true, priority: "normal", replies: [] },
];

const ROLE_COLOR: Record<string, string> = {
  Admin: "#1e3a5f", Specialist: "#3b82f6", Sales: "#10b981", Support: "#8b5cf6",
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#1e293b" };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(SAMPLE);
  const [selected, setSelected] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ to: "All Staff", subject: "", body: "", priority: "normal" });
  const [inboxTab, setInboxTab] = useState<"inbox" | "sent">("inbox");
  const [search, setSearch] = useState("");

  const unread = messages.filter(m => !m.read).length;

  const filtered = useMemo(() => {
    const source = inboxTab === "inbox"
      ? messages.filter(m => m.to !== "Admin" || m.from === "Admin")
      : messages.filter(m => m.from === "Admin");
    return source.filter(m =>
      !search || m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.from.toLowerCase().includes(search.toLowerCase()) ||
      m.body.toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, inboxTab, search]);

  function open(msg: Message) {
    setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, read: true } : m));
    setSelected({ ...msg, read: true });
    setReply("");
  }

  function markAllRead() {
    setMessages(ms => ms.map(m => ({ ...m, read: true })));
  }

  function deleteMsg(id: number) {
    setMessages(ms => ms.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function sendReply() {
    if (!reply.trim() || !selected) return;
    const r: Reply = { from: "Admin", role: "Admin", body: reply, date: new Date().toISOString() };
    setMessages(ms => ms.map(m => m.id === selected.id ? { ...m, replies: [...m.replies, r] } : m));
    setSelected(s => s ? { ...s, replies: [...s.replies, r] } : s);
    setReply("");
  }

  function sendNew() {
    if (!form.to || !form.subject) return;
    const msg: Message = {
      id: Date.now(), from: "Admin", role: "Admin", to: form.to, subject: form.subject,
      body: form.body, date: new Date().toISOString(), read: false,
      priority: form.priority as "normal" | "high", replies: [],
    };
    setMessages(ms => [msg, ...ms]);
    setForm({ to: "All Staff", subject: "", body: "", priority: "normal" });
    setShowCompose(false);
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Team Messages</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              {unread > 0 ? `${unread} unread message${unread !== 1 ? "s" : ""}` : "All messages read"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ border: "1px solid #e2e8f0", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, background: "#fff", color: "#64748b" }}>
                Mark All Read
              </button>
            )}
            <button onClick={() => setShowCompose(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              + Compose
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "360px 1fr" : "1fr", gap: 20 }}>
          {/* Left panel */}
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
            {/* Sub-tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
              {(["inbox", "sent"] as const).map(t => (
                <button key={t} onClick={() => { setInboxTab(t); setSelected(null); }}
                  style={{ flex: 1, padding: "11px 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: inboxTab === t ? 700 : 500, color: inboxTab === t ? "#1e3a5f" : "#64748b", borderBottom: inboxTab === t ? "2px solid #1e3a5f" : "2px solid transparent", textTransform: "capitalize" }}>
                  {t}
                  {t === "inbox" && unread > 0 && (
                    <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{unread}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…"
                style={{ ...inp, padding: "7px 10px", fontSize: 13 }} />
            </div>

            {/* Message list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.length === 0 && (
                <p style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No messages.</p>
              )}
              {filtered.map(m => (
                <div key={m.id} onClick={() => open(m)}
                  style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: selected?.id === m.id ? "#eff6ff" : m.read ? "#fff" : "#fffbeb", borderLeft: selected?.id === m.id ? "3px solid #1e3a5f" : m.read ? "3px solid transparent" : "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: ROLE_COLOR[m.role] || "#64748b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {initials(m.from)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: m.read ? 600 : 800, fontSize: 13, color: "#1e293b" }}>{m.from}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{fmtDate(m.date)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                        {!m.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                        {m.priority === "high" && <span style={{ fontSize: 10, background: "#fee2e2", color: "#dc2626", borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>HIGH</span>}
                        <span style={{ fontSize: 13, color: m.read ? "#374151" : "#1e293b", fontWeight: m.read ? 500 : 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.body}</div>
                      {m.replies.length > 0 && <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 3, fontWeight: 600 }}>↩ {m.replies.length} repl{m.replies.length === 1 ? "y" : "ies"}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread view */}
          {selected && (
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", border: "1px solid #f1f5f9" }}>
              {/* Thread header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{selected.subject}</h2>
                      {selected.priority === "high" && (
                        <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>HIGH PRIORITY</span>
                      )}
                    </div>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#64748b" }}>
                      <strong>{selected.from}</strong> → {selected.to} · {new Date(selected.date).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => deleteMsg(selected.id)}
                      style={{ fontSize: 12, padding: "5px 10px", border: "1px solid #fee2e2", borderRadius: 5, cursor: "pointer", background: "#fff", color: "#ef4444", fontWeight: 600 }}>
                      Delete
                    </button>
                    <button onClick={() => setSelected(null)}
                      style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", padding: "0 4px" }}>×</button>
                  </div>
                </div>
              </div>

              {/* Thread body */}
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 360 }}>
                {/* Original message */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: ROLE_COLOR[selected.role] || "#64748b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {initials(selected.from)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{selected.from} <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}>· {new Date(selected.date).toLocaleString()}</span></div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#374151", lineHeight: 1.7, marginTop: 6 }}>{selected.body}</div>
                  </div>
                </div>

                {/* Replies */}
                {selected.replies.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingLeft: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: ROLE_COLOR[r.role] || "#64748b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {initials(r.from)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{r.from} <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}>· {new Date(r.date).toLocaleString()}</span></div>
                      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#374151", lineHeight: 1.7, marginTop: 6 }}>{r.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, marginBottom: 4 }}>AD</div>
                  <div style={{ flex: 1 }}>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply…"
                      style={{ width: "100%", height: 68, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, resize: "none", boxSizing: "border-box", outline: "none" }} />
                  </div>
                  <button onClick={sendReply} disabled={!reply.trim()}
                    style={{ padding: "9px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: reply.trim() ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, opacity: reply.trim() ? 1 : 0.5, flexShrink: 0, marginBottom: 4 }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>New Message</h2>
                <button onClick={() => setShowCompose(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>To</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}>
                  {["All Staff", "Admin", "Dispute Specialist", "Sales Rep", "Support Agent"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Subject</label>
                <input style={inp} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Message subject" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Priority</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["normal", "high"].map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                      style={{ padding: "6px 16px", border: `1px solid ${form.priority === p ? (p === "high" ? "#dc2626" : "#1e3a5f") : "#e2e8f0"}`, borderRadius: 6, background: form.priority === p ? (p === "high" ? "#fee2e2" : "#eff6ff") : "#fff", cursor: "pointer", fontSize: 13, fontWeight: form.priority === p ? 700 : 500, color: form.priority === p ? (p === "high" ? "#dc2626" : "#1e3a5f") : "#64748b", textTransform: "capitalize" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Message</label>
                <textarea style={{ ...inp, height: 120, resize: "vertical" } as React.CSSProperties} value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your message…" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCompose(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>Cancel</button>
                <button onClick={sendNew} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Send Message</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
