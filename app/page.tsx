"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

type ClientRow = {
  id: string;
  created_at: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  plan: string;
  phone?: string;
  address?: string;
  dob?: string;
};

type DocumentRow = {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
};

type LetterRow = {
  id: string;
  created_at: string;
  user_id: string;
  client_id: string;
  dispute_id: string;
  template: string;
  content: string;
};

type DisputeRow = {
  id: string;
  created_at: string;
  user_id: string;
  client_id: string;
  creditor: string;
  reason: string;
  status: string;
};

type NoteRow = {
  id: string;
  created_at: string;
  user_id: string;
  client_id: string | null;
  dispute_id: string | null;
  note_text: string;
};

type ActiveSection = "dashboard" | "clients" | "disputes" | "notes" | "documents" | "letters" | "reports" | "calendar";

const NAV_ITEMS: { id: ActiveSection; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "clients", label: "Customers", icon: "👥" },
  { id: "disputes", label: "Dispute Manager", icon: "⚖" },
  { id: "notes", label: "Notes", icon: "✎" },
  { id: "documents", label: "Documents", icon: "📁" },
  { id: "letters", label: "Letters", icon: "✉" },
  { id: "reports", label: "Reports", icon: "📊" },
  { id: "calendar", label: "Calendar", icon: "📅" },
];

type LetterTemplate = "section609" | "section611" | "goodwill" | "debtValidation";

const LETTER_TEMPLATES: { id: LetterTemplate; label: string; description: string }[] = [
  { id: "section609", label: "Section 609 Letter", description: "Request original source documentation under FCRA §609" },
  { id: "section611", label: "Section 611 Letter", description: "Demand reinvestigation of inaccurate items under FCRA §611" },
  { id: "goodwill", label: "Goodwill Letter", description: "Ask creditor to remove negative item as a goodwill gesture" },
  { id: "debtValidation", label: "Debt Validation Letter", description: "Demand collector prove the debt is valid before collecting" },
];

function buildLetter(
  template: LetterTemplate,
  clientName: string,
  clientEmail: string,
  creditor: string,
  reason: string,
  date: string
): string {
  const header = `${date}\n\n${clientName}\n${clientEmail}\n\nRe: Dispute of Inaccurate Credit Information – ${creditor}\n\nTo Whom It May Concern,\n\n`;
  const footer = `\n\nSincerely,\n\n${clientName}\n${clientEmail}`;

  const bodies: Record<LetterTemplate, string> = {
    section609: `I am writing to request that you provide verification of the following item currently appearing on my credit report, as required under the Fair Credit Reporting Act (FCRA) Section 609.\n\nCreditor / Account: ${creditor}\nReason for Dispute: ${reason}\n\nUnder Section 609 of the FCRA, you are required to provide copies of the original documents you used to verify this account. If you cannot provide this documentation within 30 days, you are obligated to remove this item from my credit report immediately.\n\nPlease send the requested documentation to the address listed above. I expect written confirmation of the removal or verification within 30 days as required by law.`,
    section611: `I am writing to formally dispute the accuracy of the following item on my credit report under the Fair Credit Reporting Act (FCRA) Section 611, which requires you to conduct a reasonable reinvestigation of disputed information.\n\nCreditor / Account: ${creditor}\nReason for Dispute: ${reason}\n\nThis information is inaccurate and I am requesting that it be investigated and corrected or removed from my credit report. Under Section 611, you must complete your reinvestigation within 30 days (or 45 days if I submit additional information during the period). If the information cannot be verified, it must be deleted.\n\nPlease confirm in writing the results of your investigation.`,
    goodwill: `I am writing to respectfully request a goodwill adjustment regarding the following account on my credit report.\n\nCreditor / Account: ${creditor}\nReason: ${reason}\n\nI have been a customer and understand that this negative mark has impacted my credit profile. I take full responsibility for any past difficulties and want you to know that my financial situation has since improved significantly.\n\nI am kindly asking that you consider removing this negative entry as a gesture of goodwill. I believe this one mark does not reflect my overall creditworthiness, and its removal would greatly help me in achieving my financial goals.\n\nThank you for your time and consideration. I sincerely hope you will grant this request.`,
    debtValidation: `I am writing in response to your recent attempt to collect a debt. Pursuant to the Fair Debt Collection Practices Act (FDCPA) Section 809(b), I am disputing this debt and requesting validation.\n\nCreditor / Account: ${creditor}\nReason for Dispute: ${reason}\n\nPlease provide the following within 30 days:\n  1. The amount of the debt and how it was calculated\n  2. The name and address of the original creditor\n  3. A copy of any signed agreement creating the debt\n  4. Proof that your agency is licensed to collect debts in my state\n  5. Proof that the statute of limitations has not expired\n\nUntil you can validate this debt, please cease all collection activity and do not report this debt to any credit bureau. Failure to comply will be considered a violation of the FDCPA.`,
  };

  return header + bodies[template] + footer;
}

