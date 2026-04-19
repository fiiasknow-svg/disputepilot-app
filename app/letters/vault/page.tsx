"use client";
import { useState, useEffect, useRef } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const TYPE_C: Record<string, string> = {
  dispute: "#8b5cf6",
  campaign: "#3b82f6",
  template: "#10b981",
  metro2: "#f59e0b",
};

const SEED_LETTERS = [
  {
    title: "Standard Dispute Letter – Equifax",
    type: "dispute",
    bureau: "equifax",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

Equifax Information Services LLC
PO Box 740256
Atlanta, GA 30374

Re: Formal Dispute of Inaccurate Information
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to formally dispute the following inaccurate information appearing on my Equifax credit report. Pursuant to the Fair Credit Reporting Act (FCRA), Section 611, I have the right to dispute incomplete or inaccurate information.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Reason for Dispute: [DISPUTE_REASON]

This information is inaccurate and I am requesting that it be investigated and removed from my credit report. Please provide me with the results of your investigation in writing within 30 days as required by the FCRA.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Standard Dispute Letter – Experian",
    type: "dispute",
    bureau: "experian",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

Experian National Consumer Assistance Center
PO Box 4500
Allen, TX 75013

Re: Formal Dispute of Inaccurate Information
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to dispute the following inaccurate information on my Experian credit report under the Fair Credit Reporting Act (FCRA), Section 611.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Reason for Dispute: [DISPUTE_REASON]

I request that you investigate this item and delete it from my credit report if it cannot be verified. Please send written results of your investigation within 30 days.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Standard Dispute Letter – TransUnion",
    type: "dispute",
    bureau: "transunion",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

TransUnion Consumer Solutions
PO Box 2000
Chester, PA 19016

Re: Formal Dispute of Inaccurate Information
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing pursuant to the Fair Credit Reporting Act (FCRA), Section 611, to dispute the following inaccurate information on my TransUnion credit report.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Reason for Dispute: [DISPUTE_REASON]

Please investigate and remove this item if it cannot be verified within 30 days as required by federal law.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Method of Verification Request – Equifax",
    type: "dispute",
    bureau: "equifax",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

Equifax Information Services LLC
PO Box 740256
Atlanta, GA 30374

Re: Method of Verification Request – FCRA Section 611(a)(7)
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

Pursuant to the Fair Credit Reporting Act Section 611(a)(7), I am requesting a description of the procedure used to determine the accuracy and completeness of the disputed information, including the business name, address, and telephone number of any furnisher of information contacted.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]

I previously disputed this item and was told it was verified. I am now exercising my right to know how this was verified. Please provide this information within 15 days.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Method of Verification Request – Experian",
    type: "dispute",
    bureau: "experian",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

Experian National Consumer Assistance Center
PO Box 4500
Allen, TX 75013

Re: Method of Verification Request – FCRA Section 611(a)(7)
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

Pursuant to FCRA Section 611(a)(7), I request the method of verification used to confirm the accuracy of the following account on my Experian report.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]

Please provide the name, address, and phone number of every furnisher contacted and explain how verification was performed. This information is required within 15 days under federal law.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Method of Verification Request – TransUnion",
    type: "dispute",
    bureau: "transunion",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

TransUnion Consumer Solutions
PO Box 2000
Chester, PA 19016

Re: Method of Verification Request – FCRA Section 611(a)(7)
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

Under FCRA Section 611(a)(7), I am requesting the specific procedure used to verify the following item on my TransUnion credit report, including contact information for any furnisher used.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]

Please respond within 15 days as required by law.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Goodwill Deletion Request",
    type: "campaign",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[CREDITOR_NAME]
[CREDITOR_ADDRESS]

Re: Goodwill Deletion Request – Account [ACCOUNT_NUMBER]

Dear [CREDITOR_NAME] Customer Relations Team,

I am writing to humbly request a goodwill deletion of a late payment notation on my credit report. I have been a customer since [START_DATE] and have otherwise maintained a positive payment history with your company.

The late payment in question occurred on [LATE_DATE] due to [HARDSHIP_REASON]. I immediately brought the account current and have not missed a payment since.

I understand that the information reported is accurate, and I am not disputing it. I am simply requesting your goodwill consideration to remove this negative mark. Doing so would have a significant positive impact on my financial life.

Thank you sincerely for your time and consideration.

