"use client";

import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

const MAIN_TABS = ["Manage Affiliate", "Documents & Commissions"];
const FILTER_TABS = ["Active", "Lead", "Inactive", "Pending Messages", "Pending Referrals"];
const STATUS_C: Record<string, string> = {
  Active: "#10b981",
  Lead: "#3b82f6",
  Inactive: "#94a3b8",
  "Pending Messages": "#f59e0b",
  "Pending Referrals": "#8b5cf6",
};
const LOCAL_AFFILIATES_KEY = "disputepilot.affiliates";
const LOCAL_AFFILIATE_COMMISSIONS_KEY = "disputepilot.affiliates.commissions";
const LOCAL_AFFILIATE_DOCUMENTS_KEY = "disputepilot.affiliates.documents";

const EMPTY_FORM = {
  full_name: "",
  company_name: "",
  phone: "",
  email: "",
  referral_code: "",
  status: "Active",
  notes: "",
};

function readLocalAffiliates() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_AFFILIATES_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalAffiliates(affiliates: any[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AFFILIATES_KEY, JSON.stringify(affiliates));
}

function readLocalRows(key: string) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocalRows(key: string, rows: any[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(rows));
}

function affiliateName(affiliate: any) {
  return affiliate.full_name || affiliate.name || affiliate.company_name || affiliate.email || "Affiliate";
}

function affiliatePhone(affiliate: any) {
  return affiliate.phone || affiliate.cell_phone || affiliate.office_phone || "";
}

function affiliateStatus(affiliate: any) {
  return affiliate.status || "Active";
}

