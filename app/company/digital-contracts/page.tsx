"use client";

import { useEffect, useState } from "react";

type Contract = {
  id: string;
  name: string;
  type: string;
  recipient: string;
  status: string;
  body: string;
};

const initialContracts: Contract[] = [
  { id: "CON-001", name: "Credit Repair Service Agreement", type: "Template", recipient: "Maria Johnson", status: "Ready to Sign", body: "Standard credit repair service agreement terms are ready for review." },
  { id: "CON-002", name: "Monthly Billing Authorization", type: "Document", recipient: "James Williams", status: "Sent", body: "Monthly billing authorization was sent for local signature tracking." },
];
const STORAGE_KEY = "dp_digital_contracts";

export default function DigitalContractsPage() {
  const [contracts, setContracts] = useState(initialContracts);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [workflow, setWorkflow] = useState("Contracts");
  const [message, setMessage] = useState("");
  const [validation, setValidation] = useState("");
  const [form, setForm] = useState({ name: "", type: "Contract", recipient: "", body: "Client agrees to the selected credit repair services and billing terms." });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setContracts(JSON.parse(saved));
        setMessage("Digital contracts loaded from local storage.");
      }
    } catch {
      setMessage("Saved local digital contracts could not be loaded.");
    }
  }, []);

  function persist(next: Contract[], nextMessage: string) {
    setContracts(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage(nextMessage);
  }

  function createContract() {
    if (!form.name.trim() || !form.recipient.trim()) {
      setValidation("Enter Contract Name and Recipient before saving a local contract.");
      return;
    }
    const contract = {
      id: `CON-${String(contracts.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      type: form.type,
      recipient: form.recipient.trim(),
      status: "Draft",
      body: form.body,
    };
    persist([contract, ...contracts], `Digital contract saved locally for ${contract.recipient}.`);
    setForm({ name: "", type: "Contract", recipient: "", body: "Client agrees to the selected credit repair services and billing terms." });
    setShowCreate(false);
    setValidation("");
  }

  function sendContract(contract: Contract) {
    const next = contracts.map((item) => item.id === contract.id ? { ...item, status: "Sent locally - no email/e-sign sent" } : item);
    persist(next, `${contract.name} marked sent locally for ${contract.recipient}. No email or e-signature request was sent.`);
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

      {message && <div role="status" className="rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">{message}</div>}

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {["Documents", "Upload", "Contracts", "Templates", "Send", "Sign"].map((tab) => (
            <button key={tab} className={`rounded border px-3 py-1 font-semibold ${workflow === tab ? "bg-blue-600 text-white" : ""}`} onClick={() => { setWorkflow(tab); setMessage(`${tab} workflow selected.`); }}>
              {tab}
            </button>
          ))}
        </div>
        <div className="mb-4 rounded border bg-gray-50 p-4 text-sm text-gray-700">
          {workflow === "Documents" && "Documents panel: review uploaded contract documents and local draft records."}
          {workflow === "Upload" && "Upload panel: select contract files from Images/Documents before sending."}
          {workflow === "Contracts" && "Contracts panel: view, send, and track local contract rows below."}
          {workflow === "Templates" && "Templates panel: use service agreement, billing authorization, or CROA disclosure templates."}
          {workflow === "Send" && "Send panel: choose a draft contract below and use Send to mark it sent locally."}
          {workflow === "Sign" && "Sign panel: local signing workflow is ready; external DocuSign is deferred until connected."}
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
                    <button className="rounded border px-3 py-1 font-semibold" onClick={() => sendContract(contract)}>Mark Sent Locally</button>
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
              <label className="text-sm font-semibold text-gray-700">Contract Name<input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setValidation(""); }} /></label>
              <label className="text-sm font-semibold text-gray-700">Recipient<input className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.recipient} onChange={(e) => { setForm((f) => ({ ...f, recipient: e.target.value })); setValidation(""); }} /></label>
              <label className="text-sm font-semibold text-gray-700">Type<select className="mt-1 w-full rounded border p-2 font-normal text-gray-900" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option>Contract</option><option>Template</option><option>Document</option></select></label>
              <label className="text-sm font-semibold text-gray-700">Contract Body<textarea className="mt-1 min-h-28 w-full rounded border p-2 font-normal text-gray-900" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} /></label>
            </div>
            {validation && <p className="mt-4 text-sm font-semibold text-amber-700">{validation}</p>}
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
            <p className="mt-3 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm text-gray-700">{selected.body}</p>
            <p className="mt-4 rounded border bg-gray-50 p-3 text-sm text-gray-700">This contract is ready for local review and local sent-status tracking. Email and e-signature delivery are not connected.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded border px-4 py-2 font-semibold" onClick={() => setSelected(null)}>Close</button>
              <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={() => { sendContract(selected); setSelected(null); }}>Mark Contract Sent Locally</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
