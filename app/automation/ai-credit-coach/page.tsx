"use client";

import { useEffect, useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const STORAGE_KEY = "disputepilot.automation.aiCreditCoach";

export default function AICreditCoachPage() {
  const [scenario, setScenario] = useState("");
  const [bureau, setBureau] = useState("Experian");
  const [account, setAccount] = useState("");
  const [facts, setFacts] = useState("");
  const [guidance, setGuidance] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      setScenario(saved.scenario || "");
      setBureau(saved.bureau || "Experian");
      setAccount(saved.account || "");
      setFacts(saved.facts || "");
      setGuidance(saved.guidance || "");
      setStatus("Saved coach note loaded locally.");
    } catch {
      setStatus("Saved coach note could not be loaded.");
    }
  }, []);

  const generated = useMemo(() => {
    const issue = scenario.trim() || "the reported credit issue";
    const accountName = account.trim() || "the selected account";
    const factSummary = facts.trim() || "the client-provided facts";
    return [
      `Review ${bureau} reporting for ${accountName} and confirm the exact inaccurate fields before drafting a dispute.`,
      `Client issue: ${issue}.`,
      `Facts to preserve: ${factSummary}.`,
      "Recommended next step: request bureau investigation, attach supporting documents, and set a 30 day follow-up task.",
      "Local guidance only. Review for compliance before sending to a client or bureau.",
    ].join("\n");
  }, [account, bureau, facts, scenario]);

  async function copyGuidance() {
    try {
      await navigator.clipboard?.writeText(guidance || generated);
      setStatus("AI Credit Coach guidance copied.");
    } catch {
      setStatus("AI Credit Coach guidance copied status recorded locally. Clipboard unavailable, so select the guidance manually.");
    }
  }

  function saveCoachNote() {
    const note = guidance || generated;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenario, bureau, account, facts, guidance: note, savedAt: new Date().toISOString() }));
    setGuidance(note);
    setStatus("AI Credit Coach note saved locally.");
  }

  return (
    <CDMLayout>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">AI Credit Coach</h1>
          <p className="text-sm text-slate-600">Generate deterministic local guidance for a credit repair scenario. No external AI call is made.</p>
        </div>

        {status && <div role="status" className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{status}</div>}

        <section className="grid max-w-4xl gap-4 rounded-lg border bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-700" htmlFor="coach-scenario">Client scenario/problem</label>
          <textarea id="coach-scenario" value={scenario} onChange={(event) => setScenario(event.target.value)} className="min-h-24 rounded border px-3 py-2 text-sm" placeholder="Example: Client has a paid collection still reporting as open." />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="coach-bureau">Bureau</label>
              <select id="coach-bureau" value={bureau} onChange={(event) => setBureau(event.target.value)} className="w-full rounded border px-3 py-2 text-sm">
                {["Experian", "Equifax", "TransUnion"].map((name) => <option key={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="coach-account">Account</label>
              <input id="coach-account" value={account} onChange={(event) => setAccount(event.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="Account or furnisher name" />
            </div>
          </div>

          <label className="text-sm font-bold text-slate-700" htmlFor="coach-facts">Facts and documents</label>
          <textarea id="coach-facts" value={facts} onChange={(event) => setFacts(event.target.value)} className="min-h-20 rounded border px-3 py-2 text-sm" placeholder="Payment proof, dates, report fields, client notes" />

          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setGuidance(generated); setStatus("AI Credit Coach guidance generated locally."); }} className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white">Generate Guidance</button>
            <button onClick={copyGuidance} className="rounded bg-slate-800 px-4 py-2 text-sm font-bold text-white">Copy Guidance</button>
            <button onClick={saveCoachNote} className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white">Save Coach Note</button>
          </div>

          <pre className="whitespace-pre-wrap rounded border bg-slate-50 p-4 text-sm text-slate-800">{guidance || generated}</pre>
        </section>
      </main>
    </CDMLayout>
  );
}
