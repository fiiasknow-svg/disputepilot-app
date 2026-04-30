export default function BillingPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-gray-600">
          Manage Payments, Invoices, Subscription, and Plan details.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Invoices</h2>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Plan</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Monthly Subscription</td>
              <td className="p-3">$0.00</td>
              <td className="p-3">04/29/2026</td>
              <td className="p-3">Current</td>
              <td className="p-3">
                <button className="rounded border px-3 py-1">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Payments</h2>
        <p>Payment history and invoice payments will appear here.</p>
      </section>
    </main>
  );
}