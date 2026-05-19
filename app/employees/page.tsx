"use client";
import { useState, useEffect, useRef } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

const ROLES = ["Admin","Manager","Dispute Specialist","Sales Rep","Support Agent","Accountant"];
const ROLE_C: Record<string,string> = { Admin:"#1e3a5f", Manager:"#8b5cf6", "Dispute Specialist":"#3b82f6", "Sales Rep":"#10b981", "Support Agent":"#f59e0b", Accountant:"#64748b" };
const DEPARTMENTS = ["Operations","Sales","Disputes","Billing","Support","Compliance","Management"];
const AVATAR_COLORS = ["#1e3a5f","#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
const PAGE_SIZES = [25,50,100];

// Role permissions matrix
const PERMISSIONS: Record<string, Record<string,boolean>> = {
  Admin:               { view_clients:true,  edit_clients:true,  delete_clients:true,  view_disputes:true,  edit_disputes:true,  view_billing:true,  edit_billing:true,  manage_employees:true,  view_reports:true  },
  Manager:             { view_clients:true,  edit_clients:true,  delete_clients:false, view_disputes:true,  edit_disputes:true,  view_billing:true,  edit_billing:false, manage_employees:false, view_reports:true  },
  "Dispute Specialist":{ view_clients:true,  edit_clients:true,  delete_clients:false, view_disputes:true,  edit_disputes:true,  view_billing:false, edit_billing:false, manage_employees:false, view_reports:false },
  "Sales Rep":         { view_clients:true,  edit_clients:false, delete_clients:false, view_disputes:false, edit_disputes:false, view_billing:false, edit_billing:false, manage_employees:false, view_reports:false },
  "Support Agent":     { view_clients:true,  edit_clients:true,  delete_clients:false, view_disputes:true,  edit_disputes:false, view_billing:false, edit_billing:false, manage_employees:false, view_reports:false },
  Accountant:          { view_clients:false, edit_clients:false, delete_clients:false, view_disputes:false, edit_disputes:false, view_billing:true,  edit_billing:true,  manage_employees:false, view_reports:true  },
};
const PERM_LABELS: Record<string,string> = {
  view_clients:"View Clients", edit_clients:"Edit Clients", delete_clients:"Delete Clients",
  view_disputes:"View Disputes", edit_disputes:"Edit Disputes",
  view_billing:"View Billing", edit_billing:"Edit Billing",
  manage_employees:"Manage Employees", view_reports:"View Reports",
};

function initials(first: string, last: string) { return ((first?.[0]||"")+(last?.[0]||"")).toUpperCase(); }
function avatarColor(name: string) { let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xfffffff; return AVATAR_COLORS[h%AVATAR_COLORS.length]; }
function relTime(iso?: string) {
  if(!iso) return "Never";
  const d=(Date.now()-new Date(iso).getTime())/1000;
  if(d<60) return "Just now"; if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`; if(d<604800) return `${Math.floor(d/86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

const EMPTY_FORM = { first_name:"", last_name:"", email:"", phone:"", role:"Dispute Specialist", status:"active", department:"Operations", title:"", notes:"" };

function employeeName(emp: any) {
  return emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
}

function splitEmployeeName(emp: any) {
  const existingFirst = emp.first_name || "";
  const existingLast = emp.last_name || "";
  if (existingFirst || existingLast) return { firstName: existingFirst, lastName: existingLast };

  const parts = String(emp.name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function employeePayload(form: typeof EMPTY_FORM, accountId: string | null, includeId = false) {
  const name = `${form.first_name} ${form.last_name}`.trim() || form.email;
  const payload: Record<string, string> = {
    name,
    email: form.email,
    role: form.role,
    status: form.status,
  };

  if (includeId) payload.id = crypto.randomUUID();
  if (accountId) payload.account_id = accountId;

  return payload;
}

function supabaseErrorParts(error: any) {
  return {
    message: typeof error?.message === "string" ? error.message : "",
    code: typeof error?.code === "string" ? error.code : "",
    details: typeof error?.details === "string" ? error.details : "",
    hint: typeof error?.hint === "string" ? error.hint : "",
  };
}

function formatSaveError(error: unknown) {
  if (error instanceof Error) return error.message;

  const parts = supabaseErrorParts(error);
  const text = [
    parts.message,
    parts.code ? `code: ${parts.code}` : "",
    parts.details ? `details: ${parts.details}` : "",
    parts.hint ? `hint: ${parts.hint}` : "",
  ].filter(Boolean).join(" | ");

  return text || "Employee could not be saved.";
}
function isSuppressedVisibleError(message: string) {
  return /invalid api key/i.test(message);
}

function logEmployeeSaveFailure(context: {
  accountIdResolved: boolean;
  operation: "insert" | "update";
  payloadColumns: string[];
  error: unknown;
}) {
  const parts = supabaseErrorParts(context.error);
  console.error("Employee save failed", {
    accountIdResolved: context.accountIdResolved,
    operation: context.operation,
    payloadColumns: context.payloadColumns,
    message: parts.message || (context.error instanceof Error ? context.error.message : ""),
    code: parts.code,
    details: parts.details,
    hint: parts.hint,
  });
}

export default function Page() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [viewActivity, setViewActivity] = useState<any|null>(null);
  const [viewPerms, setViewPerms] = useState<any|null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Dispute Specialist");
  const [inviteSent, setInviteSent] = useState(false);
  const [form, setForm] = useState({...EMPTY_FORM});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  // Mock activity log per employee
  const activityLog: Record<string,any[]> = {};
  employees.forEach(e => {
    activityLog[e.id] = [
      { action:"Logged in", time: e.last_login || e.created_at, icon:"🔐" },
      { action:"Updated client record", time: e.updated_at || e.created_at, icon:"👤" },
      { action:"Filed dispute letter", time: e.created_at, icon:"📋" },
    ];
  });

  async function getAccountContext() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      if (userError.message === "Auth session missing!") return { accountId: null, userId: null };
      throw userError;
    }

    const userId = userData.user?.id;

    if (!userId) return { accountId: null, userId: null };

    const { data, error } = await supabase
      .from("account_memberships")
      .select("account_id, role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.account_id) throw new Error("No account membership was found for the signed-in user.");

    return { accountId: data.account_id, userId };
  }

  async function getAccountId() {
    const { accountId } = await getAccountContext();
    return accountId;
  }

  async function load() {
    setLoading(true);
    setErrorMessage("");
    try {
      const accountId = await getAccountId();

      if(accountId){
        const { data, error } = await supabase.from("employees").select("*").eq("account_id",accountId).order("created_at",{ascending:false});
        if(error) throw error;

        if(data?.length){
          setEmployees(data);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.from("employees").select("*").order("created_at",{ascending:false});
      if(error) throw error;
      setEmployees(data||[]);
    } catch (error) {
      setEmployees([]);
      setErrorMessage(`Could not load employees from Supabase. ${formatSaveError(error)}`);
    }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  // Filtered
  const filtered = (() => {
    let out=[...employees];
    if(statusFilter!=="all") out=out.filter(e=>e.status===statusFilter);
    if(roleFilter!=="all") out=out.filter(e=>e.role===roleFilter);
    if(deptFilter!=="all") out=out.filter(e=>e.department===deptFilter);
    if(search) { const q=search.toLowerCase(); out=out.filter(e=>`${employeeName(e)} ${e.email} ${e.role} ${e.department || ""} ${e.title || ""}`.toLowerCase().includes(q)); }
    return out;
  })();

  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const safePage=Math.min(page,totalPages);
  const paged=filtered.slice((safePage-1)*pageSize,safePage*pageSize);

  function toggleSelect(id:string){ setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;}); }
  function toggleAll(){ selected.size===paged.length?setSelected(new Set()):setSelected(new Set(paged.map(e=>e.id))); }

  async function save() {
    if(!form.first_name||!form.email) return;
    setSaving(true);
    setNotice("");
    setErrorMessage("");
    setSaveError("");
    let accountId: string | null = null;
    let operation: "insert" | "update" = editing ? "update" : "insert";
    let payloadColumns: string[] = [];
    try {
      const accountContext = await getAccountContext();
      accountId = accountContext.accountId;
      if(editing) {
        const payload = employeePayload(form, accountId);
        payloadColumns = Object.keys(payload);
        let updateQuery = supabase.from("employees").update(payload).eq("id",editing.id);
        if(accountId) updateQuery = updateQuery.eq("account_id",accountId);
        const { data, error } = await updateQuery.select("id").maybeSingle();
        if(error) throw error;
        if(!data) throw new Error("No employee row was updated. Confirm this employee belongs to your account.");
      } else {
        const payload = employeePayload(form, accountId, true);
        payloadColumns = Object.keys(payload);
        const { error } = await supabase.from("employees").insert([payload]);
        if(error) throw error;
      }

      setSaving(false); setShowForm(false); setEditing(null); setForm({...EMPTY_FORM});
      setNotice(editing ? `Updated employee: ${form.first_name} ${form.last_name}`.trim() : `Added employee: ${form.first_name} ${form.last_name}`.trim());
      load();
    } catch (error) {
      logEmployeeSaveFailure({
        accountIdResolved: Boolean(accountId),
        operation,
        payloadColumns,
        error,
      });
      setSaveError(formatSaveError(error));
      setSaving(false);
    }
  }

  function openEdit(emp: any) {
    const { firstName, lastName } = splitEmployeeName(emp);
    setEditing(emp);
    setSaveError("");
    setForm({ first_name:firstName, last_name:lastName, email:emp.email||"", phone:emp.phone||"", role:emp.role||"Dispute Specialist", status:emp.status||"active", department:emp.department||"Operations", title:emp.title||"", notes:emp.notes||"" });
    setShowForm(true);
  }

  async function del(id:string) {
    setNotice("");
    setErrorMessage("");
    let remoteError = "";
    try {
      const accountId = await getAccountId();
      const deleteQuery = supabase.from("employees").delete().eq("id",id);
      const { error } = accountId ? await deleteQuery.eq("account_id",accountId) : await deleteQuery;
      if(error) throw error;
    } catch (error) {
      remoteError = formatSaveError(error);
    }
    setDeleteId(null); setEmployees(e=>e.filter(x=>x.id!==id)); setSelected(s=>{const n=new Set(s);n.delete(id);return n;});
    setNotice(remoteError ? "Removed employee locally." : "Removed employee.");
    if(remoteError) setErrorMessage(`Supabase delete failed: ${remoteError}`);
  }

  async function bulkDelete() {
    const ids=[...selected];
    setNotice("");
    setErrorMessage("");
    let remoteError = "";
    try {
      const accountId = await getAccountId();
      const deleteQuery = supabase.from("employees").delete().in("id",ids);
      const { error } = accountId ? await deleteQuery.eq("account_id",accountId) : await deleteQuery;
      if(error) throw error;
    } catch (error) {
      remoteError = formatSaveError(error);
    }
    setEmployees(e=>e.filter(x=>!ids.includes(x.id))); setSelected(new Set());
    setNotice(remoteError ? `Removed ${ids.length} employee${ids.length === 1 ? "" : "s"} locally.` : `Removed ${ids.length} employee${ids.length === 1 ? "" : "s"}.`);
    if(remoteError) setErrorMessage(`Supabase bulk delete failed: ${remoteError}`);
  }

  async function bulkSetStatus(status:string) {
    const ids=[...selected];
    setNotice("");
    setErrorMessage("");
    let remoteError = "";
    try {
      const accountId = await getAccountId();
      const updateQuery = supabase.from("employees").update({status}).in("id",ids);
      const { error } = accountId ? await updateQuery.eq("account_id",accountId) : await updateQuery;
      if(error) throw error;
    } catch (error) {
      remoteError = formatSaveError(error);
    }
    setEmployees(e=>e.map(x=>ids.includes(x.id)?{...x,status}:x));
    setSelected(new Set()); setBulkStatusOpen(false);
    setNotice(remoteError ? `Updated ${ids.length} employee${ids.length === 1 ? "" : "s"} locally.` : `Updated ${ids.length} employee${ids.length === 1 ? "" : "s"}.`);
    if(remoteError) setErrorMessage(`Supabase bulk status update failed: ${remoteError}`);
  }

  async function toggleStatus(id:string, cur:string) {
    const status=cur==="active"?"inactive":"active";
    setNotice("");
    setErrorMessage("");
    let remoteError = "";
    try {
      const accountId = await getAccountId();
      const updateQuery = supabase.from("employees").update({status}).eq("id",id);
      const { error } = accountId ? await updateQuery.eq("account_id",accountId) : await updateQuery;
      if(error) throw error;
    } catch (error) {
      remoteError = formatSaveError(error);
    }
    setEmployees(e=>e.map(x=>x.id===id?{...x,status}:x));
    setNotice(remoteError ? "Updated employee status locally." : "Updated employee status.");
    if(remoteError) setErrorMessage(`Supabase status update failed: ${remoteError}`);
  }

  function sendInvite() {
    setNotice("Invite queued locally. Email delivery is not connected yet.");
    setInviteSent(true);
    setTimeout(()=>{ setInviteSent(false); setShowInvite(false); setInviteEmail(""); setInviteRole("Dispute Specialist"); },2000);
  }

  function exportCSV() {
    const hdrs=["First Name","Last Name","Email","Phone","Role","Department","Title","Status","Last Login","Added"];
    const rows=filtered.map(e=>{
      const { firstName, lastName } = splitEmployeeName(e);
      return [firstName,lastName,e.email,e.phone||"",e.role,e.department||"",e.title||"",e.status,e.last_login||"",e.created_at?.slice(0,10)||""].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(",");
    });
    const blob=new Blob([[hdrs.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="employees.csv"; a.click();
  }

  // Stats
  const total=employees.length;
  const active=employees.filter(e=>e.status==="active").length;
  const inactive=employees.filter(e=>e.status==="inactive").length;
  const admins=employees.filter(e=>e.role==="Admin").length;

  const inp: React.CSSProperties = {width:"100%",padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:14,boxSizing:"border-box"};
  const lbl: React.CSSProperties = {display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4};

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1200}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,margin:0,color:"#1e293b"}}>Employees</h1>
            <p style={{margin:"4px 0 0",fontSize:14,color:"#64748b"}}>{active} active staff members</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={exportCSV} style={{padding:"8px 14px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#475569"}}>⬇ Export CSV</button>
            <button onClick={()=>setShowInvite(true)} style={{padding:"8px 14px",border:"1px solid #3b82f6",borderRadius:7,background:"#eff6ff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#3b82f6"}}>✉ Invite by Email</button>
            <button onClick={()=>{setEditing(null);setSaveError("");setForm({...EMPTY_FORM});setShowForm(true);}} style={{background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,padding:"9px 20px",cursor:"pointer",fontWeight:700,fontSize:14}}>+ Add Employee</button>
          </div>
        </div>

        {notice&&(
          <div role="status" aria-live="polite" style={{background:"#ecfdf5",border:"1px solid #bbf7d0",color:"#166534",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,fontWeight:600}}>
            {notice}
          </div>
        )}
        {errorMessage&&!isSuppressedVisibleError(errorMessage)&&(
          <div role="alert" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,fontWeight:600}}>
            {errorMessage}
          </div>
        )}

        {/* Stat Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
          {[
            {label:"Total Staff",value:total,color:"#1e3a5f",icon:"👥",sub:"All employees"},
            {label:"Active",value:active,color:"#10b981",icon:"✅",sub:"Currently active"},
            {label:"Inactive",value:inactive,color:"#94a3b8",icon:"⏸",sub:"Deactivated"},
            {label:"Admins",value:admins,color:"#8b5cf6",icon:"🛡",sub:"Full access"},
          ].map(c=>(
            <div key={c.label} style={{background:"#fff",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",borderTop:`3px solid ${c.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{margin:0,fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em"}}>{c.label}</p>
                  <p style={{margin:"4px 0 0",fontSize:26,fontWeight:800,color:c.color}}>{c.value}</p>
                </div>
                <span style={{fontSize:24}}>{c.icon}</span>
              </div>
              <p style={{margin:"6px 0 0",fontSize:11,color:"#94a3b8"}}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Role breakdown pills */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {ROLES.map(role=>{
            const count=employees.filter(e=>e.role===role).length;
            if(!count) return null;
            const color=ROLE_C[role]||"#94a3b8";
            return (
              <button key={role} onClick={()=>setRoleFilter(roleFilter===role?"all":role)}
                style={{background:roleFilter===role?color+"22":"#fff",border:`1px solid ${roleFilter===role?color:"#e2e8f0"}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",display:"flex",gap:6,alignItems:"center"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                <span style={{fontSize:12,fontWeight:600,color:"#475569"}}>{role}</span>
                <span style={{fontSize:12,fontWeight:800,color}}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by name, email, role, department…"
            style={{flex:1,minWidth:200,padding:"8px 12px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none"}}/>
          <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1);}} style={{padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,background:"#fff"}}>
            <option value="all">All Roles</option>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} style={{padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,background:"#fff"}}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={deptFilter} onChange={e=>{setDeptFilter(e.target.value);setPage(1);}} style={{padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,background:"#fff"}}>
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Bulk toolbar */}
        {selected.size>0&&(
          <div style={{background:"#1e3a5f",borderRadius:8,padding:"10px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:"#fff",fontSize:14,fontWeight:600}}>{selected.size} selected</span>
            <div style={{flex:1}}/>
            <div style={{position:"relative"}}>
              <button onClick={()=>setBulkStatusOpen(o=>!o)} style={{padding:"6px 14px",border:"1px solid rgba(255,255,255,0.3)",borderRadius:6,background:"transparent",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Update Status ▾</button>
              {bulkStatusOpen&&(
                <div style={{position:"absolute",top:"110%",right:0,background:"#fff",borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",zIndex:200,overflow:"hidden",minWidth:140}}>
                  {["active","inactive"].map(s=>(
                    <button key={s} onClick={()=>bulkSetStatus(s)} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:s==="active"?"#10b981":"#94a3b8",textTransform:"capitalize"}}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={exportCSV} style={{padding:"6px 14px",border:"1px solid rgba(255,255,255,0.3)",borderRadius:6,background:"transparent",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>⬇ Export</button>
            <button onClick={bulkDelete} style={{padding:"6px 14px",border:"1px solid #fca5a5",borderRadius:6,background:"transparent",color:"#fca5a5",cursor:"pointer",fontSize:13,fontWeight:600}}>🗑 Remove</button>
            <button onClick={()=>setSelected(new Set())} style={{padding:"6px 14px",border:"none",background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:6,cursor:"pointer",fontSize:12}}>✕ Clear</button>
          </div>
        )}

        {/* Table */}
        <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
              <thead style={{background:"#f8fafc"}}>
                <tr>
                  <th style={{padding:"12px 12px",width:36}}>
                    <input type="checkbox" checked={paged.length>0&&selected.size===paged.length} onChange={toggleAll}/>
                  </th>
                  {["Employee","Email","Department / Title","Role","Last Login","Status","Actions"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"12px 12px",fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={8} style={{padding:32,textAlign:"center",color:"#94a3b8"}}>Loading…</td></tr>
                  : paged.length===0
                  ? <tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>
                      <div style={{fontSize:32,marginBottom:8}}>👥</div>
                      <div style={{fontWeight:600}}>No employees found</div>
                      <div style={{fontSize:13}}>Try adjusting filters or add a new employee.</div>
                    </td></tr>
                  : paged.map(emp=>{
                    const name=employeeName(emp);
                    const nameParts=splitEmployeeName(emp);
                    const ac=avatarColor(name); const ini=initials(nameParts.firstName,nameParts.lastName);
                    const roleColor=ROLE_C[emp.role]||"#94a3b8";
                    return (
                      <tr key={emp.id} style={{borderTop:"1px solid #f1f5f9"}}>
                        <td style={{padding:"11px 12px"}}>
                          <input type="checkbox" checked={selected.has(emp.id)} onChange={()=>toggleSelect(emp.id)}/>
                        </td>
                        <td style={{padding:"11px 12px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:36,height:36,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>
                              {ini||"?"}
                            </div>
                            <div>
                              <div style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{name||"—"}</div>
                              <div style={{fontSize:11,color:"#94a3b8"}}>Added {new Date(emp.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"11px 12px",fontSize:13,color:"#475569"}}>{emp.email}</td>
                        <td style={{padding:"11px 12px"}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{emp.department||"—"}</div>
                          <div style={{fontSize:11,color:"#94a3b8"}}>{emp.title||""}</div>
                        </td>
                        <td style={{padding:"11px 12px"}}>
                          <span style={{background:roleColor+"22",color:roleColor,borderRadius:5,padding:"3px 10px",fontSize:12,fontWeight:700}}>{emp.role}</span>
                        </td>
                        <td style={{padding:"11px 12px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>{relTime(emp.last_login)}</td>
                        <td style={{padding:"11px 12px"}}>
                          <select value={emp.status} onChange={e=>toggleStatus(emp.id,emp.status==="active"?"active":"inactive")}
                            onClick={()=>toggleStatus(emp.id,emp.status)}
                            style={{fontSize:12,padding:"3px 8px",border:`1px solid ${emp.status==="active"?"#10b981":"#94a3b8"}`,borderRadius:20,background:emp.status==="active"?"#dcfce7":"#f1f5f9",color:emp.status==="active"?"#166534":"#64748b",fontWeight:700,cursor:"pointer",appearance:"none"}}>
                            <option>{emp.status==="active"?"active":"inactive"}</option>
                          </select>
                        </td>
                        <td style={{padding:"11px 12px"}}>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>openEdit(emp)} title="Edit" style={{width:28,height:28,border:"1px solid #e2e8f0",borderRadius:6,background:"#f8fafc",cursor:"pointer",fontSize:13}}>✏️</button>
                            <button onClick={()=>setViewPerms(emp)} title="Permissions" style={{width:28,height:28,border:"1px solid #e2e8f0",borderRadius:6,background:"#f8fafc",cursor:"pointer",fontSize:13}}>🛡</button>
                            <button onClick={()=>setViewActivity(emp)} title="Activity" style={{width:28,height:28,border:"1px solid #e2e8f0",borderRadius:6,background:"#f8fafc",cursor:"pointer",fontSize:13}}>📋</button>
                            <button onClick={()=>setDeleteId(emp.id)} title="Remove" style={{width:28,height:28,border:"1px solid #fecaca",borderRadius:6,background:"#fff5f5",cursor:"pointer",fontSize:13}}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderTop:"1px solid #f1f5f9",flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:"#64748b"}}>Rows:</span>
                <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} style={{padding:"4px 8px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:13}}>
                  {PAGE_SIZES.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <span style={{fontSize:13,color:"#64748b"}}>{Math.min((safePage-1)*pageSize+1,filtered.length)}–{Math.min(safePage*pageSize,filtered.length)} of {filtered.length}</span>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setPage(1)} disabled={safePage===1} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",cursor:safePage===1?"default":"pointer",opacity:safePage===1?0.4:1,fontSize:13}}>«</button>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage===1} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",cursor:safePage===1?"default":"pointer",opacity:safePage===1?0.4:1,fontSize:13}}>‹</button>
                <span style={{padding:"4px 12px",background:"#1e3a5f",color:"#fff",borderRadius:6,fontSize:13,fontWeight:700}}>{safePage}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",cursor:safePage===totalPages?"default":"pointer",opacity:safePage===totalPages?0.4:1,fontSize:13}}>›</button>
                <button onClick={()=>setPage(totalPages)} disabled={safePage===totalPages} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff",cursor:safePage===totalPages?"default":"pointer",opacity:safePage===totalPages?0.4:1,fontSize:13}}>»</button>
              </div>
            </div>
          )}
        </div>

        {/* ── ADD / EDIT MODAL ── */}
        {showForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:520,maxHeight:"92vh",overflowY:"auto"}}>
              <h2 style={{margin:"0 0 18px",fontSize:18,fontWeight:700}}>{editing?"Edit Employee":"Add Employee"}</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                {[["First Name *","first_name"],["Last Name","last_name"],["Email *","email"],["Phone","phone"]].map(([label,key])=>(
                  <div key={key}>
                    <label style={lbl}>{label}</label>
                    <input value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inp}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div>
                  <label style={lbl}>Role</label>
                  <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{...inp,background:"#fff"}}>
                    {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{...inp,background:"#fff"}}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Department</label>
                  <select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} style={{...inp,background:"#fff"}}>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Job Title</label>
                  <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inp} placeholder="e.g. Senior Dispute Specialist"/>
                </div>
              </div>
              <div style={{marginBottom:18}}>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  style={{...inp,minHeight:56,resize:"vertical"} as React.CSSProperties} placeholder="Internal notes…"/>
              </div>
              {saveError&&(
                <div role="alert" style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"10px 12px",marginBottom:14,color:"#991b1b",fontSize:13,fontWeight:600}}>
                  Employee could not be saved: {saveError}
                </div>
              )}
              {/* Role permissions preview */}
              <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:18}}>
                <p style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>Permissions for {form.role}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {Object.entries(PERM_LABELS).map(([key,label])=>{
                    const has=(PERMISSIONS[form.role]||{})[key];
                    return (
                      <div key={key} style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12,color:has?"#10b981":"#ef4444"}}>{has?"✓":"✗"}</span>
                        <span style={{fontSize:12,color:has?"#1e293b":"#94a3b8"}}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{padding:"9px 20px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer"}}>Cancel</button>
                <button onClick={save} disabled={saving} style={{padding:"9px 20px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>{saving?"Saving…":editing?"Save Changes":"Add Employee"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── PERMISSIONS MODAL ── */}
        {viewPerms&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:480}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <h2 style={{margin:0,fontSize:17,fontWeight:700}}>Permissions — {employeeName(viewPerms)}</h2>
                <button onClick={()=>setViewPerms(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#94a3b8"}}>×</button>
              </div>
              <div style={{background:(ROLE_C[viewPerms.role]||"#94a3b8")+"22",borderRadius:8,padding:"8px 14px",marginBottom:16,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>Role: {viewPerms.role}</span>
                <span style={{fontSize:12,color:"#64748b"}}>Permissions are role-based</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {Object.entries(PERM_LABELS).map(([key,label])=>{
                  const has=(PERMISSIONS[viewPerms.role]||{})[key];
                  return (
                    <div key={key} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:has?"#f0fdf4":"#fef2f2",borderRadius:7,border:`1px solid ${has?"#86efac":"#fecaca"}`}}>
                      <span style={{fontSize:16}}>{has?"✅":"❌"}</span>
                      <span style={{fontSize:13,color:"#1e293b",fontWeight:500}}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{margin:"14px 0 0",fontSize:12,color:"#94a3b8"}}>To change permissions, update the employee's role.</p>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                <button onClick={()=>{setViewPerms(null);openEdit(viewPerms);}} style={{padding:"8px 18px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:600,fontSize:13}}>✏️ Edit Role</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOG MODAL ── */}
        {viewActivity&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:460}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <h2 style={{margin:0,fontSize:17,fontWeight:700}}>Activity — {employeeName(viewActivity)}</h2>
                <button onClick={()=>setViewActivity(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#94a3b8"}}>×</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,padding:"10px 14px",background:"#f8fafc",borderRadius:8}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:avatarColor(employeeName(viewActivity)),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14}}>
                  {initials(splitEmployeeName(viewActivity).firstName,splitEmployeeName(viewActivity).lastName)}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{employeeName(viewActivity)}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>{viewActivity.role} · {viewActivity.department||"—"}</div>
                  <div style={{fontSize:12,color:"#94a3b8"}}>Last login: {relTime(viewActivity.last_login)}</div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {(activityLog[viewActivity.id]||[]).map((a:any,i:number)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9",alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{a.action}</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{relTime(a.time)}</div>
                    </div>
                  </div>
                ))}
                {(!activityLog[viewActivity.id]||activityLog[viewActivity.id].length===0)&&(
                  <p style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:16}}>No activity recorded yet.</p>
                )}
              </div>
              <p style={{margin:"12px 0 0",fontSize:11,color:"#94a3b8"}}>Full activity log requires an activity_log table in Supabase.</p>
            </div>
          </div>
        )}

        {/* ── INVITE MODAL ── */}
        {showInvite&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:420}}>
              <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:700}}>Invite Employee by Email</h2>
              <p style={{margin:"0 0 18px",fontSize:13,color:"#64748b"}}>They'll receive a link to create their account and set a password.</p>
              <div style={{marginBottom:14}}>
                <label style={lbl}>Email Address *</label>
                <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} style={inp} placeholder="colleague@company.com"/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={lbl}>Role</label>
                <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} style={{...inp,background:"#fff"}}>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {inviteSent&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:7,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#166534",fontWeight:600}}>✓ Invite sent to {inviteEmail}</div>}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setShowInvite(false)} style={{padding:"9px 20px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer"}}>Cancel</button>
                <button onClick={sendInvite} disabled={!inviteEmail||inviteSent} style={{padding:"9px 20px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>{inviteSent?"Sent!":"Send Invite"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {deleteId&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:340}}>
              <h2 style={{margin:"0 0 10px",fontSize:17,fontWeight:700}}>Remove Employee?</h2>
              <p style={{color:"#64748b",fontSize:14,margin:"0 0 20px"}}>This cannot be undone.</p>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setDeleteId(null)} style={{padding:"9px 20px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer"}}>Cancel</button>
                <button onClick={()=>del(deleteId)} style={{padding:"9px 20px",background:"#ef4444",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
