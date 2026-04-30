export default function CompanySettingsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Settings</h1>
          <p className="text-sm text-gray-600">Manage your company setup.</p>
        </div>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Save
        </button>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Business Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            Company Name
            <input className="mt-1 w-full rounded border p-2" defaultValue="My Credit Repair Co." />
          </label>

          <label>
            Email
            <input className="mt-1 w-full rounded border p-2" defaultValue="hello@mycompany.com" />
          </label>

          <label>
            Phone
            <input className="mt-1 w-full rounded border p-2" defaultValue="(555) 000-0000" />
          </label>

          <label>
            Address
            <input className="mt-1 w-full rounded border p-2" defaultValue="123 Main St" />
          </label>

          <label>
            City
            <input className="mt-1 w-full rounded border p-2" defaultValue="Atlanta" />
          </label>

          <label>
            State
            <input className="mt-1 w-full rounded border p-2" defaultValue="GA" />
          </label>

          <label>
            Zip
            <input className="mt-1 w-full rounded border p-2" defaultValue="30301" />
          </label>
        </div>
      </section>
    </main>
  );
}