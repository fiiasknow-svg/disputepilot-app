"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FormKind = "website" | "affiliate";

type Settings = {
  formStyle?: string;
  required?: Record<string, boolean>;
  fields?: Record<string, boolean>;
  title?: string;
  company?: string;
  bgColor?: string;
  btnColor?: string;
  fontSize?: string;
  fontFamily?: string;
  btnText?: string;
};

const WEBSITE_SETTINGS_KEY = "disputepilot.websiteLeadForm.settings";
const AFFILIATE_SETTINGS_KEY = "disputepilot.affiliateWebsiteForm.settings";
const LOCAL_LEADS_KEY = "disputepilot.leads";
const LOCAL_ARCHIVED_LEAD_IDS_KEY = "disputepilot.leads.archivedIds";
const LOCAL_AUTO_ARCHIVE_KEY = "disputepilot.leads.autoArchiveWebsite";
const LOCAL_REFERRALS_KEY = "disputepilot.affiliateReferrals";

const DEFAULTS: Record<FormKind, Settings> = {
  website: {
    formStyle: "Website",
    required: { "First Name": true, "Last Name": true, Email: true },
    fields: { "First Name": true, "Last Name": true, Phone: true, Email: true, Comments: true },
    title: "Request a Free Consultation",
    company: "Local demo form",
    bgColor: "#1e3a5f",
    btnColor: "#3b82f6",
    fontSize: "14px",
    fontFamily: "Arial",
    btnText: "Submit",
  },
  affiliate: {
    formStyle: "Affiliate",
    required: { "First Name": true, "Last Name": true, Email: true },
    fields: { "First Name": true, "Last Name": true, Phone: true, Email: true, Comments: true, "Promotional Methods": true },
    title: "Affiliate Referral Form",
    company: "Local demo form",
    bgColor: "#0f172a",
    btnColor: "#10b981",
    fontSize: "14px",
    fontFamily: "Arial",
    btnText: "Submit Referral",
  },
};

const FIELD_NAMES = [
  "First Name",
  "Last Name",
  "Address",
  "City",
  "State",
  "Zip",
  "Zip Code",
  "Phone",
  "Email",
  "Email Id",
  "Phone (Mobile)",
  "Phone (Home)",
  "Phone (Work)",
  "Message",
  "How did you hear about us",
  "Promotional Methods",
  "Comments",
  "Comment",
];

function fieldKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function readArray(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeArray(key: string, rows: any[]) {
  window.localStorage.setItem(key, JSON.stringify(rows));
}

function styleConfig(style: string | undefined) {
  if (style === "Short Form") return { maxWidth: 420, columns: "1fr", padding: 20, note: "Compact single-column intake" };
  if (style === "Wide Form") return { maxWidth: 860, columns: "1fr 1fr", padding: 28, note: "Wide two-column intake" };
  if (style === "Affiliate") return { maxWidth: 680, columns: "1fr 1fr", padding: 28, note: "Referral partner submission" };
  return { maxWidth: 620, columns: "1fr", padding: 26, note: "Website branded intake" };
}

export default function PublicLocalForm({ kind }: { kind: FormKind }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS[kind]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const key = kind === "website" ? WEBSITE_SETTINGS_KEY : AFFILIATE_SETTINGS_KEY;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || "null");
      setSettings({ ...DEFAULTS[kind], ...(saved || {}) });
    } catch {
      setSettings(DEFAULTS[kind]);
    }
  }, [kind]);

  const visibleFields = useMemo(() => {
    const enabled = settings.fields || {};
    return FIELD_NAMES.filter(field => enabled[field]);
  }, [settings.fields]);

  const visual = styleConfig(settings.formStyle);
  const title = settings.title || DEFAULTS[kind].title || "";
  const buttonText = settings.btnText || DEFAULTS[kind].btnText || "Submit";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    const missing = visibleFields.filter(field => settings.required?.[field] && !values[fieldKey(field)]?.trim());
    if (missing.length) {
      setError(`Complete required fields: ${missing.join(", ")}.`);
      return;
    }

    const now = new Date().toISOString();
    const firstName = values.first_name || values.name || "";
    const lastName = values.last_name || "";
    const comments = values.comments || values.comment || values.message || "";
    const lead = {
      id: `${kind === "website" ? "local-public-website" : "local-public-affiliate"}-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      email: values.email || values.email_id || "",
      phone: values.phone || values.phone_mobile || values.phone_home || values.phone_work || "",
      address: values.address || "",
      city: values.city || "",
      state: values.state || "",
      zip: values.zip || values.zip_code || "",
      source: kind === "website" ? "Website" : "Affiliate",
      status: "new",
      notes: comments || (kind === "affiliate" ? "Submitted from public affiliate website form." : "Submitted from public website lead form."),
      tags: kind === "affiliate" ? "affiliate referral, public form" : "website, public form",
      created_at: now,
      updated_at: now,
    };

    await fetch(`/api/public-forms/${kind === "website" ? "website-lead-form" : "affiliate-website-form"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, lead }),
    }).catch(() => null);

    const leads = readArray(LOCAL_LEADS_KEY);
    writeArray(LOCAL_LEADS_KEY, [lead, ...leads]);

    let archived = false;
    if (kind === "website" && window.localStorage.getItem(LOCAL_AUTO_ARCHIVE_KEY) === "true") {
      const ids = new Set<string>(readArray(LOCAL_ARCHIVED_LEAD_IDS_KEY));
      ids.add(lead.id);
      writeArray(LOCAL_ARCHIVED_LEAD_IDS_KEY, [...ids]);
      archived = true;
    }

    if (kind === "affiliate") {
      const referrals = readArray(LOCAL_REFERRALS_KEY);
      writeArray(LOCAL_REFERRALS_KEY, [{ ...lead, referral_status: "Submitted" }, ...referrals]);
    }

    setValues({});
    setStatus(
      kind === "website"
        ? `Website lead submitted successfully${archived ? " and auto-archived locally" : ""}.`
        : "Affiliate referral submitted successfully and saved locally."
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: settings.fontFamily || "Arial" }}>
      <form onSubmit={submit} style={{ maxWidth: visual.maxWidth, margin: "0 auto", background: settings.bgColor, color: "#fff", borderRadius: 8, padding: visual.padding, boxShadow: "0 8px 24px rgba(15,23,42,0.16)" }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, color: "#ffffffb3", textTransform: "uppercase" }}>{visual.note}</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>{title}</h1>
        {settings.company && <p style={{ margin: "0 0 20px", color: "#ffffffe0", fontSize: 14 }}>{settings.company}</p>}
        <div style={{ display: "grid", gridTemplateColumns: visual.columns, gap: 12 }}>
          {visibleFields.filter(field => field !== "Comments" && field !== "Comment" && field !== "Message").map(field => {
            const key = fieldKey(field);
            return (
              <label key={field} style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#ffffffe0" }}>
                {field}{settings.required?.[field] ? " *" : ""}
                <input
                  aria-label={field}
                  value={values[key] || ""}
                  onChange={event => setValues(current => ({ ...current, [key]: event.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", borderRadius: 5, border: "1px solid #ffffff66", fontSize: settings.fontSize || "14px", boxSizing: "border-box" }}
                />
              </label>
            );
          })}
        </div>
        {visibleFields.some(field => ["Comments", "Comment", "Message"].includes(field)) && (
          <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 700, color: "#ffffffe0" }}>
            {kind === "affiliate" ? "Referral Notes" : "Comments"}
            <textarea
              aria-label={kind === "affiliate" ? "Referral Notes" : "Comments"}
              value={values.comments || ""}
              onChange={event => setValues(current => ({ ...current, comments: event.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 10px", borderRadius: 5, border: "1px solid #ffffff66", minHeight: 82, fontSize: settings.fontSize || "14px", boxSizing: "border-box", resize: "vertical" }}
            />
          </label>
        )}
        {error && <div role="alert" style={{ marginTop: 14, padding: "9px 10px", borderRadius: 6, background: "#fef2f2", color: "#991b1b", fontSize: 13, fontWeight: 700 }}>{error}</div>}
        {status && <div role="status" style={{ marginTop: 14, padding: "9px 10px", borderRadius: 6, background: "#ecfdf5", color: "#166534", fontSize: 13, fontWeight: 700 }}>{status}</div>}
        <button type="submit" style={{ marginTop: 16, padding: "10px 22px", background: settings.btnColor || "#3b82f6", color: "#fff", border: "none", borderRadius: 6, fontSize: settings.fontSize || "14px", fontWeight: 800, cursor: "pointer" }}>
          {buttonText}
        </button>
      </form>
    </main>
  );
}
