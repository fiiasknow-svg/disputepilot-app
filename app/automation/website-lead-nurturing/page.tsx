"use client";

import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type Step = {
  id: string;
  name: string;
  delay: string;
  channel: string;
  message: string;
  enabled: boolean;
};

const STORAGE_KEY = "disputepilot.automation.websiteLeadNurturing";
const DEFAULT_STEPS: Step[] = [
  { id: "welcome", name: "Welcome lead", delay: "Immediately", channel: "Email", message: "Thanks for requesting a consultation. We will review your details shortly.", enabled: true },
  { id: "sms-follow-up", name: "SMS follow-up", delay: "1 day", channel: "SMS", message: "We are ready to help with your credit goals. Reply when you have a few minutes.", enabled: true },
  { id: "portal-invite", name: "Portal invite", delay: "3 days", channel: "Portal", message: "Create your portal account to upload documents and track next steps.", enabled: false },
];

export default function WebsiteLeadNurturingPage() {
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Step>(DEFAULT_STEPS[0]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved?.steps) return;
      setSteps(saved.steps);
      setStatus("Saved nurture sequence loaded locally.");
    } catch {
      setStatus("Saved nurture sequence could not be loaded.");
    }
  }, []);

  function saveSequence(message = "Website lead nurture sequence saved locally.") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ steps, savedAt: new Date().toISOString() }));
    setStatus(message);
  }

  function openEdit(step: Step) {
    setEditingId(step.id);
    setDraft(step);
  }

  function applyEdit() {
    setSteps((current) => current.map((step) => step.id === editingId ? draft : step));
    setEditingId(null);
    setStatus("Nurture step updated locally.");
  }

  function addStep() {
    const next: Step = { id: `step-${Date.now()}`, name: "New nurture step", delay: "5 days", channel: "Email", message: "Add your follow-up message.", enabled: true };
    setSteps((current) => [...current, next]);
    setEditingId(next.id);
    setDraft(next);
    setStatus("New nurture step added locally.");
  }

  return (
    <CDMLayout>
      <main className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Website Lead Nurturing</h1>
            <p className="text-sm text-slate-600">Manage local follow-up steps for website leads. The form builder remains at /leads/website-lead-form.</p>
          </div>
          <button onClick={addStep} className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Step</button>
        </div>

        {status && <div role="status" className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{status}</div>}

        <section className="grid gap-3">
          {steps.map((step) => (
            <article key={step.id} aria-label={`${step.name} nurture step`} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{step.name}</h2>
                  <p className="text-sm text-slate-600">{step.channel} after {step.delay}</p>
                  <p className="mt-2 text-sm text-slate-700">{step.message}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">Status: {step.enabled ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button aria-pressed={step.enabled} onClick={() => setSteps((current) => current.map((item) => item.id === step.id ? { ...item, enabled: !item.enabled } : item))} className={`rounded px-3 py-2 text-sm font-bold ${step.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{step.enabled ? "Enabled" : "Disabled"}</button>
                  <button onClick={() => openEdit(step)} className="rounded bg-slate-800 px-3 py-2 text-sm font-bold text-white">Edit</button>
                  <button onClick={() => setStatus(`${step.name} test send queued locally.`)} className="rounded bg-amber-500 px-3 py-2 text-sm font-bold text-white">Test Send</button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {editingId && (
          <section className="mt-5 max-w-3xl rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Edit nurture step</h2>
            <div className="grid gap-3">
              <label className="text-sm font-bold text-slate-700" htmlFor="nurture-name">Step name</label>
              <input id="nurture-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="rounded border px-3 py-2 text-sm" />
              <label className="text-sm font-bold text-slate-700" htmlFor="nurture-delay">Delay</label>
              <input id="nurture-delay" value={draft.delay} onChange={(event) => setDraft({ ...draft, delay: event.target.value })} className="rounded border px-3 py-2 text-sm" />
              <label className="text-sm font-bold text-slate-700" htmlFor="nurture-channel">Channel</label>
              <select id="nurture-channel" value={draft.channel} onChange={(event) => setDraft({ ...draft, channel: event.target.value })} className="rounded border px-3 py-2 text-sm">
                {["Email", "SMS", "Portal"].map((channel) => <option key={channel}>{channel}</option>)}
              </select>
              <label className="text-sm font-bold text-slate-700" htmlFor="nurture-message">Message</label>
              <textarea id="nurture-message" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} className="min-h-20 rounded border px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={applyEdit} className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save Step</button>
                <button onClick={() => setEditingId(null)} className="rounded bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Cancel</button>
              </div>
            </div>
          </section>
        )}

        <button onClick={() => saveSequence()} className="mt-5 rounded bg-green-600 px-4 py-2 text-sm font-bold text-white">Save Sequence</button>
      </main>
    </CDMLayout>
  );
}
