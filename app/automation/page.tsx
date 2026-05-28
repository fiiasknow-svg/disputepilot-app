"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
};

const STORAGE_KEY = "disputepilot.automation.settings";
const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: "client-onboarding",
    name: "Client Onboarding",
    trigger: "New Client Added",
    action: "Send Email",
    enabled: true,
  },
  {
    id: "payment-reminder",
    name: "Payment Reminder",
    trigger: "Invoice Overdue",
    action: "Send Portal Notification",
    enabled: true,
  },
  {
    id: "lead-nurture",
    name: "Website Lead Nurturing",
    trigger: "New Website Lead",
    action: "Start Nurture Sequence",
    enabled: false,
  },
];

export default function AutomationPage() {
  const router = useRouter();
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOWS);
  const [activeIntegration, setActiveIntegration] = useState("Zapier");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      setGlobalEnabled(saved.globalEnabled ?? true);
      setActiveIntegration(saved.activeIntegration || "Zapier");
      if (Array.isArray(saved.workflows)) {
        setWorkflows(DEFAULT_WORKFLOWS.map((workflow) => {
          const savedWorkflow = saved.workflows.find((item: Workflow) => item.id === workflow.id);
          return savedWorkflow ? { ...workflow, enabled: !!savedWorkflow.enabled } : workflow;
        }));
      }
      setStatus("Saved automation settings loaded locally.");
    } catch {
      setStatus("Saved automation settings could not be loaded.");
    }
  }, []);

  function toggleWorkflow(id: string) {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === id ? { ...workflow, enabled: !workflow.enabled } : workflow,
      ),
    );
  }

  function saveSettings() {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        globalEnabled,
        activeIntegration,
        workflows,
        savedAt: new Date().toISOString(),
      }),
    );
    setStatus("Automation settings saved locally.");
  }

  const enabledCount = workflows.filter((workflow) => workflow.enabled).length;

  return (
    <CDMLayout>
      <main className="p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Automation</h1>
            <p className="text-sm text-gray-600">
              Manage Zapier, Go-HighLevel, GHL, Workflow, Trigger, Action, and Enable settings.
            </p>
          </div>

          <button onClick={saveSettings} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">
            Save
          </button>
        </div>

        {status && (
          <div role="status" aria-live="polite" className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            {status}
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <Link className="rounded border px-3 py-1 text-sm font-semibold text-slate-700" href="/automation/zapier">
              Zapier
            </Link>
            <Link className="rounded border px-3 py-1 text-sm font-semibold text-slate-700" href="/automation/go-highlevel">
              Go-HighLevel
            </Link>
            <Link className="rounded border px-3 py-1 text-sm font-semibold text-slate-700" href="/automation/go-highlevel">
              GHL
            </Link>
            <button
              aria-pressed={globalEnabled}
              onClick={() => {
                setGlobalEnabled((current) => !current);
                setStatus(`Automation globally ${globalEnabled ? "disabled" : "enabled"} locally.`);
              }}
              className={`rounded px-3 py-1 text-sm font-semibold ${globalEnabled ? "bg-green-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              Enable: {globalEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {[
              { name: "Zapier", href: "/automation/zapier" },
              { name: "Go-HighLevel", href: "/automation/go-highlevel" },
              { name: "Website Lead Nurturing", href: "/automation/website-lead-nurturing" },
            ].map(({ name, href }) => (
              <button
                key={name}
                aria-pressed={activeIntegration === name}
                onClick={() => {
                  setActiveIntegration(name);
                  setStatus(`Opening ${name} local configuration route.`);
                  router.push(href);
                }}
                className={`rounded-lg border p-3 text-left text-sm ${activeIntegration === name ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700"}`}
              >
                <span className="block font-bold">{name}</span>
                <span className="text-xs text-slate-500">Local configuration is available from the dedicated route.</span>
              </button>
            ))}
          </div>

          <div className="mb-3 text-sm font-semibold text-slate-700">
            Global automation is {globalEnabled ? "enabled" : "disabled"}. {enabledCount} of {workflows.length} workflows are enabled.
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Workflow</th>
                <th className="p-3">Trigger</th>
                <th className="p-3">Action</th>
                <th className="p-3">Enable</th>
              </tr>
            </thead>

            <tbody>
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="border-b">
                  <td className="p-3 font-semibold text-slate-900">{workflow.name}</td>
                  <td className="p-3">{workflow.trigger}</td>
                  <td className="p-3">{workflow.action}</td>
                  <td className="p-3">
                    <button
                      aria-pressed={workflow.enabled}
                      onClick={() => toggleWorkflow(workflow.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${workflow.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      {workflow.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </CDMLayout>
  );
}
