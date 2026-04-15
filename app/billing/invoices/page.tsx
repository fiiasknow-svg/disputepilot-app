"use client";
import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
        setInvoices(data || []);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Invoices</h2>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && invoices.length === 0 && <p style={{ color: "#6b7280" }}>No data yet</p>}
        {!loading && invoices.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Invoice #</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{inv.invoice_number || inv.id}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>${inv.amount || 0}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{inv.status || "\u2014"}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
