"use client";

import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

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

const portalSections = [
  {
    title: "Client Tracking Portal",
    description:
      "Give your clients an easy way to track their dispute progress, upload documents, and send you messages securely.",
    video:
      "Watch the video below to see what your clients experience inside the Client Tracking Portal.",
    preview:
      "Preview what your clients see inside the Client Tracking Portal - no login required.",
    qaTitle: "Client Tracking Portal Q&A",
    questions: [
      "What is the Client Tracking Portal?",
      "How can my clients access it?",
      "Can my clients upload images and documents?",
      "Will clients see their credit reports inside the portal?",
      "Can I customize the portal with my company details?",
    ],
    linkTitle: "Client Tracking Portal Link",
    linkHelp:
      "Use this link to connect your Client Portal to your website or share it directly with your customers.",
    link: "https://www.creditrestorationportal.com/Account/Login",
  },
  {
    title: "Affiliate Portal",
    description:
      "Empower your referral partners to track their leads, view commissions, and manage their performance in real time.",
    video:
      "Watch the video below to see what affiliates experience after signing up.",
    preview: "Preview the Affiliate Portal view - see exactly what your partners will see.",
    qaTitle: "Affiliate Portal Q&A",
    questions: [
      "What is the Affiliate Portal used for?",
      "How do affiliates sign up?",
      "What information can affiliates see?",
      "Can I adjust affiliate commission amounts?",
      "Can I preview the Affiliate Portal myself?",
    ],
    linkTitle: "Affiliate Portal Link",
    linkHelp:
      "Use this link to add the Affiliate Portal to your website or share it with partners who refer new clients.",
    link: "https://www.affiliatecreditrepairportal.com/Account/Login",
  },
];

const mobileQuestions = [
  "What is the Client Tracking Mobile App?",
  "Which app stores are available?",
  "How do I find the app in the stores?",
  "Is the mobile app included in my plan?",
  "Can I customize the app with my logo or brand colors?",
  "Are there templates to let the customer know?",
  "How can I let the customers know right now about the app?",
  "Can my customers upload images and documents?",
  "Client Tracking Portal Login: What if I don't want the customer to get the app?",
];

const appLinks = [
  {
    label: "Android Application",
    url: "https://play.google.com/store/apps/details?id=com.incode.portal_client",
  },
  {
    label: "IOS Application",
    url: "https://apps.apple.com/us/app/client-tracking-portal/id1549632923",
  },
];

