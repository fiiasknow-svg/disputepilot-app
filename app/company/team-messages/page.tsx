"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Message = { id: number; from: string; to: string; subject: string; body: string; date: string; read: boolean; replies: { from: string; body: string; date: string }[] };

const SAMPLE: Message[] = [
  { id: 1, from: "Admin", to: "All Staff", subject: "New client onboarded — Ana", body: "Just wanted to let the team know that Ana has been added as a new client. Please make sure her initial dispute is filed by end of week.", date: "2026-04-18T09:30:00", read: false, replies: [] },
  { id: 2, from: "Dispute Specialist", to: "Admin", subject: "Equifax response received for Tester", body: "We received a response from Equifax regarding the dispute filed for Tester Tester. The item has been updated. I'll update the status now.", date: "2026-04-17T14:15:00", read: true, replies: [{ from: "Admin", body: "Great work! Please also notify the client.", date: "2026-04-17T14:45:00" }] },
  { id: 3, from: "Admin", to: "All Staff", subject: "Reminder: Monthly billing runs Friday", body: "Just a reminder that all recurring invoices will be processed this Friday. Please make sure all client billing information is up to date.", date: "2026-04-16T10:00:00", read: true, replies: [] },
  { id: 4, from: "Sales Rep", to: "Admin", subject: "New lead from referral — Leslie", body: "Got a new referral from one of our existing clients. Leslie is interested in the full credit repair package. I've added her to the leads pipeline.", date: "2026-04-15T11:30:00", read: true, replies: [{ from: "Admin", body: "Nice! Follow up with her today if possible.", date: "2026-04-15T12:00:00" }] },
  { id: 5, from: "Support Agent", to: "Admin", subject: "Client question about portal access", body: "Ana is having trouble logging into the client portal. She says the reset email isn't arriving. Can you check the email settings?", date: "2026-04-14T16:20:00", read: true, replies: [] },
];

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(SAMPLE);
  const [selected, setSelected] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  function open(msg: Message) {
    setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, read: true } : m));
    setSelected({ ...msg, read: true });
    setReply("");
  }

  function sendReply() {
    if (!reply.trim() || !selected) return;
    const r = { from: "Admin", body: reply, date: new Date().toISOString() };
    setMessages(ms => ms.map(m => m.id === selected.id ? { ...m, replies: [...m.replies, r] } : m));
    setSelected(s => s ? { ...s, replies: [...s.replies, r] } : s);
    setReply("");
  }

  function sendNew() {
    if (!form.to || !form.subject) return;
    const msg: Message = { id: Date.now(), from: "Admin", to: form.to, subject: form.subject, body: form.body, date: new Date().toISOString(), read: false, replies: [] };
    setMessages(ms => [msg, ...ms]);
    setForm({ to: "", subject: "", body: "" });
    setShowCompose(false);
  }

  const unread = messages.filter(m => !m.read).length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1050 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Team Messages</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{unread} unread message{unread !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowCompose(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Compose</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.4fr" : "1fr", gap: 20 }}>
          {/* Message List */}
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ background: "#f8fafc", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, borderBottom: "1px solid #f1f5f9" }}>Inbox</div>
            {messages.length === 0 && <p style={{ padding: 32, textAlign: "center" as const, color: "#94a3b8" }}>No messages yet.</p>}
            {messages.map(m => (
              <div key={m.id} onClick={() => open(m)}
                style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: selected?.id === m.id ? "#eff6ff" : m.read ? "#fff" : "#fafafa", borderLeft: selected?.id === m.id ? "3px solid #3b82f6" : m.read ? "3px solid transparent" : "3px solid #f59e0b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {!m.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                      <span style={{ fontWeight: m.read ? 500 : 700, fontSize: 14, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{m.subject}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      <span style={{ fontWeight: 600 }}>{m.from}</span> → {m.to}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{m.body}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginTop: 2 }}>
                    {new Date(m.date).toLocaleDateString()}
                  </div>
                </div>
                {m.replies.length > 0 && <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 4, fontWeight: 600 }}>↩ {m.replies.length} repl{m.replies.length === 1 ? "y" : "ies"}</div>}
              </div>
            ))}
          </div>

          {/* Thread View */}
          {selected && (
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{selected.subject}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}><strong>{selected.from}</strong> → {selected.to} · {new Date(selected.date).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
              </div>
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: 340 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f", marginBottom: 6 }}>{selected.from}</div>
                  {selected.body}
                </div>
                {selected.replies.map((r, i) => (
                  <div key={i} style={{ background: "#eff6ff", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#374151", lineHeight: 1.7, marginLeft: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1d4ed8", marginBottom: 6 }}>{r.from} · {new Date(r.date).toLocaleString()}</div>
                    {r.body}
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply…" style={{ width: "100%", height: 72, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, resize: "none" as const, boxSizing: "border-box" as const }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={sendReply} disabled={!reply.trim()} style={{ padding: "8px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: reply.trim() ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, opacity: reply.trim() ? 1 : 0.5 }}>Send Reply</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 500 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Message</h2>
              {[["To", "to", "e.g. All Staff, or specific employee name"], ["Subject", "subject", "Message subject"]].map(([l, k, p]) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <label style={lbl}>{l}</label>
                  <input style={inp} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Message</label>
                <textarea style={{ ...inp, height: 120, resize: "vertical" } as React.CSSProperties} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your message…" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowCompose(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={sendNew} style={{ padding: "9px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