function mergeAffiliates(primary: any[], secondary: any[]) {
  const seen = new Set<string>();
  const merged: any[] = [];

  for (const affiliate of [...primary, ...secondary]) {
    const key = affiliate.id
      ? `id:${affiliate.id}`
      : `affiliate:${affiliate.email || affiliate.referral_code || affiliate.full_name || affiliate.created_at}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(affiliate);
  }

  return merged;
}

export default function Page() {
  const [mainTab, setMainTab] = useState("Manage Affiliate");
  const [filterTab, setFilterTab] = useState("Active");
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [removeTarget, setRemoveTarget] = useState<any | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [commissionForm, setCommissionForm] = useState({ affiliate: "", amount: "", status: "Pending", period: "", notes: "" });
  const [documentForm, setDocumentForm] = useState({ affiliate: "", name: "", type: "Agreement", status: "Received", notes: "" });

  useEffect(() => {
    load();
    setCommissions(readLocalRows(LOCAL_AFFILIATE_COMMISSIONS_KEY));
    setDocuments(readLocalRows(LOCAL_AFFILIATE_DOCUMENTS_KEY));
  }, []);

  async function getAccountId() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return null;

    const { data } = await supabase
      .from("account_memberships")
      .select("account_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    return data?.account_id || null;
  }

  async function load(preservedAffiliates: any[] = []) {
    setLoading(true);
    setError("");
    const localAffiliates = readLocalAffiliates();

    try {
      const accountId = await getAccountId();

      if (accountId) {
        const { data, error } = await supabase
          .from("affiliates")
          .select("*")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const scopedAffiliates = data || [];
        const scopedIds = new Set(scopedAffiliates.map((affiliate: any) => affiliate.id));
        const visibleAffiliates = [
          ...localAffiliates.filter((affiliate: any) => !scopedIds.has(affiliate.id)),
          ...scopedAffiliates,
        ];
        setAffiliates(mergeAffiliates(preservedAffiliates, visibleAffiliates));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const remoteAffiliates = data || [];
      const remoteIds = new Set(remoteAffiliates.map((affiliate: any) => affiliate.id));
      const visibleAffiliates = [
        ...localAffiliates.filter((affiliate: any) => !remoteIds.has(affiliate.id)),
        ...remoteAffiliates,
      ];
      setAffiliates(mergeAffiliates(preservedAffiliates, visibleAffiliates));
    } catch (err: any) {
      setAffiliates(mergeAffiliates(preservedAffiliates, localAffiliates));
      setError(err?.message ? `Could not load affiliates: ${err.message}` : "Could not load affiliates.");
    }

    setLoading(false);
  }

  async function save() {
    if (!form.full_name || !form.email) return;
    setSaving(true);
    setError("");
    setNotice("");

    const basePayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company_name: form.company_name.trim() || null,
      referral_code: form.referral_code.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    try {
      const accountId = await getAccountId();
      const payload = accountId ? { ...basePayload, account_id: accountId } : basePayload;
      const { data, error } = await supabase.from("affiliates").insert([payload]).select("*").single();
      if (error) throw error;

      const savedAffiliate = data || { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
      setAffiliates(current => [savedAffiliate, ...current]);
      setNotice(`Saved affiliate: ${affiliateName(savedAffiliate)}`);
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      await load([savedAffiliate]);
    } catch (err: any) {
      const localAffiliate = {
        ...basePayload,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const nextLocalAffiliates = [localAffiliate, ...readLocalAffiliates()];
      writeLocalAffiliates(nextLocalAffiliates);
      setAffiliates(current => [localAffiliate, ...current]);
      setNotice(`Saved affiliate locally: ${affiliateName(localAffiliate)}`);
      setError(err?.message ? `Affiliate save did not reach Supabase: ${err.message}` : "Affiliate save did not reach Supabase.");
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setError("");
    setNotice("");

    if (String(id).startsWith("local-")) {
      const nextLocalAffiliates = readLocalAffiliates().filter((affiliate: any) => affiliate.id !== id);
      writeLocalAffiliates(nextLocalAffiliates);
      setAffiliates(current => current.filter(affiliate => affiliate.id !== id));
      setNotice("Removed local affiliate.");
      return;
    }

    try {
      const accountId = await getAccountId();
      if (!accountId) throw new Error("No account context is available for this delete.");

      const { error } = await supabase.from("affiliates").delete().eq("id", id).eq("account_id", accountId);
      if (error) throw error;

      setAffiliates(current => current.filter(affiliate => affiliate.id !== id));
      setNotice("Removed affiliate.");
    } catch (err: any) {
      setError(err?.message ? `Affiliate delete failed: ${err.message}` : "Affiliate delete failed.");
    }
  }

  function addCommission() {
    if (!commissionForm.affiliate || !commissionForm.amount) return;
    const row = {
      id: `local-commission-${Date.now()}`,
      ...commissionForm,
      created_at: new Date().toISOString(),
    };
    const next = [row, ...commissions];
    setCommissions(next);
    writeLocalRows(LOCAL_AFFILIATE_COMMISSIONS_KEY, next);
    setCommissionForm({ affiliate: "", amount: "", status: "Pending", period: "", notes: "" });
    setShowCommissionForm(false);
    setNotice("Added local commission row.");
  }

  function addDocument() {
    if (!documentForm.affiliate || !documentForm.name) return;
    const row = {
      id: `local-document-${Date.now()}`,
      ...documentForm,
      created_at: new Date().toISOString(),
    };
    const next = [row, ...documents];
    setDocuments(next);
    writeLocalRows(LOCAL_AFFILIATE_DOCUMENTS_KEY, next);
    setDocumentForm({ affiliate: "", name: "", type: "Agreement", status: "Received", notes: "" });
    setShowDocumentForm(false);
    setNotice("Added local document metadata row.");
  }

  function removeCommission(id: string) {
    if (!window.confirm("Remove this local commission row?")) return;
    const next = commissions.filter(row => row.id !== id);
    setCommissions(next);
    writeLocalRows(LOCAL_AFFILIATE_COMMISSIONS_KEY, next);
    setNotice("Removed local commission row.");
  }

  function removeDocument(id: string) {
    if (!window.confirm("Remove this local document row?")) return;
    const next = documents.filter(row => row.id !== id);
    setDocuments(next);
    writeLocalRows(LOCAL_AFFILIATE_DOCUMENTS_KEY, next);
    setNotice("Removed local document metadata row.");
  }

  const filtered = affiliates.filter(affiliate => affiliateStatus(affiliate).toLowerCase() === filterTab.toLowerCase());
  const inp: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    fontSize: 14,
    boxSizing: "border-box",
  };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Affiliates</h1>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
          >
            + Add New
          </button>
        </div>

        {notice && (
          <div role="status" style={{ marginBottom: 12, padding: "10px 12px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 7, fontSize: 13, fontWeight: 600 }}>
            {notice}
          </div>
        )}
        {error && (
          <div role="alert" style={{ marginBottom: 12, padding: "10px 12px", border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", borderRadius: 7, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: 0 }}>
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: mainTab === tab ? 700 : 500, color: mainTab === tab ? "#1e3a5f" : "#64748b", borderBottom: mainTab === tab ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2 }}
            >
              {tab}
            </button>
          ))}
        </div>

        {mainTab === "Manage Affiliate" ? (
          <>
            <div style={{ display: "flex", gap: 6, padding: "14px 0", flexWrap: "wrap" }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: filterTab === tab ? 700 : 500, background: filterTab === tab ? (STATUS_C[tab] || "#1e3a5f") : "#f1f5f9", color: filterTab === tab ? "#fff" : "#64748b" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    {["Name", "Company Name", "Office Phone", "Cell Phone", "Phone", "Email", "Referral Code", "Status", "Start", "End", "Commission", "Notes", "Action"].map(header => (
                      <th key={header} style={{ textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={13} style={{ padding: 36, textAlign: "center", color: "#94a3b8" }}>No {filterTab.toLowerCase()} affiliates.</td></tr>
                  ) : filtered.map(affiliate => (
                    <tr key={affiliate.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{affiliateName(affiliate)}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliate.company_name || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliate.office_phone || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliate.cell_phone || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliatePhone(affiliate) || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliate.email || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{affiliate.referral_code || "-"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: (STATUS_C[affiliateStatus(affiliate)] || "#94a3b8") + "22", color: STATUS_C[affiliateStatus(affiliate)] || "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                          {affiliateStatus(affiliate)}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{affiliate.start_date || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{affiliate.end_date || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b" }}>{affiliate.commission || "-"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#64748b", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{affiliate.notes || "-"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <button
                          onClick={() => setRemoveTarget(affiliate)}
                          style={{ fontSize: 12, padding: "4px 10px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", color: "#ef4444", fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ padding: "18px 0" }}>
            <div style={{ marginBottom: 14, padding: 12, border: "1px solid #fde68a", background: "#fffbeb", borderRadius: 8, color: "#92400e", fontSize: 13, fontWeight: 700 }}>
              Documents and commissions are stored locally in this browser until backend persistence is added.
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <button onClick={() => setShowCommissionForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Add Commission</button>
              <button onClick={() => setShowDocumentForm(true)} style={{ background: "#0f766e", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Add Document</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "11px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1e293b", fontSize: 14 }}>Commission Summary</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Affiliate", "Amount", "Status", "Period", "Action"].map(header => <th key={header} style={{ textAlign: "left", padding: "9px 10px", fontSize: 11, color: "#64748b" }}>{header}</th>)}</tr></thead>
                  <tbody>
                    {commissions.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 18, color: "#94a3b8", fontSize: 13 }}>No local commission rows yet.</td></tr>
                    ) : commissions.map(row => (
                      <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "9px 10px", fontSize: 13, fontWeight: 600 }}>{row.affiliate}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>${row.amount}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>{row.status}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>{row.period || "-"}</td>
                        <td style={{ padding: "9px 10px" }}><button onClick={() => removeCommission(row.id)} style={{ border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", borderRadius: 5, padding: "4px 8px", fontSize: 12 }}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "11px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#1e293b", fontSize: 14 }}>Document Metadata</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Affiliate", "Document", "Type", "Status", "Action"].map(header => <th key={header} style={{ textAlign: "left", padding: "9px 10px", fontSize: 11, color: "#64748b" }}>{header}</th>)}</tr></thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 18, color: "#94a3b8", fontSize: 13 }}>No local document rows yet.</td></tr>
                    ) : documents.map(row => (
                      <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "9px 10px", fontSize: 13, fontWeight: 600 }}>{row.affiliate}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>{row.name}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>{row.type}</td>
                        <td style={{ padding: "9px 10px", fontSize: 13 }}>{row.status}</td>
                        <td style={{ padding: "9px 10px" }}><button onClick={() => removeDocument(row.id)} style={{ border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", borderRadius: 5, padding: "4px 8px", fontSize: 12 }}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Add New Affiliate</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {[
                  ["Name *", "full_name"],
                  ["Company Name", "company_name"],
                  ["Phone", "phone"],
                  ["Email *", "email"],
                  ["Referral Code", "referral_code"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                    <input value={(form as any)[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} style={inp} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select
                    value={form.status}
                    onChange={event => setForm(current => ({ ...current, status: event.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}
                  >
                    {FILTER_TABS.slice(0, 3).map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={event => setForm(current => ({ ...current, notes: event.target.value }))}
                    style={{ ...inp, minHeight: 70, resize: "vertical" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Saving..." : "Add Affiliate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCommissionForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 430 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Add Commission</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <input aria-label="Commission Affiliate" placeholder="Affiliate name" value={commissionForm.affiliate} onChange={e => setCommissionForm(f => ({ ...f, affiliate: e.target.value }))} style={inp} />
                <input aria-label="Commission Amount" placeholder="Amount" type="number" value={commissionForm.amount} onChange={e => setCommissionForm(f => ({ ...f, amount: e.target.value }))} style={inp} />
                <input aria-label="Commission Period" placeholder="Period, e.g. May 2026" value={commissionForm.period} onChange={e => setCommissionForm(f => ({ ...f, period: e.target.value }))} style={inp} />
                <select aria-label="Commission Status" value={commissionForm.status} onChange={e => setCommissionForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                  {["Pending", "Approved", "Paid", "Held"].map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setShowCommissionForm(false)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff" }}>Cancel</button>
                <button onClick={addCommission} style={{ padding: "8px 16px", border: "none", borderRadius: 7, background: "#1e3a5f", color: "#fff", fontWeight: 700 }}>Add Commission</button>
              </div>
            </div>
          </div>
        )}

        {showDocumentForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 430 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Add Document</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <input aria-label="Document Affiliate" placeholder="Affiliate name" value={documentForm.affiliate} onChange={e => setDocumentForm(f => ({ ...f, affiliate: e.target.value }))} style={inp} />
                <input aria-label="Document Name" placeholder="Document name" value={documentForm.name} onChange={e => setDocumentForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                <select aria-label="Document Type" value={documentForm.type} onChange={e => setDocumentForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  {["Agreement", "W-9", "Invoice", "Referral Proof", "Other"].map(type => <option key={type}>{type}</option>)}
                </select>
                <select aria-label="Document Status" value={documentForm.status} onChange={e => setDocumentForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                  {["Received", "Missing", "Needs Review", "Approved"].map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setShowDocumentForm(false)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff" }}>Cancel</button>
                <button onClick={addDocument} style={{ padding: "8px 16px", border: "none", borderRadius: 7, background: "#0f766e", color: "#fff", fontWeight: 700 }}>Add Document</button>
              </div>
            </div>
          </div>
        )}

        {removeTarget && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 390 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800 }}>Remove Affiliate?</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Remove {affiliateName(removeTarget)} from the local affiliate list? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setRemoveTarget(null)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { const target = removeTarget; setRemoveTarget(null); remove(target.id); }} style={{ padding: "9px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>Confirm Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
