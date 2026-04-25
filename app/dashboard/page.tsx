"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const BUREAU_COLORS: Record<string,string> = { Equifax:"#ef4444", Experian:"#3b82f6", TransUnion:"#8b5cf6" };
const STATUS_C: Record<string,string> = { active:"#10b981", pending:"#f59e0b", inactive:"#94a3b8", new:"#3b82f6", resolved:"#10b981", sent:"#8b5cf6", disputed:"#f59e0b", deleted:"#10b981" };
const AVATAR_COLORS = ["#1e3a5f","#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function initials(name: string) { const p=name.trim().split(" "); return (p[0]?.[0]||"")+(p[1]?.[0]||""); }
function avatarColor(name: string) { let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xfffffff; return AVATAR_COLORS[h%AVATAR_COLORS.length]; }
function relTime(iso: string) {
  const d = (Date.now()-new Date(iso).getTime())/1000;
  if(d<60) return "just now";
  if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`;
  if(d<604800) return `${Math.floor(d/86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
function fmt(n: number) { return "$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0}); }

// Simple SVG bar chart
function BarChart({ data, labels, color="#3b82f6", height=120 }: { data:number[], labels:string[], color?:string, height?:number }) {
  const max = Math.max(...data, 1);
  const w = 100/data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      {data.map((v,i) => {
        const bh = (v/max)*(height-20);
        return (
          <g key={i}>
            <rect x={i*w+w*0.15} y={height-20-bh} width={w*0.7} height={bh} fill={color} rx={2} opacity={0.85} />
            <text x={i*w+w/2} y={height-4} textAnchor="middle" fontSize={7} fill="#94a3b8">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Simple SVG donut chart
function DonutChart({ segments }: { segments:{label:string,value:number,color:string}[] }) {
  const total = segments.reduce((s,x)=>s+x.value,0)||1;
  let angle = -Math.PI/2;
  const r=36, cx=50, cy=50, ri=24;
  const arcs = segments.map(s => {
    const a = (s.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    angle+=a;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const xi1=cx+ri*Math.cos(angle-a), yi1=cy+ri*Math.sin(angle-a);
    const xi2=cx+ri*Math.cos(angle), yi2=cy+ri*Math.sin(angle);
    const large=a>Math.PI?1:0;
    return { d:`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${large},0 ${xi1},${yi1} Z`, color:s.color, label:s.label, value:s.value };
  });
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <svg viewBox="0 0 100 100" style={{ width:90, height:90, flexShrink:0 }}>
        {arcs.map((a,i)=><path key={i} d={a.d} fill={a.color} opacity={0.9} />)}
        <text x={cx} y={cy+4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1e293b">{total}</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {segments.map(s=>(
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#64748b" }}>{s.label}</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#1e293b", marginLeft:"auto" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// SVG line chart
function LineChart({ data, labels, color="#10b981", height=80 }: { data:number[], labels:string[], color?:string, height?:number }) {
  const max=Math.max(...data,1), min=0;
  const pts = data.map((v,i)=>`${(i/(data.length-1||1))*90+5},${height-10-((v-min)/(max-min||1))*(height-20)}`).join(" ");
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width:"100%", height }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((v,i)=>(
        <g key={i}>
          <circle cx={(i/(data.length-1||1))*90+5} cy={height-10-((v-min)/(max-min||1))*(height-20)} r={2} fill={color} />
          <text x={(i/(data.length-1||1))*90+5} y={height-1} textAnchor="middle" fontSize={7} fill="#94a3b8">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

type Range = "week"|"month"|"year";

export default function Page() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("month");
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);

  // Data
  const [clients, setClients] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [tasks, setTasks] = useState([
    { id:"1", text:"Review new client applications", done:false },
    { id:"2", text:"Send Round 2 dispute letters", done:false },
    { id:"3", text:"Follow up on overdue invoices", done:true },
    { id:"4", text:"Update client portal content", done:false },
    { id:"5", text:"Review bureau responses", done:false },
  ]);
  const [onboarding] = useState([
    { label:"Add your first client", done:false, path:"/clients" },
    { label:"Create a dispute letter", done:false, path:"/letters/vault" },
    { label:"Connect Stripe for payments", done:false, path:"/billing" },
    { label:"Set up client portal", done:false, path:"/company/portals" },
    { label:"Configure notifications", done:false, path:"/company/notify-automation" },
  ]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [c, d, inv, l, lt] = await Promise.all([
        supabase.from("clients").select("id,first_name,last_name,full_name,status,phone,credit_score,created_at,updated_at,assigned_agent").order("created_at",{ascending:false}).limit(200),
        supabase.from("disputes").select("id,account_name,bureau,status,round,created_at,updated_at,letter_title,clients(first_name,last_name)").order("created_at",{ascending:false}).limit(200),
        supabase.from("invoices").select("id,amount,status,created_at,clients(first_name,last_name)").order("created_at",{ascending:false}).limit(200),
        supabase.from("leads").select("id,first_name,last_name,status,source,created_at").order("created_at",{ascending:false}).limit(50),
        supabase.from("letter_templates").select("id,title,type,created_at,uses_count").order("created_at",{ascending:false}).limit(50),
      ]);
      setClients(c.data||[]);
      setDisputes(d.data||[]);
      setInvoices(inv.data||[]);
      setLeads(l.data||[]);
      setLetters(lt.data||[]);
      setLoading(false);
    }
    load();
    // Try to get user name from session
    supabase.auth.getUser().then(({data})=>{ if(data?.user?.email) setUserName(data.user.email.split("@")[0]); });
  },[]);

  // Range filter
  const now = new Date();
  function rangeStart(r: Range) {
    if(r==="week") return new Date(now.getTime()-7*86400000).toISOString();
    if(r==="month") return new Date(now.getFullYear(),now.getMonth(),1).toISOString();
    return new Date(now.getFullYear(),0,1).toISOString();
  }
  const rs = rangeStart(range);

  // Computed stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c=>c.status==="active").length;
  const newThisPeriod = clients.filter(c=>c.created_at>=rs).length;
  const totalLeads = leads.length;
  const activeLetters = letters.filter(l=>(l.uses_count||0)>0).length;
  const paidInv = invoices.filter(i=>i.status==="paid");
  const pendingInv = invoices.filter(i=>i.status==="pending");
  const overdueInv = invoices.filter(i=>i.status==="overdue");
  const monthStart = new Date(now.getFullYear(),now.getMonth(),1).toISOString();
  const yearStart = new Date(now.getFullYear(),0,1).toISOString();
  const monthlyRev = invoices.filter(i=>i.status==="paid"&&i.created_at>=monthStart).reduce((s:number,i:any)=>s+(i.amount||0),0);
  const ytdRev = invoices.filter(i=>i.status==="paid"&&i.created_at>=yearStart).reduce((s:number,i:any)=>s+(i.amount||0),0);
  const pendingAmt = pendingInv.reduce((s:number,i:any)=>s+(i.amount||0),0);
  const overdueAmt = overdueInv.reduce((s:number,i:any)=>s+(i.amount||0),0);
  const openDisputes = disputes.filter(d=>d.status!=="resolved"&&d.status!=="deleted");
  const eqOpen = openDisputes.filter(d=>d.bureau==="Equifax").length;
  const exOpen = openDisputes.filter(d=>d.bureau==="Experian").length;
  const tuOpen = openDisputes.filter(d=>d.bureau==="TransUnion").length;

  // Revenue chart — last 6 months
  const revenueData = Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
    const start=d.toISOString();
    const end=new Date(d.getFullYear(),d.getMonth()+1,1).toISOString();
    return invoices.filter(inv=>inv.status==="paid"&&inv.created_at>=start&&inv.created_at<end).reduce((s:number,inv:any)=>s+(inv.amount||0),0);
  });
  const revenueLabels = Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-5+i,1); return MONTHS[d.getMonth()]; });

  // Client growth — last 6 months
  const growthData = Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-5+i,1); const start=d.toISOString(); const end=new Date(d.getFullYear(),d.getMonth()+1,1).toISOString(); return clients.filter(c=>c.created_at>=start&&c.created_at<end).length; });

  // Dispute counts by status
  const disputeByStatus = [
    { label:"Open", value:disputes.filter(d=>d.status==="disputed"||d.status==="pending").length, color:"#f59e0b" },
    { label:"Sent", value:disputes.filter(d=>d.status==="sent").length, color:"#3b82f6" },
    { label:"Resolved", value:disputes.filter(d=>d.status==="resolved").length, color:"#10b981" },
    { label:"In Progress", value:disputes.filter(d=>d.status==="active").length, color:"#8b5cf6" },
  ];

  // Dispute count per client
  const disputeCount: Record<string,number> = {};
  disputes.forEach(d=>{ if(d.clients?.first_name) { const k=`${d.clients.first_name} ${d.clients.last_name}`; disputeCount[k]=(disputeCount[k]||0)+1; } });

  // Alerts
  const alerts = [
    ...overdueInv.slice(0,3).map(i=>({ type:"overdue", text:`Overdue invoice — ${i.clients?.first_name||""} ${i.clients?.last_name||""} (${fmt(i.amount||0)})`, color:"#ef4444" })),
    ...disputes.filter(d=>d.status==="pending").slice(0,2).map(d=>({ type:"dispute", text:`Dispute awaiting response — ${d.account_name||"Account"} (${d.bureau})`, color:"#f59e0b" })),
    ...leads.filter(l=>l.status==="new").slice(0,2).map(l=>({ type:"lead", text:`New lead: ${l.first_name||""} ${l.last_name||""} via ${l.source||"Website"}`, color:"#3b82f6" })),
  ];

  // Activity feed
  const activity = [
    ...clients.slice(0,4).map(c=>({ icon:"👤", text:`New client added: ${c.first_name||""} ${c.last_name||""}`, time:c.created_at, color:"#3b82f6", path:"/clients" })),
    ...disputes.slice(0,4).map(d=>({ icon:"📋", text:`Dispute filed: ${d.account_name||"Account"} (${d.bureau})`, time:d.created_at, color:"#8b5cf6", path:"/disputes" })),
    ...paidInv.slice(0,3).map(i=>({ icon:"💰", text:`Payment received: ${fmt(i.amount||0)} from ${i.clients?.first_name||""} ${i.clients?.last_name||""}`, time:i.created_at, color:"#10b981", path:"/billing" })),
    ...leads.slice(0,3).map(l=>({ icon:"🎯", text:`New lead: ${l.first_name||""} ${l.last_name||""} (${l.source||""})`, time:l.created_at, color:"#f59e0b", path:"/leads" })),
  ].filter(a=>a.time).sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime()).slice(0,12);

  function toggleTask(id: string) { setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x)); }
  function addTask() { if(!newTask.trim()) return; setTasks(t=>[...t,{id:String(Date.now()),text:newTask.trim(),done:false}]); setNewTask(""); }

  const statCard = (label:string, value:string|number, color:string, icon:string, sub:string, trend?:string) => (
    <div style={{ background:"#fff", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", borderTop:`3px solid ${color}`, minWidth:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</p>
          <p style={{ margin:"4px 0 0", fontSize:24, fontWeight:800, color }}>{loading?"—":value}</p>
        </div>
        <span style={{ fontSize:22 }}>{icon}</span>
      </div>
      <p style={{ margin:"6px 0 0", fontSize:11, color:"#94a3b8" }}>{sub}</p>
      {trend && <p style={{ margin:"3px 0 0", fontSize:11, color:"#10b981", fontWeight:600 }}>{trend}</p>}
    </div>
  );

  const today = now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  // Upcoming (derived from leads follow-up dates)
  const upcoming = leads.filter(l=>l.follow_up_date).slice(0,5).map(l=>({ title:`Follow up: ${l.first_name} ${l.last_name}`, date:l.follow_up_date, color:"#3b82f6" }));

  return (
    <CDMLayout>
      <div style={{ padding:24, maxWidth:1400 }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0, color:"#1e293b" }}>Welcome back, {userName}! 👋</h1>
            <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:13 }}>{today}</p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"+ New Client", bg:"#1e3a5f", path:"/clients" },
              { label:"+ New Dispute", bg:"#3b82f6", path:"/disputes" },
              { label:"+ New Lead", bg:"#8b5cf6", path:"/leads" },
              { label:"+ New Invoice", bg:"#10b981", path:"/billing" },
              { label:"🖨 Print Letters", bg:"#f59e0b", path:"/bulk-print" },
              { label:"+ New Letter", bg:"#f1f5f9", path:"/letters/vault", color:"#1e293b" },
            ].map(b=>(
              <button key={b.label} onClick={()=>router.push(b.path)}
                style={{ background:b.bg, color:b.color||"#fff", border:"none", borderRadius:7, padding:"8px 14px", cursor:"pointer", fontWeight:600, fontSize:13 }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range toggle */}
        <div style={{ display:"flex", gap:0, marginBottom:16, border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden", width:"fit-content" }}>
          {(["week","month","year"] as Range[]).map(r=>(
            <button key={r} onClick={()=>setRange(r)}
              style={{ padding:"7px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:range===r?700:500, background:range===r?"#1e3a5f":"#fff", color:range===r?"#fff":"#64748b" }}>
              {r==="week"?"This Week":r==="month"?"This Month":"This Year"}
            </button>
          ))}
        </div>

        {/* Main stat cards — row 1 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:12 }}>
          {statCard("Total Clients", totalClients, "#1e3a5f", "👥", "All time")}
          {statCard("Active Clients", activeClients, "#10b981", "✅", "Currently active", activeClients>0?`${Math.round(activeClients/Math.max(totalClients,1)*100)}% of total`:undefined)}
          {statCard("New This Period", newThisPeriod, "#3b82f6", "🆕", range==="week"?"This week":range==="month"?"This month":"This year")}
          {statCard("Leads", totalLeads, "#8b5cf6", "🎯", "In pipeline")}
          {statCard("Active Letters", activeLetters, "#06b6d4", "📝", "In use")}
        </div>

        {/* Main stat cards — row 2 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:12 }}>
          {statCard("Monthly Revenue", fmt(monthlyRev), "#10b981", "💰", MONTHS[now.getMonth()]+" total")}
          {statCard("YTD Revenue", fmt(ytdRev), "#059669", "📈", now.getFullYear()+" total")}
          {statCard("Pending Invoices", fmt(pendingAmt), "#f59e0b", "⏳", `${pendingInv.length} invoices`)}
          {statCard("Overdue Invoices", fmt(overdueAmt), "#ef4444", "🚨", `${overdueInv.length} invoices`)}
          {statCard("Total Disputes", disputes.length, "#475569", "📋", "All bureaus")}
        </div>

        {/* Bureau cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[["Equifax","#ef4444","🔴",eqOpen],["Experian","#3b82f6","🔵",exOpen],["TransUnion","#8b5cf6","🟣",tuOpen]].map(([name,color,icon,count])=>(
            <div key={name as string} style={{ background:"#fff", borderRadius:10, padding:"14px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", borderLeft:`4px solid ${color}`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>{icon}</span>
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#64748b" }}>{name} Open</p>
                <p style={{ margin:"2px 0 0", fontSize:22, fontWeight:800, color:color as string }}>{loading?"—":count as number}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:16, marginBottom:24 }}>
          <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>Revenue — Last 6 Months</h3>
            <BarChart data={revenueData} labels={revenueLabels} color="#3b82f6" height={130} />
          </div>
          <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>Dispute Status</h3>
            <DonutChart segments={disputeByStatus} />
          </div>
          <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>Client Growth</h3>
            <LineChart data={growthData} labels={revenueLabels} color="#10b981" height={110} />
          </div>
        </div>

        {/* 3-column main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr 260px", gap:16, marginBottom:24 }}>

          {/* LEFT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Alerts */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b", display:"flex", alignItems:"center", gap:6 }}>
                🔔 Alerts
                {alerts.length>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{alerts.length}</span>}
              </h3>
              {alerts.length===0 ? <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>All clear — no alerts.</p>
              : alerts.map((a,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:8, padding:"8px 10px", background:a.color+"11", borderRadius:7, borderLeft:`3px solid ${a.color}` }}>
                  <span style={{ fontSize:11, color:"#475569", lineHeight:1.4 }}>{a.text}</span>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>
                ✅ Tasks ({tasks.filter(t=>!t.done).length} pending)
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {tasks.map(t=>(
                  <label key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer" }}>
                    <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{ marginTop:2, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:t.done?"#94a3b8":"#475569", textDecoration:t.done?"line-through":"none", lineHeight:1.4 }}>{t.text}</span>
                  </label>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, marginTop:12 }}>
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}
                  placeholder="Add task…" style={{ flex:1, padding:"6px 10px", border:"1px solid #e2e8f0", borderRadius:6, fontSize:12, outline:"none" }} />
                <button onClick={addTask} style={{ padding:"6px 10px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:12 }}>+</button>
              </div>
            </div>

            {/* Onboarding */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>🚀 Getting Started</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {onboarding.map((o,i)=>(
                  <div key={i} onClick={()=>router.push(o.path)} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 0" }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid", borderColor:o.done?"#10b981":"#e2e8f0", background:o.done?"#10b981":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {o.done && <span style={{ fontSize:10, color:"#fff" }}>✓</span>}
                    </div>
                    <span style={{ fontSize:12, color:o.done?"#94a3b8":"#1e293b", textDecoration:o.done?"line-through":"none" }}>{o.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, background:"#f1f5f9", borderRadius:6, height:6 }}>
                <div style={{ background:"#10b981", height:6, borderRadius:6, width:`${(onboarding.filter(o=>o.done).length/onboarding.length)*100}%`, transition:"width 0.3s" }} />
              </div>
              <p style={{ margin:"6px 0 0", fontSize:11, color:"#94a3b8" }}>{onboarding.filter(o=>o.done).length}/{onboarding.length} complete</p>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Recent Clients */}
            <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Recent Clients</h2>
                <button onClick={()=>router.push("/clients")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer", fontSize:13, fontWeight:600 }}>View all →</button>
              </div>
              {loading ? <p style={{ color:"#94a3b8", fontSize:14 }}>Loading…</p>
              : clients.length===0 ? <p style={{ color:"#94a3b8", fontSize:14 }}>No clients yet</p>
              : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                      {["Client","Phone","Score","Disputes","Last Active","Status"].map(h=><th key={h} style={{ textAlign:"left", fontSize:11, color:"#64748b", paddingBottom:8, fontWeight:600, whiteSpace:"nowrap", paddingRight:12 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{clients.slice(0,6).map((c:any)=>{
                      const name=`${c.first_name||""} ${c.last_name||""}`.trim()||c.full_name||"—";
                      const ac=avatarColor(name); const ini=initials(name);
                      const dc=disputes.filter(d=>d.clients?.first_name===c.first_name&&d.clients?.last_name===c.last_name).length;
                      const score=c.credit_score;
                      return (
                        <tr key={c.id} onClick={()=>router.push("/clients")} style={{ cursor:"pointer", borderBottom:"1px solid #f8fafc" }}>
                          <td style={{ padding:"8px 12px 8px 0" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:"50%", background:ac, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700, flexShrink:0 }}>{ini||"?"}</div>
                              <span style={{ fontSize:13, fontWeight:600 }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize:12, color:"#64748b", paddingRight:12, whiteSpace:"nowrap" }}>{c.phone||"—"}</td>
                          <td style={{ fontSize:12, fontWeight:700, paddingRight:12, color:score?score>=700?"#10b981":score>=620?"#f59e0b":"#ef4444":"#94a3b8" }}>{score||"—"}</td>
                          <td style={{ paddingRight:12 }}>
                            {dc>0?<span style={{ background:"#3b82f6"+"22", color:"#3b82f6", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{dc}</span>:<span style={{ fontSize:12, color:"#94a3b8" }}>0</span>}
                          </td>
                          <td style={{ fontSize:11, color:"#94a3b8", paddingRight:12, whiteSpace:"nowrap" }}>{relTime(c.updated_at||c.created_at)}</td>
                          <td>
                            <span style={{ background:(STATUS_C[c.status]||"#94a3b8")+"22", color:STATUS_C[c.status]||"#64748b", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{c.status||"active"}</span>
                          </td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Disputes */}
            <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Recent Disputes</h2>
                <button onClick={()=>router.push("/disputes")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer", fontSize:13, fontWeight:600 }}>View all →</button>
              </div>
              {loading ? <p style={{ color:"#94a3b8", fontSize:14 }}>Loading…</p>
              : disputes.length===0 ? <p style={{ color:"#94a3b8", fontSize:14 }}>No disputes yet</p>
              : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                      {["Client","Account","Bureau","Rnd","Letter","Status"].map(h=><th key={h} style={{ textAlign:"left", fontSize:11, color:"#64748b", paddingBottom:8, fontWeight:600, paddingRight:10 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{disputes.slice(0,6).map((d:any)=>(
                      <tr key={d.id} onClick={()=>router.push("/disputes")} style={{ cursor:"pointer", borderBottom:"1px solid #f8fafc" }}>
                        <td style={{ padding:"8px 10px 8px 0", fontSize:13, fontWeight:600, whiteSpace:"nowrap" }}>{d.clients?.first_name||""} {d.clients?.last_name||""}</td>
                        <td style={{ fontSize:13, color:"#475569", paddingRight:10, whiteSpace:"nowrap", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis" }}>{d.account_name||"Unknown"}</td>
                        <td style={{ paddingRight:10 }}>
                          <span style={{ background:(BUREAU_COLORS[d.bureau]||"#94a3b8")+"22", color:BUREAU_COLORS[d.bureau]||"#64748b", borderRadius:20, padding:"2px 7px", fontSize:11, fontWeight:700 }}>{d.bureau}</span>
                        </td>
                        <td style={{ fontSize:12, color:"#64748b", paddingRight:10 }}>R{d.round||1}</td>
                        <td style={{ fontSize:11, color:"#94a3b8", paddingRight:10, maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.letter_title||"—"}</td>
                        <td>
                          <span style={{ background:(STATUS_C[d.status]||"#94a3b8")+"22", color:STATUS_C[d.status]||"#64748b", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{d.status||"pending"}</span>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Calendar / Upcoming */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#1e293b" }}>📅 Upcoming</h3>
              {upcoming.length===0 ? <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>No upcoming events. Add follow-up dates to leads.</p>
              : upcoming.map((u,i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                  <div style={{ background:u.color+"22", color:u.color, borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:700, flexShrink:0 }}>
                    {new Date(u.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </div>
                  <span style={{ fontSize:12, color:"#475569", lineHeight:1.4 }}>{u.title}</span>
                </div>
              ))}
              {upcoming.length===0 && (
                <div style={{ marginTop:8 }}>
                  {[{label:"Mon",num:now.getDate()},{label:"Tue",num:now.getDate()+1},{label:"Wed",num:now.getDate()+2},{label:"Thu",num:now.getDate()+3},{label:"Fri",num:now.getDate()+4}].map(d=>(
                    <div key={d.label} style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", marginRight:6, padding:"6px 8px", borderRadius:7, background:d.num===now.getDate()?"#1e3a5f":"#f8fafc" }}>
                      <span style={{ fontSize:10, color:d.num===now.getDate()?"rgba(255,255,255,0.7)":"#94a3b8" }}>{d.label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:d.num===now.getDate()?"#fff":"#1e293b" }}>{d.num}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Leads */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#1e293b" }}>🎯 Recent Leads</h3>
                <button onClick={()=>router.push("/leads")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer", fontSize:12, fontWeight:600 }}>View all →</button>
              </div>
              {leads.length===0 ? <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>No leads yet.</p>
              : leads.slice(0,5).map((l:any)=>(
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f8fafc" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{l.first_name} {l.last_name}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{l.source||"—"} · {relTime(l.created_at)}</div>
                  </div>
                  <span style={{ background:(STATUS_C[l.status]||"#94a3b8")+"22", color:STATUS_C[l.status]||"#64748b", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{l.status||"new"}</span>
                </div>
              ))}
            </div>

            {/* Recent Invoices */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#1e293b" }}>🧾 Recent Invoices</h3>
                <button onClick={()=>router.push("/billing")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer", fontSize:12, fontWeight:600 }}>View all →</button>
              </div>
              {invoices.length===0 ? <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>No invoices yet.</p>
              : invoices.slice(0,5).map((inv:any,i)=>(
                <div key={inv.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f8fafc" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#1e293b" }}>{fmt(inv.amount||0)}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{inv.clients?.first_name||""} {inv.clients?.last_name||""}</div>
                  </div>
                  <span style={{ background:(STATUS_C[inv.status]||"#94a3b8")+"22", color:STATUS_C[inv.status]||"#64748b", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{inv.status}</span>
                </div>
              ))}
            </div>

            {/* Recent Letters */}
            <div style={{ background:"#fff", borderRadius:10, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#1e293b" }}>📄 Recent Letters</h3>
                <button onClick={()=>router.push("/letters/vault")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer", fontSize:12, fontWeight:600 }}>View all →</button>
              </div>
              {letters.length===0 ? <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>No letters yet.</p>
              : letters.slice(0,5).map((l:any)=>(
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f8fafc" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{l.title}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{l.type} · used {l.uses_count||0}×</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed — full width */}
        <div style={{ background:"#fff", borderRadius:10, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
          <h2 style={{ fontSize:15, fontWeight:700, margin:"0 0 14px" }}>Recent Activity</h2>
          {loading ? <p style={{ color:"#94a3b8", fontSize:14 }}>Loading…</p>
          : activity.length===0 ? <p style={{ color:"#94a3b8", fontSize:14 }}>No recent activity — add clients and disputes to get started.</p>
          : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {activity.map((a,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#f8fafc", borderRadius:8 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{a.icon}</span>
                  <span style={{ fontSize:13, flex:1, color:"#475569" }}>{a.text}</span>
                  <span style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>{relTime(a.time)}</span>
                  <button onClick={()=>router.push(a.path)} style={{ fontSize:11, padding:"3px 8px", border:"1px solid #e2e8f0", borderRadius:5, background:"#fff", cursor:"pointer", color:"#3b82f6", fontWeight:600, whiteSpace:"nowrap" }}>View →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CDMLayout>
  );
}