Respectfully,
[CLIENT_NAME]`,
  },
  {
    title: "Debt Validation Letter",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[COLLECTION_AGENCY_NAME]
[COLLECTION_AGENCY_ADDRESS]

Re: Debt Validation Request – Account [ACCOUNT_NUMBER]
FDCPA Section 809(b) Notice

To Whom It May Concern:

I am writing in response to your recent communication regarding the above-referenced account. I hereby formally request validation of this debt as permitted under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

Please provide:
1. The full name and address of the original creditor
2. The original account number
3. A copy of the original signed agreement or contract
4. Complete payment history showing how the amount was calculated
5. Proof that your agency is licensed to collect debts in [CLIENT_STATE]

Until this debt is validated, please cease all collection activity. Do not report this account to any credit bureau without first providing the requested validation.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Medical Debt HIPAA Dispute",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[COLLECTION_AGENCY_NAME]
[COLLECTION_AGENCY_ADDRESS]

Re: HIPAA Dispute – Medical Debt Account [ACCOUNT_NUMBER]

To Whom It May Concern:

I am writing to dispute the medical debt you are reporting on my credit file. Under the Health Insurance Portability and Accountability Act (HIPAA), the disclosure of my protected health information to third-party debt collectors is restricted without my explicit written authorization.

I have not authorized the release of my medical records or billing information to your agency or any credit reporting bureau. Reporting this medical debt without proper HIPAA authorization is a violation of federal law.

I request that you immediately cease reporting this account to all credit bureaus and provide documentation showing a valid HIPAA authorization signed by me. If you cannot provide this, please delete this account from all credit reports immediately.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Collections Account Dispute",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Dispute of Collection Account – [ACCOUNT_NAME]
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am disputing the following collection account appearing on my credit report. This account is inaccurate and/or unverifiable.

Collection Agency: [COLLECTION_AGENCY_NAME]
Original Creditor: [ORIGINAL_CREDITOR]
Account Number: [ACCOUNT_NUMBER]
Amount Reported: $[AMOUNT]
Reason for Dispute: [DISPUTE_REASON]

Under the FCRA Section 611, I request a full investigation of this item. If the information cannot be verified with the original creditor within 30 days, it must be deleted from my credit report.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Identity Theft – Account Not Mine",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Identity Theft Dispute – Fraudulent Account
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to notify you that I am a victim of identity theft. The following account appearing on my credit report was opened fraudulently without my knowledge or consent.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Date Opened: [OPEN_DATE]

I have filed a police report (Report #[POLICE_REPORT_NUMBER]) and an FTC Identity Theft Report (Confirmation #[FTC_CONFIRMATION]). Enclosed are copies of both reports along with a copy of my government-issued ID.

Under the FCRA Section 605B, I am requesting that this fraudulent account be blocked from my credit report immediately.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Charge-Off Account Dispute",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Dispute of Charge-Off Account
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to dispute the charge-off account listed below on my credit report. The reporting of this item contains inaccuracies that violate the Fair Credit Reporting Act.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Charge-Off Date: [CHARGE_OFF_DATE]
Amount: $[AMOUNT]
Reason for Dispute: [DISPUTE_REASON]

Specifically, the balance, dates, and/or payment history associated with this charge-off are being reported inaccurately. Please investigate and correct or remove this entry within 30 days.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Hard Inquiry Removal Request",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Unauthorized Hard Inquiry Removal Request
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to dispute an unauthorized hard inquiry on my credit report. I did not authorize the following company to access my credit file.

Inquiring Company: [COMPANY_NAME]
Inquiry Date: [INQUIRY_DATE]

Under the Fair Credit Reporting Act, a hard inquiry may only be placed with a permissible purpose and my written authorization. I did not apply for credit with this company and have no record of authorizing this pull.

Please remove this unauthorized inquiry immediately and send written confirmation of its deletion.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "FCRA Section 611 Reinvestigation Demand",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Demand for Proper Reinvestigation – FCRA § 611
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I previously submitted a dispute regarding the account listed below and was informed it was "verified." I have reason to believe this verification was conducted improperly or through an automated process that does not constitute a genuine reinvestigation as required under FCRA Section 611.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]

I am formally demanding a proper reinvestigation that includes direct contact with the furnisher and examination of original source documents. If a legitimate reinvestigation cannot be completed within 30 days, this item must be deleted per FCRA requirements.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Pay-for-Delete Offer Letter",
    type: "campaign",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[COLLECTION_AGENCY_NAME]
[COLLECTION_AGENCY_ADDRESS]

Re: Settlement and Pay-for-Delete Offer – Account [ACCOUNT_NUMBER]

To Whom It May Concern:

I am writing to propose a settlement on the above-referenced account. While I do not acknowledge this debt as valid, I am willing to resolve this matter in exchange for the complete deletion of this account from all three major credit bureaus (Equifax, Experian, and TransUnion).

My offer: I will pay $[SETTLEMENT_AMOUNT] (representing [SETTLEMENT_PERCENT]% of the alleged balance of $[FULL_BALANCE]) in full satisfaction of this account, provided you agree in writing to delete all references to this account from my credit file within 30 days of payment.

Please respond in writing with your acceptance before [RESPONSE_DEADLINE]. This offer expires on that date.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "FCRA Section 623 Creditor Direct Dispute",
    type: "dispute",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[CREDITOR_NAME]
[CREDITOR_ADDRESS]

Re: Direct Dispute Under FCRA Section 623
Account Number: [ACCOUNT_NUMBER]

To Whom It May Concern:

Under the Fair Credit Reporting Act Section 623(a)(8), I am submitting a direct dispute to you as the furnisher of the following credit information I believe to be inaccurate.

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Inaccurate Information: [DISPUTE_REASON]

As a furnisher of information, you are required under FCRA § 623(b) to investigate this dispute and correct, update, or delete any inaccurate information within 30 days. Please provide written confirmation of the outcome of your investigation.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Bankruptcy Notation Dispute",
    type: "metro2",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Dispute of Bankruptcy Public Record Notation
SSN (Last 4): [LAST_4_SSN]
Case Number: [BANKRUPTCY_CASE_NUMBER]

To Whom It May Concern:

I am disputing the accuracy of a bankruptcy notation on my credit report. The information reported does not accurately reflect the details of my bankruptcy case.

Specifically:
- Discharge Date: [DISCHARGE_DATE] (Reported incorrectly as [INCORRECT_DATE])
- Chapter: [BANKRUPTCY_CHAPTER]
- Accounts Included: [DISCREPANCY_DESCRIPTION]

Pursuant to the FCRA, a bankruptcy notation must accurately reflect the type, status, and date of the proceeding. Please correct this information or remove it if it cannot be verified through the official court record.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Metro2 Compliance Dispute",
    type: "metro2",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[BUREAU_NAME]
[BUREAU_ADDRESS]

Re: Metro2 Format Compliance Dispute
SSN (Last 4): [LAST_4_SSN]

To Whom It May Concern:

I am writing to dispute the following account on the basis that it is not being reported in compliance with the Metro2 credit reporting format standards established by the Consumer Data Industry Association (CDIA).

Account Name: [ACCOUNT_NAME]
Account Number: [ACCOUNT_NUMBER]
Metro2 Compliance Issue: [COMPLIANCE_ISSUE]

Specifically, the account status code, payment rating, and/or compliance condition codes are inconsistent with Metro2 reporting guidelines. Under the FCRA, all information must be reported with maximum possible accuracy. Non-compliant reporting fails this standard and must be corrected or deleted.

Please investigate and correct this account's reporting within 30 days.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Cease and Desist Letter to Collector",
    type: "campaign",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[COLLECTION_AGENCY_NAME]
[COLLECTION_AGENCY_ADDRESS]

Re: CEASE AND DESIST All Communication – Account [ACCOUNT_NUMBER]
FDCPA Section 805(c) Notice

To Whom It May Concern:

Pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692c(c), I am formally demanding that you and all agents of your organization IMMEDIATELY CEASE AND DESIST all communication with me regarding the above-referenced account.

This includes but is not limited to: phone calls, letters, emails, text messages, and any other form of communication — whether to me, my family members, my employer, or any third party.

Any further contact after receipt of this letter will be considered a willful violation of the FDCPA, subjecting your agency to statutory damages of up to $1,000 per violation plus attorney fees.

Sincerely,
[CLIENT_NAME]`,
  },
  {
    title: "Late Payment Removal – Goodwill (Campaign)",
    type: "campaign",
    bureau: "",
    uses_count: 0,
    content: `[CLIENT_NAME]
[CLIENT_ADDRESS]
[CITY], [STATE] [ZIP]
[DATE]

[CREDITOR_NAME] Customer Service
[CREDITOR_ADDRESS]

Re: Goodwill Request – Late Payment Removal
Account Number: [ACCOUNT_NUMBER]

Dear [CREDITOR_NAME] Team,

I am reaching out to request the removal of a late payment notation from my credit report for the account referenced above. The late payment occurred on [LATE_DATE] when [HARDSHIP_REASON — e.g., I was temporarily unemployed / dealing with a medical emergency].

Since that time, I have maintained a perfect payment record with your company and remain a loyal customer. This single mark is significantly impacting my ability to [GOAL — e.g., purchase a home / qualify for a business loan].

I understand this is a goodwill request and that you are not obligated to grant it. However, I respectfully ask that you consider my overall payment history and the circumstances that led to this isolated incident.

Please confirm your decision in writing. I appreciate your time and compassion.

With gratitude,
[CLIENT_NAME]`,
  },
];

