"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const TABS = ["Overview", "Disputes", "Documents", "Notes", "Timeline"];
const BUREAU_COLORS: Record<string, string> = { equifax: "#e53e3e", experian: "#2b6cb0", transunion: "#276749" };
const STATUS_C: Record<string, string> = { active: "#10b981", pending: "#f59e0b", sent: "#8b5cf6", resolved: "#10b981", deleted: "#ef4444" };

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [client, setClient] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    async function load() {
      const [c, d, doc, n] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("disputes").select("*").eq("client_id", id).order("created_at", { ascending: false }),
        supabase.from("documents").select("*").eq("client_id", id).order("created_at", { ascending: false }),
        supabase.from("notes").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      ]);
      setClient(c.data);
      setEditForm(c.data || {});
      setDisputes(d.data || []);
      setDocuments(doc.data || []);
      setNotes(n.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function saveEdit() {
    await supabase.from("clients").update(editForm).eq("id", id);
    setClient(editForm);
    setEditing(false);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const { data } = await supabase.from("notes").insert([{ client_id: id, content: newNote }]).select().single();
    if (data) setNotes(n => [data, ...n]);
    setNewNote("");
    setSavingNote(false);
  }

  if (loading) return <CDMLayout><div style={{ padding: 32, color: "#94a3b8" }}>Loading…</div></CDMLayout>;
  if (!client) return <CDMLayout><div style={{ padding: 32 }}>Client not found. <button onClick={() => router.push("/clients")} style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Back to clients</button></div></CDMLayout>;

  const scoreStyle = (s: number) => ({ background: s >= 700 ? "#dcfce7" : s >= 600 ? "#fef9c3" : "#fee2e2", color: s >= 700 ? "#166534" : s >= 600 ? "#92400e" : "#991b1b", padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: 15 });

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <button onClick={() => router.push("/clients")} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Back to Clients</button>

        {/* Header */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>{client.first_name} {client.last_name}</h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                {client.email && <span style={{ fontSize: 14, color: "#475569" }}>✉ {client.email}</span>}
                {client.phone && <span style={{ fontSize: 14, color: "#475569" }}>📞 {client.phone}</span>}
                <span style={{ background: (STATUS_C[client.status] || "#94a3b8") + "22", color: STATUS_C[client.status] || "#64748b", borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 700 }}>{client.status || "active"}</span>
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Edit</button>
          </div>

          {/* Credit Scores */}
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            {[["Equifax", "score_equifax"], ["Experian", "score_experian"], ["TransUnion", "score_transunion"]].map(([bureau, key]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{bureau}</div>
                {client[key] ? <span style={scoreStyle(client[key])}>{client[key]}</span> : <span style={{ color: "#94a3b8", fontSize: 14 }}>—</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480, maxHeight: "80vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Edit Client</h2>
              {[["First Name", "first_name"], ["Last Name", "last_name"], ["Email", "email"], ["Phone", "phone"],
                ["Address", "address"], ["City", "city"], ["State", "state"], ["Zip", "zip"],
                ["Equifax Score", "score_equifax"], ["Experian Score", "score_experian"], ["TransUnion Score", "score_transunion"]
              ].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 3 }}>{label}</label>
                  <input value={editForm[key] || ""} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 3 }}>Status</label>
                <select value={editForm.status || "active"} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}>
                  {["active", "pending", "inactive", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setEditing(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveEdit} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{t}</button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === "Overview" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Client Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {[["Address", [client.address, client.city, client.state, client.zip].filter(Boolean).join(", ")],
                ["Joined", new Date(client.created_at).toLocaleDateString()],
                ["Referred By", client.referred_by || "—"],
              ].map(([label, val]) => (
                <div key={label as string}><span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{label}</span><p style={{ margin: "2px 0 0", fontSize: 14, color: "#1e293b" }}>{val || "—"}</p></div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Disputes */}
        {tab === "Disputes" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Disputes ({disputes.length})</h3>
              <button onClick={() => router.push("/disputes")} style={{ fontSize: 13, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>+ Add Dispute</button>
            </div>
            {disputes.length === 0 ? <p style={{ padding: 24, color: "#94a3b8", fontSize: 14 }}>No disputes yet.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}><tr>
                  {["Account", "Bureau", "Reason", "Status", "Round"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#64748b" }}>{h}</th>)}
                </tr></thead>
                <tbody>{disputes.map(d => (
                  <tr key={d.id} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => router.push(`/disputes/${d.id}`)}>
                    <td style={{ padding: "10px 16px", fontSize: 14 }}>{d.account_name || "—"}</td>
                    <td style={{ padding: "10px 16px" }}><span style={{ background: (BUREAU_COLORS[d.bureau] || "#94a3b8") + "22", color: BUREAU_COLORS[d.bureau] || "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{d.bureau}</span></td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#475569" }}>{d.reason || "—"}</td>
                    <td style={{ padding: "10px 16px" }}><span style={{ background: (STATUS_C[d.status] || "#94a3b8") + "22", color: STATUS_C[d.status] || "#64748b", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{d.status}</span></td>
                    <td style={{ padding: "10px 16px", fontSize: 14 }}>Round {d.round || 1}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Documents */}
        {tab === "Documents" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Documents ({documents.length})</h3>
            {documents.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No documents uploaded.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(doc.created_at).toLocaleDateString()}</div>
                    </div>
                    {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>View</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Notes */}
        {tab === "Notes" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Add Note</h3>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Enter a note about this client…"
                style={{ width: "100%", minHeight: 80, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
              <button onClick={addNote} disabled={savingNote} style={{ marginTop: 10, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{savingNote ? "Saving…" : "Add Note"}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notes.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No notes yet.</p> : notes.map(n => (
                <div key={n.id} style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.6 }}>{n.content}</p>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Timeline */}
        {tab === "Timeline" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Activity Timeline</h3>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
              {[
                { label: `Client created`, date: client.created_at, color: "#3b82f6" },
                ...disputes.map(d => ({ label: `Dispute filed: ${d.account_name || "Account"} (${d.bureau})`, date: d.created_at, color: "#8b5cf6" })),
                ...notes.map(n => ({ label: `Note added`, date: n.created_at, color: "#10b981" })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <div style={{ position: "absolute", left: 0, width: 16, height: 16, borderRadius: "50%", background: item.color, border: "2px solid #fff", boxShadow: "0 0 0 2px " + item.color, marginTop: 2 }} />
                  <div style={{ marginLeft: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{item.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
