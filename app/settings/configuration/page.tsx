"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import CDMLayout from "@/components/CDMLayout";

// ── constants ─────────────────────────────────────────────────────────────────
const DEFAULT_CLIENT_STATUSES = [
  {name:"Active",color:"#10b981"},{name:"Pending",color:"#f59e0b"},{name:"Inactive",color:"#94a3b8"},{name:"Cancelled",color:"#ef4444"},
];
const DEFAULT_DISPUTE_STATUSES = [
  {name:"Pending",color:"#f59e0b"},{name:"Sent",color:"#8b5cf6"},{name:"Responded",color:"#3b82f6"},{name:"Resolved",color:"#10b981"},{name:"Deleted",color:"#ef4444"},
];
const COLOR_OPTIONS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#94a3b8","#1e3a5f","#ec4899","#14b8a6","#f97316","#dc2626","#7c3aed"];
const TABS = ["General","Client Statuses","Dispute Statuses","Round Settings","Notifications","Portal","Service Plans","Tags","Integrations"];
const TIMEZONES = ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Phoenix","America/Anchorage","Pacific/Honolulu"];

type Status = {id?:string;name:string;color:string;type?:string};
type Plan = {id:number;name:string;price:number;interval:"monthly"|"quarterly"|"annual";features:string;active:boolean};
type Tag = {id:number;name:string;color:string};

