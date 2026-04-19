"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const STEPS = ["Welcome", "Terms of Use", "Billing Setup", "Design Center", "About You", "Select a Plan", "Agreement", "Credit Monitoring", "Finish", "Embed Code"];

export default function Page() {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bgColor, setBgColor] = useState("#1e3a5f");
  const [embedCopied, setEmbedCopied] = useState(false);

  const embedCode = `<iframe src="https://portal.disputepilot.com/signup?company=${encodeURIComponent(companyName)}" width="100%" height="600" frameborder="0"></iframe>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }

  const inp = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const };
  const COLORS = ["#1e3a5f", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>Welcome to Self-Service Signup</h2>
            <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 32px" }}>
              This wizard will guide you through setting up your client self-service signup portal. Clients can register, choose a plan, sign agreements, and set up credit monitoring — all without your involvement.
            </p>
            <button onClick={() => setStep(1)}
              style={{ padding: "12px 36px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Get Started
            </button>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>Terms of Use</h2>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, height: 260, overflowY: "auto", fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              <p><strong>Credit Repair Organizations Act (CROA) Compliance</strong></p>
              <p>By using this platform you agree to comply with all applicable federal and state laws governing credit repair services, including but not limited to the Credit Repair Organizations Act (15 U.S.C. 1679 et seq.) and the Fair Credit Reporting Act.</p>
              <p>You agree not to make any false, misleading, or deceptive representations to consumers about the services you provide. You understand that results are not guaranteed and vary by individual.</p>
              <p>You agree to maintain accurate records of all dispute correspondence and client agreements for a minimum of 5 years. You agree to provide all required disclosures to clients before accepting payment.</p>
              <p>This platform is provided as a tool to facilitate credit repair operations. All legal compliance obligations remain the responsibility of the business operator.</p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
              <span style={{ fontSize: 14, color: "#1e293b" }}>I have read and agree to the Terms of Use</span>
            </label>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#1e293b" }}>Billing Setup</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Connect your payment processor to accept payments through the signup portal.</p>
            {[["Stripe API Key", "sk_live_…"], ["Stripe Publishable Key", "pk_live_…"], ["Webhook Secret", "whsec_…"]].map(([label, ph]) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{label}</label>
                <input placeholder={ph} style={inp} />
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#1e293b" }}>Design Center</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Company Name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Company" style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Contact Email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="info@company.com" style={inp} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Brand Color</label>
              <div style={{ display: "flex", gap: 10 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setBgColor(c)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: bgColor === c ? "3px solid #1e293b" : "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#1e293b" }}>About You</h2>
            {[["Business Legal Name", ""], ["Business Address", ""], ["Phone Number", ""], ["State of Operation", ""], ["License Number (if applicable)", ""]].map(([label, ph]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{label}</label>
                <input placeholder={ph} style={inp} />
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#1e293b" }}>Select a Plan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { name: "Starter", price: "$97/mo", features: ["Up to 25 clients", "Basic disputes", "Email support"] },
                { name: "Professional", price: "$197/mo", features: ["Up to 100 clients", "AI letters", "Priority support", "Client portal"] },
                { name: "Agency", price: "$397/mo", features: ["Unlimited clients", "All features", "White label", "Dedicated support"] },
              ].map(p => (
                <div key={p.name} onClick={() => setPlan(p.name)}
                  style={{ border: `2px solid ${plan === p.name ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 10, padding: 20, cursor: "pointer", background: plan === p.name ? "#eff6ff" : "#fff" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#1e293b" }}>{p.name}</h3>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f", margin: "0 0 14px" }}>{p.price}</p>
                  {p.features.map(f => <p key={f} style={{ fontSize: 13, color: "#475569", margin: "0 0 4px" }}>- {f}</p>)}
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>Service Agreement</h2>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, height: 220, overflowY: "auto", fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              <p><strong>Service Agreement</strong></p>
              <p>This agreement is between the credit repair company ("Provider") and the client ("Client"). Provider agrees to perform credit dispute services as outlined. Client agrees to provide accurate information and timely documentation. Services are provided month-to-month. Either party may cancel with 30 days written notice.</p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
              <span style={{ fontSize: 14, color: "#1e293b" }}>I agree to the Service Agreement</span>
            </label>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>Credit Monitoring Setup</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Select which credit monitoring service to offer clients during signup.</p>
            {["SmartCredit", "MyFreeScore360", "IdentityIQ"].map(name => (
              <label key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#1e3a5f" }} />
                <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 500 }}>{name}</span>
              </label>
            ))}
          </div>
        );
      case 8:
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>Setup Complete!</h2>
            <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 28px" }}>
              Your self-service signup portal is configured. Proceed to the next step to get your embed code.
            </p>
          </div>
        );
      case 9:
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>Embed Code</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>Paste this code into your website to display the signup form.</p>
            <div style={{ background: "#0f172a", borderRadius: 8, padding: 20, marginBottom: 16, position: "relative" }}>
              <pre style={{ color: "#7dd3fc", fontSize: 12, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" as const }}>{embedCode}</pre>
            </div>
            <button onClick={copyEmbed}
              style={{ padding: "10px 24px", background: embedCopied ? "#10b981" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {embedCopied ? "Copied!" : "Copy Embed Code"}
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 860 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "#1e293b" }}>Self-Service Signup</h1>

        {/* Step tabs */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              style={{ padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: step === i ? 700 : 500, color: step === i ? "#1e3a5f" : i < step ? "#10b981" : "#94a3b8", borderBottom: step === i ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 32, minHeight: 340 }}>
          {renderStep()}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ padding: "10px 24px", background: step === 0 ? "#f1f5f9" : "#f1f5f9", color: step === 0 ? "#cbd5e1" : "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: step === 0 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}>
            Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              style={{ padding: "10px 28px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              Next
            </button>
          ) : (
            <button style={{ padding: "10px 28px", background: "#10b981", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              Finish
            </button>
          )}
        </div>
      </div>
    </CDMLayout>
  );
}
