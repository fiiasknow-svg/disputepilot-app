"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <Link
            href="/dashboard"
            aria-label="Back to Dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-400/40"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Company profile
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Company Settings
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Manage your company profile and contact details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                onClick={cancelChanges}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                onClick={saveCompany}
              >
                Save Company
              </button>
            </div>
          </div>
        </header>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm"
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Business Information</h2>
                <p className="text-sm text-slate-600">Keep the contact details and public-facing profile up to date.</p>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.key}
              className="flex flex-col gap-2 text-sm font-semibold text-slate-700"
            >
              {field.label}
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-400/10"
                type={field.type || "text"}
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
              />
            </label>
          ))}

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Notes / Description
            <textarea
              className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-400/10"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>
        </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Saved Company Profile</h2>
                <p className="text-sm text-slate-600">Preview the last saved company details before you commit updates.</p>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <dl className="grid gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold tracking-normal text-slate-500">Company</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{saved.companyName}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold tracking-normal text-slate-500">Contact</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{saved.phone} / {saved.email}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold tracking-normal text-slate-500">Website</dt>
                  <dd className="mt-1 break-all text-base font-semibold text-slate-900">{saved.website}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold tracking-normal text-slate-500">Address</dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">{saved.address}, {saved.city}, {saved.state} {saved.zip}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <dt className="text-xs font-semibold tracking-normal text-slate-500">Notes</dt>
                  <dd className="mt-1 text-base leading-6 text-slate-900">{saved.notes}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
