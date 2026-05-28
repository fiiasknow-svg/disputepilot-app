"use client";

import type React from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

type Client = { id: string; full_name: string; email?: string };
type Fee = { id: number; label: string; amount: number };
type Estimate = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date: string;
  displayDate: string;
  preview: string;
  report_type: string;
  feeTotal: number;
  status: string;
  archived: boolean;
};

const REPORT_TYPES = ["Standard Report", "3-Bureau Report", "Single Bureau"];
const CHECKS = ["Credit Analysis", "Personal Information", "Return Item"];
const fallbackClients: Client[] = [
  { id: "local-leslie", full_name: "Leslie Sabek", email: "leslie@example.com" },
  { id: "local-morgan", full_name: "Morgan Credit", email: "morgan@example.com" },
];
const ESTIMATES_KEY = "dp_pay_per_deletion_estimates";

const primaryButton = { padding: "9px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700 };
const secondaryButton = { padding: "9px 18px", background: "#fff", color: "#1e3a5f", border: "1px solid #cbd5e1", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700 };
const panel = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 };
const sel = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, background: "#fff", boxSizing: "border-box" as const };

export default function Page() {
  const [clients, setClients] = useState<Client[]>(fallbackClients);
  const [clientId, setClientId] = useState("");
  const [reportType, setReportType] = useState("Standard Report");
  const [checked, setChecked] = useState<Record<string, boolean>>({ "Credit Analysis": true });
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [building, setBuilding] = useState(false);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [fees, setFees] = useState<Fee[]>([{ id: 1, label: "Verified deletion fee", amount: 120 }]);
  const [activeTab, setActiveTab] = useState<"Current" | "Archive" | "Quick Import">("Current");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modal, setModal] = useState<null | "fees" | "credentials" | "contract" | "Cover and Welcome" | "Good Faith Estimate" | "Final Preview">(null);
  const [contractEstimate, setContractEstimate] = useState<Estimate | null>(null);
  const [removeEstimate, setRemoveEstimate] = useState<Estimate | null>(null);
  const [status, setStatus] = useState("");

  async function getAccountId() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;
    const { data } = await supabase.from("account_memberships").select("account_id").eq("user_id", userId).limit(1).maybeSingle();
    return data?.account_id || null;
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ESTIMATES_KEY);
      if (saved) setEstimates(JSON.parse(saved));
    } catch {
      setStatus("Saved local estimates could not be loaded.");
    }
    async function loadClients() {
      try {
        const accountId = await getAccountId();
        let remoteClients: Client[] = [];
        if (accountId) {
          const { data } = await supabase.from("clients").select("id, full_name, email").eq("account_id", accountId).order("full_name");
          remoteClients = data || [];
        }
        if (!remoteClients.length) {
          const { data } = await supabase.from("clients").select("id, full_name, email").order("full_name");
          remoteClients = data || [];
        }
        if (remoteClients.length) setClients(remoteClients);
      } catch {
        setClients(fallbackClients);
      }
    }
    loadClients();
  }, []);

  function persistEstimates(next: Estimate[], message: string) {
    setEstimates(next);
    window.localStorage.setItem(ESTIMATES_KEY, JSON.stringify(next));
    setStatus(message);
  }

  const filteredEstimates = useMemo(() => {
    return estimates
      .filter((estimate) => activeTab === "Archive" ? estimate.archived : !estimate.archived)
      .filter((estimate) => !fromDate || estimate.date >= fromDate)
      .filter((estimate) => !toDate || estimate.date <= toDate);
  }, [estimates, activeTab, fromDate, toDate]);

  function toggle(k: string) {
    setChecked((current) => ({ ...current, [k]: !current[k] }));
  }

  async function buildEstimate() {
    if (!clientId) return;
    setBuilding(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const client = clients.find((item) => item.id === clientId);
    const parts = (client?.full_name || "").split(" ");
    const selectedSections = Object.keys(checked).filter((key) => checked[key]);
    const feeTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const today = new Date().toISOString().slice(0, 10);
    const estimate: Estimate = {
      id: Date.now(),
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || "",
      email: client?.email || "local@example.com",
      date: today,
      displayDate: new Date(`${today}T00:00:00`).toLocaleDateString(),
      preview: `${selectedSections.join(", ") || "No sections"} | Fees ${money(feeTotal)}${htmlFile ? ` | ${htmlFile.name}` : ""}`,
      report_type: reportType,
      feeTotal,
      status: "Draft",
      archived: false,
    };
    persistEstimates([estimate, ...estimates], `Generated local estimate for ${client?.full_name} using ${fees.length} fee item(s). HTML files are attached by name only; parser automation is deferred.`);
    setBuilding(false);
    setActiveTab("Current");
  }

  function archiveVisible() {
    const idsToArchive = selectedIds.length ? selectedIds : filteredEstimates.map((estimate) => estimate.id);
    persistEstimates(estimates.map((estimate) => idsToArchive.includes(estimate.id) ? { ...estimate, archived: true, status: "Archived" } : estimate), `Archived ${idsToArchive.length} estimate record(s) locally.`);
    setSelectedIds([]);
    setActiveTab("Archive");
  }

  function sendEstimate(id: number) {
    persistEstimates(estimates.map((estimate) => estimate.id === id ? { ...estimate, status: "Marked sent locally" } : estimate), "Estimate marked sent locally. No email was sent.");
  }

  function downloadEstimate(estimate: Estimate) {
    const content = `Pay Per Deletion Estimate\nClient: ${estimate.first_name} ${estimate.last_name}\nDate: ${estimate.date}\nReport Type: ${estimate.report_type}\nSections and Fees: ${estimate.preview}\nTotal: ${money(estimate.feeTotal)}\nStatus: ${estimate.status}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pay-per-deletion-estimate-${estimate.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded estimate ${estimate.id}.`);
  }

  function confirmRemoveEstimate() {
    if (!removeEstimate) return;
    persistEstimates(estimates.filter((estimate) => estimate.id !== removeEstimate.id), `Estimate for ${removeEstimate.first_name} ${removeEstimate.last_name} removed locally.`);
    setRemoveEstimate(null);
  }

  return (
    <CDMLayout>
      <main style={{ padding: 24, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>Pay Per Deletion</h1>
        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>Build Automated and Manual Pay Per Deletion Good Faith Estimates.</p>

        {status && <section role="status" aria-live="polite" style={{ ...panel, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 700, marginBottom: 18 }}>{status}</section>}

        <section style={{ ...panel, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 14px" }}>Include Sections</p>
              {CHECKS.map(label => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!checked[label]} onChange={() => toggle(label)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1e3a5f" }} />
                  <span style={{ fontSize: 14, color: "#1e293b" }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 200, maxWidth: 280 }}>
              <label style={labelStyle}>Select Client</label>
              <select aria-label="Select Client" value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...sel, marginBottom: 16 }}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              <label style={labelStyle}>Report Type</label>
              <select aria-label="Report Type" value={reportType} onChange={e => setReportType(e.target.value)} style={sel}>
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button type="button" onClick={() => setModal("fees")} style={secondaryButton}>+ Pay Per Deletion Fees</button>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>HTML Credit Report</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", maxWidth: 220 }}>Local attachment only. HTML parser automation is deferred.</p>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                  {htmlFile ? htmlFile.name.slice(0, 22) : "Browse HTML File"}
                  <input type="file" accept=".html,.htm" onChange={e => setHtmlFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                </label>
              </div>
              <button onClick={buildEstimate} disabled={building || !clientId} style={{ ...primaryButton, padding: "11px 28px", background: !clientId ? "#cbd5e1" : "#1e3a5f", cursor: !clientId ? "not-allowed" : "pointer" }}>
                {building ? "Building..." : "Build Estimate"}
              </button>
              <button type="button" onClick={() => setModal("credentials")} style={{ ...secondaryButton, background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" }}>View Credentials</button>
            </div>
          </div>
        </section>

        <section style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", ...panel, padding: 16, marginBottom: 24 }}>
          {["Current", "Archive", "Quick Import"].map(label => (
            <button key={label} type="button" onClick={() => setActiveTab(label as "Current" | "Archive" | "Quick Import")} aria-pressed={activeTab === label} style={{ ...secondaryButton, background: activeTab === label ? "#1e3a5f" : "#fff", color: activeTab === label ? "#fff" : "#475569" }}>
              {label}
            </button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 700 }}>From <input aria-label="From" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} style={sel} /></label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 700 }}>To <input aria-label="To" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} style={sel} /></label>
          <button type="button" onClick={archiveVisible} disabled={!filteredEstimates.length || activeTab === "Archive" || activeTab === "Quick Import"} style={{ ...secondaryButton, opacity: !filteredEstimates.length || activeTab !== "Current" ? 0.65 : 1 }}>Archive</button>
        </section>

        {activeTab === "Quick Import" ? (
          <section style={{ ...panel, marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>Quick Import</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Choose an HTML credit report above, then build an estimate. Parsed report automation is deferred until backend parsing is available.</p>
          </section>
        ) : (
          <EstimateTable
            estimates={filteredEstimates}
            selectedIds={selectedIds}
            onToggleSelected={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
            onSend={sendEstimate}
            onDownload={downloadEstimate}
            onContract={(estimate) => { setContractEstimate(estimate); setModal("contract"); }}
            onRemove={(estimate) => setRemoveEstimate(estimate)}
          />
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}>
          {[
            { title: "Cover and Welcome", desc: "Personalized cover letter and welcome message included with the client estimate package." },
            { title: "Good Faith Estimate", desc: "Itemized breakdown of services and projected deletion fees sent directly to the client." },
            { title: "Final Preview", desc: "Combined preview of all sections before sending the full estimate to the client." },
          ].map(card => (
            <article key={card.title} style={{ ...panel, borderTop: "3px solid #1e3a5f" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: "#1e293b" }}>{card.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, marginBottom: 20 }}>{card.desc}</p>
              <button onClick={() => setModal(card.title as "Cover and Welcome" | "Good Faith Estimate" | "Final Preview")} style={{ ...primaryButton, width: "100%" }}>Preview</button>
            </article>
          ))}
        </section>

        {modal === "fees" && <Modal title="Pay Per Deletion Fees" onClose={() => setModal(null)}><FeeForm fees={fees} onSave={(next) => { setFees(next); setModal(null); setStatus("Updated pay per deletion fee schedule."); }} /></Modal>}
        {modal === "credentials" && <Modal title="Pay Per Deletion Credentials" onClose={() => setModal(null)}><Credentials /></Modal>}
        {modal === "contract" && contractEstimate && <Modal title="Estimate Contract" onClose={() => setModal(null)}><Contract estimate={contractEstimate} /></Modal>}
        {modal && ["Cover and Welcome", "Good Faith Estimate", "Final Preview"].includes(modal) && <Modal title={`${modal} Preview`} onClose={() => setModal(null)}><Preview section={modal} estimate={estimates[0]} /></Modal>}
        {removeEstimate && (
          <Modal title="Confirm Estimate Removal" onClose={() => setRemoveEstimate(null)}>
            <p style={{ margin: "0 0 18px", color: "#475569", lineHeight: 1.6 }}>Remove the local estimate for {removeEstimate.first_name} {removeEstimate.last_name}? This only changes browser local storage.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setRemoveEstimate(null)} style={secondaryButton}>Cancel</button>
              <button type="button" onClick={confirmRemoveEstimate} style={{ ...primaryButton, background: "#ef4444" }}>Confirm Remove</button>
            </div>
          </Modal>
        )}
      </main>
    </CDMLayout>
  );
}

function EstimateTable({ estimates, selectedIds, onToggleSelected, onSend, onDownload, onContract, onRemove }: {
  estimates: Estimate[];
  selectedIds: number[];
  onToggleSelected: (id: number) => void;
  onSend: (id: number) => void;
  onDownload: (estimate: Estimate) => void;
  onContract: (estimate: Estimate) => void;
  onRemove: (estimate: Estimate) => void;
}) {
  return (
    <section style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 28 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>{["Select", "First Name", "Last Name", "Email", "Date", "Estimation Preview", "Report Type", "Status", "Local Send", "Downloads", "Contract Context", "Action"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {estimates.length === 0 ? (
            <tr><td colSpan={12} style={{ padding: 44, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No estimates match this view. Select a client and click Build Estimate to generate a preview.</td></tr>
          ) : estimates.map(e => (
            <tr key={e.id} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={td}><input aria-label={`Select estimate ${e.id}`} type="checkbox" checked={selectedIds.includes(e.id)} onChange={() => onToggleSelected(e.id)} /></td>
              <td style={{ ...td, fontWeight: 600, color: "#1e293b" }}>{e.first_name}</td>
              <td style={td}>{e.last_name}</td>
              <td style={td}>{e.email}</td>
              <td style={td}>{e.displayDate}</td>
              <td style={td}><span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{e.preview}</span></td>
              <td style={td}>{e.report_type}</td>
              <td style={td}>{e.status}</td>
              <td style={td}><button onClick={() => onSend(e.id)} style={{ ...primaryButton, padding: "5px 12px", background: "#eff6ff", color: "#3b82f6" }}>Mark Sent Locally</button></td>
              <td style={td}><button onClick={() => onDownload(e)} style={{ ...secondaryButton, padding: "5px 12px", color: "#475569" }}>Download</button></td>
              <td style={td}><button onClick={() => onContract(e)} style={{ ...primaryButton, padding: "5px 12px", background: "#f0fdf4", color: "#16a34a" }}>Preview Contract Context</button></td>
              <td style={td}><button onClick={() => onRemove(e)} style={{ ...secondaryButton, padding: "5px 10px", borderColor: "#fca5a5", color: "#ef4444" }}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FeeForm({ fees, onSave }: { fees: Fee[]; onSave: (fees: Fee[]) => void }) {
  const [draft, setDraft] = useState(fees);
  function update(id: number, key: "label" | "amount", value: string) {
    setDraft((current) => current.map((fee) => fee.id === id ? { ...fee, [key]: key === "amount" ? Number(value) : value } : fee));
  }
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSave(draft); }} style={{ display: "grid", gap: 12 }}>
      {draft.map((fee) => (
        <div key={fee.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 10 }}>
          <input aria-label="Fee label" value={fee.label} onChange={(event) => update(fee.id, "label", event.target.value)} style={sel} />
          <input aria-label="Fee amount" type="number" min="0" value={fee.amount} onChange={(event) => update(fee.id, "amount", event.target.value)} style={sel} />
          <button type="button" onClick={() => setDraft((current) => current.filter((item) => item.id !== fee.id))} style={secondaryButton}>Remove</button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button type="button" onClick={() => setDraft((current) => [...current, { id: Date.now(), label: "Additional deletion fee", amount: 50 }])} style={secondaryButton}>Add Fee</button>
        <button type="submit" style={primaryButton}>Save Fees</button>
      </div>
    </form>
  );
}

function Credentials() {
  return <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>No live credentials are connected. Configure processor credentials under Credit Card Setup before enabling real backend workflows.</p>;
}

function Contract({ estimate }: { estimate: Estimate }) {
  return <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>Contract draft opened for {estimate.first_name} {estimate.last_name}. E-signature integration is deferred; use this local context to prepare the digital contract route later.</p>;
}

function Preview({ section, estimate }: { section: string; estimate?: Estimate }) {
  return <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>{section} preview for {estimate ? `${estimate.first_name} ${estimate.last_name}` : "the next generated estimate"}. Fee total: {money(estimate?.feeTotal || 0)}.</p>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(event) => event.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: 720, maxWidth: "100%", maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{title}</h2>
          <button aria-label="Close" onClick={onClose} style={{ ...secondaryButton, padding: "5px 10px" }}>x</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };
const th = { textAlign: "left" as const, padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 0, whiteSpace: "nowrap" as const };
const td = { padding: "11px 14px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" as const, verticalAlign: "top" as const };
const money = (amount: number) => `$${amount.toFixed(2)}`;
