"use client";
import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const FORM_STYLES = ["Website", "Affiliate"];
const REQUIRED_FIELDS = ["First Name", "Last Name", "Phone", "Email"];
const FORM_FIELDS = ["First Name", "Last Name", "Address", "City", "State", "Zip", "Phone", "Email", "Comments"];
const EXTRA_FIELDS = ["Email Id", "Phone (Mobile)", "Phone (Home)", "Phone (Work)", "Message", "How did you hear about us"];
const FONT_SIZES = ["12px", "13px", "14px", "15px", "16px", "18px"];
const FONT_FAMILIES = ["Arial", "Georgia", "Verdana", "Helvetica", "Times New Roman"];
const COLORS = ["#1e3a5f", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#0f172a"];
const STORAGE_KEY = "disputepilot.websiteLeadForm.settings";

export default function Page() {
  const [formStyle, setFormStyle] = useState("Website");
  const [required, setRequired] = useState<Record<string, boolean>>({ "First Name": true, "Last Name": true, Email: true });
  const [fields, setFields] = useState<Record<string, boolean>>({ "First Name": true, "Last Name": true, Phone: true, Email: true, Comments: true });
  const [title, setTitle] = useState("Request a Free Consultation");
  const [company, setCompany] = useState("");
  const [bgColor, setBgColor] = useState("#1e3a5f");
  const [btnColor, setBtnColor] = useState("#3b82f6");
  const [fontSize, setFontSize] = useState("14px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [btnText, setBtnText] = useState("Submit");
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState("");
  const [published, setPublished] = useState(false);
  const [previewStatus, setPreviewStatus] = useState("");

  const toggleRequired = (f: string) => setRequired(p => ({ ...p, [f]: !p[f] }));
  const toggleField = (f: string) => setFields(p => ({ ...p, [f]: !p[f] }));
  const allFields = [...FORM_FIELDS, ...EXTRA_FIELDS];

  const settings = { formStyle, required, fields, title, company, bgColor, btnColor, fontSize, fontFamily, btnText };
  const embedSnippet = `<script src="/embed/website-lead-form.js" data-form="website-lead-form"></script>`;

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      setFormStyle(saved.formStyle || "Website");
      setRequired(saved.required || { "First Name": true, "Last Name": true, Email: true });
      setFields(saved.fields || { "First Name": true, "Last Name": true, Phone: true, Email: true, Comments: true });
      setTitle(saved.title || "Request a Free Consultation");
      setCompany(saved.company || "");
      setBgColor(saved.bgColor || "#1e3a5f");
      setBtnColor(saved.btnColor || "#3b82f6");
      setFontSize(saved.fontSize || "14px");
      setFontFamily(saved.fontFamily || "Arial");
      setBtnText(saved.btnText || "Submit");
      setPublished(!!saved.published);
    } catch {
      setStatus("Saved settings could not be loaded.");
    }
  }, []);

  function saveSettings(nextPublished = published) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, published: nextPublished, savedAt: new Date().toISOString() }));
  }

  function handleSave() {
    saveSettings();
    setStatus("Website lead form settings saved locally.");
  }

  function handlePublish() {
    saveSettings(true);
    setPublished(true);
    setStatus("Website lead form published locally. Embed snippet is ready.");
  }

  const sectionStyle = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" };
  const headerStyle = { padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 14, fontWeight: 700, color: "#1e293b" };
  const bodyStyle = { padding: 20 };
  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Website Lead Form</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowPreview(true)}
              style={{ padding: "9px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Preview</button>
            <button onClick={handlePublish} style={{ padding: "9px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Publish</button>
            <button onClick={handleSave} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save</button>
          </div>
        </div>
        {status && <div role="status" aria-live="polite" style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 700 }}>{status}</div>}
        {published && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>Published embed</div>
            <code style={{ display: "block", whiteSpace: "normal", overflowWrap: "anywhere", fontSize: 12, color: "#475569" }}>{embedSnippet}</code>
            <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>Public URL placeholder: /public/forms/website-lead-form</div>
          </div>
        )}

        {/* Section 1: Form Style */}
        <div style={sectionStyle}>
          <div style={headerStyle}>1. Select Form Style</div>
          <div style={{ ...bodyStyle, display: "flex", gap: 16 }}>
            {["Short Form", "Wide Form", ...FORM_STYLES].map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 20px", border: `2px solid ${formStyle === s ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 8, background: formStyle === s ? "#eff6ff" : "#fff" }}>
                <input type="radio" checked={formStyle === s} onChange={() => setFormStyle(s)} style={{ accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, fontWeight: formStyle === s ? 700 : 500, color: formStyle === s ? "#1e3a5f" : "#374151" }}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Required Fields */}
        <div style={sectionStyle}>
          <div style={headerStyle}>2. Required Fields</div>
          <p style={{ ...bodyStyle, paddingBottom: 0, margin: 0, color: "#64748b", fontSize: 13 }}>Required/Hide Fields - select the fields you want required or hidden.</p>
          <div style={{ ...bodyStyle, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 13, color: "#475569" }}>Required</strong>
            <strong style={{ fontSize: 13, color: "#475569" }}>Hide</strong>
            {REQUIRED_FIELDS.map(f => (
              <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!required[f]} onChange={() => toggleRequired(f)} style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b" }}>{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 3: Title & Company */}
        <div style={sectionStyle}>
          <div style={headerStyle}>3. Form Title / Company Name Settings</div>
          <div style={{ ...bodyStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Form Title</label>
              <input aria-label="Form Title" value={title} onChange={e => setTitle(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Custom Subtitle</label>
              <input aria-label="Custom Subtitle" value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company name" style={inp} />
            </div>
          </div>
        </div>

        {/* Section 4: Form Fields */}
        <div style={sectionStyle}>
          <div style={headerStyle}>4. Form Fields</div>
          <div style={{ ...bodyStyle, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {allFields.map(f => (
              <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 140 }}>
                <input type="checkbox" checked={!!fields[f]} onChange={() => toggleField(f)} style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b" }}>{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 5: Design Settings */}
        <div style={sectionStyle}>
          <div style={headerStyle}>5. Design Settings</div>
          <div style={{ ...bodyStyle }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Background Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setBgColor(c)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: bgColor === c ? "3px solid #1e293b" : "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Button Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setBtnColor(c)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: btnColor === c ? "3px solid #1e293b" : "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Design Settings 2 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>6. Design Settings 2</div>
          <div style={{ ...bodyStyle, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Font Size</label>
              <select value={fontSize} onChange={e => setFontSize(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Font Family</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Button Text</label>
              <input aria-label="Button Text" value={btnText} onChange={e => setBtnText(e.target.value)} style={inp} />
            </div>
          </div>
        </div>

        {/* Section 7: Preview */}
        <div style={sectionStyle}>
          <div style={headerStyle}>7. Form Preview</div>
          <div style={bodyStyle}>
            <div style={{ background: bgColor, borderRadius: 10, padding: 28, maxWidth: 480 }}>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 20px", fontFamily }}>{title || "Lead Form"}</h2>
              {company && <p style={{ color: "#ffffff99", fontSize: 13, margin: "0 0 16px" }}>{company}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {allFields.filter(f => fields[f] && f !== "Comments").map(f => (
                  <div key={f}>
                    <label style={{ display: "block", fontSize: 12, color: "#ffffff99", marginBottom: 4, fontFamily }}>{f}{required[f] ? " *" : ""}</label>
                    <input disabled placeholder={f} style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "none", fontSize, fontFamily, boxSizing: "border-box" as const, opacity: 0.9 }} />
                  </div>
                ))}
              </div>
              {fields["Comments"] && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#ffffff99", marginBottom: 4 }}>Comments</label>
                  <textarea disabled placeholder="Comments" style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "none", fontSize, fontFamily, minHeight: 60, boxSizing: "border-box" as const, opacity: 0.9, resize: "none" }} />
                </div>
              )}
              <button disabled style={{ padding: "10px 24px", background: btnColor, color: "#fff", border: "none", borderRadius: 6, fontSize, fontFamily, fontWeight: 700, cursor: "default" }}>{btnText}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Form Preview</h2>
              <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>x</button>
            </div>
            <div style={{ background: bgColor, borderRadius: 10, padding: 28 }}>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 20px", fontFamily }}>{title}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {allFields.filter(f => fields[f] && f !== "Comments").map(f => (
                  <div key={f}>
                    <label style={{ display: "block", fontSize: 12, color: "#ffffff99", marginBottom: 4 }}>{f}{required[f] ? " *" : ""}</label>
                    <input placeholder={f} style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "none", fontSize, fontFamily, boxSizing: "border-box" as const }} />
                  </div>
                ))}
              </div>
              {fields["Comments"] && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#ffffff99", marginBottom: 4 }}>Comments</label>
                  <textarea placeholder="Comments" style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "none", fontSize, fontFamily, minHeight: 60, boxSizing: "border-box" as const, resize: "none" }} />
                </div>
              )}
              {previewStatus && <div role="status" style={{ background: "#ffffff22", border: "1px solid #ffffff55", color: "#fff", borderRadius: 6, padding: "8px 10px", marginBottom: 12, fontSize: 13, fontWeight: 700 }}>{previewStatus}</div>}
              <button type="button" onClick={() => setPreviewStatus("Preview submission captured locally. No lead was created from preview mode.")} style={{ padding: "10px 24px", background: btnColor, color: "#fff", border: "none", borderRadius: 6, fontSize, fontFamily, fontWeight: 700, cursor: "pointer" }}>{btnText}</button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
