export default function PortalsPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portals / Mobile App</h1>
        <p className="text-sm text-gray-600">Manage Client Portal access, Portal URL, Logo, Branding, and Mobile App settings.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Client Portal</h2>

        <label className="block">
          Portal URL
          <input className="mt-1 w-full rounded border p-2" defaultValue="https://portal.disputepilot.com/client" />
        </label>

        <label className="block">
          Logo
          <input className="mt-1 w-full rounded border p-2" type="file" />
        </label>

        <label className="block">
          Branding
          <input className="mt-1 w-full rounded border p-2" defaultValue="DisputePilot" />
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          Enable Client Portal
        </label>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Save
        </button>
      </section>
    </main>
  );
}