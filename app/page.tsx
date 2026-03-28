"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

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

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>Missing Supabase environment variables</h1>
          <p>
            Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and locally.
          </p>
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
            <p style={styles.subtext}>
              Create your account first, then sign in.
            </p>

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
              <button
                style={styles.primaryButton}
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Sign In"}
              </button>

              <button
                style={styles.secondaryButton}
                onClick={handleSignUp}
                disabled={loading}
              >
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
                <div style={styles.email}>{session.user.email}</div>
              </div>

              <button style={styles.primaryButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>

            <div style={styles.grid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Active Clients</div>
                <div style={styles.statValue}>128</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Open Disputes</div>
                <div style={styles.statValue}>342</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Monthly Revenue</div>
                <div style={styles.statValue}>$9,480</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pending Tasks</div>
                <div style={styles.statValue}>27</div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.heading}>Dashboard Connected</h2>
              <p style={styles.subtext}>
                Your app is now connected to Supabase Auth.
              </p>
              <ul style={styles.list}>
                <li>You can create an admin account.</li>
                <li>You can sign in and sign out.</li>
                <li>Next step is saving real clients to the database.</li>
              </ul>
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
  email: {
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
  list: {
    color: "#d1d5db",
    lineHeight: 1.8,
    paddingLeft: "20px",
  },
};