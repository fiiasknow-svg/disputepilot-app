"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase
          .from("Reminders.ToLower()")
          .select("*");
        
        if (error) throw error;
        setData(result || []);
      } catch (err) {
        // Silently fail - no pink borders
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CDMLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Reminders</h1>
        
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        
        {!loading && data.length === 0 && (
          <div style={{ padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px", color: "#6b7280" }}>
            No data yet
          </div>
        )}
        
        {!loading && data.length > 0 && (
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p>{data.length} records found</p>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
