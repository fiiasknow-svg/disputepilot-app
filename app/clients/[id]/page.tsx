"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CDMLayout from "@/components/CDMLayout";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const PROVIDERS = ["SmartCredit","MyFreeScore360","IdentityIQ","mySCOREIQ","PrivacyGuard"];
const STATUSES = ["active","pending","inactive","cancelled"];
const TABS = ["Overview","Disputes","Payments","Documents","Notes","Activity"];

const STATUS_COLORS: Record<string, string> = { active:"#10b981", pending:"#f59e0b", inactive:"#94a3b8", cancelled:"#ef4444" };
const DISPUTE_COLORS: Record<string, string> = { pending:"#f59e0b", sent:"#8b5cf6", responded:"#3b82f6", resolved:"#10b981" };
const INV_COLORS: Record<string, string> = { paid:"#10b981", pending:"#f59e0b", overdue:"#ef4444", draft:"#94a3b8" };

function scoreColor(s: number) { return s>=740?"#10b981":s>=670?"#3b82f6":s>=580?"#f59e0b":"#ef4444"; }
function scoreLabel(s: number) { return s>=800?"Exceptional":s>=740?"Very Good":s>=670?"Good":s>=580?"Fair":"Poor"; }
function initials(n: string) { return n.split(" ").map(p=>p[0]).join("").toUpperCase().slice(0,2)||"?"; }
function relTime(iso: string) {
  const m = Math.floor((Date.now()-new Date(iso).getTime())/60000);
  if(m<1)return"just now"; if(m<60)return`${m}m ago`;
  const h=Math.floor(m/60); if(h<24)return`${h}h ago`;
  return`${Math.floor(h/24)}d ago`;
}

