"use client";

import { useEffect, useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Dispute = {
  id: number;
  client: string;
  status: string;
  round: string;
  bureau: string;
  reason: string;
  account: string;
  letter: string;
  date: string;
  notes: string;
};

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 1,
    client: "John Smith",
    status: "In Progress",
    round: "Round 1",
    bureau: "Equifax",
    reason: "Incorrect Balance",
    account: "Capital One Platinum",
    letter: "609 Dispute Letter",
    date: "2026-04-29",
    notes: "Client says the balance was paid before the statement date.",
  },
  {
    id: 2,
    client: "Maria Johnson",
    status: "Ready",
    round: "Round 2",
    bureau: "Experian",
    reason: "Account Paid in Full",
    account: "Synchrony Bank",
    letter: "Method of Verification",
    date: "2026-04-28",
    notes: "Prepare follow-up after bureau verified the first round.",
  },
  {
    id: 3,
    client: "David Lee",
    status: "Completed",
    round: "Round 3",
    bureau: "TransUnion",
    reason: "Not My Account",
    account: "Midland Credit Management",
    letter: "Debt Validation Letter",
    date: "2026-04-27",
    notes: "Collection deleted after furnisher failed to validate.",
  },
];

const EMPTY_FORM: Omit<Dispute, "id"> = {
  client: "",
  status: "Ready",
  round: "Round 1",
  bureau: "Equifax",
  reason: "Incorrect Balance",
  account: "",
  letter: "609 Dispute Letter",
  date: "2026-05-02",
  notes: "",
};

const STATUSES = ["Ready", "In Progress", "Sent", "Responded", "Completed"];
const ROUNDS = ["Round 1", "Round 2", "Round 3", "Round 4"];
const BUREAUS = ["Equifax", "Experian", "TransUnion"];
const REASONS = [
  "Incorrect Balance",
  "Account Paid in Full",
  "Not My Account",
  "Incorrect Late Payment",
  "Duplicate Account",
  "Fraud / Identity Theft",
  "Inquiry Not Authorized",
];
const LETTERS = [
  "609 Dispute Letter",
  "Method of Verification",
  "Debt Validation Letter",
  "Goodwill Adjustment Letter",
  "Metro 2 Compliance Letter",
];

const LOCAL_CLIENTS_KEY = "disputepilot.clients";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "9px 11px",
  fontSize: 14,
  boxSizing: "border-box",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

