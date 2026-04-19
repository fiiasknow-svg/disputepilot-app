"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const TABS = ["Invoices", "Payments", "Services / Products", "Credit Card Setup"];
const STATUS_C: Record<string, string> = { paid: "#10b981", pending: "#f59e0b", overdue: "#ef4444" };

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState("Invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ client_id: "", amount: "", description: "", status: "pending", due_date: "" });
  const [serviceForm, setServiceForm] = useState({ name: "", price: "", description: "", type: "monthly" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalPaid: 0, totalPending: 0, totalOverdue: 0 });

  async function load() {
    setLoading(true);
    const [inv, svc, cli] = await Promise.all([
      supabase.from("invoices").select("*, clients(first_name, last_name)").order("created_at", { ascending: false }),
      supabase.from("services").select("*").order("name"),
      supabase.from("clients").select("id, first_name, last_name"),
    ]);
    const invData = inv.data || [];
    setInvoices(invData);
    setServices(svc.data || []);
    setClients(cli.data || []);
    setStats({
      totalPaid: invData.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0),
      totalPending: invData.filter(i => i.status === "pending").reduce((s, i) => s + (i.amount || 0), 0),
      totalOverdue: invData.filter(i => i.status === "overdue").reduce((s, i) => s + (i.amount || 0), 0),
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveInvoice() {
    if (!invoiceForm.client_id || !invoiceForm.amount) return;
    setSaving(true);
    await supabase.from("invoices").insert([{ ...invoiceForm, amount: parseFloat(invoiceForm.amount) }]);
    setSaving(false);
    setShowInvoiceForm(false);
    setInvoiceForm({ client_id: "", amount: "", description: "", status: "pending", due_date: "" });
    load();
  }

  async function saveService() {
    if (!serviceForm.name) return;
    setSaving(true);
    await supabase.from("services").insert([{ ...serviceForm, price: parseFloat(serviceForm.price) || 0 }]);
    setSaving(false);
    setShowServiceForm(false);
    setServiceForm({ name: "", price: "", description: "", type: "monthly" });
    load();
  }

  async function updateInvoiceStatus(id: string, status: string) {
    await supabase.from("invoices").update({ status }).eq("id", id);
    setInvoices(inv => inv.map(i => i.id === id ? { ...i, status } : i));
    load();
  }

  const selectStyle = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, width: "100%", boxSizing: "border-box" as const };

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "#1e293b" }}>Billing</h1>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {[["Paid", stats.totalPaid, "#10b981"], ["Pending", stats.totalPending, "#f59e0b"], ["Overdue", stats.totalOverdue, "#ef4444"]].map(([label, val, color]) => (
            <div key={label as string} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: color as string }}>${(val as number).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #f1f5f9" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#1e3a5f" : "#64748b", borderBottom: tab === t ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, fontSize: 14 }}>{t}</button>
          ))}
        </div>

        {/* Invoices Tab */}
        {tab === "Invoices" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={() => setShowInvoiceForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ New Invoice</button>
            </div>
            {showInvoiceForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 440 }}>
                  <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Invoice</h2>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Client</label>
                    <select value={invoiceForm.client_id} onChange={e => setInvoiceForm(f => ({ ...f, client_id: e.target.value }))} style={selectStyle}>
                      <option value="">Select client…</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  </div>
                  {[["Amount ($)", "amount", "number"], ["Description", "description", "text"], ["Due Date", "due_date", "date"]].map(([label, key, type]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                      <input type={type} value={(invoiceForm as any)[key]} onChange={e => setInvoiceForm(f => ({ ...f, [key]: e.target.value }))} style={{ ...selectStyle }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
                    <select value={invoiceForm.status} onChange={e => setInvoiceForm(f => ({ ...f, status: e.target.value }))} style={selectStyle}>
                      {["pending", "paid", "overdue"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowInvoiceForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                    <button onClick={saveInvoice} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save Invoice"}</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}><tr>
                  {["Client", "Description", "Amount", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
                    : invoices.length === 0 ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No invoices yet.</td></tr>
                    : invoices.map(inv => (
                      <tr key={inv.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>{inv.clients?.first_name} {inv.clients?.last_name}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{inv.description || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700 }}>${(inv.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: (STATUS_C[inv.status] || "#94a3b8") + "22", color: STATUS_C[inv.status] || "#64748b", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{inv.status}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {inv.status !== "paid" && <button onClick={() => updateInvoiceStatus(inv.id, "paid")} style={{ fontSize: 12, padding: "4px 10px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 5, cursor: "pointer", color: "#166534" }}>✓ Paid</button>}
                            {inv.status === "pending" && <button onClick={() => updateInvoiceStatus(inv.id, "overdue")} style={{ fontSize: 12, padding: "4px 10px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", color: "#ef4444" }}>Overdue</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {tab === "Payments" && (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Payment History</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr>
                {["Client", "Amount", "Date", "Method"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {invoices.filter(i => i.status === "paid").length === 0
                  ? <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No payments recorded.</td></tr>
                  : invoices.filter(i => i.status === "paid").map(inv => (
                    <tr key={inv.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontSize: 14 }}>{inv.clients?.first_name} {inv.clients?.last_name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#10b981" }}>${(inv.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{new Date(inv.updated_at || inv.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>Card</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services Tab */}
        {tab === "Services / Products" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={() => setShowServiceForm(true)} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Service</button>
            </div>
            {showServiceForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400 }}>
                  <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Service / Product</h2>
                  {[["Name", "name", "text"], ["Price ($)", "price", "number"], ["Description", "description", "text"]].map(([label, key, type]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                      <input type={type} value={(serviceForm as any)[key]} onChange={e => setServiceForm(f => ({ ...f, [key]: e.target.value }))} style={selectStyle} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Billing Type</label>
                    <select value={serviceForm.type} onChange={e => setServiceForm(f => ({ ...f, type: e.target.value }))} style={selectStyle}>
                      {["monthly", "one-time", "annual", "pay-per-deletion"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowServiceForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                    <button onClick={saveService} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Save"}</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {services.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No services yet.</p> : services.map(s => (
                <div key={s.id} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>{s.name}</h3>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b" }}>{s.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#1e3a5f" }}>${s.price}</span>
                    <span style={{ fontSize: 12, background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", color: "#64748b" }}>{s.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Credit Card Setup Tab */}
        {tab === "Credit Card Setup" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", maxWidth: 500 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Payment Processing</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Connect Stripe to accept credit card payments from clients.</p>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Stripe Integration</span>
                <span style={{ fontSize: 12, background: process.env.NEXT_PUBLIC_STRIPE_KEY ? "#dcfce7" : "#fee2e2", color: process.env.NEXT_PUBLIC_STRIPE_KEY ? "#166534" : "#991b1b", borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>{process.env.NEXT_PUBLIC_STRIPE_KEY ? "Connected" : "Not Connected"}</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_KEY to your Vercel environment variables to enable payments.</p>
            </div>
            <button onClick={() => router.push("/billing/invoices")} style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Manage Invoices</button>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