type Note = { id: number; text: string; date: string; author: string };
type Doc  = { name: string; size: string; date: string };
type Act  = { icon: string; label: string; date: string };

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab,   setTab]   = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [form, setForm] = useState({
    first_name:"", middle_name:"", last_name:"", full_name:"",
    dob_month:"", dob_day:"", dob_year:"", ssn:"",
    street_address:"", city:"", state:"", zip:"",
    mobile_phone:"", home_phone:"", work_phone:"", email:"",
    status:"active", assign_to:"", registration_date:"", end_date:"",
    portal_access:false, comments:"",
    cc_number:"", cc_cvv:"", cc_expiry:"",
    cm_username:"", cm_password:"", cm_last4:"", cm_provider:"",
    eq_score:0, ex_score:0, tu_score:0,
  });

  const [disputes, setDisputes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [docs,  setDocs]  = useState<Doc[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [activity, setActivity] = useState<Act[]>([]);

  const [showEmail, setShowEmail]     = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody,    setEmailBody]    = useState("");

  useEffect(() => {
    async function load() {
      const [cr, dr, ir] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("disputes").select("id,account_name,bureau,status,round,created_at").eq("client_id", id).order("created_at",{ascending:false}),
        supabase.from("invoices").select("id,invoice_number,amount,status,created_at,due_date").eq("client_id", id).order("created_at",{ascending:false}),
      ]);
      if (cr.data) {
        const d = cr.data;
        const parts = (d.full_name||"").split(" ");
        setForm(f => ({...f, ...d, first_name:d.first_name||parts[0]||"", middle_name:d.middle_name||"", last_name:d.last_name||parts.slice(1).join(" ")||""}));
        setActivity([
          {icon:"👤",label:"Client profile created",date:d.created_at||new Date().toISOString()},
          ...(d.portal_access?[{icon:"🔑",label:"Portal access enabled",date:d.updated_at||d.created_at||new Date().toISOString()}]:[]),
        ]);
      }
      setDisputes(dr.data||[]);
      setInvoices(ir.data||[]);
      setLoading(false);
    }
    load();
  }, [id]);

  function set(k: string, v: unknown) { setForm(f=>({...f,[k]:v})); }

  async function save() {
    setSaving(true);
    const full=[form.first_name,form.middle_name,form.last_name].filter(Boolean).join(" ");
    await supabase.from("clients").update({...form,full_name:full}).eq("id",id);
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),3000);
    setActivity(a=>[{icon:"✏️",label:"Profile updated",date:new Date().toISOString()},...a]);
  }

  function addNote() {
    if(!noteText.trim())return;
    setNotes(n=>[{id:Date.now(),text:noteText.trim(),date:new Date().toISOString(),author:"You"},...n]);
    setActivity(a=>[{icon:"📝",label:"Note added",date:new Date().toISOString()},...a]);
    setNoteText("");
  }

  function handleDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const f=e.target.files?.[0]; if(!f)return;
    setDocs(d=>[{name:f.name,size:(f.size/1024).toFixed(0)+" KB",date:new Date().toLocaleString()},...d]);
    setActivity(a=>[{icon:"📄",label:`Document uploaded: ${f.name}`,date:new Date().toISOString()},...a]);
    if(fileRef.current)fileRef.current.value="";
  }

  const displayName=[form.first_name,form.last_name].filter(Boolean).join(" ")||form.full_name||"Client";
  const sc=STATUS_COLORS[form.status]||"#94a3b8";

  const inp: React.CSSProperties={width:"100%",padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:14,boxSizing:"border-box"};
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:20};
  const TH: React.CSSProperties={textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",background:"#f8fafc",whiteSpace:"nowrap"};
  const TD: React.CSSProperties={padding:"10px 14px",fontSize:13,color:"#374151",borderTop:"1px solid #f1f5f9"};
  const SH=(t:string)=>(
    <h3 style={{fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 16px",paddingBottom:10,borderBottom:"1px solid #f1f5f9"}}>{t}</h3>
  );
  const LBL=(t:string)=>(
    <label style={{display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.03em"}}>{t}</label>
  );

  if(loading)return<CDMLayout><div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading…</div></CDMLayout>;

  const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1100}}>

        {/* ── Header ── */}
        <div style={{...card,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:800,flexShrink:0}}>
              {initials(displayName)}
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <h1 style={{fontSize:20,fontWeight:800,margin:0,color:"#1e293b"}}>{displayName}</h1>
                <span style={{background:sc+"22",color:sc,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700,textTransform:"capitalize"}}>{form.status}</span>
              </div>
              <div style={{fontSize:13,color:"#64748b",marginTop:4,display:"flex",gap:16,flexWrap:"wrap"}}>
                {form.email&&<span>✉ {form.email}</span>}
                {form.mobile_phone&&<span>📱 {form.mobile_phone}</span>}
                {form.registration_date&&<span>📅 Since {form.registration_date}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600,cursor:"pointer",padding:"8px 14px",border:"1px solid #e2e8f0",borderRadius:7,background:form.portal_access?"#eff6ff":"#f8fafc",color:form.portal_access?"#3b82f6":"#64748b"}}>
                <input type="checkbox" checked={!!form.portal_access} onChange={e=>set("portal_access",e.target.checked)} style={{accentColor:"#3b82f6"}} />
                Portal Access
              </label>
              <button onClick={()=>setShowEmail(true)} style={{padding:"8px 16px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer",color:"#374151"}}>✉ Send Email</button>
              <button onClick={()=>router.push("/clients")} style={{padding:"8px 16px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>← Back</button>
              <button onClick={save} disabled={saving} style={{padding:"8px 20px",background:saved?"#10b981":"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                {saving?"Saving…":saved?"✓ Saved":"Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick stats row ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
          {[
            {label:"Open Disputes",value:disputes.filter(d=>d.status!=="resolved").length,color:"#8b5cf6"},
            {label:"Total Invoices",value:invoices.length,color:"#3b82f6"},
            {label:"Total Paid",value:"$"+totalPaid.toFixed(2),color:"#10b981"},
            {label:"Documents",value:docs.length,color:"#f59e0b"},
          ].map(s=>(
            <div key={s.label} style={{...card,borderTop:`3px solid ${s.color}`,padding:"14px 16px"}}>
              <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{display:"flex",borderBottom:"2px solid #f1f5f9",marginBottom:20,overflowX:"auto"}}>
          {TABS.map(t=>{
            const badge=t==="Disputes"?disputes.length:t==="Payments"?invoices.length:t==="Notes"?notes.length:0;
            return(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 20px",background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:tab===t?700:500,color:tab===t?"#1e3a5f":"#64748b",borderBottom:tab===t?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>
                {t}{badge>0&&<span style={{marginLeft:6,background:"#f1f5f9",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700,color:"#64748b"}}>{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* ═══════════════ OVERVIEW ═══════════════ */}
        {tab==="Overview"&&(<>

          {/* Credit scores */}
          {(form.eq_score||form.ex_score||form.tu_score)?(<>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
              {([["Equifax",form.eq_score,"#ef4444"],["Experian",form.ex_score,"#3b82f6"],["TransUnion",form.tu_score,"#10b981"]] as [string,number,string][]).map(([b,s,bc])=>(
                <div key={b} style={{...card,borderTop:`4px solid ${bc}`,padding:"14px 16px"}}>
                  <div style={{fontSize:11,fontWeight:800,color:bc,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{b}</div>
                  {s?<><div style={{fontSize:32,fontWeight:900,color:scoreColor(s),lineHeight:1}}>{s}</div><div style={{fontSize:12,color:scoreColor(s),fontWeight:600}}>{scoreLabel(s)}</div></>:<div style={{fontSize:22,fontWeight:700,color:"#94a3b8"}}>—</div>}
                </div>
              ))}
            </div>
          </>):null}

          {/* Personal Info */}
          <div style={{...card,marginBottom:16}}>
            {SH("Personal Information")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
              <div>{LBL("First Name")}<input value={form.first_name} onChange={e=>set("first_name",e.target.value)} style={inp}/></div>
              <div>{LBL("Middle Name")}<input value={form.middle_name} onChange={e=>set("middle_name",e.target.value)} style={inp}/></div>
              <div>{LBL("Last Name")}<input value={form.last_name} onChange={e=>set("last_name",e.target.value)} style={inp}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
              <div>
                {LBL("Date of Birth")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px",gap:6}}>
                  <select value={form.dob_month} onChange={e=>set("dob_month",e.target.value)} style={{...inp,background:"#fff"}}><option value="">Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}</select>
                  <select value={form.dob_day} onChange={e=>set("dob_day",e.target.value)} style={{...inp,background:"#fff"}}><option value="">Day</option>{DAYS.map(d=><option key={d}>{d}</option>)}</select>
                  <select value={form.dob_year} onChange={e=>set("dob_year",e.target.value)} style={{...inp,background:"#fff"}}><option value="">Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select>
                </div>
              </div>
              <div>{LBL("SSN")}<input value={form.ssn} onChange={e=>set("ssn",e.target.value)} style={inp}/></div>
              <div>{LBL("Street Address")}<input value={form.street_address} onChange={e=>set("street_address",e.target.value)} style={inp}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              <div>{LBL("City")}<input value={form.city} onChange={e=>set("city",e.target.value)} style={inp}/></div>
              <div>{LBL("State")}<select value={form.state} onChange={e=>set("state",e.target.value)} style={{...inp,background:"#fff"}}><option value="">--</option>{STATES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div>{LBL("Zip")}<input value={form.zip} onChange={e=>set("zip",e.target.value)} style={inp}/></div>
            </div>
          </div>

          {/* Contact */}
          <div style={{...card,marginBottom:16}}>
            {SH("Contact")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
              <div>{LBL("Mobile Phone")}<input type="tel" value={form.mobile_phone} onChange={e=>set("mobile_phone",e.target.value)} style={inp}/></div>
              <div>{LBL("Home Phone")}<input type="tel" value={form.home_phone} onChange={e=>set("home_phone",e.target.value)} style={inp}/></div>
              <div>{LBL("Work Phone")}<input type="tel" value={form.work_phone} onChange={e=>set("work_phone",e.target.value)} style={inp}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              <div>{LBL("Email")}<input type="email" value={form.email} onChange={e=>set("email",e.target.value)} style={inp}/></div>
              <div>{LBL("Status")}<select value={form.status} onChange={e=>set("status",e.target.value)} style={{...inp,background:"#fff"}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div>{LBL("Assign To")}<input value={form.assign_to} onChange={e=>set("assign_to",e.target.value)} style={inp}/></div>
            </div>
          </div>

          {/* Account Settings */}
          <div style={{...card,marginBottom:16}}>
            {SH("Account Settings")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
              <div>{LBL("Registration Date")}<input type="date" value={form.registration_date} onChange={e=>set("registration_date",e.target.value)} style={inp}/></div>
              <div>{LBL("End Date")}<input type="date" value={form.end_date} onChange={e=>set("end_date",e.target.value)} style={inp}/></div>
              <div>
                {LBL("Client Portal Access")}
                <label style={{display:"flex",alignItems:"center",gap:10,marginTop:4,cursor:"pointer"}}>
                  <input type="checkbox" checked={!!form.portal_access} onChange={e=>set("portal_access",e.target.checked)} style={{width:16,height:16,accentColor:"#1e3a5f"}}/>
                  <span style={{fontSize:14}}>Enabled</span>
                </label>
              </div>
            </div>
            <div>{LBL("Comments")}<textarea value={form.comments||""} onChange={e=>set("comments",e.target.value)} style={{...inp,minHeight:80,resize:"vertical"}}/></div>
          </div>

          {/* Credit Scores (editable) */}
          <div style={{...card,marginBottom:16}}>
            {SH("Credit Scores")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              {([["eq_score","Equifax"],["ex_score","Experian"],["tu_score","TransUnion"]] as [string,string][]).map(([k,l])=>(
                <div key={k}>{LBL(l)}<input type="number" value={(form as Record<string,unknown>)[k]as number||""} onChange={e=>set(k,Number(e.target.value))} style={inp} placeholder="300–850" min={300} max={850}/></div>
              ))}
            </div>
          </div>

          {/* Credit Card */}
          <div style={{...card,marginBottom:16}}>
            {SH("Credit Card on File")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              <div>{LBL("Card Number")}<input value={form.cc_number} onChange={e=>set("cc_number",e.target.value)} style={inp}/></div>
              <div>{LBL("CVV")}<input value={form.cc_cvv} onChange={e=>set("cc_cvv",e.target.value)} style={inp}/></div>
              <div>{LBL("Expiration (MM/YY)")}<input value={form.cc_expiry} onChange={e=>set("cc_expiry",e.target.value)} style={inp}/></div>
            </div>
          </div>

          {/* Credit Monitoring */}
          <div style={{...card,marginBottom:16}}>
            {SH("Credit Monitoring Login")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16}}>
              <div>{LBL("Provider")}<select value={form.cm_provider} onChange={e=>set("cm_provider",e.target.value)} style={{...inp,background:"#fff"}}><option value="">--</option>{PROVIDERS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div>{LBL("Username")}<input value={form.cm_username} onChange={e=>set("cm_username",e.target.value)} style={inp}/></div>
              <div>{LBL("Password")}<input value={form.cm_password} onChange={e=>set("cm_password",e.target.value)} style={inp}/></div>
              <div>{LBL("Last 4 SSN")}<input value={form.cm_last4} onChange={e=>set("cm_last4",e.target.value)} style={inp}/></div>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:32}}>
            <button onClick={()=>router.push("/clients")} style={{padding:"10px 24px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer",fontSize:14,fontWeight:600}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"10px 28px",background:saved?"#10b981":"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:14}}>
              {saving?"Saving…":saved?"✓ Saved":"Save Changes"}
            </button>
          </div>
        </>)}

        {/* ═══════════════ DISPUTES ═══════════════ */}
        {tab==="Disputes"&&(
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Disputes ({disputes.length})</h3>
              <button onClick={()=>router.push("/disputes")} style={{padding:"7px 14px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>+ New Dispute</button>
            </div>
            {disputes.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:14}}>No disputes found for this client.</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Account","Bureau","Status","Round","Filed",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {disputes.map(d=>{
                    const dc=DISPUTE_COLORS[d.status]||"#94a3b8";
                    return(
                      <tr key={d.id}>
                        <td style={{...TD,fontWeight:600,color:"#1e293b"}}>{d.account_name}</td>
                        <td style={TD}><span style={{textTransform:"capitalize"}}>{d.bureau}</span></td>
                        <td style={TD}><span style={{background:dc+"22",color:dc,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700,textTransform:"capitalize"}}>{d.status}</span></td>
                        <td style={TD}>Round {d.round||1}</td>
                        <td style={TD}>{new Date(d.created_at).toLocaleDateString()}</td>
                        <td style={TD}><button onClick={()=>router.push(`/disputes/${d.id}`)} style={{padding:"4px 10px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:5,fontSize:12,fontWeight:600,cursor:"pointer"}}>View</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══════════════ PAYMENTS ═══════════════ */}
        {tab==="Payments"&&(
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Payment History ({invoices.length})</h3>
              <button onClick={()=>router.push("/billing")} style={{padding:"7px 14px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer",color:"#374151"}}>View All Billing</button>
            </div>
            {invoices.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:14}}>No payment records found.</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Invoice #","Amount","Status","Date","Due Date"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {invoices.map((inv,i)=>{
                    const ic=INV_COLORS[inv.status]||"#94a3b8";
                    return(
                      <tr key={inv.id||i}>
                        <td style={{...TD,fontWeight:600}}>{inv.invoice_number||`INV-${String(i+1).padStart(3,"0")}`}</td>
                        <td style={TD}>${Number(inv.amount||0).toFixed(2)}</td>
                        <td style={TD}><span style={{background:ic+"22",color:ic,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700,textTransform:"capitalize"}}>{inv.status}</span></td>
                        <td style={TD}>{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td style={TD}>{inv.due_date?new Date(inv.due_date).toLocaleDateString():"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {invoices.length>0&&(
              <div style={{marginTop:16,padding:"12px 16px",background:"#f8fafc",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Total Paid</span>
                <span style={{fontSize:16,fontWeight:900,color:"#10b981"}}>${totalPaid.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ DOCUMENTS ═══════════════ */}
        {tab==="Documents"&&(
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Documents ({docs.length})</h3>
              <label style={{padding:"7px 14px",background:"#1e3a5f",color:"#fff",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                + Upload Document
                <input ref={fileRef} type="file" onChange={handleDoc} style={{display:"none"}}/>
              </label>
            </div>
            {docs.length===0?(
              <div style={{border:"2px dashed #e2e8f0",borderRadius:10,padding:"48px 24px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:10}}>📁</div>
                <div style={{fontSize:14,color:"#64748b",marginBottom:4}}>No documents uploaded yet</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>Upload credit reports, ID documents, dispute letters, and more.</div>
              </div>
            ):docs.map((doc,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderTop:i>0?"1px solid #f1f5f9":"none"}}>
                <div style={{fontSize:26}}>{doc.name.endsWith(".pdf")?"📄":doc.name.match(/\.(jpg|jpeg|png|gif)$/i)?"🖼":"📎"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{doc.name}</div>
                  <div style={{fontSize:12,color:"#94a3b8"}}>{doc.size} · Uploaded {doc.date}</div>
                </div>
                <button style={{padding:"5px 12px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,cursor:"pointer",color:"#374151",fontWeight:600}}>Download</button>
                <button onClick={()=>setDocs(d=>d.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ NOTES ═══════════════ */}
        {tab==="Notes"&&(
          <div>
            <div style={{...card,marginBottom:14}}>
              <h3 style={{margin:"0 0 10px",fontSize:15,fontWeight:700}}>Add Note</h3>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Write a note about this client…" style={{...inp,minHeight:90,resize:"vertical",marginBottom:10}}/>
              <button onClick={addNote} disabled={!noteText.trim()} style={{padding:"8px 20px",background:noteText.trim()?"#1e3a5f":"#94a3b8",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:14,cursor:noteText.trim()?"pointer":"not-allowed"}}>
                Add Note
              </button>
            </div>
            {notes.length===0?(
              <div style={{...card,textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:14}}>No notes yet.</div>
            ):notes.map(note=>(
              <div key={note.id} style={{...card,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{note.author}</span>
                  <span style={{fontSize:12,color:"#94a3b8"}}>{relTime(note.date)} · {new Date(note.date).toLocaleString()}</span>
                </div>
                <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6}}>{note.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ ACTIVITY ═══════════════ */}
        {tab==="Activity"&&(
          <div style={card}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Activity Log</h3>
            {activity.length===0?(
              <div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8",fontSize:14}}>No activity recorded yet.</div>
            ):(
              <div style={{position:"relative",paddingLeft:28}}>
                <div style={{position:"absolute",left:11,top:0,bottom:0,width:2,background:"#e2e8f0"}}/>
                {activity.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:12,marginBottom:18,position:"relative"}}>
                    <div style={{position:"absolute",left:-22,top:0,width:22,height:22,borderRadius:"50%",background:"#fff",border:"2px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{item.icon}</div>
                    <div>
                      <p style={{margin:0,fontSize:14,fontWeight:500,color:"#1e293b"}}>{item.label}</p>
                      <p style={{margin:"2px 0 0",fontSize:12,color:"#94a3b8"}}>{relTime(item.date)} · {new Date(item.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Email Modal ── */}
      {showEmail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:520,width:"90%",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
            <h3 style={{margin:"0 0 16px",fontSize:17,fontWeight:800}}>Send Email to {displayName}</h3>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>To</label>
              <input value={form.email} readOnly style={{...inp,background:"#f8fafc",color:"#64748b"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Subject</label>
              <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder="Email subject…" style={inp}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Message</label>
              <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={5} style={{...inp,resize:"vertical"}} placeholder="Write your message…"/>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowEmail(false)} style={{padding:"9px 20px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setShowEmail(false);setActivity(a=>[{icon:"✉",label:`Email sent: "${emailSubject||"(no subject)"}"`,date:new Date().toISOString()},...a]);setEmailSubject("");setEmailBody("");}}
                style={{padding:"9px 20px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,cursor:"pointer"}}>
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
