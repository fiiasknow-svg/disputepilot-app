"use client";

import { useState } from "react";

const defaults = {
  portalUrl: "https://portal.disputepilot.com/client",
  branding: "DisputePilot",
  welcomeMessage: "Welcome to your secure client portal.",
  portalEnabled: true,
  documentUploads: true,
  secureMessages: true,
  mobileEnabled: true,
  pushNotifications: false,
  biometricLogin: true,
  appName: "DisputePilot Mobile",
};

export default function PortalsPage() {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [logoName, setLogoName] = useState("No logo selected");
  const [message, setMessage] = useState("");

  function update(key: keyof typeof defaults, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function saveSettings() {
    setSaved(form);
    setMessage(`Portal and mobile app settings saved for ${form.branding}.`);
  }

  function resetSettings() {
    setForm(saved);
    setMessage("Portal changes were reset.");
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portals / Mobile App</h1>
          <p className="text-sm text-gray-600">Manage client portal access, branding, and mobile settings.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-4 py-2 font-semibold" onClick={resetSettings}>
            Reset
          </button>
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={saveSettings}>
            Save Portal Settings
          </button>
        </div>
      </div>

      {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">{message}</div>}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Client Portal</h2>

          <label className="block text-sm font-semibold text-gray-700">
            Portal URL
            <input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.portalUrl} onChange={(e) => update("portalUrl", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold text-gray-700">
            Logo
            <input
              className="mt-1 w-full rounded border p-2 font-normal text-gray-900"
              type="file"
              onChange={(e) => setLogoName(e.target.files?.[0]?.name || "No logo selected")}
            />
          </label>
          <p className="text-sm text-gray-600">Selected logo: {logoName}</p>

          <label className="block text-sm font-semibold text-gray-700">
            Branding
            <input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.branding} onChange={(e) => update("branding", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold text-gray-700">
            Welcome Message
            <textarea className="mt-1 min-h-24 w-full rounded border p-2 font-normal text-gray-900" value={form.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} />
          </label>

          {[
            ["portalEnabled", "Enable Client Portal"],
            ["documentUploads", "Allow Document Uploads"],
            ["secureMessages", "Enable Secure Messages"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={Boolean(form[key as keyof typeof form])} onChange={(e) => update(key as keyof typeof defaults, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Mobile App</h2>
          <label className="block text-sm font-semibold text-gray-700">
            App Display Name
            <input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.appName} onChange={(e) => update("appName", e.target.value)} />
          </label>

          {[
            ["mobileEnabled", "Enable Mobile App Access"],
            ["pushNotifications", "Enable Push Notifications"],
            ["biometricLogin", "Allow Biometric Login"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={Boolean(form[key as keyof typeof form])} onChange={(e) => update(key as keyof typeof defaults, e.target.checked)} />
              {label}
            </label>
          ))}

          <div className="rounded border bg-gray-50 p-3 text-sm">
            <p className="font-semibold text-gray-700">Saved Portal Summary</p>
            <p className="mt-1 text-gray-900">{saved.branding} at {saved.portalUrl}</p>
            <p className="text-gray-700">Portal: {saved.portalEnabled ? "Enabled" : "Disabled"} / Mobile: {saved.mobileEnabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