export default function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientDOB, setClientDOB] = useState("");
  const [clientStatus, setClientStatus] = useState("Active");
  const [clientPlan, setClientPlan] = useState("Standard Plan");
  const [savingClient, setSavingClient] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [creditor, setCreditor] = useState("");
  const [reason, setReason] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("Draft");
  const [savingDispute, setSavingDispute] = useState(false);

  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [noteClientId, setNoteClientId] = useState("");
  const [noteDisputeId, setNoteDisputeId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [letterClientId, setLetterClientId] = useState("");
  const [letterDisputeId, setLetterDisputeId] = useState("");
  const [letterTemplate, setLetterTemplate] = useState<LetterTemplate>("section609");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [letterCopied, setLetterCopied] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);
  const [savedLetters, setSavedLetters] = useState<LetterRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingDisputeId, setEditingDisputeId] = useState<string | null>(null);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calSelectedDay, setCalSelectedDay] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) {
      void Promise.all([loadClients(), loadDisputes(), loadNotes(), loadLetters(), loadDocuments()]);
    } else {
      setClients([]);
      setDisputes([]);
      setNotes([]);
      setSavedLetters([]);
      setDocuments([]);
    }
  }, [session]);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    setClients(data || []);
  };

  const loadDisputes = async () => {
    const { data, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    setDisputes(data || []);
  };

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    setNotes(data || []);
  };

  const loadLetters = async () => {
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSavedLetters(data || []);
  };

  const loadDocuments = async () => {
    if (!session?.user) return;
    const { data } = await supabase.storage.from("documents").list(session.user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    setDocuments((data as DocumentRow[]) || []);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Account created. Check your email for confirmation.");
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Signed in successfully.");
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAddClient = async () => {
    if (!session?.user) return;
    if (!clientName || !clientEmail) { setMessage("Enter client name and email."); return; }
    setSavingClient(true);
    setMessage("");
    const { error } = await supabase.from("clients").insert({
      user_id: session.user.id,
      full_name: clientName,
      email: clientEmail,
      phone: clientPhone || null,
      address: clientAddress || null,
      dob: clientDOB || null,
      status: clientStatus,
      plan: clientPlan,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setClientName(""); setClientEmail(""); setClientPhone(""); setClientAddress(""); setClientDOB("");
      setClientStatus("Active");
      setClientPlan("Standard Plan");
      setMessage("Customer added successfully.");
      await loadClients();
    }
    setSavingClient(false);
  };

  const handleAddDispute = async () => {
    if (!session?.user) return;
    if (!selectedClientId || !creditor || !reason) {
      setMessage("Choose a client, creditor, and reason.");
      return;
    }
    setSavingDispute(true);
    setMessage("");
    const { error } = await supabase.from("disputes").insert({
      user_id: session.user.id,
      client_id: selectedClientId,
      creditor,
      reason,
      status: disputeStatus,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setSelectedClientId("");
      setCreditor("");
      setReason("");
      setDisputeStatus("Draft");
      setMessage("Dispute added successfully.");
      await loadDisputes();
    }
    setSavingDispute(false);
  };

  const handleAddNote = async () => {
    if (!session?.user) return;
    if (!noteText.trim()) { setMessage("Enter a note."); return; }
    if (!noteClientId && !noteDisputeId) { setMessage("Choose a client or a dispute."); return; }
    setSavingNote(true);
    setMessage("");
    const { error } = await supabase.from("notes").insert({
      user_id: session.user.id,
      client_id: noteClientId || null,
      dispute_id: noteDisputeId || null,
      note_text: noteText,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setNoteClientId("");
      setNoteDisputeId("");
      setNoteText("");
      setMessage("Note added successfully.");
      await loadNotes();
    }
    setSavingNote(false);
  };

  const handleUpload = async () => {
    if (!session?.user) { setMessage("You must be signed in."); return; }
    if (!file) { setMessage("Choose a file first."); return; }
    setUploading(true);
    setMessage("");
    const safeName = file.name.replace(/\s+/g, "-");
    const filePath = `${session.user.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { upsert: false });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("File uploaded successfully.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadDocuments();
    }
    setUploading(false);
  };

  const handleDeleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditClient = (c: ClientRow) => {
    setEditingClientId(c.id);
    setClientName(c.full_name);
    setClientEmail(c.email);
    setClientPhone(c.phone ?? "");
    setClientAddress(c.address ?? "");
    setClientDOB(c.dob ?? "");
    setClientStatus(c.status);
    setClientPlan(c.plan);
    setActiveSection("clients");
  };

  const handleUpdateClient = async () => {
    if (!editingClientId) return;
    setSavingClient(true);
    setMessage("");
    const { error } = await supabase
      .from("clients")
      .update({ full_name: clientName, email: clientEmail, phone: clientPhone || null, address: clientAddress || null, dob: clientDOB || null, status: clientStatus, plan: clientPlan })
      .eq("id", editingClientId);
    if (error) {
      setMessage(error.message);
    } else {
      setEditingClientId(null);
      setClientName(""); setClientEmail(""); setClientPhone(""); setClientAddress(""); setClientDOB("");
      setClientStatus("Active");
      setClientPlan("Standard Plan");
      setMessage("Customer updated successfully.");
      await loadClients();
    }
    setSavingClient(false);
  };

  const handleDeleteDispute = async (id: string) => {
    const { error } = await supabase.from("disputes").delete().eq("id", id);
    if (error) { setMessage(error.message); return; }
    setDisputes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleEditDispute = (d: DisputeRow) => {
    setEditingDisputeId(d.id);
    setSelectedClientId(d.client_id);
    setCreditor(d.creditor);
    setReason(d.reason);
    setDisputeStatus(d.status);
    setActiveSection("disputes");
  };

  const handleUpdateDispute = async () => {
    if (!editingDisputeId) return;
    setSavingDispute(true);
    setMessage("");
    const { error } = await supabase
      .from("disputes")
      .update({ client_id: selectedClientId, creditor, reason, status: disputeStatus })
      .eq("id", editingDisputeId);
    if (error) {
      setMessage(error.message);
    } else {
      setEditingDisputeId(null);
      setSelectedClientId("");
      setCreditor("");
      setReason("");
      setDisputeStatus("Draft");
      setMessage("Dispute updated successfully.");
      await loadDisputes();
    }
    setSavingDispute(false);
  };

  const handleGenerateLetter = () => {
    const client = clients.find((c) => c.id === letterClientId);
    const dispute = disputes.find((d) => d.id === letterDisputeId);
    if (!client || !dispute) { setMessage("Select a client and a dispute to generate a letter."); return; }
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    setGeneratedLetter(buildLetter(letterTemplate, client.full_name, client.email, dispute.creditor, dispute.reason, date));
    setMessage("");
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter).then(() => {
      setLetterCopied(true);
      setTimeout(() => setLetterCopied(false), 2000);
    });
  };

  const handleSaveLetter = async () => {
    if (!session?.user || !generatedLetter || !letterClientId || !letterDisputeId) return;
    setSavingLetter(true);
    const { error } = await supabase.from("letters").insert({
      user_id: session.user.id,
      client_id: letterClientId,
      dispute_id: letterDisputeId,
      template: letterTemplate,
      content: generatedLetter,
    });
    if (error) { setMessage(error.message); }
    else { setMessage("Letter saved to history."); await loadLetters(); }
    setSavingLetter(false);
  };

  const handlePrintLetter = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Dispute Letter</title><style>body{font-family:Georgia,serif;line-height:1.8;padding:60px;max-width:700px;margin:0 auto;font-size:15px;color:#1a1a1a;}pre{white-space:pre-wrap;word-wrap:break-word;font-family:Georgia,serif;}</style></head><body><pre>${generatedLetter.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "—";
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "Unknown";
  };

  const getDisputeLabel = (disputeId: string | null) => {
    if (!disputeId) return "—";
    const dispute = disputes.find((d) => d.id === disputeId);
    return dispute ? `${dispute.creditor} – ${dispute.status}` : "Unknown";
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main style={s.loginPage}>
        <div style={s.loginCard}>
          <h1 style={{ color: "#0f172a" }}>Missing Supabase environment variables</h1>
          <p style={{ color: "#64748b" }}>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={s.loginPage}>
        <div style={s.loginCard}>
          <div style={{ marginBottom: 28 }}>
            <div style={s.loginEyebrow}>Credit Repair CRM</div>
            <h1 style={s.loginTitle}>DisputePilot</h1>
          </div>
          <h2 style={s.loginHeading}>Welcome Back</h2>
          <p style={s.loginSub}>Sign in to your account or create a new one to get started.</p>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button style={s.btnPrimary} onClick={handleSignIn} disabled={loading}>
              {loading ? "Please wait..." : "Sign In"}
            </button>
            <button style={s.btnSecondary} onClick={handleSignUp} disabled={loading}>
              Create Account
            </button>
          </div>
          {message ? <p style={s.formMsg}>{message}</p> : null}
        </div>
      </main>
    );
  }

  const draftDisputes = disputes.filter((d) => d.status === "Draft").length;
  const sentDisputes = disputes.filter((d) => d.status === "Sent").length;
  const activeClients = clients.filter((c) => c.status === "Active").length;

  const pageLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? "";

  return (
    <div style={s.appRoot}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarBrand}>
          <div style={s.brandBadge}>DP</div>
          <div>
            <div style={s.brandName}>DisputePilot</div>
            <div style={s.brandSub}>Credit Repair CRM</div>
          </div>
        </div>

        <nav style={s.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setMessage(""); }}
              style={activeSection === item.id ? { ...s.navBtn, ...s.navBtnActive } : s.navBtn}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.sidebarEmail}>{session.user.email}</div>
          <button style={s.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={s.mainWrap}>
        {/* Top bar */}
        <header style={s.topBar}>
          <h2 style={s.topBarTitle}>{pageLabel}</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {activeSection === "clients" && (
              <button style={s.btnPrimary} onClick={handleAddClient} disabled={savingClient}>
                + Add Customer
              </button>
            )}
            {activeSection === "disputes" && (
              <button style={s.btnPrimary} onClick={handleAddDispute} disabled={savingDispute}>
                + Add Dispute
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={s.pageContent}>
          {message ? (
            <div style={s.alert}>{message}</div>
          ) : null}

          {/* ─── DASHBOARD ─── */}
          {activeSection === "dashboard" && (
            <>
              {/* Stat cards */}
              <div style={s.statsRow}>
                <StatCard icon="👥" label="Total Customers" value={clients.length} color="#dbeafe" />
                <StatCard icon="✅" label="Active Clients" value={activeClients} color="#dcfce7" />
                <StatCard icon="⚖" label="Total Disputes" value={disputes.length} color="#fef9c3" />
                <StatCard icon="📋" label="Draft Disputes" value={draftDisputes} color="#fce7f3" />
              </div>

              {/* Overview panels */}
              <div style={s.overviewGrid}>
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Recent Customers</h3>
                  {clients.length === 0 ? (
                    <p style={s.emptyTxt}>No customers yet. Add your first one.</p>
                  ) : (
                    clients.slice(0, 6).map((c) => (
                      <div key={c.id} style={s.listRow}>
                        <div style={s.rowAvatar}>{c.full_name.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.rowName}>{c.full_name}</div>
                          <div style={s.rowSub}>{c.email}</div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))
                  )}
                  {clients.length > 0 && (
                    <button style={s.seeAllBtn} onClick={() => setActiveSection("clients")}>
                      See All Customers →
                    </button>
                  )}
                </div>

                <div style={s.card}>
                  <h3 style={s.cardTitle}>Recent Disputes</h3>
                  {disputes.length === 0 ? (
                    <p style={s.emptyTxt}>No disputes yet. Add your first one.</p>
                  ) : (
                    disputes.slice(0, 6).map((d) => (
                      <div key={d.id} style={s.listRow}>
                        <div style={{ ...s.rowAvatar, background: "#fef3c7", color: "#92400e" }}>
                          {d.creditor.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.rowName}>{d.creditor}</div>
                          <div style={s.rowSub}>{getClientName(d.client_id)}</div>
                        </div>
                        <DisputeBadge status={d.status} />
                      </div>
                    ))
                  )}
                  {disputes.length > 0 && (
                    <button style={s.seeAllBtn} onClick={() => setActiveSection("disputes")}>
                      See All Disputes →
                    </button>
                  )}
                </div>
              </div>

              {/* Dispute status strip + Upcoming events */}
              <div style={s.overviewGrid}>
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Dispute Status Overview</h3>
                  <div style={s.statusStrip}>
                    {(["Draft", "Sent", "Under Review", "Deleted"] as const).map((status) => {
                      const count = disputes.filter((d) => d.status === status).length;
                      return (
                        <div key={status} style={s.statusCell}>
                          <div style={s.statusCount}>{count}</div>
                          <div style={s.statusLabel}>{status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={s.cardTitle}>Upcoming Deadlines</h3>
                    <button style={s.seeAllBtn} onClick={() => setActiveSection("calendar")}>View Calendar →</button>
                  </div>
                  {(() => {
                    const upcoming = disputes
                      .filter((d) => d.status === "Sent")
                      .map((d) => {
                        const deadline = new Date(d.created_at);
                        deadline.setDate(deadline.getDate() + 30);
                        return { ...d, deadline };
                      })
                      .filter((d) => d.deadline >= today)
                      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
                      .slice(0, 5);
                    if (upcoming.length === 0) return <p style={s.emptyTxt}>No upcoming deadlines.</p>;
                    return upcoming.map((d) => {
                      const daysLeft = Math.ceil((d.deadline.getTime() - today.getTime()) / 86400000);
                      return (
                        <div key={d.id} style={s.listRow}>
                          <div style={{ ...s.rowAvatar, background: daysLeft <= 7 ? "#fee2e2" : "#fef9c3", color: daysLeft <= 7 ? "#991b1b" : "#713f12", fontSize: 13, fontWeight: 700 }}>
                            {daysLeft}d
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={s.rowName}>{d.creditor}</div>
                            <div style={s.rowSub}>{getClientName(d.client_id)} · due {d.deadline.toLocaleDateString()}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          )}

          {/* ─── CLIENTS ─── */}
          {activeSection === "clients" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>{editingClientId ? "Edit Customer" : "Add New Customer"}</h3>
                {editingClientId && (
                  <button
                    style={{ ...s.btnSecondary, marginBottom: 16, fontSize: 13 }}
                    onClick={() => { setEditingClientId(null); setClientName(""); setClientEmail(""); setClientPhone(""); setClientAddress(""); setClientDOB(""); setClientStatus("Active"); setClientPlan("Standard Plan"); }}
                  >
                    ← Cancel Edit
                  </button>
                )}
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client full name"
                />
                <label style={s.label}>Email</label>
                <input
                  style={s.input}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                />
                <label style={s.label}>Phone</label>
                <input
                  style={s.input}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                />
                <label style={s.label}>Address</label>
                <input
                  style={s.input}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                />
                <label style={s.label}>Date of Birth</label>
                <input
                  style={s.input}
                  type="date"
                  value={clientDOB}
                  onChange={(e) => setClientDOB(e.target.value)}
                />
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={clientStatus}
                  onChange={(e) => setClientStatus(e.target.value)}
                >
                  <option>Active</option>
                  <option>Needs Docs</option>
                  <option>Lead</option>
                </select>
                <label style={s.label}>Plan</label>
                <select
                  style={s.input}
                  value={clientPlan}
                  onChange={(e) => setClientPlan(e.target.value)}
                >
                  <option>Standard Plan</option>
                  <option>Premium Repair</option>
                  <option>Business Credit Build</option>
                </select>
                <button
                  style={{ ...s.btnPrimary, marginTop: 20, width: "100%" }}
                  onClick={editingClientId ? handleUpdateClient : handleAddClient}
                  disabled={savingClient}
                >
                  {savingClient ? "Saving..." : editingClientId ? "Update Customer" : "Save Customer"}
                </button>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>All Customers ({clients.length})</h3>
                {clients.length === 0 ? (
                  <p style={s.emptyTxt}>No customers saved yet.</p>
                ) : (
                  clients.map((c) => (
                    <div key={c.id} style={{ ...s.listRow, cursor: "pointer" }} onClick={() => setActiveClientId(c.id)}>
                      <div style={s.rowAvatar}>{c.full_name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.rowName}>{c.full_name}</div>
                        <div style={s.rowSub}>{c.email} · {c.plan}</div>
                      </div>
                      <StatusBadge status={c.status} />
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>
                        <button style={s.actionBtn} onClick={() => handleEditClient(c)}>Edit</button>
                        <button style={{ ...s.actionBtn, ...s.actionBtnDanger }} onClick={() => handleDeleteClient(c.id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── CLIENT DETAIL ─── */}
          {activeSection === "clients" && activeClientId && (() => {
            const client = clients.find((c) => c.id === activeClientId);
            if (!client) return null;
            const clientDisputes = disputes.filter((d) => d.client_id === activeClientId);
            const clientNotes = notes.filter((n) => n.client_id === activeClientId);
            return (
              <div style={s.detailOverlay} onClick={() => setActiveClientId(null)}>
                <div style={s.detailPanel} onClick={(e) => e.stopPropagation()}>
                  <div style={s.detailHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ ...s.rowAvatar, width: 52, height: 52, fontSize: 22 }}>{client.full_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{client.full_name}</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>{client.email}</div>
                      </div>
                    </div>
                    <button style={s.detailClose} onClick={() => setActiveClientId(null)}>✕</button>
                  </div>

                  <div style={s.detailGrid}>
                    <div style={s.detailField}><span style={s.detailLabel}>Phone</span><span>{client.phone || "—"}</span></div>
                    <div style={s.detailField}><span style={s.detailLabel}>DOB</span><span>{client.dob || "—"}</span></div>
                    <div style={s.detailField}><span style={s.detailLabel}>Status</span><StatusBadge status={client.status} /></div>
                    <div style={s.detailField}><span style={s.detailLabel}>Plan</span><span>{client.plan}</span></div>
                    {client.address && <div style={{ ...s.detailField, gridColumn: "1 / -1" }}><span style={s.detailLabel}>Address</span><span>{client.address}</span></div>}
                  </div>

                  <h4 style={s.detailSectionTitle}>Disputes ({clientDisputes.length})</h4>
                  {clientDisputes.length === 0 ? <p style={s.emptyTxt}>No disputes for this client.</p> : clientDisputes.map((d) => (
                    <div key={d.id} style={s.listRow}>
                      <div style={{ ...s.rowAvatar, background: "#fef3c7", color: "#92400e" }}>{d.creditor.charAt(0)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={s.rowName}>{d.creditor}</div><div style={s.rowSub}>{d.reason}</div></div>
                      <DisputeBadge status={d.status} />
                    </div>
                  ))}

                  <h4 style={s.detailSectionTitle}>Notes ({clientNotes.length})</h4>
                  {clientNotes.length === 0 ? <p style={s.emptyTxt}>No notes for this client.</p> : clientNotes.map((n) => (
                    <div key={n.id} style={s.listRow}>
                      <div style={{ ...s.rowAvatar, background: "#f0fdf4", color: "#166534" }}>✎</div>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={s.rowName}>{n.note_text}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ─── DISPUTES ─── */}
          {activeSection === "disputes" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>{editingDisputeId ? "Edit Dispute" : "Add New Dispute"}</h3>
                {editingDisputeId && (
                  <button
                    style={{ ...s.btnSecondary, marginBottom: 16, fontSize: 13 }}
                    onClick={() => { setEditingDisputeId(null); setSelectedClientId(""); setCreditor(""); setReason(""); setDisputeStatus("Draft"); }}
                  >
                    ← Cancel Edit
                  </button>
                )}
                <label style={s.label}>Client</label>
                <select
                  style={s.input}
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
                <label style={s.label}>Creditor</label>
                <input
                  style={s.input}
                  value={creditor}
                  onChange={(e) => setCreditor(e.target.value)}
                  placeholder="Capital One, Experian, etc."
                />
                <label style={s.label}>Reason</label>
                <input
                  style={s.input}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Late payment inaccurate, not mine, etc."
                />
                <label style={s.label}>Status</label>
                <select
                  style={s.input}
                  value={disputeStatus}
                  onChange={(e) => setDisputeStatus(e.target.value)}
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Under Review</option>
                  <option>Deleted</option>
                </select>
                <button
                  style={{ ...s.btnPrimary, marginTop: 20, width: "100%" }}
                  onClick={editingDisputeId ? handleUpdateDispute : handleAddDispute}
                  disabled={savingDispute}
                >
                  {savingDispute ? "Saving..." : editingDisputeId ? "Update Dispute" : "Save Dispute"}
                </button>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>All Disputes ({disputes.length})</h3>
                {disputes.length === 0 ? (
                  <p style={s.emptyTxt}>No disputes saved yet.</p>
                ) : (
                  disputes.map((d) => (
                    <div key={d.id} style={s.listRow}>
                      <div style={{ ...s.rowAvatar, background: "#fef3c7", color: "#92400e" }}>
                        {d.creditor.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.rowName}>{d.creditor}</div>
                        <div style={s.rowSub}>{getClientName(d.client_id)} · {d.reason}</div>
                      </div>
                      <DisputeBadge status={d.status} />
                      <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                        <button style={s.actionBtn} onClick={() => handleEditDispute(d)}>Edit</button>
                        <button style={{ ...s.actionBtn, ...s.actionBtnDanger }} onClick={() => handleDeleteDispute(d.id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── NOTES ─── */}
          {activeSection === "notes" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Add Note</h3>
                <label style={s.label}>Client (optional)</label>
                <select
                  style={s.input}
                  value={noteClientId}
                  onChange={(e) => setNoteClientId(e.target.value)}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
                <label style={s.label}>Dispute (optional)</label>
                <select
                  style={s.input}
                  value={noteDisputeId}
                  onChange={(e) => setNoteDisputeId(e.target.value)}
                >
                  <option value="">Select dispute</option>
                  {disputes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.creditor} – {getClientName(d.client_id)}
                    </option>
                  ))}
                </select>
                <label style={s.label}>Note</label>
                <textarea
                  style={{ ...s.input, minHeight: 130, resize: "vertical" }}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter note details..."
                />
                <button
                  style={{ ...s.btnPrimary, marginTop: 16, width: "100%" }}
                  onClick={handleAddNote}
                  disabled={savingNote}
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>All Notes ({notes.length})</h3>
                {notes.length === 0 ? (
                  <p style={s.emptyTxt}>No notes saved yet.</p>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} style={s.listRow}>
                      <div style={{ ...s.rowAvatar, background: "#f0fdf4", color: "#166534" }}>✎</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.rowName}>{n.note_text}</div>
                        <div style={s.rowSub}>
                          {getClientName(n.client_id)} · {getDisputeLabel(n.dispute_id)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── LETTERS ─── */}
          {activeSection === "letters" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Generate Dispute Letter</h3>
                <label style={s.label}>Client</label>
                <select
                  style={s.input}
                  value={letterClientId}
                  onChange={(e) => { setLetterClientId(e.target.value); setLetterDisputeId(""); setGeneratedLetter(""); }}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
                <label style={s.label}>Dispute</label>
                <select
                  style={s.input}
                  value={letterDisputeId}
                  onChange={(e) => { setLetterDisputeId(e.target.value); setGeneratedLetter(""); }}
                  disabled={!letterClientId}
                >
                  <option value="">Select dispute</option>
                  {disputes
                    .filter((d) => d.client_id === letterClientId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.creditor} – {d.reason}</option>
                    ))}
                </select>
                <label style={s.label}>Letter Type</label>
                {LETTER_TEMPLATES.map((t) => (
                  <label key={t.id} style={s.radioRow}>
                    <input
                      type="radio"
                      name="letterTemplate"
                      value={t.id}
                      checked={letterTemplate === t.id}
                      onChange={() => { setLetterTemplate(t.id); setGeneratedLetter(""); }}
                      style={{ marginRight: 10 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{t.description}</div>
                    </div>
                  </label>
                ))}
                <button
                  style={{ ...s.btnPrimary, marginTop: 20, width: "100%" }}
                  onClick={handleGenerateLetter}
                  disabled={!letterClientId || !letterDisputeId}
                >
                  Generate Letter
                </button>
              </div>

              <div style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Letter Preview</h3>
                    {generatedLetter && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={s.btnSecondary} onClick={handleCopyLetter}>{letterCopied ? "Copied!" : "Copy"}</button>
                      <button style={s.btnSecondary} onClick={handlePrintLetter}>Print / PDF</button>
                      <button style={s.btnPrimary} onClick={handleSaveLetter} disabled={savingLetter}>{savingLetter ? "Saving..." : "Save"}</button>
                    </div>
                  )}
                </div>
                {generatedLetter ? (
                  <textarea
                    style={{ ...s.input, minHeight: 480, fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.7, resize: "vertical" }}
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                  />
                ) : (
                  <div style={s.emptyLetterBox}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✉</div>
                    <p style={{ color: "#64748b", margin: 0 }}>Select a client, dispute, and letter type, then click Generate Letter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "letters" && savedLetters.length > 0 && (
            <div style={{ ...s.card, marginTop: 24 }}>
              <h3 style={s.cardTitle}>Letter History ({savedLetters.length})</h3>
              {savedLetters.map((l) => (
                <div key={l.id} style={s.listRow}>
                  <div style={{ ...s.rowAvatar, background: "#ede9fe", color: "#5b21b6" }}>✉</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.rowName}>{LETTER_TEMPLATES.find((t) => t.id === l.template)?.label ?? l.template}</div>
                    <div style={s.rowSub}>{getClientName(l.client_id)} · {new Date(l.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── DOCUMENTS ─── */}
          {activeSection === "documents" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Upload Document</h3>
                <p style={{ color: "#64748b", marginTop: 0, marginBottom: 24 }}>
                  Upload client documents, credit reports, or supporting files.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <div style={s.uploadBox}>
                  <div style={s.uploadIconWrap}>📁</div>
                  <p style={s.uploadFileName}>
                    {file ? file.name : "No file selected"}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 20px" }}>
                    Supports PDF, DOC, DOCX, JPG, PNG
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button style={s.btnSecondary} onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </button>
                    <button style={s.btnPrimary} onClick={handleUpload} disabled={uploading || !file}>
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Uploaded Files ({documents.length})</h3>
                {documents.length === 0 ? (
                  <p style={s.emptyTxt}>No documents uploaded yet.</p>
                ) : (
                  documents.map((doc) => {
                    const ext = doc.name.split(".").pop()?.toUpperCase() ?? "FILE";
                    return (
                      <div key={doc.id} style={s.listRow}>
                        <div style={{ ...s.rowAvatar, background: "#f0f9ff", color: "#0369a1", fontSize: 11, fontWeight: 700 }}>{ext}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.rowName}>{doc.name.replace(/^\d+-/, "")}</div>
                          <div style={s.rowSub}>{new Date(doc.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          {/* ─── CALENDAR ─── */}
          {activeSection === "calendar" && (() => {
            // Build event map: dateStr -> list of event labels
            const events: Record<string, { label: string; color: string }[]> = {};
            const addEvent = (dateStr: string, label: string, color: string) => {
              if (!events[dateStr]) events[dateStr] = [];
              events[dateStr].push({ label, color });
            };

            disputes.forEach((d) => {
              const created = new Date(d.created_at).toISOString().slice(0, 10);
              addEvent(created, `Dispute filed: ${d.creditor}`, "#dbeafe");
              if (d.status === "Sent") {
                const deadline = new Date(d.created_at);
                deadline.setDate(deadline.getDate() + 30);
                addEvent(deadline.toISOString().slice(0, 10), `30-day deadline: ${d.creditor}`, "#fee2e2");
              }
            });
            clients.forEach((c) => {
              const created = new Date(c.created_at).toISOString().slice(0, 10);
              addEvent(created, `Client added: ${c.full_name}`, "#dcfce7");
            });

            // Calendar grid
            const firstDay = new Date(calYear, calMonth, 1).getDay();
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const monthName = new Date(calYear, calMonth).toLocaleString("en-US", { month: "long", year: "numeric" });
            const todayStr = today.toISOString().slice(0, 10);

            const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
            while (cells.length % 7 !== 0) cells.push(null);

            const selectedEvents = calSelectedDay ? (events[calSelectedDay] ?? []) : [];

            return (
              <div style={s.twoCol}>
                <div style={s.card}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <button style={s.calNavBtn} onClick={() => {
                      if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                      else setCalMonth(m => m - 1);
                      setCalSelectedDay(null);
                    }}>‹</button>
                    <h3 style={{ ...s.cardTitle, margin: 0 }}>{monthName}</h3>
                    <button style={s.calNavBtn} onClick={() => {
                      if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                      else setCalMonth(m => m + 1);
                      setCalSelectedDay(null);
                    }}>›</button>
                  </div>

                  {/* Day labels */}
                  <div style={s.calGrid}>
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                      <div key={d} style={s.calDayLabel}>{d}</div>
                    ))}

                    {/* Day cells */}
                    {cells.map((day, i) => {
                      if (!day) return <div key={`empty-${i}`} />;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === calSelectedDay;
                      const dayEvents = events[dateStr] ?? [];
                      return (
                        <div
                          key={dateStr}
                          style={{
                            ...s.calCell,
                            ...(isToday ? s.calCellToday : {}),
                            ...(isSelected ? s.calCellSelected : {}),
                          }}
                          onClick={() => setCalSelectedDay(isSelected ? null : dateStr)}
                        >
                          <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400 }}>{day}</span>
                          {dayEvents.slice(0, 2).map((ev, j) => (
                            <div key={j} style={{ ...s.calDot, background: ev.color }} />
                          ))}
                          {dayEvents.length > 2 && <div style={{ fontSize: 10, color: "#94a3b8" }}>+{dayEvents.length - 2}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Event detail panel */}
                <div style={s.card}>
                  <h3 style={s.cardTitle}>
                    {calSelectedDay
                      ? new Date(calSelectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                      : "Select a date"}
                  </h3>
                  {!calSelectedDay ? (
                    <p style={s.emptyTxt}>Click a date to see events.</p>
                  ) : selectedEvents.length === 0 ? (
                    <p style={s.emptyTxt}>No events on this date.</p>
                  ) : (
                    selectedEvents.map((ev, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: ev.color, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "#0f172a" }}>{ev.label}</span>
                      </div>
                    ))
                  )}

                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: "0 0 12px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Legend</h4>
                    {[
                      { color: "#dcfce7", label: "Client added" },
                      { color: "#dbeafe", label: "Dispute filed" },
                      { color: "#fee2e2", label: "30-day response deadline" },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, border: "1px solid #e2e8f0" }} />
                        <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── REPORTS ─── */}
          {activeSection === "reports" && (() => {
            const statusList = ["Draft", "Sent", "Under Review", "Deleted"] as const;
            const maxCount = Math.max(...statusList.map((s) => disputes.filter((d) => d.status === s).length), 1);
            const planList = ["Standard Plan", "Premium Repair", "Business Credit Build"];
            const planColors = ["#dbeafe", "#dcfce7", "#fef9c3"];
            const topClients = clients
              .map((c) => ({ ...c, count: disputes.filter((d) => d.client_id === c.id).length }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            return (
              <>
                <div style={s.statsRow}>
                  <StatCard icon="👥" label="Total Customers" value={clients.length} color="#dbeafe" />
                  <StatCard icon="✅" label="Active Clients" value={clients.filter((c) => c.status === "Active").length} color="#dcfce7" />
                  <StatCard icon="⚖" label="Total Disputes" value={disputes.length} color="#fef9c3" />
                  <StatCard icon="✉" label="Letters Generated" value={savedLetters.length} color="#ede9fe" />
                </div>

                <div style={s.overviewGrid}>
                  <div style={s.card}>
                    <h3 style={s.cardTitle}>Disputes by Status</h3>
                    {statusList.map((status) => {
                      const count = disputes.filter((d) => d.status === status).length;
                      const pct = Math.round((count / maxCount) * 100);
                      return (
                        <div key={status} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{status}</span>
                            <span style={{ fontSize: 14, color: "#64748b" }}>{count}</span>
                          </div>
                          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", borderRadius: 4, transition: "width 0.3s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={s.card}>
                    <h3 style={s.cardTitle}>Top Clients by Disputes</h3>
                    {topClients.length === 0 ? (
                      <p style={s.emptyTxt}>No data yet.</p>
                    ) : topClients.map((c, i) => (
                      <div key={c.id} style={s.listRow}>
                        <div style={{ ...s.rowAvatar, background: "#f1f5f9", color: "#475569", fontWeight: 700 }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={s.rowName}>{c.full_name}</div>
                          <div style={s.rowSub}>{c.count} dispute{c.count !== 1 ? "s" : ""}</div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.card}>
                  <h3 style={s.cardTitle}>Clients by Plan</h3>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                    {planList.map((plan, i) => {
                      const count = clients.filter((c) => c.plan === plan).length;
                      return (
                        <div key={plan} style={{ flex: "1 1 160px", background: planColors[i], borderRadius: 12, padding: "20px 24px" }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{count}</div>
                          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{plan}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </main>

        <footer style={s.footer}>
          <span>© 2026 DisputePilot — Credit Repair CRM. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}

/* ── Small helper components ── */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIconWrap, background: color }}>{icon}</div>
      <div>
        <div style={s.statLabel}>{label}</div>
        <div style={s.statValue}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, React.CSSProperties> = {
    Active: { background: "#dcfce7", color: "#166534" },
    Lead: { background: "#dbeafe", color: "#1d4ed8" },
    "Needs Docs": { background: "#fef9c3", color: "#713f12" },
  };
  const style = colors[status] ?? { background: "#f1f5f9", color: "#64748b" };
  return <span style={{ ...s.badge, ...style }}>{status}</span>;
}

function DisputeBadge({ status }: { status: string }) {
  const colors: Record<string, React.CSSProperties> = {
    Draft: { background: "#dbeafe", color: "#1d4ed8" },
    Sent: { background: "#dcfce7", color: "#166534" },
    "Under Review": { background: "#fef9c3", color: "#713f12" },
    Deleted: { background: "#fee2e2", color: "#991b1b" },
  };
  const style = colors[status] ?? { background: "#f1f5f9", color: "#64748b" };
  return <span style={{ ...s.badge, ...style }}>{status}</span>;
}

/* ── Styles ── */

const s: Record<string, React.CSSProperties> = {
  // Login
  loginPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loginCard: {
    background: "white",
    borderRadius: 16,
    padding: "40px 48px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
  },
  loginEyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: 6,
  },
  loginTitle: {
    fontSize: 34,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  loginHeading: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
  },
  loginSub: {
    color: "#64748b",
    fontSize: 14,
    margin: "0 0 24px",
  },
  formMsg: {
    marginTop: 14,
    color: "#2563eb",
    fontSize: 14,
  },

  // App shell
  appRoot: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  // Sidebar
  sidebar: {
    width: 240,
    background: "#0f172a",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
    position: "sticky" as const,
    top: 0,
    height: "100vh",
    overflowY: "auto" as const,
  },
  sidebarBrand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "24px 20px",
    borderBottom: "1px solid #1e293b",
  },
  brandBadge: {
    width: 40,
    height: 40,
    background: "#2563eb",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
  },
  brandName: {
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: "1.2",
  },
  brandSub: {
    color: "#475569",
    fontSize: 11,
  },
  sidebarNav: {
    padding: "16px 12px",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    fontSize: 14,
    fontWeight: 500,
  },
  navBtnActive: {
    background: "#2563eb",
    color: "white",
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: "center" as const,
  },
  sidebarFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #1e293b",
  },
  sidebarEmail: {
    color: "#475569",
    fontSize: 12,
    marginBottom: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  signOutBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
    width: "100%",
  },

  // Main
  mainWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    minWidth: 0,
  },
  topBar: {
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  topBarTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  pageContent: {
    padding: "28px 32px",
    flex: 1,
  },

  // Alert
  alert: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 20,
    color: "#1d4ed8",
    fontSize: 14,
  },

  // Stats row
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 18,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: "1",
  },

  // Overview
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },

  // Status strip
  statusStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1,
    background: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  statusCell: {
    background: "white",
    padding: "16px 0",
    textAlign: "center" as const,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 4,
  },
  statusLabel: {
    color: "#64748b",
    fontSize: 13,
  },

  // Two-col form+list layout
  twoCol: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 24,
    alignItems: "start",
  },

  // Cards
  card: {
    background: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
    marginBottom: 20,
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },

  // List rows
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #f8fafc",
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  rowName: {
    fontWeight: 600,
    color: "#0f172a",
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  rowSub: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  seeAllBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    padding: "12px 0 0",
    display: "block",
  },

  // Badge
  badge: {
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  },

  // Upload
  uploadBox: {
    border: "2px dashed #cbd5e1",
    borderRadius: 12,
    padding: "40px 24px",
    textAlign: "center" as const,
  },
  uploadIconWrap: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadFileName: {
    color: "#374151",
    fontWeight: 600,
    margin: "0 0 6px",
  },

  // Form elements
  label: {
    display: "block",
    marginBottom: 6,
    marginTop: 14,
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
    fontFamily: "inherit",
  },

  // Buttons
  btnPrimary: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "inherit",
  },
  btnSecondary: {
    background: "white",
    color: "#374151",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "inherit",
  },

  emptyTxt: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center" as const,
    padding: "24px 0",
    margin: 0,
  },

  // Calendar
  calNavBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    width: 34,
    height: 34,
    cursor: "pointer",
    fontSize: 18,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  calDayLabel: {
    textAlign: "center" as const,
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    padding: "4px 0 8px",
  },
  calCell: {
    minHeight: 64,
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    padding: "6px 8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    gap: 3,
    background: "white",
    transition: "background 0.15s",
  },
  calCellToday: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },
  calCellSelected: {
    background: "#2563eb",
    color: "white",
    border: "2px solid #1d4ed8",
  },
  calDot: {
    width: "100%",
    height: 4,
    borderRadius: 2,
  },

  // Client detail overlay
  detailOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  detailPanel: {
    background: "white",
    width: "100%",
    maxWidth: 520,
    height: "100vh",
    overflowY: "auto" as const,
    padding: "28px 32px",
    boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
  },
  detailHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid #e2e8f0",
  },
  detailClose: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    width: 34,
    height: 34,
    cursor: "pointer",
    fontSize: 16,
    color: "#64748b",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 24,
  },
  detailField: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    fontSize: 14,
    color: "#0f172a",
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#94a3b8",
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    margin: "20px 0 12px",
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
  },

  // Action buttons
  actionBtn: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#475569",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  actionBtnDanger: {
    color: "#dc2626",
    borderColor: "#fecaca",
    background: "#fff5f5",
  },

  // Letters
  radioRow: {
    display: "flex",
    alignItems: "flex-start",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    marginBottom: 8,
    cursor: "pointer",
    background: "white",
  },
  emptyLetterBox: {
    minHeight: 300,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    borderRadius: 10,
    border: "2px dashed #e2e8f0",
    padding: 40,
    textAlign: "center" as const,
  },

  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0",
    padding: "14px 32px",
    color: "#94a3b8",
    fontSize: 12,
    background: "white",
  },
};
