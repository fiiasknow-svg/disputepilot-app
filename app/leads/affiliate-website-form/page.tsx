"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const FORM_STYLES = ["Website", "Affiliate"];
const REQUIRED_FIELDS = ["First Name", "Last Name", "Phone", "Email"];
const FORM_FIELDS = ["First Name", "Last Name", "Address", "City", "State", "Zip", "Phone", "Email", "Comments"];
const FONT_SIZES = ["12px", "13px", "14px", "15px", "16px", "18px"];
const FONT_FAMILIES = ["Arial", "Georgia", "Verdana", "Helvetica", "Times New Roman"];
const COLORS = ["#1e3a5f", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#0f172a"];

export default function Page() {
  const [formStyle, setFormStyle] = useState("Affiliate");
  const [required, setRequired] = useState<Record<string, boolean>>({ "First Name": true, "Last Name": true, Email: true });
  const [fields, setFields] = useState<Record<string, boolean>>({ "First Name": true, "Last Name": true, Phone: true, Email: true, Comments: true });
  const [title, setTitle] = useState("Affiliate Referral Form");
  const [company, setCompany] = useState("");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [btnColor, setBtnColor] = useState("#10b981");
  const [fontSize, setFontSize] = useState("14px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [btnText, setBtnText] = useState("Submit Referral");
  const [showPreview, setShowPreview] = useState(false);

  const toggleRequired = (f: string) => setRequired(p => ({ ...p, [f]: !p[f] }));
  const toggleField = (f: string) => setFields(p => ({ ...p, [f]: !p[f] }));

  const sectionStyle = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" };
  const headerStyle = { padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 14, fontWeight: 700, color: "#1e293b" };
  const bodyStyle = { padding: 20 };
  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Affiliate Website Form</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowPreview(true)}
              style={{ padding: "9px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Preview</button>
            <button style={{ padding: "9px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Publish</button>
            <button style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save</button>
          </div>
        </div>

        {/* Section 1 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>1. Select Form Style</div>
          <div style={{ ...bodyStyle, display: "flex", gap: 16 }}>
            {FORM_STYLES.map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 20px", border: `2px solid ${formStyle === s ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 8, background: formStyle === s ? "#eff6ff" : "#fff" }}>
                <input type="radio" checked={formStyle === s} onChange={() => setFormStyle(s)} style={{ accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, fontWeight: formStyle === s ? 700 : 500, color: formStyle === s ? "#1e3a5f" : "#374151" }}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>2. Required Fields</div>
          <div style={{ ...bodyStyle, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {REQUIRED_FIELDS.map(f => (
              <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!required[f]} onChange={() => toggleRequired(f)} style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b" }}>{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>3. Form Title / Company Name Settings</div>
          <div style={{ ...bodyStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Form Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Company Name</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company name" style={inp} />
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>4. Form Fields</div>
          <div style={{ ...bodyStyle, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {FORM_FIELDS.map(f => (
              <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 140 }}>
                <input type="checkbox" checked={!!fields[f]} onChange={() => toggleField(f)} style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b" }}>{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 5 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>5. Design Settings</div>
          <div style={bodyStyle}>
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

        {/* Section 6 */}
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
              <input value={btnText} onChange={e => setBtnText(e.target.value)} style={inp} />
            </div>
          </div>
        </div>

        {/* Section 7 */}
        <div style={sectionStyle}>
          <div style={headerStyle}>7. Form Preview</div>
          <div style={bodyStyle}>
            <div style={{ background: bgColor, borderRadius: 10, padding: 28, maxWidth: 480 }}>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 20px", fontFamily }}>{title || "Affiliate Form"}</h2>
              {company && <p style={{ color: "#ffffff99", fontSize: 13, margin: "0 0 16px" }}>{company}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {FORM_FIELDS.filter(f => fields[f] && f !== "Comments").map(f => (
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
                {FORM_FIELDS.filter(f => fields[f] && f !== "Comments").map(f => (
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
              <button style={{ padding: "10px 24px", background: btnColor, color: "#fff", border: "none", borderRadius: 6, fontSize, fontFamily, fontWeight: 700, cursor: "pointer" }}>{btnText}</button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