// ── helpers ───────────────────────────────────────────────────────────────────
const inp: React.CSSProperties={width:"100%",padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:14,boxSizing:"border-box",background:"#fff"};
const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",marginBottom:16,overflow:"hidden"};
const SH=(t:string,action?:React.ReactNode)=>(
  <div style={{padding:"12px 18px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</h3>
    {action}
  </div>
);

export default function Page() {
  const [tab, setTab] = useState("General");

  // ── statuses ──────────────────────────────────────────────────────────────
  const [statuses,    setStatuses]    = useState<Status[]>([]);
  const [loadingSt,   setLoadingSt]   = useState(true);
  const [showSF,      setShowSF]      = useState<"client"|"dispute"|null>(null);
  const [sfForm,      setSfForm]      = useState({name:"",color:"#3b82f6",type:"client"});
  const [savingSt,    setSavingSt]    = useState(false);

  // ── general settings ──────────────────────────────────────────────────────
  const [gen, setGen] = useState({
    company_name:"", company_email:"", company_phone:"", company_address:"",
    timezone:"America/New_York", date_format:"MM/DD/YYYY", currency:"USD",
    primary_color:"#1e3a5f",
  });
  const [savingGen, setSavingGen] = useState(false);
  const [savedGen,  setSavedGen]  = useState(false);

  // ── round settings ────────────────────────────────────────────────────────
  const [rounds, setRounds] = useState({
    default_rounds:"3", days_between_rounds:"35", auto_advance:false,
    track_responses:true, response_deadline:"30", escalation_reminder:"5",
  });
  const [savingR, setSavingR] = useState(false);
  const [savedR,  setSavedR]  = useState(false);

  // ── notifications ─────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    new_client:true, new_dispute:true, dispute_resolved:true, invoice_paid:true,
    invoice_overdue:true, bureau_response:true, portal_login:false, weekly_summary:true,
    email_from:"", email_reply_to:"",
  });
  const [savingN, setSavingN] = useState(false);
  const [savedN,  setSavedN]  = useState(false);

  // ── portal settings ───────────────────────────────────────────────────────
  const [portal, setPortal] = useState({
    portal_url:"", portal_enabled:true, allow_doc_upload:true, allow_messaging:true,
    show_credit_scores:true, show_dispute_status:true, show_invoices:true,
    welcome_message:"Welcome to your credit repair portal. Track your progress here.",
  });
  const [savingP, setSavingP] = useState(false);
  const [savedP,  setSavedP]  = useState(false);

  // ── service plans ─────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>([
    {id:1,name:"Basic",price:99,interval:"monthly",features:"3 bureaus, up to 5 disputes/month",active:true},
    {id:2,name:"Standard",price:149,interval:"monthly",features:"3 bureaus, unlimited disputes",active:true},
    {id:3,name:"Premium",price:199,interval:"monthly",features:"3 bureaus, unlimited disputes, priority support",active:true},
    {id:4,name:"Credit Builder",price:49,interval:"monthly",features:"Score monitoring + basic disputes",active:false},
  ]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState<Omit<Plan,"id">>({name:"",price:0,interval:"monthly",features:"",active:true});

  // ── tags ──────────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<Tag[]>([
    {id:1,name:"VIP",color:"#f59e0b"},{id:2,name:"At Risk",color:"#ef4444"},
    {id:3,name:"New Lead",color:"#3b82f6"},{id:4,name:"Referral",color:"#10b981"},
  ]);
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");

  useEffect(()=>{
    supabase.from("statuses").select("*").order("name")
      .then(({data})=>{setStatuses(data||[]); setLoadingSt(false);});
  },[]);

  async function addStatus(){
    if(!sfForm.name)return;
    setSavingSt(true);
    const {data}=await supabase.from("statuses").insert([sfForm]).select().single();
    if(data)setStatuses(s=>[...s,data]);
    setSavingSt(false); setShowSF(null); setSfForm({name:"",color:"#3b82f6",type:"client"});
  }
  async function delStatus(id:string){
    await supabase.from("statuses").delete().eq("id",id);
    setStatuses(s=>s.filter(x=>x.id!==id));
  }

  function saveGen(){setSavingGen(true);setTimeout(()=>{setSavingGen(false);setSavedGen(true);setTimeout(()=>setSavedGen(false),3000);},500);}
  function saveRound(){setSavingR(true);setTimeout(()=>{setSavingR(false);setSavedR(true);setTimeout(()=>setSavedR(false),3000);},500);}
  function saveNotifs(){setSavingN(true);setTimeout(()=>{setSavingN(false);setSavedN(true);setTimeout(()=>setSavedN(false),3000);},500);}
  function savePortal(){setSavingP(true);setTimeout(()=>{setSavingP(false);setSavedP(true);setTimeout(()=>setSavedP(false),3000);},500);}

  function addPlan(){
    if(!planForm.name)return;
    setPlans(p=>[...p,{...planForm,id:Date.now()}]);
    setPlanForm({name:"",price:0,interval:"monthly",features:"",active:true});
    setShowPlanForm(false);
  }
  function addTag(){
    if(!tagInput.trim())return;
    setTags(t=>[...t,{id:Date.now(),name:tagInput.trim(),color:tagColor}]);
    setTagInput("");
  }

  const SAVE_BTN=(label:string,saving:boolean,saved:boolean,onClick:()=>void)=>(
    <button onClick={onClick} disabled={saving} style={{padding:"9px 22px",background:saved?"#10b981":"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer"}}>
      {saving?"Saving…":saved?"✓ Saved":label}
    </button>
  );
  const TOGGLE=(key:string,val:boolean,onChange:(v:boolean)=>void,label:string,desc?:string)=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:"1px solid #f1f5f9"}}>
      <div>
        <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{label}</div>
        {desc&&<div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{desc}</div>}
      </div>
      <label style={{position:"relative",display:"inline-block",width:44,height:24,cursor:"pointer",flexShrink:0}}>
        <input type="checkbox" checked={val} onChange={e=>onChange(e.target.checked)} style={{opacity:0,width:0,height:0}}/>
        <span style={{position:"absolute",inset:0,borderRadius:24,background:val?"#1e3a5f":"#cbd5e1",transition:"background 0.2s"}}/>
        <span style={{position:"absolute",left:val?22:2,top:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
      </label>
    </div>
  );

  const tabStyle=(t:string):React.CSSProperties=>({
    padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:13,
    fontWeight:tab===t?700:500,color:tab===t?"#1e3a5f":"#64748b",
    borderBottom:tab===t?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2,whiteSpace:"nowrap",
  });

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:900}}>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 4px",color:"#1e293b"}}>Configuration</h1>
        <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>Manage system settings, statuses, plans, and integrations.</p>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"2px solid #f1f5f9",marginBottom:24,overflowX:"auto"}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={tabStyle(t)}>{t}</button>)}
        </div>

        {/* ═══ GENERAL ═══ */}
        {tab==="General"&&(<>
          <div style={card}>
            {SH("Company Information")}
            <div style={{padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Company Name</label><input value={gen.company_name} onChange={e=>setGen(g=>({...g,company_name:e.target.value}))} style={inp} placeholder="Your Company Name"/></div>
                <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Company Email</label><input type="email" value={gen.company_email} onChange={e=>setGen(g=>({...g,company_email:e.target.value}))} style={inp} placeholder="info@yourcompany.com"/></div>
                <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Phone Number</label><input type="tel" value={gen.company_phone} onChange={e=>setGen(g=>({...g,company_phone:e.target.value}))} style={inp} placeholder="(555) 000-0000"/></div>
                <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Business Address</label><input value={gen.company_address} onChange={e=>setGen(g=>({...g,company_address:e.target.value}))} style={inp} placeholder="123 Main St, City, State 00000"/></div>
              </div>
            </div>
          </div>
          <div style={card}>
            {SH("Regional & Display")}
            <div style={{padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Timezone</label>
                  <select value={gen.timezone} onChange={e=>setGen(g=>({...g,timezone:e.target.value}))} style={inp}>
                    {TIMEZONES.map(tz=><option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Date Format</label>
                  <select value={gen.date_format} onChange={e=>setGen(g=>({...g,date_format:e.target.value}))} style={inp}>
                    {["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Currency</label>
                  <select value={gen.currency} onChange={e=>setGen(g=>({...g,currency:e.target.value}))} style={inp}>
                    {["USD","CAD","GBP","EUR"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Primary Brand Color</label>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input type="color" value={gen.primary_color} onChange={e=>setGen(g=>({...g,primary_color:e.target.value}))} style={{width:40,height:36,border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer",padding:2}}/>
                  <span style={{fontSize:14,color:"#374151"}}>{gen.primary_color}</span>
                  <div style={{width:32,height:32,borderRadius:6,background:gen.primary_color,border:"1px solid #e2e8f0"}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>{SAVE_BTN("Save General Settings",savingGen,savedGen,saveGen)}</div>
        </>)}

        {/* ═══ CLIENT STATUSES ═══ */}
        {tab==="Client Statuses"&&(<>
          <div style={card}>
            {SH("Default Client Statuses")}
            {DEFAULT_CLIENT_STATUSES.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderTop:i>0?"1px solid #f8fafc":"none"}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:600}}>{s.name}</span>
                <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s.name}</span>
                <span style={{fontSize:11,color:"#94a3b8",background:"#f8fafc",borderRadius:5,padding:"2px 8px"}}>Built-in</span>
              </div>
            ))}
          </div>
          <div style={card}>
            {SH("Custom Client Statuses",<button onClick={()=>{setShowSF("client");setSfForm(f=>({...f,type:"client"}));}} style={{fontSize:12,background:"#1e3a5f",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontWeight:700}}>+ Add Status</button>)}
            {loadingSt?<p style={{padding:18,color:"#94a3b8",fontSize:14}}>Loading…</p>
              :statuses.filter(s=>s.type==="client").length===0?<p style={{padding:18,color:"#94a3b8",fontSize:14}}>No custom client statuses yet.</p>
              :statuses.filter(s=>s.type==="client").map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderTop:"1px solid #f8fafc"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:600}}>{s.name}</span>
                  <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s.name}</span>
                  <button onClick={()=>s.id&&delStatus(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:18,lineHeight:1}}>×</button>
                </div>
              ))}
          </div>
        </>)}

        {/* ═══ DISPUTE STATUSES ═══ */}
        {tab==="Dispute Statuses"&&(<>
          <div style={card}>
            {SH("Default Dispute Statuses")}
            {DEFAULT_DISPUTE_STATUSES.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderTop:i>0?"1px solid #f8fafc":"none"}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:600}}>{s.name}</span>
                <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s.name}</span>
                <span style={{fontSize:11,color:"#94a3b8",background:"#f8fafc",borderRadius:5,padding:"2px 8px"}}>Built-in</span>
              </div>
            ))}
          </div>
          <div style={card}>
            {SH("Custom Dispute Statuses",<button onClick={()=>{setShowSF("dispute");setSfForm(f=>({...f,type:"dispute"}));}} style={{fontSize:12,background:"#1e3a5f",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontWeight:700}}>+ Add Status</button>)}
            {loadingSt?<p style={{padding:18,color:"#94a3b8",fontSize:14}}>Loading…</p>
              :statuses.filter(s=>s.type==="dispute").length===0?<p style={{padding:18,color:"#94a3b8",fontSize:14}}>No custom dispute statuses yet.</p>
              :statuses.filter(s=>s.type==="dispute").map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderTop:"1px solid #f8fafc"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:600}}>{s.name}</span>
                  <span style={{background:s.color+"22",color:s.color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{s.name}</span>
                  <button onClick={()=>s.id&&delStatus(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:18,lineHeight:1}}>×</button>
                </div>
              ))}
          </div>
        </>)}

        {/* ═══ ROUND SETTINGS ═══ */}
        {tab==="Round Settings"&&(<>
          <div style={card}>
            {SH("Default Round Configuration")}
            <div style={{padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
                {([
                  ["default_rounds","Default Number of Rounds","Number of dispute rounds to run before recommending other action."],
                  ["days_between_rounds","Days Between Rounds","Days to wait after sending a letter before advancing to next round."],
                  ["response_deadline","Response Deadline (Days)","Days the bureau has to respond (FCRA mandates 30–45)."],
                  ["escalation_reminder","Escalation Reminder (Days)","Days before deadline to send reminder notification."],
                ] as [string,string,string][]).map(([k,l,d])=>(
                  <div key={k} style={{gridColumn:k==="response_deadline"||k==="escalation_reminder"?"auto":"auto"}}>
                    <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>{l}</label>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{d}</div>
                    <input type="number" value={(rounds as Record<string,unknown>)[k] as string} onChange={e=>setRounds(r=>({...r,[k]:e.target.value}))} style={{...inp,width:"100%"}} min={1} max={365}/>
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid #f1f5f9",paddingTop:16}}>
                {TOGGLE("auto_advance",rounds.auto_advance,v=>setRounds(r=>({...r,auto_advance:v})),"Auto-Advance Rounds","Automatically advance to the next round when the response deadline passes with no response.")}
                {TOGGLE("track_responses",rounds.track_responses,v=>setRounds(r=>({...r,track_responses:v})),"Track Bureau Responses","Record and track all bureau responses per round.")}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>{SAVE_BTN("Save Round Settings",savingR,savedR,saveRound)}</div>
        </>)}

        {/* ═══ NOTIFICATIONS ═══ */}
        {tab==="Notifications"&&(<>
          <div style={card}>
            {SH("Email Notification Sender")}
            <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>From Address</label><input type="email" value={notifs.email_from} onChange={e=>setNotifs(n=>({...n,email_from:e.target.value}))} style={inp} placeholder="noreply@yourcompany.com"/></div>
              <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Reply-To Address</label><input type="email" value={notifs.email_reply_to} onChange={e=>setNotifs(n=>({...n,email_reply_to:e.target.value}))} style={inp} placeholder="support@yourcompany.com"/></div>
            </div>
          </div>
          <div style={card}>
            {SH("Email Notification Triggers")}
            <div style={{padding:"0 20px 8px"}}>
              {TOGGLE("new_client",notifs.new_client,v=>setNotifs(n=>({...n,new_client:v})),"New Client Added","Send notification when a new client is created.")}
              {TOGGLE("new_dispute",notifs.new_dispute,v=>setNotifs(n=>({...n,new_dispute:v})),"New Dispute Filed","Send notification when a new dispute is created.")}
              {TOGGLE("dispute_resolved",notifs.dispute_resolved,v=>setNotifs(n=>({...n,dispute_resolved:v})),"Dispute Resolved","Send notification when a dispute is marked resolved.")}
              {TOGGLE("bureau_response",notifs.bureau_response,v=>setNotifs(n=>({...n,bureau_response:v})),"Bureau Response Received","Send notification when a bureau response is logged.")}
              {TOGGLE("invoice_paid",notifs.invoice_paid,v=>setNotifs(n=>({...n,invoice_paid:v})),"Invoice Paid","Send notification when a client payment is received.")}
              {TOGGLE("invoice_overdue",notifs.invoice_overdue,v=>setNotifs(n=>({...n,invoice_overdue:v})),"Invoice Overdue","Send notification when an invoice passes its due date.")}
              {TOGGLE("portal_login",notifs.portal_login,v=>setNotifs(n=>({...n,portal_login:v})),"Client Portal Login","Send notification when a client logs into the portal.")}
              {TOGGLE("weekly_summary",notifs.weekly_summary,v=>setNotifs(n=>({...n,weekly_summary:v})),"Weekly Summary Report","Send a weekly summary of activity every Monday.")}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>{SAVE_BTN("Save Notification Settings",savingN,savedN,saveNotifs)}</div>
        </>)}

        {/* ═══ PORTAL ═══ */}
        {tab==="Portal"&&(<>
          <div style={card}>
            {SH("Client Portal Configuration")}
            <div style={{padding:20}}>
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Portal URL / Subdomain</label>
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  <span style={{padding:"9px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"7px 0 0 7px",fontSize:14,color:"#64748b",whiteSpace:"nowrap"}}>portal.</span>
                  <input value={portal.portal_url} onChange={e=>setPortal(p=>({...p,portal_url:e.target.value}))} style={{...inp,borderRadius:"0 7px 7px 0",borderLeft:"none"}} placeholder="yourcompany.com"/>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Welcome Message</label>
                <textarea value={portal.welcome_message} onChange={e=>setPortal(p=>({...p,welcome_message:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}}/>
              </div>
              <div style={{borderTop:"1px solid #f1f5f9"}}>
                {TOGGLE("portal_enabled",portal.portal_enabled,v=>setPortal(p=>({...p,portal_enabled:v})),"Portal Enabled","Allow clients to log in to the client portal.")}
                {TOGGLE("allow_doc_upload",portal.allow_doc_upload,v=>setPortal(p=>({...p,allow_doc_upload:v})),"Allow Document Uploads","Let clients upload documents through the portal.")}
                {TOGGLE("allow_messaging",portal.allow_messaging,v=>setPortal(p=>({...p,allow_messaging:v})),"Allow Client Messaging","Let clients send messages through the portal.")}
                {TOGGLE("show_credit_scores",portal.show_credit_scores,v=>setPortal(p=>({...p,show_credit_scores:v})),"Show Credit Scores","Display bureau credit scores to clients in the portal.")}
                {TOGGLE("show_dispute_status",portal.show_dispute_status,v=>setPortal(p=>({...p,show_dispute_status:v})),"Show Dispute Status","Display dispute status and round information to clients.")}
                {TOGGLE("show_invoices",portal.show_invoices,v=>setPortal(p=>({...p,show_invoices:v})),"Show Invoices","Allow clients to view and download their invoices.")}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>{SAVE_BTN("Save Portal Settings",savingP,savedP,savePortal)}</div>
        </>)}

        {/* ═══ SERVICE PLANS ═══ */}
        {tab==="Service Plans"&&(<>
          <div style={card}>
            {SH("Service Plans",<button onClick={()=>setShowPlanForm(true)} style={{fontSize:12,background:"#1e3a5f",color:"#fff",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontWeight:700}}>+ Add Plan</button>)}
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Plan Name","Price","Interval","Features","Status",""].map(h=><th key={h} style={{textAlign:"left",padding:"10px 18px",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",background:"#f8fafc",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>
                {plans.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:"12px 18px",fontSize:14,fontWeight:700,color:"#1e293b",borderTop:"1px solid #f1f5f9"}}>{p.name}</td>
                    <td style={{padding:"12px 18px",fontSize:14,color:"#374151",borderTop:"1px solid #f1f5f9"}}>${p.price}/mo</td>
                    <td style={{padding:"12px 18px",fontSize:13,color:"#374151",borderTop:"1px solid #f1f5f9",textTransform:"capitalize"}}>{p.interval}</td>
                    <td style={{padding:"12px 18px",fontSize:12,color:"#64748b",borderTop:"1px solid #f1f5f9"}}>{p.features}</td>
                    <td style={{padding:"12px 18px",borderTop:"1px solid #f1f5f9"}}>
                      <span style={{background:p.active?"#dcfce7":"#f1f5f9",color:p.active?"#166534":"#64748b",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{p.active?"Active":"Inactive"}</span>
                    </td>
                    <td style={{padding:"12px 18px",borderTop:"1px solid #f1f5f9"}}>
                      <button onClick={()=>setPlans(ps=>ps.map(x=>x.id===p.id?{...x,active:!x.active}:x))} style={{fontSize:12,padding:"4px 10px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:5,cursor:"pointer",fontWeight:600,color:"#374151"}}>
                        {p.active?"Deactivate":"Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showPlanForm&&(
            <div style={card}>
              {SH("New Service Plan")}
              <div style={{padding:20}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Plan Name</label><input value={planForm.name} onChange={e=>setPlanForm(p=>({...p,name:e.target.value}))} style={inp} placeholder="e.g. Basic"/></div>
                  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Price ($/mo)</label><input type="number" value={planForm.price} onChange={e=>setPlanForm(p=>({...p,price:Number(e.target.value)}))} style={inp} min={0}/></div>
                  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Billing Interval</label><select value={planForm.interval} onChange={e=>setPlanForm(p=>({...p,interval:e.target.value as Plan["interval"]}))} style={inp}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div>
                </div>
                <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Features Description</label><input value={planForm.features} onChange={e=>setPlanForm(p=>({...p,features:e.target.value}))} style={inp} placeholder="e.g. 3 bureaus, unlimited disputes"/></div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={()=>setShowPlanForm(false)} style={{padding:"9px 18px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                  <button onClick={addPlan} style={{padding:"9px 18px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,cursor:"pointer"}}>Add Plan</button>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ═══ TAGS ═══ */}
        {tab==="Tags"&&(<>
          <div style={card}>
            {SH("Manage Tags")}
            <div style={{padding:20}}>
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                <input value={tagInput} onChange={e=>setTagInput(e.target.value)} placeholder="New tag name…" style={{...inp,flex:1,minWidth:180}} onKeyDown={e=>e.key==="Enter"&&addTag()}/>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {COLOR_OPTIONS.slice(0,6).map(c=>(
                    <button key={c} onClick={()=>setTagColor(c)} style={{width:26,height:26,borderRadius:"50%",background:c,border:tagColor===c?"3px solid #1e293b":"2px solid #fff",boxShadow:"0 0 0 1px #e2e8f0",cursor:"pointer"}}/>
                  ))}
                </div>
                <button onClick={addTag} disabled={!tagInput.trim()} style={{padding:"9px 18px",background:tagInput.trim()?"#1e3a5f":"#94a3b8",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:tagInput.trim()?"pointer":"not-allowed"}}>+ Add Tag</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {tags.map(t=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,background:t.color+"22",borderRadius:20,padding:"5px 12px",border:`1px solid ${t.color}44`}}>
                    <span style={{fontSize:13,fontWeight:700,color:t.color}}>{t.name}</span>
                    <button onClick={()=>setTags(ts=>ts.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",color:t.color,fontSize:14,lineHeight:1,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ INTEGRATIONS ═══ */}
        {tab==="Integrations"&&(<>
          <div style={card}>
            {SH("Connected Services")}
            <div style={{padding:20,display:"flex",flexDirection:"column",gap:10}}>
              {([
                {name:"Supabase",desc:"Database & authentication",key:"NEXT_PUBLIC_SUPABASE_URL",val:process.env.NEXT_PUBLIC_SUPABASE_URL,icon:"🗄"},
                {name:"OpenAI",desc:"AI letter generation & analysis",key:"OPENAI_API_KEY",val:"Configured in server env",icon:"🤖"},
                {name:"Stripe",desc:"Payment processing",key:"STRIPE_SECRET_KEY",val:"Configured in server env",icon:"💳"},
                {name:"Twilio",desc:"SMS notifications",key:"TWILIO_ACCOUNT_SID",val:null,icon:"📱"},
                {name:"SendGrid",desc:"Transactional email",key:"SENDGRID_API_KEY",val:null,icon:"✉"},
                {name:"DocuSign",desc:"Document e-signatures",key:"DOCUSIGN_API_KEY",val:null,icon:"✍"},
              ]).map(({name,desc,key,val,icon})=>(
                <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f8fafc",borderRadius:8}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:22}}>{icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{name}</div>
                      <div style={{fontSize:12,color:"#94a3b8"}}>{desc} · <code style={{fontSize:11}}>{key}</code></div>
                    </div>
                  </div>
                  <span style={{fontSize:12,background:val?"#dcfce7":"#fee2e2",color:val?"#166534":"#991b1b",borderRadius:20,padding:"3px 12px",fontWeight:700}}>{val?"✓ Configured":"Not Set"}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            {SH("Webhook Endpoints")}
            <div style={{padding:20}}>
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Stripe Webhook URL</label>
                <input readOnly value={typeof window!=="undefined"?`${window.location.origin}/api/webhooks/stripe`:"https://yourapp.com/api/webhooks/stripe"} style={{...inp,background:"#f8fafc",color:"#64748b",fontFamily:"monospace",fontSize:12}}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>General Inbound Webhook</label>
                <input readOnly value={typeof window!=="undefined"?`${window.location.origin}/api/webhooks/inbound`:"https://yourapp.com/api/webhooks/inbound"} style={{...inp,background:"#f8fafc",color:"#64748b",fontFamily:"monospace",fontSize:12}}/>
              </div>
            </div>
          </div>
        </>)}
      </div>

      {/* ── Add Status Modal ── */}
      {showSF&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#fff",borderRadius:12,padding:28,width:380,boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
            <h2 style={{margin:"0 0 20px",fontSize:18,fontWeight:700}}>Add Custom {showSF==="client"?"Client":"Dispute"} Status</h2>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:5}}>Status Name</label>
              <input value={sfForm.name} onChange={e=>setSfForm(f=>({...f,name:e.target.value}))} placeholder="e.g. On Hold" style={{...inp}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:8}}>Color</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {COLOR_OPTIONS.map(c=>(
                  <button key={c} onClick={()=>setSfForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:sfForm.color===c?"3px solid #1e293b":"2px solid #fff",boxShadow:"0 0 0 1px #e2e8f0",cursor:"pointer"}}/>
                ))}
              </div>
              <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:sfForm.color}}/>
                <span style={{fontSize:13,background:sfForm.color+"22",color:sfForm.color,borderRadius:20,padding:"2px 12px",fontWeight:700}}>{sfForm.name||"Preview"}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowSF(null)} style={{padding:"9px 20px",border:"1px solid #e2e8f0",borderRadius:7,background:"#fff",cursor:"pointer",fontWeight:600}}>Cancel</button>
              <button onClick={addStatus} disabled={savingSt} style={{padding:"9px 20px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>
                {savingSt?"Saving…":"Add Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