type SortOption = "date" | "az" | "type";

function tabFilter(tab: string, l: any) {
  if (tab === "Campaign Letters") return l.type === "campaign";
  if (tab === "Dispute Flow Letters") return l.type === "dispute" || l.type === "metro2";
  return true;
}

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" };

export default function Page() {
  const [tab, setTab] = useState("All Letters");
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("date");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "template", bureau: "" });
  const [saving, setSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [usages, setUsages] = useState<Record<string, number>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("letters").select("*").order("created_at", { ascending: false });
    const rows = data || [];
    if (rows.length === 0) {
      setSeeding(true);
      await supabase.from("letters").insert(SEED_LETTERS);
      const { data: seeded } = await supabase.from("letters").select("*").order("created_at", { ascending: false });
      const seedRows = seeded || [];
      setLetters(seedRows);
      const u: Record<string, number> = {};
      for (const l of seedRows) u[l.id] = l.uses_count || 0;
      setUsages(u);
      setSeeding(false);
    } else {
      setLetters(rows);
      const u: Record<string, number> = {};
      for (const l of rows) u[l.id] = l.uses_count || 0;
      setUsages(u);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveNew() {
    if (!form.title || !form.content) return;
    setSaving(true);
    await supabase.from("letters").insert([{ ...form, uses_count: 0 }]);
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", content: "", type: "template", bureau: "" });
    load();
  }

  async function saveEdit() {
    if (!editing || !form.title || !form.content) return;
    setSaving(true);
    await supabase.from("letters").update({ title: form.title, content: form.content, type: form.type, bureau: form.bureau }).eq("id", editing.id);
    setSaving(false);
    setEditing(null);
    setForm({ title: "", content: "", type: "template", bureau: "" });
    load();
  }

  function openEdit(letter: any) {
    setEditing(letter);
    setForm({ title: letter.title, content: letter.content, type: letter.type, bureau: letter.bureau || "" });
  }

  async function del(id: string) {
    await supabase.from("letters").delete().eq("id", id);
    setLetters(l => l.filter(x => x.id !== id));
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    const ids = Array.from(selected);
    await supabase.from("letters").delete().in("id", ids);
    setLetters(l => l.filter(x => !selected.has(x.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  }

  async function copyLetter(letter: any) {
    navigator.clipboard.writeText(letter.content);
    setCopied(letter.id);
    setTimeout(() => setCopied(null), 2000);
    const newCount = (usages[letter.id] || 0) + 1;
    setUsages(u => ({ ...u, [letter.id]: newCount }));
    await supabase.from("letters").update({ uses_count: newCount }).eq("id", letter.id);
  }

  async function importLetters() {
    let parsed: any[] = [];
    try {
      const text = importText.trim();
      if (text) parsed = JSON.parse(text);
    } catch {
      alert("Invalid JSON. Please paste valid letter JSON.");
      return;
    }
    if (!parsed.length) return;
    setSaving(true);
    await supabase.from("letters").insert(parsed.map((l: any) => ({ title: l.title || "Imported Letter", content: l.content || "", type: l.type || "template", bureau: l.bureau || "", uses_count: 0 })));
    setSaving(false);
    setShowImport(false);
    setImportText("");
    load();
  }

  function toggleSelect(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l.id)));
    }
  }

  const TABS = ["All Letters", "Campaign Letters", "Dispute Flow Letters"];

  const tabCount = (t: string) => letters.filter(l => tabFilter(t, l)).length;

  const filtered = letters
    .filter(l => tabFilter(tab, l))
    .filter(l => typeFilter === "all" || l.type === typeFilter)
    .filter(l => {
      if (!search) return true;
      return l.title?.toLowerCase().includes(search.toLowerCase()) || l.content?.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "az") return (a.title || "").localeCompare(b.title || "");
      if (sort === "type") return (a.type || "").localeCompare(b.type || "");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Letter Vault</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowImport(true)}
              style={{ background: "#fff", color: "#1e3a5f", border: "1px solid #e2e8f0", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              ↑ Import Letters
            </button>
            <button onClick={() => { setEditing(null); setForm({ title: "", content: "", type: "template", bureau: "" }); setShowForm(true); }}
              style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              + New Letter
            </button>
          </div>
        </div>

        {/* Tabs with count badges */}
        <div style={{ display: "flex", gap: 2, marginBottom: 0, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(new Set()); }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14, whiteSpace: "nowrap" as const }}>
              {t}
              <span style={{ background: tab === t ? "#1e3a5f22" : "#f1f5f9", color: tab === t ? "#1e3a5f" : "#94a3b8", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                {tabCount(t)}
              </span>
            </button>
          ))}
        </div>

        {/* Filter / Sort / Bulk toolbar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 0 14px", flexWrap: "wrap" as const }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search letters…"
            style={{ flex: 1, minWidth: 180, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, outline: "none" }} />

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", color: "#1e293b" }}>
            <option value="all">All Types</option>
            <option value="dispute">Dispute</option>
            <option value="campaign">Campaign</option>
            <option value="template">Template</option>
            <option value="metro2">Metro2</option>
          </select>

          <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 13, background: "#fff", color: "#1e293b" }}>
            <option value="date">Newest First</option>
            <option value="az">A – Z</option>
            <option value="type">By Type</option>
          </select>

          {selected.size > 0 && (
            <button onClick={bulkDelete} disabled={bulkDeleting}
              style={{ padding: "8px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {bulkDeleting ? "Deleting…" : `🗑 Delete (${selected.size})`}
            </button>
          )}
        </div>

        {/* Loading / Seeding */}
        {(loading || seeding) && (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>
            {seeding ? "Loading built-in templates…" : "Loading letters…"}
          </p>
        )}

        {/* Letters Grid */}
        {!loading && !seeding && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <p style={{ fontSize: 15 }}>No letters match your filters.</p>
                <button onClick={() => { setShowForm(true); }} style={{ marginTop: 8, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700 }}>
                  + New Letter
                </button>
              </div>
            ) : (
              <>
                {/* Select All row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "6px 2px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                      style={{ width: 15, height: 15, accentColor: "#1e3a5f", cursor: "pointer" }} />
                    {allSelected ? "Deselect all" : `Select all (${filtered.length})`}
                  </label>
                  {selected.size > 0 && (
                    <span style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 600 }}>{selected.size} selected</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {filtered.map(letter => (
                    <div key={letter.id}
                      style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", border: selected.has(letter.id) ? "2px solid #1e3a5f" : "1px solid #f1f5f9", transition: "border 0.1s" }}>

                      {/* Card header with checkbox */}
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <input type="checkbox" checked={selected.has(letter.id)} onChange={() => toggleSelect(letter.id)}
                          style={{ width: 15, height: 15, accentColor: "#1e3a5f", cursor: "pointer", marginTop: 3, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: "#1e293b" }}>{letter.title}</h3>
                            <span style={{ background: (TYPE_C[letter.type] || "#94a3b8") + "22", color: TYPE_C[letter.type] || "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0, textTransform: "capitalize" as const }}>{letter.type}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            {letter.bureau && (
                              <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" as const, background: "#f1f5f9", borderRadius: 4, padding: "1px 7px" }}>{letter.bureau}</span>
                            )}
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              Used {usages[letter.id] ?? 0} time{(usages[letter.id] ?? 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content preview */}
                      <div style={{ padding: "10px 14px", background: "#fafafa" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                          {letter.content}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: "10px 14px", display: "flex", gap: 6 }}>
                        <button onClick={() => setPreview(letter)}
                          style={{ flex: 1, fontSize: 12, padding: "6px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontWeight: 600, color: "#475569" }}>
                          Preview
                        </button>
                        <button onClick={() => copyLetter(letter)}
                          style={{ fontSize: 12, padding: "6px 11px", background: copied === letter.id ? "#dcfce7" : "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", color: copied === letter.id ? "#166534" : "#475569", fontWeight: 600 }}>
                          {copied === letter.id ? "✓" : "Copy"}
                        </button>
                        <button onClick={() => openEdit(letter)}
                          style={{ fontSize: 12, padding: "6px 11px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", color: "#1d4ed8", fontWeight: 600 }}>
                          Edit
                        </button>
                        <button onClick={() => del(letter.id)}
                          style={{ fontSize: 12, padding: "6px 10px", background: "#fff", border: "1px solid #fee2e2", borderRadius: 6, cursor: "pointer", color: "#ef4444" }}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* New Letter Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 580, maxHeight: "88vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Letter</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="e.g. Standard Dispute Letter – Equifax" />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inp }}>
                  {["template", "dispute", "campaign", "metro2"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bureau</label>
                <select value={form.bureau} onChange={e => setForm(f => ({ ...f, bureau: e.target.value }))} style={{ ...inp }}>
                  <option value="">All Bureaus</option>
                  {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Letter Content</label>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                Use placeholders: [CLIENT_NAME] [DATE] [ACCOUNT_NAME] [ACCOUNT_NUMBER] [BUREAU_NAME]
              </div>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your letter template here…"
                style={{ ...inp, minHeight: 220, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveNew} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                {saving ? "Saving…" : "Save Letter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Letter Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 580, maxHeight: "88vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Edit Letter</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inp }}>
                  {["template", "dispute", "campaign", "metro2"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bureau</label>
                <select value={form.bureau} onChange={e => setForm(f => ({ ...f, bureau: e.target.value }))} style={{ ...inp }}>
                  <option value="">All Bureaus</option>
                  {["equifax", "experian", "transunion"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Letter Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ ...inp, minHeight: 220, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 640, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>{preview.title}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ background: (TYPE_C[preview.type] || "#94a3b8") + "22", color: TYPE_C[preview.type] || "#64748b", borderRadius: 5, padding: "2px 10px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" as const }}>{preview.type}</span>
                  {preview.bureau && <span style={{ background: "#f1f5f9", borderRadius: 5, padding: "2px 10px", fontSize: 12, color: "#64748b", textTransform: "capitalize" as const }}>{preview.bureau}</span>}
                  <span style={{ fontSize: 12, color: "#94a3b8", padding: "2px 0" }}>Used {usages[preview.id] ?? 0} time{(usages[preview.id] ?? 0) !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>
            <pre style={{ fontSize: 13, lineHeight: 1.75, whiteSpace: "pre-wrap", color: "#1e293b", fontFamily: "Georgia, serif", background: "#fafafa", padding: 18, borderRadius: 8, margin: 0 }}>{preview.content}</pre>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => openEdit(preview)}
                style={{ padding: "9px 18px", border: "1px solid #bfdbfe", borderRadius: 7, background: "#eff6ff", cursor: "pointer", fontWeight: 600, color: "#1d4ed8" }}>
                Edit
              </button>
              <button onClick={() => copyLetter(preview)}
                style={{ padding: "9px 18px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {copied === preview.id ? "✓ Copied" : "Copy"}
              </button>
              <button onClick={() => setPreview(null)} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 540, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Import Letters</h2>
              <button onClick={() => setShowImport(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
              Paste a JSON array of letters. Each letter needs: <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>title</code>, <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>content</code>, <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>type</code>, and optionally <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>bureau</code>.
            </p>
            <div style={{ marginBottom: 14 }}>
              <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImportFile(file);
                  const reader = new FileReader();
                  reader.onload = ev => setImportText(ev.target?.result as string || "");
                  reader.readAsText(file);
                }} />
              <button onClick={() => fileRef.current?.click()} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                📂 Choose JSON File{importFile ? ` — ${importFile.name}` : ""}
              </button>
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={'[{"title":"My Letter","type":"dispute","bureau":"equifax","content":"Letter body..."}]'}
              style={{ ...inp, minHeight: 160, fontFamily: "monospace", fontSize: 12, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button onClick={() => setShowImport(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={importLetters} disabled={saving || !importText.trim()}
                style={{ padding: "9px 20px", background: importText.trim() ? "#1e3a5f" : "#94a3b8", color: "#fff", border: "none", borderRadius: 7, cursor: importText.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                {saving ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
