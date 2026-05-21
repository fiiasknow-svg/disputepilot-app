"use client";

import { useMemo, useState, type CSSProperties } from "react";
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

const topTabs = [
  { label: "CREDIT BUREAU LETTERS", category: "Credit Bureau Letters" },
  { label: "CREDITOR'S LETTERS", category: "Creditor's Letters" },
  { label: "COLLECTOR'S LETTERS", category: "Collector's Letters" },
  { label: "RESPOND LETTERS", category: "Respond Letters" },
  { label: "MANUAL LETTERS", category: "Manual Letters" },
];

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5,
};

const buttonStyle = (variant: "primary" | "secondary" | "danger" = "secondary"): CSSProperties => ({
  padding: "7px 12px",
  borderRadius: 6,
  border: variant === "primary" ? "1px solid #1e3a5f" : variant === "danger" ? "1px solid #fecaca" : "1px solid #cbd5e1",
  background: variant === "primary" ? "#1e3a5f" : "#fff",
  color: variant === "primary" ? "#fff" : variant === "danger" ? "#dc2626" : "#334155",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
});

const rowActionStyle = (color: string): CSSProperties => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: "50%",
  border: "1px solid #dce5ef",
  background: "#fff",
  color,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.14)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1,
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

function groupTemplates(templates: LetterTemplate[]) {
  return templates.reduce<Record<string, LetterTemplate[]>>((groups, template) => {
    groups[template.category] = groups[template.category] || [];
    groups[template.category].push(template);
    return groups;
  }, {});
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("Credit Bureau Letters");
  const [search, setSearch] = useState("");
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate>(letterTemplates[0]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]);
  const [confirmation, setConfirmation] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>([]);
  const [lastDeletedIds, setLastDeletedIds] = useState<string[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [moveCategory, setMoveCategory] = useState("Manual Letters");

  const displayTemplates = useMemo(
    () =>
      letterTemplates
        .filter((template) => !deletedTemplateIds.includes(template.id))
        .map((template) => ({ ...template, category: categoryOverrides[template.id] || template.category })),
    [categoryOverrides, deletedTemplateIds]
  );

  const categories = useMemo(() => [...new Set(displayTemplates.map((template) => template.category))], [displayTemplates]);

  const defaultGroups = useMemo(() => {
    const grouped = groupTemplates(displayTemplates);
    if (activeTab === "Credit Bureau Letters") {
      return [
        ["Dispute Flow Letters", grouped["Dispute Flow Letters"] || []] as const,
        ["General Letters", grouped["General Letters"] || []] as const,
      ];
    }

    return [[activeTab, grouped[activeTab] || []] as const];
  }, [activeTab, displayTemplates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayTemplates.filter((template) => {
      const matchesTab = activeTab === "Credit Bureau Letters" ? ["Dispute Flow Letters", "General Letters", "Credit Bureau Letters"].includes(template.category) : template.category === activeTab;
      const matchesSearch = !q || [template.title, template.description, template.category].some((value) => value.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, displayTemplates, search]);

  function openDetails(template: LetterTemplate) {
    setSelectedTemplate(template);
    setToolsOpen(true);
    setConfirmation("");
  }

  function openCreate(template: LetterTemplate) {
    setSelectedTemplate(template);
    setDraft(draftFromTemplate(template));
    setEditingId(null);
    setToolsOpen(true);
    setEditorOpen(true);
    setConfirmation("");
  }

  function openManual() {
    setDraft({ ...emptyDraft, title: "Manual dispute letter", body: "To Whom It May Concern,\n\nI am writing to dispute the account listed below.\n\nSincerely,\n" });
    setEditingId(null);
    setToolsOpen(true);
    setEditorOpen(true);
    setConfirmation("");
  }

  function openEdit(saved: Draft) {
    setDraft(saved);
    setEditingId(saved.id);
    setToolsOpen(true);
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

  function selectAllFiltered() {
    const visibleIds = filtered.map((template) => template.id);
    setSelectedTemplateIds(visibleIds);
    setConfirmation(`Selected ${visibleIds.length} visible letter${visibleIds.length === 1 ? "" : "s"}.`);
  }

  function toggleTemplateSelection(templateId: string) {
    setSelectedTemplateIds((current) => (current.includes(templateId) ? current.filter((id) => id !== templateId) : [...current, templateId]));
    setConfirmation("");
  }

  function deleteSelectedLetters() {
    const idsToDelete = selectedTemplateIds.length ? selectedTemplateIds : filtered.map((template) => template.id);
    if (!idsToDelete.length) {
      setConfirmation("No letters are available to delete.");
      return;
    }

    setDeletedTemplateIds((current) => [...new Set([...current, ...idsToDelete])]);
    setLastDeletedIds(idsToDelete);
    setSelectedTemplateIds([]);
    setConfirmation(`Deleted ${idsToDelete.length} letter${idsToDelete.length === 1 ? "" : "s"}. Use Undo Deleted Letters to restore them.`);
  }

  function undoDeletedLetters() {
    if (!lastDeletedIds.length) {
      setConfirmation("No recently deleted letters to restore.");
      return;
    }

    setDeletedTemplateIds((current) => current.filter((id) => !lastDeletedIds.includes(id)));
    setConfirmation(`Restored ${lastDeletedIds.length} deleted letter${lastDeletedIds.length === 1 ? "" : "s"}.`);
    setLastDeletedIds([]);
  }

  function moveSelectedLetters() {
    if (!selectedTemplateIds.length) {
      setConfirmation("Select one or more letters before moving them.");
      return;
    }

    setCategoryOverrides((current) => {
      const next = { ...current };
      selectedTemplateIds.forEach((id) => {
        next[id] = moveCategory;
      });
      return next;
    });
    setActiveTab(moveCategory);
    setConfirmation(`Moved ${selectedTemplateIds.length} selected letter${selectedTemplateIds.length === 1 ? "" : "s"} to ${moveCategory}.`);
  }

  return (
    <CDMLayout>
      <main className="letter-vault-page">
        <style>{`
          .letter-vault-page {
            padding: 24px 32px 34px;
            max-width: 1380px;
            color: #1e293b;
          }
          .letter-title-row {
            display: flex;
            align-items: center;
            gap: 11px;
            margin: 8px 0 16px;
          }
          .letter-title-icon {
            width: 27px;
            height: 27px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid #e5edf7;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
            font-size: 11px;
          }
          .letter-instruction-panel {
            min-height: 92px;
            background: #fff;
            border: 1px solid #e5eaf1;
            border-radius: 13px;
            display: grid;
            grid-template-columns: 180px 1fr 230px;
            align-items: center;
            gap: 20px;
            padding: 18px 28px;
            margin-bottom: 26px;
          }
          .letter-back-button {
            width: 112px;
            min-height: 43px;
            border-radius: 24px;
            border: 1px solid #f7c760;
            background: #fff;
            color: #111827;
            font-size: 14px;
            cursor: pointer;
          }
          .letter-helper-copy {
            text-align: center;
            font-size: 14px;
            font-weight: 700;
            color: #111827;
          }
          .training-wrap {
            position: relative;
            justify-self: end;
          }
          .training-button {
            min-width: 195px;
            min-height: 45px;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            background: #fff;
            padding: 0 17px;
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            gap: 13px;
            color: #111827;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(15, 23, 42, 0.04);
          }
          .training-menu {
            position: absolute;
            top: 52px;
            right: 0;
            z-index: 5;
            width: 236px;
            padding: 8px;
            border: 1px solid #dbe4ef;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 14px 30px rgba(15, 23, 42, 0.15);
            display: grid;
            gap: 7px;
          }
          .training-menu button {
            text-align: left;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
            cursor: pointer;
          }
          .letter-original-surface {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
            padding: 16px;
          }
          .letter-tabs {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 4px;
            border-radius: 23px;
            background: #fff;
            margin-bottom: 15px;
          }
          .letter-tab {
            min-height: 44px;
            border: 0;
            border-radius: 23px;
            background: #fff;
            color: #111827;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            white-space: nowrap;
          }
          .letter-tab[aria-selected="true"] {
            background: #356bbb;
            color: #fff;
            font-weight: 800;
          }
          .letter-list-card {
            overflow: hidden;
            border-radius: 0 0 10px 10px;
            background: #fff;
          }
          .letter-group {
            margin-top: 0;
          }
          .letter-group + .letter-group {
            margin-top: 16px;
          }
          .letter-group-heading {
            margin: 0;
            padding: 10px 14px 4px;
            font-size: 22px;
            line-height: 1.15;
            font-weight: 800;
            color: #1f2937;
          }
          .letter-group-subheading {
            margin: 0;
            padding: 14px 14px 9px;
            font-size: 22px;
            line-height: 1.15;
            font-weight: 800;
            color: #1f2937;
          }
          .letter-row {
            min-height: 60px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 12px;
            padding: 0 17px 0 14px;
            border-bottom: 1px solid #edf2f7;
            color: #00a63d;
            font-size: 15px;
          }
          .letter-row:nth-child(odd) {
            background: #fbfcfe;
          }
          .letter-row:nth-child(even) {
            background: #f7f9fc;
          }
          .letter-row-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .letter-row-actions {
            display: inline-flex;
            align-items: center;
            gap: 13px;
          }
          .letter-tools-toggle {
            margin: 18px 0 0;
            display: flex;
            justify-content: flex-end;
          }
          .letter-tools {
            margin-top: 18px;
            display: grid;
            gap: 14px;
          }
          .tool-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            background: #fff;
          }
          .tool-card h2 {
            margin: 0 0 10px;
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
          }
          .tools-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 410px;
            gap: 20px;
          }
          @media (max-width: 900px) {
            .letter-vault-page {
              padding: 18px 14px 28px;
              max-width: none;
            }
            .letter-instruction-panel {
              grid-template-columns: 1fr;
              justify-items: center;
              gap: 10px;
              padding: 16px;
              margin-bottom: 24px;
            }
            .letter-helper-copy {
              max-width: 320px;
            }
            .training-wrap {
              justify-self: center;
            }
            .letter-original-surface {
              padding: 13px 10px;
            }
            .letter-tabs {
              display: flex;
              overflow-x: auto;
              padding-bottom: 4px;
              border-radius: 22px;
            }
            .letter-tab {
              flex: 0 0 176px;
              font-size: 12px;
            }
            .letter-group-heading,
            .letter-group-subheading {
              font-size: 20px;
            }
            .letter-row {
              min-height: 57px;
              grid-template-columns: minmax(120px, 1fr) auto;
              padding: 0 10px;
              font-size: 14px;
            }
            .letter-row-actions {
              gap: 8px;
            }
            .tools-grid {
              grid-template-columns: 1fr;
            }
          }
          @media (max-width: 430px) {
            .letter-row {
              grid-template-columns: minmax(0, 1fr) 104px;
              gap: 8px;
            }
            .letter-row-actions {
              gap: 4px;
            }
            .letter-row-actions button {
              width: 29px !important;
              height: 29px !important;
              min-width: 29px !important;
            }
          }
        `}</style>

        <div className="letter-title-row">
          <span className="letter-title-icon" aria-hidden="true">i</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#111827" }}>Letter Vault</h1>
        </div>

        <section className="letter-instruction-panel" aria-label="Letter Vault instructions">
          <button className="letter-back-button" type="button">BACK</button>
          <div className="letter-helper-copy">In this area, you can add and edit your letters.</div>
          <div className="training-wrap">
            <button className="training-button" type="button" aria-expanded={trainingOpen} onClick={() => setTrainingOpen((open) => !open)}>
              <span>Training Videos</span>
              <span aria-hidden="true">v</span>
            </button>
            {trainingOpen && (
              <div className="training-menu">
                <button type="button">Letter Vault Training Video</button>
                <button type="button">Move Letters Training Video</button>
              </div>
            )}
          </div>
        </section>

        {confirmation && (
          <section aria-label="Saved confirmation" style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 13, fontWeight: 700 }}>
            {confirmation}
          </section>
        )}

        <section className="letter-original-surface" aria-label="Letter Vault templates">
          <div className="letter-tabs" role="tablist" aria-label="Letter categories">
            {topTabs.map((tab) => (
              <button
                key={tab.category}
                className="letter-tab"
                role="tab"
                type="button"
                aria-selected={activeTab === tab.category}
                onClick={() => {
                  setActiveTab(tab.category);
                  setSearch("");
                  setConfirmation("");
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="letter-list-card" aria-label="Template list">
            {defaultGroups.map(([groupName, templates], groupIndex) => (
              <section className="letter-group" key={groupName} aria-label={groupName}>
                <h2 className="letter-group-heading">{groupName}</h2>
                {groupName === "Dispute Flow Letters" && <h3 className="letter-group-subheading">Pre-Step (Optional)</h3>}
                {templates.length === 0 ? (
                  <div className="letter-row">
                    <span className="letter-row-title">{groupName === "Manual Letters" ? "No manual letters saved." : "No letters available."}</span>
                  </div>
                ) : (
                  templates.slice(0, activeTab === "Credit Bureau Letters" && groupIndex === 1 ? 1 : templates.length).map((template) => (
                    <article className="letter-row" key={template.id}>
                      <span className="letter-row-title">{template.title}</span>
                      <span className="letter-row-actions">
                        <button type="button" aria-label={`View ${template.title}`} onClick={() => openDetails(template)} style={rowActionStyle("#00a63d")}>i</button>
                        <button type="button" aria-label={`Use ${template.title}`} onClick={() => openCreate(template)} style={rowActionStyle("#f97316")}>+</button>
                        <button type="button" aria-label={`Preview ${template.title}`} onClick={() => openDetails(template)} style={rowActionStyle("#2563eb")}>&gt;</button>
                      </span>
                    </article>
                  ))
                )}
              </section>
            ))}
          </div>
        </section>

        <div className="letter-tools-toggle">
          <button type="button" onClick={() => setToolsOpen((open) => !open)} style={buttonStyle("secondary")} aria-expanded={toolsOpen}>
            {toolsOpen ? "Close letter tools" : "Open letter tools"}
          </button>
        </div>

        {toolsOpen && (
          <div className="letter-tools">
            <section aria-label="Manual Letters" className="tool-card">
              <h2>Manual Letters</h2>
              <button onClick={openManual} style={buttonStyle("primary")}>Add Manual Letter</button>
              <button onClick={selectAllFiltered} style={{ ...buttonStyle(), marginLeft: 8 }}>Select All</button>
              <button onClick={deleteSelectedLetters} style={{ ...buttonStyle(), marginLeft: 8 }}>Delete All</button>
              <button onClick={moveSelectedLetters} style={{ ...buttonStyle(), marginLeft: 8 }}>Move Letters</button>
              <button style={{ ...buttonStyle(), marginLeft: 8 }}>Letter Preview</button>
              <button onClick={undoDeletedLetters} style={{ ...buttonStyle(), marginLeft: 8 }}>Undo Deleted Letters</button>
              <button onClick={moveSelectedLetters} style={{ ...buttonStyle(), marginLeft: 8 }}>Move Manual Letters</button>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 8, marginTop: 8, fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Move to Letter Category
                <select aria-label="Move to Letter Category" value={moveCategory} onChange={(event) => setMoveCategory(event.target.value)} style={{ ...fieldStyle, width: 190, padding: "7px 9px" }}>
                  {[...new Set([...categories, "Manual Letters"])].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </section>

            <section aria-label="Response Letters" className="tool-card">
              <h2>Response Letters</h2>
              <button style={buttonStyle()}>Respond Credit Bureau</button>
              <button style={{ ...buttonStyle(), marginLeft: 8 }}>Respond Creditor</button>
              <button style={{ ...buttonStyle(), marginLeft: 8 }}>Respond Collector</button>
            </section>

            <input
              aria-label="Search letter templates"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates by title, description, or category"
              style={{ ...fieldStyle, maxWidth: 520 }}
            />

            {editorOpen && (
              <section aria-label="Letter editor" className="tool-card">
                <h2>{editingId ? "Edit Letter" : "Create Letter From Template"}</h2>
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

            <div className="tools-grid">
              <section aria-label="Template list" className="tool-card">
                <h2>Templates</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map((template) => (
                    <article key={template.id} style={{ background: selectedTemplate.id === template.id ? "#eff6ff" : "#fff", border: `1px solid ${selectedTemplate.id === template.id ? "#93c5fd" : "#e2e8f0"}`, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <input
                            aria-label={`Select ${template.title}`}
                            checked={selectedTemplateIds.includes(template.id)}
                            onChange={() => toggleTemplateSelection(template.id)}
                            type="checkbox"
                            style={{ marginTop: 3 }}
                          />
                          <div>
                            <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 800, marginBottom: 3 }}>{template.category}</div>
                            <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#1e293b" }}>{template.title}</h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{template.description}</p>
                          </div>
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
                <section aria-label="Template details" className="tool-card" style={{ position: "sticky", top: 24, marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 800, marginBottom: 6 }}>{selectedTemplate.category}</div>
                  <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#1e293b" }}>{selectedTemplate.title}</h2>
                  <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 13 }}>{selectedTemplate.description}</p>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", fontSize: 12, lineHeight: 1.55, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, maxHeight: 360, overflow: "auto" }}>{selectedTemplate.body}</pre>
                  <button onClick={() => openCreate(selectedTemplate)} style={{ ...buttonStyle("primary"), width: "100%", marginTop: 12 }}>Create From This Template</button>
                </section>

                <section aria-label="Saved letters" className="tool-card">
                  <h2>Saved Letters</h2>
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
          </div>
        )}
      </main>
    </CDMLayout>
  );
}
