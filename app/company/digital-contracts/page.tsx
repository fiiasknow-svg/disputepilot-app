export default function DigitalContractsPage() {
  const contracts = [
    {
      id: 'CON-001',
      name: 'Credit Repair Service Agreement',
      type: 'Template',
      status: 'Ready to Sign',
    },
    {
      id: 'CON-002',
      name: 'Monthly Billing Authorization',
      type: 'Document',
      status: 'Sent',
    },
  ];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Digital Contracts</h1>
          <p className="text-sm text-gray-600">
            Manage Documents, Contracts, Templates, Upload, Send, and Sign workflows.
          </p>
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Upload
        </button>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex gap-2">
          <button className="rounded border px-3 py-1">Documents</button>
          <button className="rounded border px-3 py-1">Contracts</button>
          <button className="rounded border px-3 py-1">Templates</button>
          <button className="rounded border px-3 py-1">Send</button>
          <button className="rounded border px-3 py-1">Sign</button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Contract ID</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Contracts</th>
              <th className="p-3">Templates</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-b">
                <td className="p-3">{contract.id}</td>
                <td className="p-3">{contract.name}</td>
                <td className="p-3">{contract.type}</td>
                <td className="p-3">Template</td>
                <td className="p-3">{contract.status}</td>
                <td className="p-3">
                  <button className="rounded border px-3 py-1">Send</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}