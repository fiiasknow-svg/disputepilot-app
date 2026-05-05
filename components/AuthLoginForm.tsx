"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthLoginFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  alternateHref: string;
  alternateLabel: string;
  redirectTo?: string;
  showForgotPassword?: boolean;
};

export default function AuthLoginForm({
  title,
  description,
  submitLabel,
  alternateHref,
  alternateLabel,
  redirectTo,
  showForgotPassword = false,
}: AuthLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Unable to sign in with those credentials.");
      return;
    }

    setStatus("success");
    setMessage("Signed in successfully.");

    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 28, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 42, height: 42, borderRadius: 7, background: "#2563eb", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, marginBottom: 16 }}>
            DP
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, lineHeight: 1.2, color: "#0f172a" }}>{title}</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>{description}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#334155", fontSize: 13, fontWeight: 600 }}>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#0f172a" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#334155", fontSize: 13, fontWeight: 600 }}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#0f172a" }}
            />
          </label>

          {message && (
            <p role="status" style={{ margin: 0, color: status === "error" ? "#b91c1c" : "#047857", fontSize: 13 }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            style={{ marginTop: 4, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "11px 14px", fontSize: 14, fontWeight: 700, cursor: status === "submitting" ? "wait" : "pointer" }}
          >
            {status === "submitting" ? "Signing in..." : submitLabel}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18, fontSize: 13 }}>
          <Link href={alternateHref} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
            {alternateLabel}
          </Link>
          {showForgotPassword && (
            <Link href="/login" aria-disabled="true" style={{ color: "#64748b", textDecoration: "none" }}>
              Forgot password
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
