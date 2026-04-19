"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const STEPS = ["pending", "sent", "responded", "resolved"];
const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", sent: "#8b5cf6", responded: "#3b82f6", resolved: "#10b981", deleted: "#ef4444" };
const BUREAU_COLORS: Record<string, string> = { equifax: "#e53e3e", experian: "#2b6cb0", transunion: "#276749" };
const TABS = ["Overview", "Letters Sent", "Bureau Response", "Timeline"];

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [updating, setUpdating] = useState(false);
  const [response, setResponse] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => {
    async function load() {
      const [d, l] = await Promise.all([
        supabase.from("disputes").select("*, clients(first_name, last_name, email, phone)").eq("id", id).single(),
        supabase.from("dispute_letters").select("*").eq("dispute_id", id).order("created_at", { ascending: false }),
      ]);
      setDispute(d.data);
      setLetters(l.data || []);
      if (d.data?.bureau_response) setResponse(d.data.bureau_response);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await supabase.from("disputes").update({ status }).eq("id", id);
    setDispute((d: any) => ({ ...d, status }));
    setUpdating(false);
  }

  async function saveBureauResponse() {
    setSavingResponse(true);
    await supabase.from("disputes").update({ bureau_response: response, status: "responded" }).eq("id", id);
    setDispute((d: any) => ({ ...d, bureau_response: response, status: "responded" }));
    setSavingResponse(false);
  }

  if (loading) return <CDMLayout><div style={{ padding: 32, color: "#94a3b8" }}>Loading…</div></CDMLayout>;
  if (!dispute) return <CDMLayout><div style={{ padding: 32 }}>Dispute not found. <button onClick={() => router.push("/disputes")} style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Back</button></div></CDMLayout>;

  const currentStep = STEPS.indexOf(dispute.status);

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <button onClick={() => router.push("/disputes")} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Back to Disputes</button>

        {/* Header */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>{dispute.account_name || "Dispute"}</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ background: (BUREAU_COLORS[dispute.bureau] || "#94a3b8") + "22", color: BUREAU_COLORS[dispute.bureau] || "#64748b", borderRadius: 6, padding: "3px 12px", fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>{dispute.bureau}</span>
                <span style={{ background: (STATUS_COLORS[dispute.status] || "#94a3b8") + "22", color: STATUS_COLORS[dispute.status] || "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>{dispute.status}</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>Round {dispute.round || 1}</span>
              </div>
              {dispute.clients && <p style={{ margin: "8px 0 0", fontSize: 14, color: "#475569" }}>Client: <strong>{dispute.clients.first_name} {dispute.clients.last_name}</strong></p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {STEPS.filter(s => s !== dispute.status && s !== "deleted").map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating} style={{ fontSize: 12, padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: "#fff", textTransform: "capitalize" }}>→ {s}</button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: "flex", marginBottom: 8 }}>
              {STEPS.map((step, i) => (
                <div key={step} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && <div style={{ flex: 1, height: 3, background: i <= currentStep ? "#1e3a5f" : "#e2e8f0" }} />}
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= currentStep ? "#1e3a5f" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: i <= currentStep ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    {i < STEPS.length - 1 && <div style={{ flex: 1, height: 3, background: i < currentStep ? "#1e3a5f" : "#e2e8f0" }} />}
                  </div>
                  <div style={{ fontSize: 11, color: i <= currentStep ? "#1e3a5f" : "#94a3b8", marginTop: 4, textTransform: "capitalize", fontWeight: i === currentStep ? 700 : 400 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{t}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "Overview" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Dispute Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
              {[["Account Name", dispute.account_name], ["Account Number", dispute.account_number || "—"], ["Bureau", dispute.bureau], ["Reason", dispute.reason || "—"], ["Round", `Round ${dispute.round || 1}`], ["Filed", new Date(dispute.created_at).toLocaleDateString()],
              ].map(([l, v]) => (
                <div key={l as string}><span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{l}</span><p style={{ margin: "2px 0 0", fontSize: 14, color: "#1e293b", textTransform: l === "Bureau" ? "capitalize" : undefined }}>{v}</p></div>
              ))}
            </div>
          </div>
        )}

        {/* Letters Sent Tab */}
        {tab === "Letters Sent" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Letters Sent ({letters.length})</h3>
            {letters.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No letters sent yet for this dispute.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {letters.map(l => (
                  <div key={l.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{l.title || "Dispute Letter"}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                    {l.content && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#475569", whiteSpace: "pre-wrap" }}>{l.content.substring(0, 200)}…</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bureau Response Tab */}
        {tab === "Bureau Response" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Bureau Response</h3>
            <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Paste or type the bureau's response here…"
              style={{ width: "100%", minHeight: 160, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={saveBureauResponse} disabled={savingResponse} style={{ marginTop: 12, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{savingResponse ? "Saving…" : "Save Response"}</button>
          </div>
        )}

        {/* Timeline Tab */}
        {tab === "Timeline" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Dispute Timeline</h3>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
              {[
                { label: "Dispute created", date: dispute.created_at, color: "#3b82f6" },
                ...letters.map(l => ({ label: `Letter sent: ${l.title || "Dispute Letter"}`, date: l.created_at, color: "#8b5cf6" })),
                ...(dispute.bureau_response ? [{ label: "Bureau response received", date: dispute.updated_at || dispute.created_at, color: "#f59e0b" }] : []),
                ...(dispute.status === "resolved" ? [{ label: "Dispute resolved", date: dispute.updated_at || dispute.created_at, color: "#10b981" }] : []),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ position: "absolute", left: 0, width: 16, height: 16, borderRadius: "50%", background: item.color, border: "2px solid #fff", boxShadow: "0 0 0 2px " + item.color, marginTop: 2 }} />
                  <div style={{ marginLeft: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{item.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
