"use client";

import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

const STORAGE_KEY = "disputepilot.automation.goHighLevel";

export default function GoHighLevelAutomationPage() {
  const [locationId, setLocationId] = useState("");
  const [token, setToken] = useState("");
  const [pipeline, setPipeline] = useState("Credit Repair Pipeline");
  const [stage, setStage] = useState("New Lead");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      setLocationId(saved.locationId || "");
      setToken(saved.token || "");
      setPipeline(saved.pipeline || "Credit Repair Pipeline");
      setStage(saved.stage || "New Lead");
      setStatus("Saved GoHighLevel settings loaded locally.");
    } catch {
      setStatus("Saved GoHighLevel settings could not be loaded.");
    }
  }, []);

  function saveSettings(message = "GoHighLevel settings saved locally.") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ locationId, token, pipeline, stage, savedAt: new Date().toISOString() }));
    setStatus(message);
  }

  return (
    <CDMLayout>
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">GoHighLevel Integration</h1>
          <p className="text-sm text-slate-600">Store local Go-HighLevel routing details. No real GHL API request is sent.</p>
        </div>

        {status && <div role="status" className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{status}</div>}

        <section className="grid max-w-3xl gap-4 rounded-lg border bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-700" htmlFor="ghl-location">Location ID</label>
          <input id="ghl-location" value={locationId} onChange={(event) => setLocationId(event.target.value)} className="rounded border px-3 py-2 text-sm" placeholder="GHL location ID" />

          <label className="text-sm font-bold text-slate-700" htmlFor="ghl-token">API Key/Token</label>
          <input id="ghl-token" value={token} onChange={(event) => setToken(event.target.value)} className="rounded border px-3 py-2 text-sm" placeholder="GHL API key or private integration token" />

          <label className="text-sm font-bold text-slate-700" htmlFor="ghl-pipeline">Pipeline</label>
          <input id="ghl-pipeline" value={pipeline} onChange={(event) => setPipeline(event.target.value)} className="rounded border px-3 py-2 text-sm" />

          <label className="text-sm font-bold text-slate-700" htmlFor="ghl-stage">Stage</label>
          <input id="ghl-stage" value={stage} onChange={(event) => setStage(event.target.value)} className="rounded border px-3 py-2 text-sm" />

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => locationId.trim() && token.trim() ? saveSettings("GoHighLevel connection saved locally. No external GHL validation was performed.") : setStatus("Enter Location ID and API Key/Token before connecting.")} className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white">Connect</button>
            <button onClick={() => setStatus("Local GoHighLevel connection test recorded. No external API request was sent.")} className="rounded bg-amber-500 px-4 py-2 text-sm font-bold text-white">Record Local Test</button>
            <button onClick={() => saveSettings()} className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white">Save Settings</button>
          </div>
        </section>
      </main>
    </CDMLayout>
  );
}
