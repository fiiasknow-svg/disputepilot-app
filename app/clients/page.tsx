"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CDMLayout from "@/components/CDMLayout";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      setClients(data || []);
    } catch (error) {
      console.log("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await supabase.from("clients").delete().eq("id", id);
      fetchClients();
    } catch (error) {
      alert("Error deleting client");
    }
  };

  const filteredClients = clients.filter((client: any) => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CDMLayout>
      <PageHeader 
        title="Customers" 
        description="Manage your clients and their information"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers" }]}
      />
      
      <div style={{ padding: "24px" }}>
        {/* Action Bar */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/clients/new">
              <button style={{ 
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer"
              }}>
                <Icons.Plus />
                Add New
              </button>
            </Link>
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            width: "300px"
          }}>
            <Icons.Search />
            <input 
              type="text" 
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                border: "none", 
                outline: "none", 
                fontSize: "13px",
                width: "100%",
                backgroundColor: "transparent"
              }}
            />
          </div>
        </div>

        {/* Clients Table */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "8px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Date Added</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    No clients found. <Link href="/clients/new" style={{ color: "#3b82f6" }}>Add your first client</Link>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: any) => (
                  <tr key={client.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}>{client.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>{client.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>{client.phone || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: "12px", 
                        fontSize: "11px", 
                        fontWeight: "500",
                        backgroundColor: client.status === "active" ? "#dcfce7" : "#f1f5f9",
                        color: client.status === "active" ? "#166534" : "#64748b"
                      }}>
                        {client.status || "active"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <Link href={`/clients/${client.id}/edit`}>
                          <button style={{ 
                            padding: "6px", 
                            backgroundColor: "#fef3c7", 
                            color: "#92400e",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}>
                            <Icons.Edit />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          style={{ 
                            padding: "6px", 
                            backgroundColor: "#fee2e2", 
                            color: "#991b1b",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CDMLayout>
  );
}
