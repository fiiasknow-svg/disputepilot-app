"use client";

import { useState } from "react";

type Contract = {
  id: string;
  name: string;
  type: string;
  recipient: string;
  status: string;
};

const initialContracts: Contract[] = [
  { id: "CON-001", name: "Credit Repair Service Agreement", type: "Template", recipient: "Maria Johnson", status: "Ready to Sign" },
  { id: "CON-002", name: "Monthly Billing Authorization", type: "Document", recipient: "James Williams", status: "Sent" },
];

export default function DigitalContractsPage() {
  const [contracts, setContracts] = useState(initialContracts);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", type: "Contract", recipient: "", body: "Client agrees to the selected credit repair services and billing terms." });

  function createContract() {
    if (!form.name.trim() || !form.recipient.trim()) return;
    const contract = {
      id: `CON-${String(contracts.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      type: form.type,
      recipient: form.recipient.trim(),
      status: "Draft",
    };
    setContracts((current) => [contract, ...current]);
    setForm({ name: "", type: "Contract", recipient: "", body: "Client agrees to the selected credit repair services and billing terms." });
    setShowCreate(false);
    setMessage(`Digital contract saved for ${contract.recipient}.`);
  }

  function sendContract(contract: Contract) {
    setContracts((current) => current.map((item) => item.id === contract.id ? { ...item, status: "Sent" } : item));
    setMessage(`${contract.name} sent to ${contract.recipient}.`);
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Digital Contracts</h1>
          <p className="text-sm text-gray-600">Create, view, send, and track contract workflows.</p>
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={() => setShowCreate(true)}>
          Create Contract
        </button>
      </div>

      {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">{message}</div>}

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {["Documents", "Contracts", "Templates", "Send", "Sign"].map((tab) => (
            <button key={tab} className="rounded border px-3 py-1 font-semibold" onClick={() => setMessage(`${tab} workflow selected.`)}>
              {tab}
            </button>
          ))}
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Contract ID</th>
              <th className="p-3">Document</th>
              <th className="p-3">Type</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-b">
                <td className="p-3">{contract.id}</td>
                <td className="p-3 font-semibold">{contract.name}</td>
                <td className="p-3">{contract.type}</td>
                <td className="p-3">{contract.recipient}</td>
                <td className="p-3">{contract.status}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="rounded border px-3 py-1 font-semibold" onClick={() => setSelected(contract)}>View</button>
                    <button className="rounded border px-3 py-1 font-semibold" onClick={() => sendContract(contract)}>Send</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">New Digital Contract</h2>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-semibold text-gray-700">Contract Name<input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-gray-700">Recipient<input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} /></label>
              <label className="text-sm font-semibold text-gray-700">Type<select className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option>Contract</option><option>Template</option><option>Document</option></select></label>
              <label className="text-sm font-semibold text-gray-700">Contract Body<textarea className="mt-1 min-h-28 w-full rounded border p-2 font-normal text-gray-900" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border px-4 py-2 font-semibold" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={createContract}>Save Contract</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold">{selected.name}</h2>
            <p className="mt-2 text-sm text-gray-700">Recipient: {selected.recipient}</p>
            <p className="text-sm text-gray-700">Status: {selected.status}</p>
            <p className="mt-4 rounded border bg-gray-50 p-3 text-sm text-gray-700">This contract is ready for review, sending, or signing.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border px-4 py-2 font-semibold" onClick={() => setSelected(null)}>Close</button>
              <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={() => { sendContract(selected); setSelected(null); }}>Send Contract</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
