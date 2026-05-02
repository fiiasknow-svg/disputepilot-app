"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CDMLayout from "@/components/CDMLayout";

type Letter = {
  id: string;
  client: string;
  recipient: string;
  reason: string;
  account: string;
  type: string;
  title: string;
  body: string;
  notes: string;
};

const starterLetters: Letter[] = [
  {
    id: "starter-round-1",
    client: "Jordan Miles",
    recipient: "Experian",
    reason: "Account does not belong to consumer",
    account: "ABC Collections",
    type: "Initial dispute",
    title: "Experian Round 1 Collection Dispute",
    body: "I am disputing the ABC Collections account because it does not belong to me. Please investigate and remove the item if it cannot be verified as accurate and complete.",
    notes: "Ready for review before print batch.",
  },
  {
    id: "starter-mov",
    client: "Taylor Brooks",
    recipient: "TransUnion",
    reason: "Method of verification request",
    account: "Metro Bank Card",
    type: "Method of Verification",
    title: "TransUnion MOV Request",
    body: "Please provide the method of verification used to confirm the Metro Bank Card reporting after my previous dispute.",
    notes: "Send after bureau response is uploaded.",
  },
];

const emptyLetter: Letter = {
  id: "",
  client: "",
  recipient: "",
  reason: "",
  account: "",
  type: "",
  title: "",
  body: "",
  notes: "",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5,
};

const buttonStyle = (primary = false): React.CSSProperties => ({
  padding: "8px 13px",
  borderRadius: 6,
  border: primary ? "1px solid #1e3a5f" : "1px solid #cbd5e1",
  background: primary ? "#1e3a5f" : "#fff",
  color: primary ? "#fff" : "#334155",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
});

export default function Page() {
  const [letters, setLetters] = useState<Letter[]>(starterLetters);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [letter, setLetter] = useState<Letter>(emptyLetter);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return letters;
    return letters.filter((item) => [item.client, item.recipient, item.reason, item.account, item.type, item.title, item.body, item.notes].some((value) => value.toLowerCase().includes(q)));
  }, [letters, query]);

  function startCreate() {
    setLetter({ ...emptyLetter, title: "New dispute letter", type: "Initial dispute" });
    setEditingId(null);
    setEditorOpen(true);
    setMessage("");
  }

  function startEdit(item: Letter) {
    setLetter(item);
    setEditingId(item.id);
    setEditorOpen(true);
    setMessage("");
  }

  function saveLetter() {
    const saved = {
      ...letter,
      id: editingId || `letter-${Date.now()}`,
      title: letter.title.trim() || "Untitled letter",
      body: letter.body.trim() || "No letter body entered.",
    };
    setLetters((current) => (editingId ? current.map((item) => (item.id === editingId ? saved : item)) : [saved, ...current]));
    setEditorOpen(false);
    setEditingId(saved.id);
    setLetter(saved);
    setMessage(`Saved "${saved.title}" for ${saved.client || "unnamed client"}.`);
  }

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1220 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Letters</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage saved and generated dispute letters before review, print, or send.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/letter-vault" style={{ ...buttonStyle(), textDecoration: "none" }}>Use Letter Vault</Link>
            <Link href="/letters/ai-rewriter" style={{ ...buttonStyle(), textDecoration: "none" }}>AI Rewriter</Link>
            <button onClick={startCreate} style={buttonStyle(true)}>Create Letter</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 12, marginBottom: 18 }}>
          {[
            ["Total Letters", letters.length],
            ["Ready for Review", letters.length],
            ["Bureaus", new Set(letters.map((item) => item.recipient)).size],
            ["Clients", new Set(letters.map((item) => item.client)).size],
          ].map(([label, value]) => (
            <section key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>{label}</div>
              <div style={{ color: "#1e293b", fontSize: 24, fontWeight: 800 }}>{value}</div>
            </section>
          ))}
        </div>

        <input aria-label="Search letters" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved letters by client, bureau, account, reason, or title" style={{ ...fieldStyle, maxWidth: 560, marginBottom: 16 }} />

        {message && (
          <section aria-label="Saved confirmation" style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
            {message}
          </section>
        )}

        {editorOpen && (
          <section aria-label="Letter editor" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 18, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, color: "#1e293b" }}>{editingId ? "Edit Saved Letter" : "Create Saved Letter"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(150px, 1fr))", gap: 14, marginBottom: 14 }}>
              {[
                ["Client / Customer", "client"],
                ["Bureau / Recipient", "recipient"],
                ["Dispute Reason / Type", "reason"],
                ["Account / Creditor", "account"],
                ["Template / Letter Type", "type"],
                ["Subject / Title", "title"],
              ].map(([label, key]) => (
                <label key={key} style={{ gridColumn: key === "title" ? "span 2" : "span 1" }}>
                  <span style={labelStyle}>{label}</span>
                  <input value={letter[key as keyof Letter]} onChange={(event) => setLetter({ ...letter, [key]: event.target.value })} style={fieldStyle} />
                </label>
              ))}
            </div>
            <label>
              <span style={labelStyle}>Body / Content</span>
              <textarea value={letter.body} onChange={(event) => setLetter({ ...letter, body: event.target.value })} rows={8} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }} />
            </label>
            <label style={{ display: "block", marginTop: 14 }}>
              <span style={labelStyle}>Notes</span>
              <textarea value={letter.notes} onChange={(event) => setLetter({ ...letter, notes: event.target.value })} rows={3} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5 }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button onClick={() => setEditorOpen(false)} style={buttonStyle()}>Cancel</button>
              <button onClick={saveLetter} style={buttonStyle(true)}>Save Letter</button>
            </div>
          </section>
        )}

        <section aria-label="Saved letters" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map((item) => (
            <article key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 800, marginBottom: 5 }}>{item.type || "Letter"}</div>
              <h2 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: 16 }}>{item.title}</h2>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>{item.client || "No client"} to {item.recipient || "No recipient"} - {item.account || "No account"}</div>
              <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px" }}>{item.body}</p>
              {item.notes && <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 10px" }}>Notes: {item.notes}</p>}
              <button onClick={() => startEdit(item)} style={buttonStyle()}>Edit</button>
            </article>
          ))}
        </section>
      </main>
    </CDMLayout>
  );
}
