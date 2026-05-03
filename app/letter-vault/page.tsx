"use client";

import { useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { letterTemplates, LetterTemplate } from "@/letterTemplates";

type Draft = {
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

const emptyDraft: Draft = {
  id: "",
  client: "",
  recipient: "Experian",
  reason: "",
  account: "",
  type: "Custom Letter",
  title: "",
  body: "",
  notes: "",
};

const categories = [...new Set(letterTemplates.map((t) => t.category))];

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

const buttonStyle = (variant: "primary" | "secondary" | "danger" = "secondary"): React.CSSProperties => ({
  padding: "7px 12px",
  borderRadius: 6,
  border: variant === "primary" ? "1px solid #1e3a5f" : variant === "danger" ? "1px solid #fecaca" : "1px solid #cbd5e1",
  background: variant === "primary" ? "#1e3a5f" : "#fff",
  color: variant === "primary" ? "#fff" : variant === "danger" ? "#dc2626" : "#334155",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
});

function draftFromTemplate(template: LetterTemplate): Draft {
  return {
    ...emptyDraft,
    id: "",
    type: template.title,
    title: template.title,
    body: template.body,
    notes: `Created from ${template.category}.`,
  };
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate>(letterTemplates[0]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]);
  const [confirmation, setConfirmation] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return letterTemplates.filter((template) => {
      const matchesTab = activeTab === "All" || template.category === activeTab;
      const matchesSearch = !q || [template.title, template.description, template.category].some((value) => value.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  function openDetails(template: LetterTemplate) {
    setSelectedTemplate(template);
    setConfirmation("");
  }

  function openCreate(template: LetterTemplate) {
    setSelectedTemplate(template);
    setDraft(draftFromTemplate(template));
    setEditingId(null);
    setEditorOpen(true);
    setConfirmation("");
  }

  function openManual() {
    setDraft({ ...emptyDraft, title: "Manual dispute letter", body: "To Whom It May Concern,\n\nI am writing to dispute the account listed below.\n\nSincerely,\n" });
    setEditingId(null);
    setEditorOpen(true);
    setConfirmation("");
  }

  function openEdit(saved: Draft) {
    setDraft(saved);
    setEditingId(saved.id);
    setEditorOpen(true);
    setConfirmation("");
  }

  function saveDraft() {
    const saved: Draft = {
      ...draft,
      id: editingId || `letter-${Date.now()}`,
      title: draft.title.trim() || draft.type || "Untitled letter",
      body: draft.body.trim() || "No letter body entered.",
    };
    setSavedDrafts((current) => (editingId ? current.map((item) => (item.id === editingId ? saved : item)) : [saved, ...current]));
    setDraft(saved);
    setEditingId(saved.id);
    setConfirmation(`Saved "${saved.title}" for ${saved.client || "unnamed client"} to ${saved.recipient || "recipient not set"}.`);
    setEditorOpen(false);
  }

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Letter Vault</h1><div style={{ marginTop: 12, display: "grid", gap: 10 }}>
  <section aria-label="Training Videos" style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#fff" }}>
    <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>Training Videos</h2>
    <button style={buttonStyle}>Letter Vault Training Video</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Move Letters Training Video</button>
  </section>

  <section aria-label="Manual Letters" style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#fff" }}>
    <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>Manual Letters</h2>
    <button style={buttonStyle}>Select All</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Delete All</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Move Letters</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Letter Preview</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Undo Deleted Letters</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Move Manual Letters</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Move to Letter Category</button>
  </section>

  <section aria-label="Response Letters" style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#fff" }}>
    <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>Response Letters</h2>
    <button style={buttonStyle}>Respond Credit Bureau</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Respond Creditor</button>
    <button style={{ ...buttonStyle, marginLeft: 8 }}>Respond Collector</button>
  </section>
</div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>View templates, create client-ready drafts, and edit saved letters.</p>
          </div>
          <button onClick={openManual} style={buttonStyle("primary")}>Add Manual Letter</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button onClick={() => setActiveTab("All")} style={buttonStyle(activeTab === "All" ? "primary" : "secondary")}>All ({letterTemplates.length})</button>
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveTab(category)} style={buttonStyle(activeTab === category ? "primary" : "secondary")}>
              {category}
            </button>
          ))}
        </div>

        <input
          aria-label="Search letter templates"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates by title, description, or category"
          style={{ ...fieldStyle, maxWidth: 520, marginBottom: 18 }}
        />

        {confirmation && (
          <section aria-label="Saved confirmation" style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 13, fontWeight: 700 }}>
            {confirmation}
          </section>
        )}

        {editorOpen && (
          <section aria-label="Letter editor" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 18, marginBottom: 22 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, color: "#1e293b" }}>{editingId ? "Edit Letter" : "Create Letter From Template"}</h2>
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
                  <input value={draft[key as keyof Draft]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} style={fieldStyle} />
                </label>
              ))}
            </div>
            <label>
              <span style={labelStyle}>Body / Content</span>
              <textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} rows={10} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }} />
            </label>
            <label style={{ display: "block", marginTop: 14 }}>
              <span style={labelStyle}>Notes</span>
              <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5 }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button onClick={() => setEditorOpen(false)} style={buttonStyle()}>Cancel</button>
              <button onClick={saveDraft} style={buttonStyle("primary")}>Save Letter</button>
            </div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 410px", gap: 20 }}>
          <section aria-label="Template list">
            <h2 style={{ fontSize: 15, margin: "0 0 10px", color: "#1e293b" }}>Templates</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((template) => (
                <article key={template.id} style={{ background: selectedTemplate.id === template.id ? "#eff6ff" : "#fff", border: `1px solid ${selectedTemplate.id === template.id ? "#93c5fd" : "#e2e8f0"}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 800, marginBottom: 3 }}>{template.category}</div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#1e293b" }}>{template.title}</h3>
                      <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{template.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: 7, alignItems: "flex-start", flexShrink: 0 }}>
                      <button onClick={() => openDetails(template)} style={buttonStyle("primary")}>View</button>
                      <button onClick={() => openCreate(template)} style={buttonStyle()}>Use Template</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside>
            <section aria-label="Template details" style={{ position: "sticky", top: 24, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 800, marginBottom: 6 }}>{selectedTemplate.category}</div>
              <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#1e293b" }}>{selectedTemplate.title}</h2>
              <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 13 }}>{selectedTemplate.description}</p>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", fontSize: 12, lineHeight: 1.55, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, maxHeight: 360, overflow: "auto" }}>{selectedTemplate.body}</pre>
              <button onClick={() => openCreate(selectedTemplate)} style={{ ...buttonStyle("primary"), width: "100%", marginTop: 12 }}>Create From This Template</button>
            </section>

            <section aria-label="Saved letters" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 16, color: "#1e293b" }}>Saved Letters</h2>
              {savedDrafts.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>No saved letters yet. Use a template or add a manual letter.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {savedDrafts.map((saved) => (
                    <article key={saved.id} style={{ border: "1px solid #e2e8f0", borderRadius: 7, padding: 11 }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#1e293b" }}>{saved.title}</h3>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{saved.client || "No client"} to {saved.recipient || "No recipient"} - {saved.account || "No account"}</div>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#334155" }}>{saved.body.slice(0, 150)}</p>
                      <button onClick={() => openEdit(saved)} style={buttonStyle()}>Edit</button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </CDMLayout>
  );
}
