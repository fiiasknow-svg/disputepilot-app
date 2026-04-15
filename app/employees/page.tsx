"use client";
import { useEffect, useState } from "react";
import CDMLayout from "@/components/CDMLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
        setEmployees(data || []);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <CDMLayout>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>BACK</a>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>Dashboard</span>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Employees</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", background: "#fff", cursor: "pointer" }}>Training Videos</button>
          <button style={{ padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "13px", background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer" }}>ACTIVATE MEMBERSHIP</button>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Employees</h2>
        {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
        {!loading && employees.length === 0 && <p style={{ color: "#6b7280" }}>No data yet</p>}
        {!loading && employees.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Email</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{emp.name || "\u2014"}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{emp.email || "\u2014"}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>{emp.role || "\u2014"}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 500, background: emp.status === "active" ? "#dcfce7" : "#fee2e2", color: emp.status === "active" ? "#166534" : "#991b1b" }}>
                        {emp.status || "inactive"}
                      </span>
                    </td>
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
