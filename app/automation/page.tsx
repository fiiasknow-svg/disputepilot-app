export default function AutomationPage() {
  const workflows = [
    {
      name: 'Client Onboarding',
      trigger: 'New Client Added',
      action: 'Send Email',
      status: 'Enabled',
    },
    {
      name: 'Payment Reminder',
      trigger: 'Invoice Overdue',
      action: 'Send Portal Notification',
      status: 'Enabled',
    },
  ];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automation</h1>
          <p className="text-sm text-gray-600">
            Manage Zapier, Go-HighLevel, GHL, Workflow, Trigger, Action, and Enable settings.
          </p>
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Save
        </button>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex gap-2">
          <button className="rounded border px-3 py-1">Zapier</button>
          <button className="rounded border px-3 py-1">Go-HighLevel</button>
          <button className="rounded border px-3 py-1">GHL</button>
          <button className="rounded border px-3 py-1">Enable</button>
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
              <tr key={workflow.name} className="border-b">
                <td className="p-3">{workflow.name}</td>
                <td className="p-3">{workflow.trigger}</td>
                <td className="p-3">{workflow.action}</td>
                <td className="p-3">{workflow.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}