"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DisputeDetailPage() {
  const { id } = useParams();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("disputes").select("*, clients(name)").eq("id", id).single();
        setDispute(data ?? null);
      } catch {}
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id]);

  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Dispute Detail</h2>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && !dispute && <p style={{ color: "#6b7280" }}>No data yet</p>}
        {!loading && dispute && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", maxWidth: "600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "14px" }}>
              <span style={{ fontWeight: 600 }}>Creditor</span><span>{dispute.creditor || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Reason</span><span>{dispute.reason || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Status</span><span>{dispute.status || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Client</span><span>{dispute.clients?.name || "\u2014"}</span>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