function formatDate(date: string) {
  if (!date) return "No date";
  const [year, month, day] = date.split("-");
  return month && day && year ? `${month}/${day}/${year}` : date;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [saved, setSaved] = useState<Dispute | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [saveHint, setSaveHint] = useState("");

  const canSave = useMemo(() => Boolean(form.client.trim() && form.account.trim()), [form.client, form.account]);

  useEffect(() => {
    function loadClientSuggestions() {
      try {
        const raw = window.localStorage.getItem(LOCAL_CLIENTS_KEY);
        if (!raw) {
          setClientSuggestions(["John Smith", "Maria Johnson", "David Lee"]);
          return;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          setClientSuggestions(["John Smith", "Maria Johnson", "David Lee"]);
          return;
        }

        const suggestions = parsed
          .map((item: any) => (item.full_name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email || "").trim())
          .filter(Boolean);

        setClientSuggestions(Array.from(new Set([...suggestions, "John Smith", "Maria Johnson", "David Lee"])));
      } catch {
        setClientSuggestions(["John Smith", "Maria Johnson", "David Lee"]);
      }
    }

    loadClientSuggestions();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_CLIENTS_KEY) loadClientSuggestions();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function updateField(name: keyof typeof EMPTY_FORM, value: string) {
    setForm(current => ({ ...current, [name]: value }));
    if (name === "client" || name === "account") setSaveHint("");
  }

  function openCreate() {
    setSaved(null);
    setSaveHint("");
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function cancelCreate() {
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    setSaveHint("");
  }

  function saveDispute() {
    if (!form.client.trim() || !form.account.trim()) {
      const missing: string[] = [];
      if (!form.client.trim()) missing.push("client");
      if (!form.account.trim()) missing.push("account");
      setSaveHint(`To save, fill ${missing.join(" and ")}.`);
      return;
    }

    const next: Dispute = {
      ...form,
      id: Date.now(),
      client: form.client.trim(),
      account: form.account.trim(),
      notes: form.notes.trim() || "No notes entered.",
    };

    setDisputes(current => [next, ...current]);
    setSaved(next);
    setSaveHint("");
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Dispute Center</h1>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Manage client disputes, bureaus, letters, accounts, dates, and action status. Table columns include Bureau, Date, and Action for every dispute.</p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            style={{ borderRadius: 7, background: "#1e3a5f", border: "none", padding: "10px 18px", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Create New Dispute
          </button>
        </div>

        {saved && (
          <section aria-label="Saved dispute confirmation" style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#166534" }}>Dispute Saved</h2>
            <p style={{ margin: 0, color: "#166534", fontSize: 14 }}>
              {saved.client} now has a {saved.bureau} {saved.round.toLowerCase()} dispute for {saved.account} using {saved.letter}.
            </p>
          </section>
        )}

        <section style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Disputes</h2>
            <span style={{ fontSize: 13, color: "#64748b" }}>{disputes.length} active records</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  {["Client", "Status", "Round", "Bureau", "Equifax", "Experian", "TransUnion", "Letters", "Accounts", "Date", "Action"].map(header => (
                    <th key={header} style={{ padding: 12, color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {disputes.map(dispute => (
                  <tr key={dispute.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 12, fontWeight: 700, color: "#0f172a" }}>{dispute.client}</td>
                    <td style={{ padding: 12 }}>{dispute.status}</td>
                    <td style={{ padding: 12 }}>{dispute.round}</td>
                    <td style={{ padding: 12 }}>{dispute.bureau}</td>
                    <td style={{ padding: 12 }}>{dispute.bureau === "Equifax" ? "Included" : "Not included"}</td>
                    <td style={{ padding: 12 }}>{dispute.bureau === "Experian" ? "Included" : "Not included"}</td>
                    <td style={{ padding: 12 }}>{dispute.bureau === "TransUnion" ? "Included" : "Not included"}</td>
                    <td style={{ padding: 12 }}>{dispute.letter}</td>
                    <td style={{ padding: 12 }}>{dispute.account}</td>
                    <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatDate(dispute.date)}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        type="button"
                        onClick={() => setSelected(dispute)}
                        style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#1e3a5f", cursor: "pointer" }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div role="dialog" aria-modal="true" aria-labelledby="new-dispute-title" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.48)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <section style={{ background: "#fff", borderRadius: 10, width: 720, maxWidth: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 16px 40px rgba(15,23,42,0.24)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <h2 id="new-dispute-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Create New Dispute</h2>
            </div>

            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              <div>
                <label htmlFor="client" style={labelStyle}>Client / Customer *</label>
                <input id="client" list="client-options" value={form.client} onChange={event => updateField("client", event.target.value)} style={inputStyle} placeholder="Select client" aria-describedby="client-helper" />
                <datalist id="client-options">
                  {clientSuggestions.map(client => <option key={client} value={client} />)}
                </datalist>
                <p id="client-helper" style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                  Select a client or type a name. Saved clients from the Clients page are available here.
                </p>
              </div>
              <div>
                <label htmlFor="status" style={labelStyle}>Status</label>
                <select id="status" value={form.status} onChange={event => updateField("status", event.target.value)} style={inputStyle}>
                  {STATUSES.map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="round" style={labelStyle}>Round</label>
                <select id="round" value={form.round} onChange={event => updateField("round", event.target.value)} style={inputStyle}>
                  {ROUNDS.map(round => <option key={round}>{round}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="bureau" style={labelStyle}>Bureau</label>
                <select id="bureau" value={form.bureau} onChange={event => updateField("bureau", event.target.value)} style={inputStyle}>
                  {BUREAUS.map(bureau => <option key={bureau}>{bureau}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reason" style={labelStyle}>Dispute Reason / Type</label>
                <select id="reason" value={form.reason} onChange={event => updateField("reason", event.target.value)} style={inputStyle}>
                  {REASONS.map(reason => <option key={reason}>{reason}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="account" style={labelStyle}>Account / Creditor *</label>
                <input id="account" value={form.account} onChange={event => updateField("account", event.target.value)} style={inputStyle} placeholder="First National Bank" aria-describedby="account-helper" />
                <p id="account-helper" style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                  Enter the creditor or account name to enable Save Dispute.
                </p>
              </div>
              <div>
                <label htmlFor="letter" style={labelStyle}>Letter / Template</label>
                <select id="letter" value={form.letter} onChange={event => updateField("letter", event.target.value)} style={inputStyle}>
                  {LETTERS.map(letter => <option key={letter}>{letter}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="date" style={labelStyle}>Date</label>
                <input id="date" type="date" value={form.date} onChange={event => updateField("date", event.target.value)} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="notes" style={labelStyle}>Notes</label>
                <textarea id="notes" value={form.notes} onChange={event => updateField("notes", event.target.value)} style={{ ...inputStyle, minHeight: 104, resize: "vertical" }} placeholder="Document what should be disputed and any client context." />
              </div>
            </div>

            <div style={{ padding: "16px 24px 24px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {saveHint && (
                <p role="status" aria-live="polite" style={{ margin: "0 auto 0 0", color: "#b45309", fontSize: 12, fontWeight: 700 }}>
                  {saveHint}
                </p>
              )}
              <button type="button" onClick={cancelCreate} style={{ border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff", padding: "9px 18px", fontWeight: 700, color: "#334155", cursor: "pointer" }}>Cancel</button>
              <button
                type="button"
                onClick={saveDispute}
                disabled={!canSave}
                style={{ border: "none", borderRadius: 7, background: canSave ? "#1e3a5f" : "#94a3b8", padding: "9px 20px", fontWeight: 800, color: "#fff", cursor: canSave ? "pointer" : "not-allowed" }}
              >
                Save Dispute
              </button>
            </div>
          </section>
        </div>
      )}

      {selected && (
        <div role="dialog" aria-modal="true" aria-labelledby="dispute-details-title" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.48)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <section style={{ background: "#fff", borderRadius: 10, width: 560, maxWidth: "100%", boxShadow: "0 16px 40px rgba(15,23,42,0.24)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 id="dispute-details-title" style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Dispute Details</h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{selected.client}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close dispute details" style={{ border: "none", background: "transparent", color: "#64748b", fontSize: 24, lineHeight: 1, cursor: "pointer" }}>x</button>
            </div>

            <dl style={{ padding: 24, margin: 0, display: "grid", gridTemplateColumns: "150px 1fr", gap: "12px 18px", fontSize: 14 }}>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Client</dt><dd style={{ margin: 0 }}>{selected.client}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Status</dt><dd style={{ margin: 0 }}>{selected.status}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Round</dt><dd style={{ margin: 0 }}>{selected.round}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Bureau</dt><dd style={{ margin: 0 }}>{selected.bureau}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Dispute Reason</dt><dd style={{ margin: 0 }}>{selected.reason}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Account / Creditor</dt><dd style={{ margin: 0 }}>{selected.account}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Letter / Template</dt><dd style={{ margin: 0 }}>{selected.letter}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Date</dt><dd style={{ margin: 0 }}>{formatDate(selected.date)}</dd>
              <dt style={{ fontWeight: 800, color: "#475569" }}>Notes</dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.notes}</dd>
            </dl>

            <div style={{ padding: "0 24px 24px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setSelected(null)} style={{ border: "none", borderRadius: 7, background: "#1e3a5f", padding: "9px 20px", fontWeight: 800, color: "#fff", cursor: "pointer" }}>Close</button>
            </div>
          </section>
        </div>
      )}
    </CDMLayout>
  );
}
