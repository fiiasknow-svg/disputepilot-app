"use client";
import { useState, useEffect, useRef } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const TABS = ["Invoices","Payments","Services / Products","Credit Card Setup","Pay Per Deletion","Subscriptions","Auto-Billing"];
const STATUS_C: Record<string,string> = { paid:"#10b981", pending:"#f59e0b", overdue:"#ef4444" };
const PAGE_SIZES = [25,50,100];

function fmt(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function badge(color: string, label: string) {
  return <span style={{ background: color+"22", color, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:700, textTransform:"capitalize" as const }}>{label}</span>;
}

export default function Page() {
  const [tab, setTab] = useState("Invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice state
  const [invSearch, setInvSearch] = useState("");
  const [invStatus, setInvStatus] = useState("all");
  const [invDateFrom, setInvDateFrom] = useState("");
  const [invDateTo, setInvDateTo] = useState("");
  const [invSort, setInvSort] = useState<{col:string,dir:1|-1}>({ col:"created_at", dir:-1 });
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(25);
  const [invSelected, setInvSelected] = useState<Set<string>>(new Set());
  const [showInvForm, setShowInvForm] = useState(false);
  const [editingInv, setEditingInv] = useState<any|null>(null);
  const [deleteInvId, setDeleteInvId] = useState<string|null>(null);
  const [viewInv, setViewInv] = useState<any|null>(null);
  const [invForm, setInvForm] = useState({ client_id:"", amount:"", description:"", status:"pending", due_date:"", tax_rate:"", discount:"", notes:"" });

  // Payments state
  const [paySearch, setPaySearch] = useState("");
  const [payDateFrom, setPayDateFrom] = useState("");
  const [payDateTo, setPayDateTo] = useState("");

  // Services state
  const [showSvcForm, setShowSvcForm] = useState(false);
  const [editingSvc, setEditingSvc] = useState<any|null>(null);
  const [svcForm, setSvcForm] = useState({ name:"", price:"", description:"", type:"monthly", active:true });

  // Stripe setup state
  const [stripeMode, setStripeMode] = useState<"test"|"live">("test");
  const [stripeKey, setStripeKey] = useState("");
  const [stripeSaved, setStripeSaved] = useState(false);

  // Auto-billing state
  const [autoBillingRules, setAutoBillingRules] = useState([
    { id:"1", name:"Monthly Retainer", plan:"Standard", day:1, amount:149, active:true },
    { id:"2", name:"Premium Auto-Charge", plan:"Premium", day:1, amount:199, active:false },
  ]);

  // Subscriptions state
  const [subs, setSubs] = useState<any[]>([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ client_id:"", plan:"", amount:"", billing_cycle:"monthly", status:"active" });

  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [inv, pay, svc, cli, sub] = await Promise.all([
      supabase.from("invoices").select("*, clients(first_name,last_name,email)").order("created_at", { ascending:false }),
      supabase.from("payments").select("*, clients(first_name,last_name)").order("created_at", { ascending:false }).limit(200),
      supabase.from("services").select("*").order("name"),
      supabase.from("clients").select("id,first_name,last_name,email"),
      supabase.from("subscriptions").select("*, clients(first_name,last_name)").order("created_at", { ascending:false }),
    ]);
    setInvoices(inv.data || []);
    setPayments(pay.data || []);
    setServices(svc.data || []);
    setClients(cli.data || []);
    setSubs(sub.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
  const totalPaid = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+(i.amount||0),0);
  const totalPending = invoices.filter(i=>i.status==="pending").reduce((s,i)=>s+(i.amount||0),0);
  const totalOverdue = invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+(i.amount||0),0);
  const monthlyRev = invoices.filter(i=>i.status==="paid" && i.created_at>=monthStart).reduce((s,i)=>s+(i.amount||0),0);
  const ytdRev = invoices.filter(i=>i.status==="paid" && i.created_at>=yearStart).reduce((s,i)=>s+(i.amount||0),0);
  const paidInvoices = invoices.filter(i=>i.status==="paid");
  const avgInvoice = paidInvoices.length ? totalPaid/paidInvoices.length : 0;
  const totalOutstanding = totalPending + totalOverdue;

  // Invoice number helper
  function invNumber(inv: any, idx: number) {
    return inv.invoice_number || `INV-${String(invoices.length - idx).padStart(3,"0")}`;
  }

  // Filtered invoices
  const filteredInv = (() => {
    let out = [...invoices];
    if (invStatus !== "all") out = out.filter(i=>i.status===invStatus);
    if (invDateFrom) out = out.filter(i=>i.created_at>=invDateFrom);
    if (invDateTo) out = out.filter(i=>i.created_at<=invDateTo+"T23:59:59");
    if (invSearch) {
      const q = invSearch.toLowerCase();
      out = out.filter(i=>`${i.clients?.first_name} ${i.clients?.last_name} ${i.description} ${invNumber(i,0)}`.toLowerCase().includes(q));
    }
    out.sort((a,b)=>{
      const av = a[invSort.col] ?? ""; const bv = b[invSort.col] ?? "";
      return av < bv ? -invSort.dir : av > bv ? invSort.dir : 0;
    });
    return out;
  })();

  const invTotalPages = Math.max(1, Math.ceil(filteredInv.length/invPageSize));
  const invSafePage = Math.min(invPage, invTotalPages);
  const pagedInv = filteredInv.slice((invSafePage-1)*invPageSize, invSafePage*invPageSize);

  function sortBy(col: string) {
    setInvSort(s => s.col===col ? { col, dir: s.dir===1?-1:1 } : { col, dir:-1 });
  }
  function sortIcon(col: string) { return invSort.col===col ? (invSort.dir===1?"▲":"▼") : ""; }

  function toggleInvSelect(id: string) { setInvSelected(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); }
  function toggleAllInv() { invSelected.size===pagedInv.length ? setInvSelected(new Set()) : setInvSelected(new Set(pagedInv.map(i=>i.id))); }

  async function saveInvoice() {
    if (!invForm.client_id||!invForm.amount) return;
    setSaving(true);
    const base = parseFloat(invForm.amount)||0;
    const tax = (base*(parseFloat(invForm.tax_rate)||0))/100;
    const disc = parseFloat(invForm.discount)||0;
    const total = base + tax - disc;
    const payload = { ...invForm, amount:total, base_amount:base, tax_rate:parseFloat(invForm.tax_rate)||0, discount:disc, due_date:invForm.due_date||null };
    if (editingInv) await supabase.from("invoices").update(payload).eq("id",editingInv.id);
    else await supabase.from("invoices").insert([payload]);
    setSaving(false); setShowInvForm(false); setEditingInv(null);
    setInvForm({ client_id:"", amount:"", description:"", status:"pending", due_date:"", tax_rate:"", discount:"", notes:"" });
    load();
  }

  function openEditInv(inv: any) {
    setEditingInv(inv);
    setInvForm({ client_id:inv.client_id||"", amount:String(inv.base_amount||inv.amount||""), description:inv.description||"", status:inv.status||"pending", due_date:inv.due_date||"", tax_rate:String(inv.tax_rate||""), discount:String(inv.discount||""), notes:inv.notes||"" });
    setShowInvForm(true);
  }

  async function deleteInvoice(id: string) {
    await supabase.from("invoices").delete().eq("id",id);
    setInvoices(i=>i.filter(x=>x.id!==id)); setDeleteInvId(null);
  }

  async function bulkMarkPaid() {
    const ids=[...invSelected];
    await supabase.from("invoices").update({status:"paid"}).in("id",ids);
    setInvoices(inv=>inv.map(i=>ids.includes(i.id)?{...i,status:"paid"}:i)); setInvSelected(new Set());
  }

  async function bulkDeleteInv() {
    const ids=[...invSelected];
    await supabase.from("invoices").delete().in("id",ids);
    setInvoices(i=>i.filter(x=>!ids.includes(x.id))); setInvSelected(new Set());
  }

  function exportInvCSV() {
    const hdrs=["Invoice #","Client","Description","Base Amount","Tax","Discount","Total","Status","Due Date","Created"];
    const rows=filteredInv.map((i,idx)=>[invNumber(i,idx),`${i.clients?.first_name||""} ${i.clients?.last_name||""}`,i.description||"",i.base_amount||i.amount,i.tax_rate||0,i.discount||0,i.amount,i.status,i.due_date||"",i.created_at?.slice(0,10)||""].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(","));
    const blob=new Blob([[hdrs.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="invoices.csv"; a.click();
  }

  async function sendInvoice(inv: any) {
    const email = inv.clients?.email;
    if (!email) { alert("No email on file for this client."); return; }
    const subject = `Invoice ${invNumber(inv, 0)} — $${(inv.amount||0).toFixed(2)} due`;
    const body = `Hi ${inv.clients?.first_name||""},\n\nPlease find your invoice details below:\n\nInvoice: ${invNumber(inv, 0)}\nAmount: $${(inv.amount||0).toFixed(2)}\nDue Date: ${inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "N/A"}\nDescription: ${inv.description||""}\nStatus: ${inv.status}\n\nThank you for being a DisputePilot client.\n\nBest regards,\nDisputePilot`;
    const res = await fetch("/api/send-email", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ to: email, subject, body }) });
    if (res.ok) alert(`Invoice emailed to ${email}`);
    else alert("Failed to send email. Please try again.");
  }
  function downloadPDF(inv: any) { alert(`PDF download for invoice ${invNumber(inv,0)} — connect PDF library`); }
  function copyPaymentLink(inv: any) { navigator.clipboard.writeText(`https://pay.disputepilot.app/inv/${inv.id}`); alert("Payment link copied!"); }

  async function updateInvStatus(id: string, status: string) {
    await supabase.from("invoices").update({status}).eq("id",id);
    setInvoices(inv=>inv.map(i=>i.id===id?{...i,status}:i));
  }

  // Services
  async function saveSvc() {
    if (!svcForm.name) return;
    setSaving(true);
    const payload={...svcForm, price:parseFloat(svcForm.price)||0};
    if (editingSvc) await supabase.from("services").update(payload).eq("id",editingSvc.id);
    else await supabase.from("services").insert([payload]);
    setSaving(false); setShowSvcForm(false); setEditingSvc(null);
    setSvcForm({name:"",price:"",description:"",type:"monthly",active:true}); load();
  }
  function openEditSvc(s: any) { setEditingSvc(s); setSvcForm({name:s.name,price:String(s.price||""),description:s.description||"",type:s.type||"monthly",active:s.active!==false}); setShowSvcForm(true); }
  async function deleteSvc(id: string) { await supabase.from("services").delete().eq("id",id); setServices(s=>s.filter(x=>x.id!==id)); }
  async function toggleSvcActive(s: any) { await supabase.from("services").update({active:!s.active}).eq("id",s.id); setServices(sv=>sv.map(x=>x.id===s.id?{...x,active:!x.active}:x)); }
  function clientsOnPlan(s: any) { return clients.filter(c=>c.service_plan===s.name).length; }

  async function saveSubscription() {
    if (!subForm.client_id) return;
    setSaving(true);
    await supabase.from("subscriptions").insert([{ ...subForm, amount: parseFloat(subForm.amount)||0 }]);
    setSaving(false); setShowSubForm(false);
    setSubForm({ client_id:"", plan:"", amount:"", billing_cycle:"monthly", status:"active" });
    load();
  }
  async function deleteSub(id: string) {
    await supabase.from("subscriptions").delete().eq("id", id);
    setSubs(s => s.filter(x => x.id !== id));
  }
  function exportSvcCSV() {
    const hdrs=["Name","Price","Type","Active","Description"];
    const rows=services.map(s=>[s.name,s.price,s.type,s.active?"Yes":"No",s.description||""].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(","));
    const blob=new Blob([[hdrs.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="services.csv"; a.click();
  }

  // Filtered payments
  const filteredPay = payments.filter(p=>{
    if (payDateFrom && p.created_at<payDateFrom) return false;
    if (payDateTo && p.created_at>payDateTo+"T23:59:59") return false;
    if (paySearch) {
      const q=paySearch.toLowerCase();
      if (!`${p.clients?.first_name} ${p.clients?.last_name} ${p.transaction_id} ${p.method}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  function exportPayCSV() {
    const hdrs=["Client","Amount","Method","Transaction ID","Date"];
    const rows=filteredPay.map(p=>[`${p.clients?.first_name||""} ${p.clients?.last_name||""}`,p.amount,p.method||"Card",p.transaction_id||"",p.created_at?.slice(0,10)||""].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(","));
    const blob=new Blob([[hdrs.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="payments.csv"; a.click();
  }

  // Tab counts
  const tabCounts: Record<string,number> = {
    "Invoices": invoices.length,
    "Payments": payments.length,
    "Services / Products": services.length,
    "Subscriptions": subs.length,
  };

  const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:14, boxSizing:"border-box" };
  const lbl: React.CSSProperties = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:4 };
  const sel: React.CSSProperties = { ...inp, background:"#fff" };

  function Pagination({ page, total, pageSize, setPage, setPageSize }: any) {
    const totalPages = Math.max(1, Math.ceil(total/pageSize));
    const safe = Math.min(page, totalPages);
    return (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:"1px solid #f1f5f9", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, color:"#64748b" }}>Rows:</span>
          <select value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding:"4px 8px", border:"1px solid #e2e8f0", borderRadius:6, fontSize:13 }}>
            {PAGE_SIZES.map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <span style={{ fontSize:13, color:"#64748b" }}>{Math.min((safe-1)*pageSize+1,total)}–{Math.min(safe*pageSize,total)} of {total}</span>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={()=>setPage(1)} disabled={safe===1} style={{ padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#fff", cursor:safe===1?"default":"pointer", opacity:safe===1?0.4:1, fontSize:13 }}>«</button>
          <button onClick={()=>setPage((p:number)=>Math.max(1,p-1))} disabled={safe===1} style={{ padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#fff", cursor:safe===1?"default":"pointer", opacity:safe===1?0.4:1, fontSize:13 }}>‹</button>
          <span style={{ padding:"4px 12px", background:"#1e3a5f", color:"#fff", borderRadius:6, fontSize:13, fontWeight:700 }}>{safe}</span>
          <button onClick={()=>setPage((p:number)=>Math.min(totalPages,p+1))} disabled={safe===totalPages} style={{ padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#fff", cursor:safe===totalPages?"default":"pointer", opacity:safe===totalPages?0.4:1, fontSize:13 }}>›</button>
          <button onClick={()=>setPage(totalPages)} disabled={safe===totalPages} style={{ padding:"4px 10px", border:"1px solid #e2e8f0", borderRadius:6, background:"#fff", cursor:safe===totalPages?"default":"pointer", opacity:safe===totalPages?0.4:1, fontSize:13 }}>»</button>
        </div>
      </div>
    );
  }

  return (
    <CDMLayout>
      <div style={{ padding:24, maxWidth:1200 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0, color:"#1e293b" }}>Billing</h1>
            <p style={{ margin:"4px 0 0", fontSize:14, color:"#64748b" }}>Manage invoices, payments, and subscriptions.</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={exportInvCSV} style={{ padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, color:"#475569" }}>⬇ Export CSV</button>
            <button onClick={()=>{ setEditingInv(null); setInvForm({client_id:"",amount:"",description:"",status:"pending",due_date:"",tax_rate:"",discount:"",notes:""}); setShowInvForm(true); setTab("Invoices"); }}
              style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>+ New Invoice</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Monthly Revenue", val:monthlyRev, color:"#10b981", icon:"📈", trend:"+12% vs last month" },
            { label:"YTD Revenue", val:ytdRev, color:"#3b82f6", icon:"💰", trend:`${new Date().getFullYear()} total` },
            { label:"Avg Invoice", val:avgInvoice, color:"#8b5cf6", icon:"🧾", trend:`${paidInvoices.length} paid invoices` },
            { label:"Total Outstanding", val:totalOutstanding, color:"#f59e0b", icon:"⏳", trend:`${invoices.filter(i=>i.status!=="paid").length} unpaid` },
          ].map(c=>(
            <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", borderTop:`3px solid ${c.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ margin:0, fontSize:12, color:"#64748b", fontWeight:600 }}>{c.label}</p>
                  <p style={{ margin:"6px 0 0", fontSize:26, fontWeight:800, color:c.color }}>{fmt(c.val)}</p>
                </div>
                <span style={{ fontSize:28 }}>{c.icon}</span>
              </div>
              <p style={{ margin:"8px 0 0", fontSize:12, color:"#94a3b8" }}>{c.trend}</p>
            </div>
          ))}
        </div>

        {/* Sub-stat row */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {[["Paid",totalPaid,"#10b981"],["Pending",totalPending,"#f59e0b"],["Overdue",totalOverdue,"#ef4444"]].map(([l,v,c])=>(
            <div key={l as string} style={{ flex:1, background:"#fff", borderRadius:9, padding:"12px 16px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:`3px solid ${c}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#64748b" }}>{l}</span>
              <span style={{ fontSize:18, fontWeight:800, color:c as string }}>{fmt(v as number)}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, marginBottom:20, borderBottom:"2px solid #f1f5f9", overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontWeight:tab===t?700:500, color:tab===t?"#1e3a5f":"#64748b", borderBottom:tab===t?"2px solid #1e3a5f":"2px solid transparent", marginBottom:-2, fontSize:13, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
              {t}
              {tabCounts[t]!==undefined && <span style={{ background:tab===t?"#1e3a5f":"#e2e8f0", color:tab===t?"#fff":"#64748b", borderRadius:20, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{tabCounts[t]}</span>}
            </button>
          ))}
        </div>

        {/* ── INVOICES TAB ── */}
        {tab==="Invoices" && (
          <>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              <input value={invSearch} onChange={e=>{setInvSearch(e.target.value);setInvPage(1);}} placeholder="Search by client, #, description…"
                style={{ flex:1, minWidth:200, padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, outline:"none" }} />
              <select value={invStatus} onChange={e=>{setInvStatus(e.target.value);setInvPage(1);}} style={{ padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, background:"#fff" }}>
                <option value="all">All Status</option>
                {["paid","pending","overdue"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <input type="date" value={invDateFrom} onChange={e=>{setInvDateFrom(e.target.value);setInvPage(1);}} style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13 }} title="From" />
              <input type="date" value={invDateTo} onChange={e=>{setInvDateTo(e.target.value);setInvPage(1);}} style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13 }} title="To" />
            </div>

            {/* Bulk toolbar */}
            {invSelected.size>0 && (
              <div style={{ background:"#1e3a5f", borderRadius:8, padding:"10px 16px", marginBottom:12, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{invSelected.size} selected</span>
                <div style={{ flex:1 }} />
                <button onClick={exportInvCSV} style={{ padding:"6px 14px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6, background:"transparent", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>⬇ Export</button>
                <button onClick={bulkMarkPaid} style={{ padding:"6px 14px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6, background:"transparent", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>✓ Mark Paid</button>
                <button onClick={bulkDeleteInv} style={{ padding:"6px 14px", border:"1px solid #fca5a5", borderRadius:6, background:"transparent", color:"#fca5a5", cursor:"pointer", fontSize:13, fontWeight:600 }}>🗑 Delete</button>
                <button onClick={()=>setInvSelected(new Set())} style={{ padding:"6px 14px", border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", borderRadius:6, cursor:"pointer", fontSize:12 }}>✕</button>
              </div>
            )}

            <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                  <thead style={{ background:"#f8fafc" }}>
                    <tr>
                      <th style={{ padding:"12px 12px", width:36 }}>
                        <input type="checkbox" checked={pagedInv.length>0&&invSelected.size===pagedInv.length} onChange={toggleAllInv} />
                      </th>
                      {[["invoice_number","Invoice #"],["client","Client"],["description","Description"],["amount","Amount"],["due_date","Due Date"],["status","Status"]].map(([col,label])=>(
                        <th key={col} onClick={()=>sortBy(col)} style={{ textAlign:"left", padding:"12px 12px", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", cursor:"pointer", whiteSpace:"nowrap", userSelect:"none" }}>
                          {label} {sortIcon(col)}
                        </th>
                      ))}
                      <th style={{ textAlign:"left", padding:"12px 12px", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>Loading…</td></tr>
                    : pagedInv.length===0 ? <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#94a3b8" }}>
                        <div style={{ fontSize:32, marginBottom:8 }}>🧾</div>
                        <div style={{ fontWeight:600 }}>No invoices found</div>
                      </td></tr>
                    : pagedInv.map((inv,idx)=>(
                      <tr key={inv.id} onClick={()=>setViewInv(inv)} style={{ borderTop:"1px solid #f1f5f9", cursor:"pointer" }}
                        onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")}
                        onMouseLeave={e=>(e.currentTarget.style.background="")}>
                        <td style={{ padding:"11px 12px" }} onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" checked={invSelected.has(inv.id)} onChange={()=>toggleInvSelect(inv.id)} />
                        </td>
                        <td style={{ padding:"11px 12px", fontSize:13, fontWeight:700, color:"#1e3a5f" }}>{invNumber(inv,(invSafePage-1)*invPageSize+idx)}</td>
                        <td style={{ padding:"11px 12px", fontSize:14, fontWeight:600 }}>{inv.clients?.first_name} {inv.clients?.last_name}</td>
                        <td style={{ padding:"11px 12px", fontSize:13, color:"#475569", maxWidth:200 }}>{inv.description||"—"}</td>
                        <td style={{ padding:"11px 12px", fontSize:14, fontWeight:700 }}>{fmt(inv.amount||0)}</td>
                        <td style={{ padding:"11px 12px", fontSize:13, color:"#64748b" }}>{inv.due_date?new Date(inv.due_date).toLocaleDateString():"—"}</td>
                        <td style={{ padding:"11px 12px" }}>
                          <select value={inv.status} onClick={e=>e.stopPropagation()} onChange={e=>updateInvStatus(inv.id,e.target.value)}
                            style={{ fontSize:12, padding:"3px 8px", border:`1px solid ${STATUS_C[inv.status]||"#94a3b8"}`, borderRadius:20, background:(STATUS_C[inv.status]||"#94a3b8")+"22", color:STATUS_C[inv.status]||"#64748b", fontWeight:700, cursor:"pointer" }}>
                            {["pending","paid","overdue"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ padding:"11px 12px" }} onClick={e=>e.stopPropagation()}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button type="button" onClick={()=>sendInvoice(inv)} title="Send" style={{ width:28, height:28, border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:13 }}>✉️</button>
                            <button onClick={()=>downloadPDF(inv)} title="PDF" style={{ width:28, height:28, border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:13 }}>📄</button>
                            <button onClick={()=>copyPaymentLink(inv)} title="Payment link" style={{ width:28, height:28, border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:13 }}>🔗</button>
                            <button onClick={()=>openEditInv(inv)} title="Edit" style={{ width:28, height:28, border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:13 }}>✏️</button>
                            <button onClick={()=>setDeleteInvId(inv.id)} title="Delete" style={{ width:28, height:28, border:"1px solid #fecaca", borderRadius:6, background:"#fff5f5", cursor:"pointer", fontSize:13 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredInv.length>0 && <Pagination page={invSafePage} total={filteredInv.length} pageSize={invPageSize} setPage={setInvPage} setPageSize={setInvPageSize} />}
            </div>
          </>
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab==="Payments" && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              <input value={paySearch} onChange={e=>setPaySearch(e.target.value)} placeholder="Search by client, transaction ID, method…"
                style={{ flex:1, minWidth:200, padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, outline:"none" }} />
              <input type="date" value={payDateFrom} onChange={e=>setPayDateFrom(e.target.value)} style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13 }} title="From" />
              <input type="date" value={payDateTo} onChange={e=>setPayDateTo(e.target.value)} style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13 }} title="To" />
              <button onClick={exportPayCSV} style={{ padding:"8px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, color:"#475569" }}>⬇ Export</button>
            </div>
            <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={{ background:"#f8fafc" }}><tr>
                  {["Client","Amount","Method","Transaction ID","Date","Actions"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>Loading…</td></tr>
                  : filteredPay.length===0
                    ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No payments recorded.</td></tr>
                    : filteredPay.map(p=>(
                      <tr key={p.id} style={{ borderTop:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"12px 16px", fontSize:14 }}>{p.clients?.first_name} {p.clients?.last_name}</td>
                        <td style={{ padding:"12px 16px", fontSize:14, fontWeight:700, color:"#10b981" }}>{fmt(p.amount||0)}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>
                          <span style={{ background:"#f1f5f9", borderRadius:6, padding:"3px 8px", fontSize:12 }}>{p.method||"Card"}</span>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:"#94a3b8", fontFamily:"monospace" }}>{p.transaction_id||"—"}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <button onClick={()=>alert(`Refund for ${fmt(p.amount)} — connect Stripe`)} style={{ fontSize:12, padding:"4px 10px", background:"#fff", border:"1px solid #fca5a5", borderRadius:5, cursor:"pointer", color:"#ef4444", fontWeight:600 }}>Refund</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── SERVICES TAB ── */}
        {tab==="Services / Products" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <button onClick={exportSvcCSV} style={{ padding:"8px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, color:"#475569" }}>⬇ Export</button>
              <button onClick={()=>{ setEditingSvc(null); setSvcForm({name:"",price:"",description:"",type:"monthly",active:true}); setShowSvcForm(true); }}
                style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>+ Add Service</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:16 }}>
              {services.length===0 ? <p style={{ color:"#94a3b8", fontSize:14 }}>No services yet.</p>
              : services.map(s=>(
                <div key={s.id} style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", border:"1px solid #f1f5f9", opacity:s.active===false?0.6:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{s.name}</h3>
                    <button onClick={()=>toggleSvcActive(s)}
                      style={{ width:40, height:22, borderRadius:11, border:"none", background:s.active!==false?"#10b981":"#e2e8f0", cursor:"pointer", position:"relative", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:3, left:s.active!==false?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                    </button>
                  </div>
                  <p style={{ margin:"0 0 10px", fontSize:13, color:"#64748b" }}>{s.description||"—"}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:22, fontWeight:800, color:"#1e3a5f" }}>${s.price}</span>
                    <span style={{ fontSize:12, background:"#f1f5f9", borderRadius:20, padding:"2px 10px", color:"#64748b" }}>{s.type}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>{clientsOnPlan(s)} clients on this plan</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>openEditSvc(s)} style={{ flex:1, padding:"6px 0", border:"1px solid #e2e8f0", borderRadius:6, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:600 }}>✏️ Edit</button>
                    <button onClick={()=>deleteSvc(s.id)} style={{ flex:1, padding:"6px 0", border:"1px solid #fecaca", borderRadius:6, background:"#fff5f5", cursor:"pointer", fontSize:12, fontWeight:600, color:"#ef4444" }}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CREDIT CARD SETUP TAB ── */}
        {tab==="Credit Card Setup" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:"#fff", borderRadius:10, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>
              <h2 style={{ fontSize:16, fontWeight:700, margin:"0 0 16px" }}>Stripe Integration</h2>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                {(["test","live"] as const).map(m=>(
                  <button key={m} onClick={()=>setStripeMode(m)}
                    style={{ flex:1, padding:"9px 0", border:`2px solid ${stripeMode===m?"#1e3a5f":"#e2e8f0"}`, borderRadius:8, background:stripeMode===m?"#1e3a5f":"#fff", color:stripeMode===m?"#fff":"#64748b", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                    {m==="test"?"🧪 Test Mode":"🚀 Live Mode"}
                  </button>
                ))}
              </div>
              {stripeMode==="test" && <div style={{ background:"#fef9c3", borderRadius:7, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#854d0e" }}>⚠️ Test mode — payments are not real. Use Stripe test cards.</div>}
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Stripe {stripeMode==="test"?"Test":"Live"} Publishable Key</label>
                <input value={stripeKey} onChange={e=>setStripeKey(e.target.value)} placeholder={`pk_${stripeMode}_...`} style={inp} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Webhook Endpoint URL</label>
                <div style={{ display:"flex", gap:8 }}>
                  <input value="https://disputepilot-app.vercel.app/api/stripe/webhook" readOnly style={{ ...inp, background:"#f8fafc", color:"#64748b", flex:1 }} />
                  <button onClick={()=>navigator.clipboard.writeText("https://disputepilot-app.vercel.app/api/stripe/webhook")}
                    style={{ padding:"9px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Copy</button>
                </div>
                <p style={{ fontSize:12, color:"#94a3b8", margin:"6px 0 0" }}>Add this URL to your Stripe Dashboard → Developers → Webhooks</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ background:process.env.NEXT_PUBLIC_STRIPE_KEY?"#dcfce7":"#fee2e2", borderRadius:7, padding:"8px 14px", flex:1, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>Connection Status</span>
                  <span style={{ fontSize:13, fontWeight:700, color:process.env.NEXT_PUBLIC_STRIPE_KEY?"#166534":"#991b1b" }}>{process.env.NEXT_PUBLIC_STRIPE_KEY?"✓ Connected":"✗ Not Connected"}</span>
                </div>
              </div>
              <button onClick={()=>{ setStripeSaved(true); setTimeout(()=>setStripeSaved(false),2000); }}
                style={{ background:stripeSaved?"#10b981":"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"10px 24px", cursor:"pointer", fontWeight:700, fontSize:14 }}>
                {stripeSaved?"✓ Saved":"Save Settings"}
              </button>
            </div>

            <div style={{ background:"#fff", borderRadius:10, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>
              <h2 style={{ fontSize:15, fontWeight:700, margin:"0 0 14px" }}>Accepted Payment Methods</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { name:"Visa / Mastercard / Amex", icon:"💳", enabled:true },
                  { name:"ACH / Bank Transfer", icon:"🏦", enabled:false },
                  { name:"PayPal", icon:"🅿️", enabled:false },
                  { name:"Apple Pay / Google Pay", icon:"📱", enabled:false },
                ].map(m=>(
                  <div key={m.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", border:"1px solid #f1f5f9", borderRadius:8 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:20 }}>{m.icon}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{m.name}</span>
                    </div>
                    <div style={{ width:36, height:20, borderRadius:10, background:m.enabled?"#10b981":"#e2e8f0", position:"relative", cursor:"pointer" }}>
                      <div style={{ position:"absolute", top:2, left:m.enabled?16:2, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 2px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAY PER DELETION TAB ── */}
        {tab==="Pay Per Deletion" && (
          <div style={{ maxWidth:700 }}>
            <div style={{ background:"#fff", borderRadius:10, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>
              <h2 style={{ fontSize:15, fontWeight:700, margin:"0 0 6px" }}>Pay Per Deletion Billing</h2>
              <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>Charge clients automatically when a negative item is successfully removed from their credit report.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                {[["Charge per deletion","$50"],["Collections removed","$75"],["Late payment removed","$50"],["Hard inquiry removed","$25"]].map(([label,def])=>(
                  <div key={label}>
                    <label style={lbl}>{label}</label>
                    <input defaultValue={def} style={inp} placeholder="$0.00" />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700, fontSize:14 }}>Save PPD Settings</button>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:10, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, margin:"0 0 14px" }}>Recent Pay Per Deletion Charges</h3>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={{ background:"#f8fafc" }}><tr>
                  {["Client","Item Removed","Charge","Date","Status"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <tr><td colSpan={5} style={{ padding:28, textAlign:"center", color:"#94a3b8", fontSize:14 }}>No PPD charges yet.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTIONS TAB ── */}
        {tab==="Subscriptions" && (
          <>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
              <button onClick={() => setShowSubForm(true)} style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>+ New Subscription</button>
            </div>
            <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={{ background:"#f8fafc" }}><tr>
                  {["Client","Plan","Amount","Billing Cycle","Next Charge","Status","Actions"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {subs.length===0
                    ? <tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No subscriptions yet.</td></tr>
                    : subs.map(s=>(
                      <tr key={s.id} style={{ borderTop:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"12px 16px", fontWeight:600, fontSize:14 }}>{s.clients?.first_name} {s.clients?.last_name}</td>
                        <td style={{ padding:"12px 16px", fontSize:13 }}>{s.plan||"—"}</td>
                        <td style={{ padding:"12px 16px", fontSize:14, fontWeight:700 }}>{fmt(s.amount||0)}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>{s.billing_cycle||"monthly"}</td>
                        <td style={{ padding:"12px 16px", fontSize:13, color:"#64748b" }}>{s.next_charge?new Date(s.next_charge).toLocaleDateString():"—"}</td>
                        <td style={{ padding:"12px 16px" }}>{badge(s.status==="active"?"#10b981":"#94a3b8", s.status||"active")}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", gap:5 }}>
                            <button onClick={() => deleteSub(s.id)} style={{ fontSize:12, padding:"4px 10px", border:"1px solid #fca5a5", borderRadius:5, background:"#fff5f5", cursor:"pointer", color:"#ef4444" }}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── AUTO-BILLING TAB ── */}
        {tab==="Auto-Billing" && (
          <div style={{ maxWidth:700 }}>
            <div style={{ background:"#fff", borderRadius:10, padding:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>
              <h2 style={{ fontSize:15, fontWeight:700, margin:"0 0 6px" }}>Auto-Billing Rules</h2>
              <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>Automatically charge clients on a schedule based on their service plan.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {autoBillingRules.map(rule=>(
                  <div key={rule.id} style={{ border:"1px solid #f1f5f9", borderRadius:9, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, background:rule.active?"#fff":"#f8fafc" }}>
                    <button onClick={()=>setAutoBillingRules(r=>r.map(x=>x.id===rule.id?{...x,active:!x.active}:x))}
                      style={{ width:44, height:24, borderRadius:12, border:"none", background:rule.active?"#10b981":"#e2e8f0", cursor:"pointer", position:"relative", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:3, left:rule.active?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                    </button>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>{rule.name}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>Plan: {rule.plan} · Charge {fmt(rule.amount)} on day {rule.day} of each month</div>
                    </div>
                    <button style={{ padding:"6px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:12, fontWeight:600 }}>Edit</button>
                  </div>
                ))}
              </div>
              <button style={{ marginTop:16, background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>+ New Auto-Billing Rule</button>
            </div>
            <div style={{ background:"#fff3cd", borderRadius:9, padding:"14px 18px", fontSize:13, color:"#856404", border:"1px solid #ffc107" }}>
              ⚡ Auto-billing requires Stripe to be connected in Credit Card Setup and clients to have a saved payment method on file.
            </div>
          </div>
        )}

        {/* ── INVOICE DETAIL MODAL ── */}
        {viewInv && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:32, width:520, maxHeight:"90vh", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>{invNumber(viewInv,0)}</h2>
                {badge(STATUS_C[viewInv.status]||"#94a3b8", viewInv.status)}
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>Bill To</div>
                <div style={{ fontWeight:700, fontSize:15 }}>{viewInv.clients?.first_name} {viewInv.clients?.last_name}</div>
                <div style={{ fontSize:13, color:"#64748b" }}>{viewInv.clients?.email||"—"}</div>
              </div>
              <div style={{ background:"#f8fafc", borderRadius:8, padding:16, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:"#64748b" }}>{viewInv.description||"Service"}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{fmt(viewInv.base_amount||viewInv.amount||0)}</span>
                </div>
                {viewInv.tax_rate>0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:"#64748b" }}>Tax ({viewInv.tax_rate}%)</span>
                  <span style={{ fontSize:13 }}>{fmt((viewInv.base_amount||0)*(viewInv.tax_rate||0)/100)}</span>
                </div>}
                {viewInv.discount>0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:"#64748b" }}>Discount</span>
                  <span style={{ fontSize:13, color:"#10b981" }}>-{fmt(viewInv.discount||0)}</span>
                </div>}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"1px solid #e2e8f0" }}>
                  <span style={{ fontWeight:700 }}>Total</span>
                  <span style={{ fontWeight:800, fontSize:16, color:"#1e3a5f" }}>{fmt(viewInv.amount||0)}</span>
                </div>
              </div>
              {viewInv.notes && <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>Notes</div>
                <p style={{ margin:0, fontSize:13, color:"#475569" }}>{viewInv.notes}</p>
              </div>}
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={()=>setViewInv(null)} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Close</button>
                <button onClick={()=>downloadPDF(viewInv)} style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>📄 Download PDF</button>
                <button type="button" onClick={()=>sendInvoice(viewInv)} style={{ padding:"9px 20px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>✉️ Send</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD/EDIT INVOICE MODAL ── */}
        {showInvForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:28, width:500, maxHeight:"92vh", overflowY:"auto" }}>
              <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700 }}>{editingInv?"Edit Invoice":"New Invoice"}</h2>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Client *</label>
                <select value={invForm.client_id} onChange={e=>setInvForm(f=>({...f,client_id:e.target.value}))} style={sel}>
                  <option value="">Select client…</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Base Amount ($) *</label>
                  <input type="number" value={invForm.amount} onChange={e=>setInvForm(f=>({...f,amount:e.target.value}))} style={inp} placeholder="149.00" />
                </div>
                <div>
                  <label style={lbl}>Due Date</label>
                  <input type="date" value={invForm.due_date} onChange={e=>setInvForm(f=>({...f,due_date:e.target.value}))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Tax Rate (%)</label>
                  <input type="number" value={invForm.tax_rate} onChange={e=>setInvForm(f=>({...f,tax_rate:e.target.value}))} style={inp} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Discount ($)</label>
                  <input type="number" value={invForm.discount} onChange={e=>setInvForm(f=>({...f,discount:e.target.value}))} style={inp} placeholder="0" />
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Description</label>
                <input value={invForm.description} onChange={e=>setInvForm(f=>({...f,description:e.target.value}))} style={inp} placeholder="Credit repair services — Month 1" />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Status</label>
                <select value={invForm.status} onChange={e=>setInvForm(f=>({...f,status:e.target.value}))} style={sel}>
                  {["pending","paid","overdue"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Notes</label>
                <textarea value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))}
                  style={{ ...inp, minHeight:60, resize:"vertical" } as React.CSSProperties} placeholder="Optional notes for this invoice…" />
              </div>
              {(invForm.amount||invForm.tax_rate||invForm.discount) && (
                <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:7, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#166534" }}>
                  Total: {fmt((parseFloat(invForm.amount)||0)+(parseFloat(invForm.amount)||0)*(parseFloat(invForm.tax_rate)||0)/100-(parseFloat(invForm.discount)||0))}
                </div>
              )}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>{ setShowInvForm(false); setEditingInv(null); }} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Cancel</button>
                <button onClick={saveInvoice} disabled={saving} style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>
                  {saving?"Saving…":editingInv?"Save Changes":"Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {deleteInvId && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:28, width:360 }}>
              <h2 style={{ margin:"0 0 10px", fontSize:17, fontWeight:700 }}>Delete Invoice?</h2>
              <p style={{ color:"#64748b", fontSize:14, margin:"0 0 20px" }}>This cannot be undone.</p>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setDeleteInvId(null)} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Cancel</button>
                <button onClick={()=>deleteInvoice(deleteInvId)} style={{ padding:"9px 20px", background:"#ef4444", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD/EDIT SERVICE MODAL ── */}
        {showSvcForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:28, width:420 }}>
              <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700 }}>{editingSvc?"Edit Service":"New Service / Product"}</h2>
              {[["Name *","name","text"],["Price ($)","price","number"],["Description","description","text"]].map(([label,key,type])=>(
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={(svcForm as any)[key]} onChange={e=>setSvcForm(f=>({...f,[key]:e.target.value}))} style={inp} />
                </div>
              ))}
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Billing Type</label>
                <select value={svcForm.type} onChange={e=>setSvcForm(f=>({...f,type:e.target.value}))} style={sel}>
                  {["monthly","one-time","annual","pay-per-deletion"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>{ setShowSvcForm(false); setEditingSvc(null); }} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Cancel</button>
                <button onClick={saveSvc} disabled={saving} style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>{saving?"Saving…":editingSvc?"Save Changes":"Add Service"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── NEW SUBSCRIPTION MODAL ── */}
        {showSubForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:28, width:440 }}>
              <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700 }}>New Subscription</h2>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Client *</label>
                <select value={subForm.client_id} onChange={e=>setSubForm(f=>({...f,client_id:e.target.value}))} style={inp}>
                  <option value="">Select client…</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Plan</label>
                <input value={subForm.plan} onChange={e=>setSubForm(f=>({...f,plan:e.target.value}))} style={inp} placeholder="e.g. Standard ($149/mo)" />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Amount ($)</label>
                <input type="number" value={subForm.amount} onChange={e=>setSubForm(f=>({...f,amount:e.target.value}))} style={inp} placeholder="149" />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Billing Cycle</label>
                <select value={subForm.billing_cycle} onChange={e=>setSubForm(f=>({...f,billing_cycle:e.target.value}))} style={inp}>
                  {["monthly","quarterly","annually"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowSubForm(false)} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Cancel</button>
                <button onClick={saveSubscription} disabled={saving} style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>{saving?"Saving…":"Create Subscription"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
