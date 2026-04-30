export default function DisputesPage() {
  const disputes = [
    {
      client: 'John Smith',
      status: 'In Progress',
      round: 'Round 1',
      bureau: 'Equifax',
      letters: '609 Dispute Letter',
      accounts: '2 Accounts',
      date: '04/29/2026',
    },
    {
      client: 'Maria Johnson',
      status: 'Ready',
      round: 'Round 2',
      bureau: 'Experian',
      letters: 'Method of Verification',
      accounts: '1 Account',
      date: '04/28/2026',
    },
    {
      client: 'David Lee',
      status: 'Completed',
      round: 'Round 3',
      bureau: 'TransUnion',
      letters: 'Debt Validation Letter',
      accounts: '3 Accounts',
      date: '04/27/2026',
    },
  ];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dispute Center</h1>
          <p className="text-sm text-gray-600">Manage client disputes, bureaus, letters, and accounts.</p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium">
          Create New Dispute
        </button>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Disputes</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Client</th>
                <th className="p-3">Status</th>
                <th className="p-3">Round</th>
                <th className="p-3">Bureau</th>
                <th className="p-3">Equifax</th>
                <th className="p-3">Experian</th>
                <th className="p-3">TransUnion</th>
                <th className="p-3">Letters</th>
                <th className="p-3">Accounts</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {disputes.map((dispute) => (
                <tr key={`${dispute.client}-${dispute.bureau}`} className="border-b">
                  <td className="p-3">{dispute.client}</td>
                  <td className="p-3">{dispute.status}</td>
                  <td className="p-3">{dispute.round}</td>
                  <td className="p-3">{dispute.bureau}</td>
                  <td className="p-3">Included</td>
                  <td className="p-3">Included</td>
                  <td className="p-3">Included</td>
                  <td className="p-3">{dispute.letters}</td>
                  <td className="p-3">{dispute.accounts}</td>
                  <td className="p-3">{dispute.date}</td>
                  <td className="p-3">
                    <button className="rounded border px-3 py-1 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}