"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) {
      loadClients();
      loadDisputes();
      loadNotes();
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

    if (error) {
      setMessage(error.message);
      return;
    }

    setClients(data || []);
  };

  const loadDisputes = async () => {
    const { data, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDisputes(data || []);
  };

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes(data || []);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created. Check your email for confirmation.");
    }

    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  const handleAddClient = async () => {
    if (!session?.user) return;

    if (!clientName || !clientEmail) {
      setMessage("Enter client name and email.");
      return;
    }

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
      setMessage("Client added.");
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
      setMessage("Dispute added.");
      await loadDisputes();
    }

    setSavingDispute(false);
  };

  const handleAddNote = async () => {
    if (!session?.user) return;

    if (!noteText) {
      setMessage("Enter a note.");
      return;
    }

    if (!noteClientId && !noteDisputeId) {
      setMessage("Choose a client or a dispute.");
      return;
    }

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
      setMessage("Note added.");
      await loadNotes();
    }

    setSavingNote(false);
  };

  const handleUpload = async () => {
    if (!file || !session?.user) {
      setMessage("Choose a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("File uploaded successfully.");
      setFile(null);
    }

    setUploading(false);
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "No client";
    const client = clients.find((c) => c.id === clientId);
    return client ? client.full_name : "Unknown Client";
  };

  const getDisputeLabel = (disputeId: string | null) => {
    if (!disputeId) return "No dispute";
    const dispute = disputes.find((d) => d.id === disputeId);
    return dispute ? `${dispute.creditor} - ${dispute.status}` : "Unknown Dispute";
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>Missing Supabase environment variables</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Credit Repair CRM</div>
            <h1 style={styles.title}>DisputePilot</h1>
          </div>
        </div>

        {!session ? (
          <div style={styles.card}>
            <h2 style={styles.heading}>Admin Login</h2>
            <p style={styles.subtext}>Create your account first, then sign in.</p>

            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={handleSignIn} disabled={loading}>
                {loading ? "Please wait..." : "Sign In"}
              </button>
              <button style={styles.secondaryButton} onClick={handleSignUp} disabled={loading}>
                Create Account
              </button>
            </div>

            {message ? <p style={styles.message}>{message}</p> : null}
          </div>
        ) : (
          <>
            <div style={styles.topCard}>
              <div>
                <div style={styles.loggedIn}>Logged in as</div>
                <div style={styles.emailText}>{session.user.email}</div>
              </div>
              <button style={styles.primaryButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Add Client</h2>

              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client full name"
              />

              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@email.com"
              />

              <label style={styles.label}>Status</label>
              <select
                style={styles.input}
                value={clientStatus}
                onChange={(e) => setClientStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Needs Docs</option>
                <option>Lead</option>
              </select>

              <label style={styles.label}>Plan</label>
              <select
                style={styles.input}
                value={clientPlan}
                onChange={(e) => setClientPlan(e.target.value)}
              >
                <option>Standard Plan</option>
                <option>Premium Repair</option>
                <option>Business Credit Build</option>
              </select>

              <div style={styles.buttonRow}>
                <button
                  style={styles.primaryButton}
                  onClick={handleAddClient}
                  disabled={savingClient}
                >
                  {savingClient ? "Saving..." : "Save Client"}
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Add Dispute</h2>

              <label style={styles.label}>Client</label>
              <select
                style={styles.input}
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>

              <label style={styles.label}>Creditor</label>
              <input
                style={styles.input}
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="Capital One, Experian, etc."
              />

              <label style={styles.label}>Reason</label>
              <input
                style={styles.input}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Late payment inaccurate, not mine, etc."
              />

              <label style={styles.label}>Status</label>
              <select
                style={styles.input}
                value={disputeStatus}
                onChange={(e) => setDisputeStatus(e.target.value)}
              >
                <option>Draft</option>
                <option>Sent</option>
                <option>Under Review</option>
                <option>Deleted</option>
              </select>

              <div style={styles.buttonRow}>
                <button
                  style={styles.primaryButton}
                  onClick={handleAddDispute}
                  disabled={savingDispute}
                >
                  {savingDispute ? "Saving..." : "Save Dispute"}
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Add Note</h2>

              <label style={styles.label}>Client</label>
              <select
                style={styles.input}
                value={noteClientId}
                onChange={(e) => setNoteClientId(e.target.value)}
              >
                <option value="">Optional client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>

              <label style={styles.label}>Dispute</label>
              <select
                style={styles.input}
                value={noteDisputeId}
                onChange={(e) => setNoteDisputeId(e.target.value)}
              >
                <option value="">Optional dispute</option>
                {disputes.map((dispute) => (
                  <option key={dispute.id} value={dispute.id}>
                    {dispute.creditor} - {getClientName(dispute.client_id)}
                  </option>
                ))}
              </select>

              <label style={styles.label}>Note</label>
              <textarea
                style={styles.textarea}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter note details"
              />

              <div style={styles.buttonRow}>
                <button
                  style={styles.primaryButton}
                  onClick={handleAddNote}
                  disabled={savingNote}
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>

              {message ? <p style={styles.message}>{message}</p> : null}
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Upload Document</h2>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ marginBottom: "12px" }}
              />

              <div style={styles.buttonRow}>
                <button
                  style={styles.primaryButton}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
              </div>

              {message ? <p style={styles.message}>{message}</p> : null}
            </div>

            <div style={styles.grid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Clients</div>
                <div style={styles.statValue}>{clients.length}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Disputes</div>
                <div style={styles.statValue}>{disputes.length}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Notes</div>
                <div style={styles.statValue}>{notes.length}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Draft Disputes</div>
                <div style={styles.statValue}>
                  {disputes.filter((d) => d.status === "Draft").length}
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Saved Clients</h2>

              {clients.length === 0 ? (
                <p style={styles.subtext}>No clients saved yet.</p>
              ) : (
                <div style={styles.clientList}>
                  {clients.map((client) => (
                    <div key={client.id} style={styles.clientCard}>
                      <div>
                        <div style={styles.clientName}>{client.full_name}</div>
                        <div style={styles.clientMeta}>{client.email}</div>
                      </div>
                      <div style={styles.rightInfo}>
                        <div style={styles.badge}>{client.status}</div>
                        <div style={styles.clientMeta}>{client.plan}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Saved Disputes</h2>

              {disputes.length === 0 ? (
                <p style={styles.subtext}>No disputes saved yet.</p>
              ) : (
                <div style={styles.clientList}>
                  {disputes.map((dispute) => (
                    <div key={dispute.id} style={styles.clientCard}>
                      <div>
                        <div style={styles.clientName}>{dispute.creditor}</div>
                        <div style={styles.clientMeta}>
                          {getClientName(dispute.client_id)}
                        </div>
                        <div style={styles.clientMeta}>{dispute.reason}</div>
                      </div>
                      <div style={styles.rightInfo}>
                        <div style={styles.badge}>{dispute.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Saved Notes</h2>

              {notes.length === 0 ? (
                <p style={styles.subtext}>No notes saved yet.</p>
              ) : (
                <div style={styles.clientList}>
                  {notes.map((note) => (
                    <div key={note.id} style={styles.clientCard}>
                      <div>
                        <div style={styles.clientName}>{note.note_text}</div>
                        <div style={styles.clientMeta}>
                          Client: {getClientName(note.client_id)}
                        </div>
                        <div style={styles.clientMeta}>
                          Dispute: {getDisputeLabel(note.dispute_id)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#030712",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: "24px",
  },
  wrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#9ca3af",
    fontSize: "14px",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  },
  topCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  heading: {
    marginTop: 0,
    marginBottom: "10px",
  },
  subtext: {
    color: "#9ca3af",
    marginTop: 0,
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "12px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #374151",
    background: "#0f172a",
    color: "white",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #374151",
    background: "#0f172a",
    color: "white",
    marginBottom: "12px",
    minHeight: "120px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  primaryButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondaryButton: {
    background: "#1f2937",
    color: "white",
    border: "1px solid #374151",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "16px",
    color: "#93c5fd",
  },
  loggedIn: {
    color: "#9ca3af",
    fontSize: "14px",
    marginBottom: "8px",
  },
  emailText: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px",
  },
  statLabel: {
    color: "#9ca3af",
    marginBottom: "10px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
  },
  clientList: {
    display: "grid",
    gap: "12px",
  },
  clientCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "16px",
    flexWrap: "wrap",
  },
  clientName: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "6px",
  },
  clientMeta: {
    color: "#9ca3af",
  },
  rightInfo: {
    textAlign: "right",
  },
  badge: {
    display: "inline-block",
    background: "#1f2937",
    borderRadius: "999px",
    padding: "6px 10px",
    marginBottom: "6px",
  },
};