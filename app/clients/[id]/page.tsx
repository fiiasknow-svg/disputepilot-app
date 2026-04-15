"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("clients").select("*").eq("id", id).single();
        setClient(data ?? null);
      } catch {}
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id]);

  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Client Detail</h2>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && !client && <p style={{ color: "#6b7280" }}>No data yet</p>}
        {!loading && client && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", maxWidth: "600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "14px" }}>
              <span style={{ fontWeight: 600 }}>Name</span><span>{client.name || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Email</span><span>{client.email || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Phone</span><span>{client.phone || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Status</span><span>{client.status || "\u2014"}</span>
              <span style={{ fontWeight: 600 }}>Plan</span><span>{client.plan || "\u2014"}</span>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
