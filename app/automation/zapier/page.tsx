"use client";

import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const STORAGE_KEY = "disputepilot.automation.zapier";
const WEBHOOK_URL = "https://local.disputepilot.test/webhooks/zapier/website-lead";

export default function ZapierAutomationPage() {
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      setToken(saved.token || "");
      setEnabled(saved.enabled ?? true);
      setStatus("Saved Zapier settings loaded locally.");
    } catch {
      setStatus("Saved Zapier settings could not be loaded.");
    }
  }, []);

  async function copyWebhook() {
    try {
      await navigator.clipboard?.writeText(WEBHOOK_URL);
      setStatus("Zapier webhook URL copied.");
    } catch {
      setStatus("Zapier webhook URL copied status recorded locally. Clipboard unavailable, so select the URL manually.");
    }
  }

  function saveSettings(message = "Zapier settings saved locally.") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, enabled, savedAt: new Date().toISOString() }));
    setStatus(message);
  }

  return (
    <CDMLayout>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Zapier Integration</h1>
          <p className="text-sm text-slate-600">Configure local Zapier handoff details. No external Zapier call is made from this page.</p>
        </div>

        {status && <div role="status" className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{status}</div>}

        <section className="max-w-3xl rounded-lg border bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="zapier-webhook">Webhook URL</label>
          <div className="mb-4 flex gap-2">
            <input id="zapier-webhook" readOnly value={WEBHOOK_URL} className="flex-1 rounded border px-3 py-2 text-sm" />
            <button onClick={copyWebhook} className="rounded bg-slate-800 px-4 py-2 text-sm font-bold text-white">Copy Webhook</button>
          </div>

          <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="zapier-token">API Key or connection token</label>
          <input id="zapier-token" value={token} onChange={(event) => setToken(event.target.value)} className="mb-4 w-full rounded border px-3 py-2 text-sm" placeholder="Paste your Zapier connection token" />

          <label className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={enabled} onChange={() => setEnabled((current) => !current)} />
            Zapier workflow enabled locally
          </label>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => token.trim() ? saveSettings("Zapier connection saved locally. No external Zapier validation was performed.") : setStatus("Enter a Zapier token before connecting.")} className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white">Connect</button>
            <button onClick={() => setStatus("Local Zap test recorded. No external Zapier request was sent.")} className="rounded bg-amber-500 px-4 py-2 text-sm font-bold text-white">Record Local Test</button>
            <button onClick={() => saveSettings()} className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white">Save Settings</button>
          </div>
        </section>
      </main>
    </CDMLayout>
  );
}
