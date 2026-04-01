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

type ActiveSection = "dashboard" | "clients" | "disputes" | "notes" | "documents";

const NAV_ITEMS: { id: ActiveSection; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "clients", label: "Customers", icon: "👥" },
  { id: "disputes", label: "Dispute Manager", icon: "⚖" },
  { id: "notes", label: "Notes", icon: "✎" },
  { id: "documents", label: "Documents", icon: "📁" },
];

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
  const [clientStatus, setClientStatus] = useState("Active");
  const [clientPlan, setClientPlan] = useState("Standard Plan");
  const [savingClient, setSavingClient] = useState(false);

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
      void loadClients();
      void loadDisputes();
      void loadNotes();
    } else {
      setClients([]);
      setDisputes([]);
      setNotes([]);
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
      status: clientStatus,
      plan: clientPlan,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setClientName("");
      setClientEmail("");
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
    }
    setUploading(false);
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

              {/* Dispute status strip */}
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
            </>
          )}

          {/* ─── CLIENTS ─── */}
          {activeSection === "clients" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Add New Customer</h3>
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
                  onClick={handleAddClient}
                  disabled={savingClient}
                >
                  {savingClient ? "Saving..." : "Save Customer"}
                </button>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>All Customers ({clients.length})</h3>
                {clients.length === 0 ? (
                  <p style={s.emptyTxt}>No customers saved yet.</p>
                ) : (
                  clients.map((c) => (
                    <div key={c.id} style={s.listRow}>
                      <div style={s.rowAvatar}>{c.full_name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.rowName}>{c.full_name}</div>
                        <div style={s.rowSub}>{c.email} · {c.plan}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── DISPUTES ─── */}
          {activeSection === "disputes" && (
            <div style={s.twoCol}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Add New Dispute</h3>
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
                  onClick={handleAddDispute}
                  disabled={savingDispute}
                >
                  {savingDispute ? "Saving..." : "Save Dispute"}
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

          {/* ─── DOCUMENTS ─── */}
          {activeSection === "documents" && (
            <div style={{ maxWidth: 600 }}>
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
            </div>
          )}
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

  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0",
    padding: "14px 32px",
    color: "#94a3b8",
    fontSize: 12,
    background: "white",
  },
};
