"use client";

import { useState } from "react";

const defaultCompany = {
  companyName: "My Credit Repair Co.",
  phone: "(555) 000-0000",
  email: "hello@mycompany.com",
  website: "https://mycreditrepairco.com",
  address: "123 Main St",
  city: "Atlanta",
  state: "GA",
  zip: "30301",
  notes: "Full-service credit repair and dispute management firm.",
};

type CompanyForm = typeof defaultCompany;

const fields: { key: keyof CompanyForm; label: string; type?: string }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "website", label: "Website", type: "url" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "Zip" },
];

export default function CompanySettingsPage() {
  const [form, setForm] = useState(defaultCompany);
  const [saved, setSaved] = useState(defaultCompany);
  const [message, setMessage] = useState("");

  function update(key: keyof CompanyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function saveCompany() {
    setSaved(form);
    setMessage(`Company profile saved for ${form.companyName}.`);
  }

  function cancelChanges() {
    setForm(saved);
    setMessage("Unsaved company changes were reset.");
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Company Settings</h1>
          <p className="text-sm text-gray-600">Manage your company profile and contact details.</p>
        </div>

        <div className="flex gap-2">
          <button className="rounded border px-4 py-2 font-semibold" onClick={cancelChanges}>
            Cancel
          </button>
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={saveCompany}>
            Save Company
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
          {message}
        </div>
      )}

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Business Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="text-sm font-semibold text-gray-700">
              {field.label}
              <input
                className="mt-1 w-full rounded border p-2 font-normal text-gray-900"
                type={field.type || "text"}
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
              />
            </label>
          ))}

          <label className="text-sm font-semibold text-gray-700 md:col-span-2">
            Notes / Description
            <textarea
              className="mt-1 min-h-28 w-full rounded border p-2 font-normal text-gray-900"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Saved Company Profile</h2>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="font-semibold text-gray-500">Company</dt>
            <dd className="text-gray-900">{saved.companyName}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Contact</dt>
            <dd className="text-gray-900">{saved.phone} / {saved.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Website</dt>
            <dd className="text-gray-900">{saved.website}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Address</dt>
            <dd className="text-gray-900">{saved.address}, {saved.city}, {saved.state} {saved.zip}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="font-semibold text-gray-500">Notes</dt>
            <dd className="text-gray-900">{saved.notes}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