export default function PortalsPage() {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [logoName, setLogoName] = useState("No logo selected");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

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

  async function copyLink(url: string) {
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // The visible confirmation still mirrors the original copied state when clipboard APIs are unavailable.
    }
    setCopied(url);
  }

  return (
    <CDMLayout>
      <main className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Portals / Mobile App</h1>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dashboard Portals / Mobile App</p>
          <button className="rounded border px-4 py-2 text-sm font-semibold text-gray-700">BACK</button>
          <p className="max-w-5xl text-sm leading-6 text-gray-700">
            In this area, you can access and share all your company's portals - the Client Tracking Portal,
            Affiliate Portal, and Mobile App. These tools allow your clients to track their credit repair
            progress, your affiliates to monitor referrals, and your business to stay connected and organized in
            one place.
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          {portalSections.map((section) => (
            <article key={section.title} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="text-sm leading-6 text-gray-700">{section.description}</p>
                <p className="text-sm leading-6 text-gray-700">{section.video}</p>
                <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">WATCH VIDEO</button>
                <p className="text-sm leading-6 text-gray-700">{section.preview}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">{section.qaTitle}</h3>
                <div className="divide-y rounded border">
                  {section.questions.map((question) => (
                    <p key={question} className="px-3 py-2 text-sm text-gray-700">
                      {question}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded border bg-gray-50 p-3">
                <h3 className="font-semibold">{section.linkTitle}</h3>
                <p className="text-sm leading-6 text-gray-700">{section.linkHelp}</p>
                <p className="break-all text-sm text-gray-900">{section.link}</p>
                <button
                  className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  onClick={() => copyLink(section.link)}
                >
                  COPY LINK
                </button>
                {copied === section.link && <p className="text-xs font-semibold text-green-700">Copied!</p>}
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Client Tracking Portal Mobile Application</h2>
          <p className="text-sm leading-6 text-gray-700">
            In this area, you can give your customers access to the mobile Client Tracking Portal, allowing them
            to log in and view their status in real time.
          </p>
          <p className="text-sm leading-6 text-gray-700">
            Share these links with your customers so they can download the Client Tracking Portal mobile app.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {appLinks.map((appLink) => (
              <div key={appLink.label} className="space-y-2 rounded border bg-gray-50 p-3">
                <h3 className="font-semibold">{appLink.label}</h3>
                <p className="break-all text-sm text-gray-900">{appLink.url}</p>
                <button
                  className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  onClick={() => copyLink(appLink.url)}
                >
                  COPY LINK
                </button>
                {copied === appLink.url && <p className="text-xs font-semibold text-green-700">Copied!</p>}
              </div>
            ))}
          </div>

          <div className="divide-y rounded border">
            {mobileQuestions.map((question) => (
              <p key={question} className="px-3 py-2 text-sm text-gray-700">
                {question}
              </p>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Portal Settings</h2>
              <p className="text-sm text-gray-600">
                Manage client portal access, branding, and mobile settings after sharing the portal links above.
              </p>
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

          {message && (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
              {message}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded border bg-gray-50 p-4">
              <h3 className="text-lg font-semibold">Client Portal</h3>

              <label className="block text-sm font-semibold text-gray-700">
                Portal URL
                <input
                  className="mt-1 w-full rounded border bg-white p-2 font-normal text-gray-900"
                  value={form.portalUrl}
                  onChange={(e) => update("portalUrl", e.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Logo
                <input
                  className="mt-1 w-full rounded border bg-white p-2 font-normal text-gray-900"
                  type="file"
                  onChange={(e) => setLogoName(e.target.files?.[0]?.name || "No logo selected")}
                />
              </label>
              <p className="text-sm text-gray-600">Selected logo: {logoName}</p>

              <label className="block text-sm font-semibold text-gray-700">
                Branding
                <input
                  className="mt-1 w-full rounded border bg-white p-2 font-normal text-gray-900"
                  value={form.branding}
                  onChange={(e) => update("branding", e.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Welcome Message
                <textarea
                  className="mt-1 min-h-24 w-full rounded border bg-white p-2 font-normal text-gray-900"
                  value={form.welcomeMessage}
                  onChange={(e) => update("welcomeMessage", e.target.value)}
                />
              </label>

              {[
                ["portalEnabled", "Enable Client Portal"],
                ["documentUploads", "Allow Document Uploads"],
                ["secureMessages", "Enable Secure Messages"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(e) => update(key as keyof typeof defaults, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="space-y-4 rounded border bg-gray-50 p-4">
              <h3 className="text-lg font-semibold">Mobile App</h3>
              <label className="block text-sm font-semibold text-gray-700">
                App Display Name
                <input
                  className="mt-1 w-full rounded border bg-white p-2 font-normal text-gray-900"
                  value={form.appName}
                  onChange={(e) => update("appName", e.target.value)}
                />
              </label>

              {[
                ["mobileEnabled", "Enable Mobile App Access"],
                ["pushNotifications", "Enable Push Notifications"],
                ["biometricLogin", "Allow Biometric Login"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(e) => update(key as keyof typeof defaults, e.target.checked)}
                  />
                  {label}
                </label>
              ))}

              <div className="rounded border bg-white p-3 text-sm">
                <p className="font-semibold text-gray-700">Saved Portal Summary</p>
                <p className="mt-1 text-gray-900">
                  {saved.branding} at {saved.portalUrl}
                </p>
                <p className="text-gray-700">
                  Portal: {saved.portalEnabled ? "Enabled" : "Disabled"} / Mobile:{" "}
                  {saved.mobileEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </CDMLayout>
  );
}
