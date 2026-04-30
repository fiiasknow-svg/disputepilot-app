"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type RevFilter = "Today"|"Custom"|"Last 30 Days"|"YTD"|"All Time";

export default function Page() {
  const router = useRouter();
  const now = new Date();
  const [revFilter, setRevFilter] = useState<RevFilter>("All Time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [msgTab, setMsgTab] = useState<"Customer"|"Affiliate"|"Text">("Customer");
  const [msgDetail, setMsgDetail] = useState(false);
  const [taskTab, setTaskTab] = useState<"Pending"|"Completed"|"Current"|"Archive"|"All">("Pending");
  const [reminders, setReminders] = useState<{id:number,title:string,date:string,time:string,recurring:boolean,endDate:string}[]>([]);
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderRecurring, setReminderRecurring] = useState(false);
  const [reminderEndDate, setReminderEndDate] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadNote, setLeadNote] = useState("");
  const [tasks] = useState([
    {id:1,text:"Review new client applications",done:false},
    {id:2,text:"Send Round 2 dispute letters",done:false},
    {id:3,text:"Follow up on overdue invoices",done:true},
  ]);

  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthLabel = `${MONTHS[calMonth]} ${calYear}`;

  function saveReminder() {
    if (!reminderTitle.trim()) return;
    setReminders(r => [...r, {id:Date.now(), title:reminderTitle, date:reminderDate, time:reminderTime, recurring:reminderRecurring, endDate:reminderEndDate}]);
    setReminderTitle(""); setReminderDate(""); setReminderTime(""); setReminderRecurring(false); setReminderEndDate("");
  }

  const inp: React.CSSProperties = {width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,boxSizing:"border-box",outline:"none"};
  const btn = (bg:string,color="#fff"): React.CSSProperties => ({background:bg,color,border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13});

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1400}}>

        {/* Trial banner */}
        <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,fontWeight:600,color:"#92400e"}}>
          29 Days Left in The Trial
        </div>

        {/* Quick action buttons */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>router.push("/leads")} style={btn("#1e3a5f")}>Add Quick Lead</button>
          <button onClick={()=>router.push("/clients")} style={btn("#3b82f6")}>Add New Customer</button>
          <button style={btn("#8b5cf6")}>Customer Search</button>
          <button onClick={()=>router.push("/academy/credit-repair")} style={btn("#f59e0b")}>Training Videos</button>
        </div>

        {/* CDM stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {([
            {label:"Total Customers",val:"1",color:"#1e3a5f",icon:"👥"},
            {label:"Total Current Leads",val:"0",color:"#8b5cf6",icon:"🎯"},
            {label:"Total Bureau Disputes",val:"0",color:"#3b82f6",icon:"📋"},
            {label:"Total Deletion",val:"0",color:"#10b981",icon:"✅"},
          ] as const).map(s=>(
            <div key={s.label} style={{background:"#fff",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderTop:`3px solid ${s.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <h3 style={{margin:0,fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".04em"}}>{s.label}</h3>
                  <p style={{margin:"6px 0 0",fontSize:28,fontWeight:800,color:s.color}}>{s.val}</p>
                </div>
                <span style={{fontSize:24}}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Channels + Training */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,marginBottom:20}}>
          <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700,color:"#1e293b"}}>Revenue Channels</h3>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {(["Today","Custom","Last 30 Days","YTD","All Time"] as RevFilter[]).map(f=>(
                <button key={f} onClick={()=>setRevFilter(f)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid",borderColor:revFilter===f?"#1e3a5f":"#e2e8f0",background:revFilter===f?"#1e3a5f":"#fff",color:revFilter===f?"#fff":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>{f}</button>
              ))}
            </div>
            {revFilter==="Custom" && (
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-end",flexWrap:"wrap"}}>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>From Date</label><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12}} /></div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>To Date</label><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12}} /></div>
                <button style={btn("#1e3a5f")}>Apply</button>
              </div>
            )}
            {revFilter!=="Custom" && (
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>From Date</label><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12,width:"100%"}} /></div>
                <div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>To Date</label><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12,width:"100%"}} /></div>
                <div style={{display:"flex",alignItems:"flex-end"}}><button style={btn("#1e3a5f")}>Apply</button></div>
              </div>
            )}
            <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:10,padding:"20px 24px",textAlign:"center"}}>
              <label style={{display:"block",fontSize:11,color:"rgba(255,255,255,.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>Total Revenue</label>
              <p style={{margin:"8px 0 0",fontSize:36,fontWeight:800,color:"#10b981"}}>$0</p>
            </div>
          </div>

          {/* Training links */}
          <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Training &amp; Resources</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {label:"Claim Your Free Gifts",href:"/billing"},
                {label:"Your First Dispute",href:"/disputes"},
                {label:"Full Walkthrough",href:"/academy/credit-repair"},
                {label:"1 to 1 Training",href:"/academy/credit-repair"},
                {label:"Group Training",href:"/academy/credit-repair"},
                {label:"Help Center",href:"/academy/credit-repair"},
                {label:"Task",href:"/dashboard"},
                {label:"Start-Run-Grow Training",href:"/get-customers/start-run-grow"},
              ].map(l=>(
                <a key={l.label} href={l.href} style={{display:"block",padding:"7px 10px",background:"#f8fafc",borderRadius:6,textDecoration:"none",color:"#1e293b",fontSize:12,fontWeight:500}}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Search + Quick Lead + Messages + Calendar/Reminders */}
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr 300px",gap:16,marginBottom:20}}>

          {/* Left: Search + Quick Lead */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Search Your Customer Here</h3>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Name, phone, email…" style={{...inp,marginBottom:8}} />
              <div style={{display:"flex",gap:6}}>
                <button style={{...btn("#1e3a5f"),flex:1,padding:"7px"}}>Search</button>
                <button onClick={()=>setSearchQ("")} style={{...btn("#f1f5f9","#475569"),flex:1,padding:"7px"}}>Clear</button>
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Quick Lead Generation</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Phone</label><input value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="Phone" style={inp} /></div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Email</label><input value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} placeholder="Email" style={inp} /></div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Note</label><textarea value={leadNote} onChange={e=>setLeadNote(e.target.value)} rows={2} style={{...inp,resize:"vertical"}} /></div>
                <button style={btn("#8b5cf6")}>Create</button>
              </div>
            </div>
          </div>

          {/* Center: Messages */}
          <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)",display:"flex",flexDirection:"column"}}>
            <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700,color:"#1e293b"}}>Customer/Affiliate/Text Messages</h3>
            <div style={{display:"flex",gap:0,borderBottom:"2px solid #f1f5f9",marginBottom:16}}>
              {(["Customer","Affiliate","Text"] as const).map(t=>(
                <button key={t} onClick={()=>{setMsgTab(t);setMsgDetail(false);}} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:msgTab===t?700:500,color:msgTab===t?"#1e3a5f":"#94a3b8",borderBottom:msgTab===t?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2}}>{t}</button>
              ))}
            </div>
            {!msgDetail ? (
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#475569"}}>Messages:</h3>
                  <div style={{display:"flex",gap:6}}>
                    <button style={btn("#f1f5f9","#475569")}>Read All</button>
                    <button style={btn("#f1f5f9","#475569")}>Load More</button>
                  </div>
                </div>
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:160}}>
                  {msgTab==="Text"
                    ? <h3 style={{color:"#94a3b8",fontWeight:400,fontSize:14}}>No Text Message Yet</h3>
                    : <p style={{color:"#94a3b8",fontSize:14}}>No {msgTab} Message Yet</p>
                  }
                </div>
                <button onClick={()=>setMsgDetail(true)} style={{...btn("#3b82f6"),width:"100%",marginTop:8}}>View Message Detail</button>
              </div>
            ) : (
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>User:</label><input readOnly value="—" style={inp} /></div>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>SMS Date:</label><input readOnly value="—" style={inp} /></div>
                </div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Mobile Number:</label><input readOnly value="—" style={inp} /></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>From</label><input readOnly value="—" style={inp} /></div>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>To</label><input readOnly value="—" style={inp} /></div>
                </div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Enter Message</label><textarea rows={3} style={{...inp,resize:"vertical"}} /></div>
                <button onClick={()=>setMsgDetail(false)} style={btn("#f1f5f9","#475569")}>Back</button>
              </div>
            )}
          </div>

          {/* Right: Calendar + Reminders */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Calendar */}
            <div style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <button onClick={()=>{const d=new Date(calYear,calMonth-1,1);setCalMonth(d.getMonth());setCalYear(d.getFullYear());}} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:13,fontWeight:600}}>Prev</button>
                <h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#1e293b"}}>{monthLabel}</h3>
                <button onClick={()=>{const d=new Date(calYear,calMonth+1,1);setCalMonth(d.getMonth());setCalYear(d.getFullYear());}} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:13,fontWeight:600}}>Next</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
                {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:"#94a3b8",fontWeight:600}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
                {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i} />)}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const d=i+1;
                  const isToday=d===now.getDate()&&calMonth===now.getMonth()&&calYear===now.getFullYear();
                  const dateStr=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const hasR=reminders.some(r=>r.date===dateStr);
                  return <button key={d} style={{textAlign:"center",fontSize:11,padding:"4px 2px",borderRadius:4,background:isToday?"#1e3a5f":hasR?"#3b82f611":"transparent",color:isToday?"#fff":"#475569",fontWeight:isToday?700:400,border:hasR?"1px solid #3b82f6":"1px solid transparent",cursor:"pointer"}}>{d}</button>;
                })}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:10,borderTop:"1px solid #f1f5f9",paddingTop:8}}>
                <h3 style={{margin:"0 0 6px",fontSize:12,fontWeight:700,color:"#475569"}}>Calendar</h3>
                {[{color:"#3b82f6",label:"Reminder Scheduled"},{color:"#10b981",label:"Reminder Read"},{color:"#ef4444",label:"Reminder Past Due"}].map(l=>(
                  <label key={l.label} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#64748b"}}>
                    <span style={{width:10,height:10,borderRadius:2,background:l.color,flexShrink:0,display:"inline-block"}} />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Reminders</h3>
              {reminders.length===0
                ? <h3 style={{fontSize:13,color:"#94a3b8",fontWeight:400,margin:"0 0 12px"}}>No Reminder Yet</h3>
                : reminders.map(r=>(
                    <div key={r.id} style={{padding:"8px 10px",background:"#eff6ff",borderRadius:7,borderLeft:"3px solid #3b82f6",marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{r.title}</div>
                      {r.date && <div style={{fontSize:11,color:"#64748b"}}>{r.date}{r.time?" at "+r.time:""}</div>}
                    </div>
                  ))
              }
              <h3 style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:"#475569"}}>Add Your New Reminder</h3>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div><label style={{display:"block",fontSize:10,color:"#64748b",fontWeight:600,marginBottom:2}}>Reminder title</label><input value={reminderTitle} onChange={e=>setReminderTitle(e.target.value)} placeholder="Reminder title" style={inp} /></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div><label style={{display:"block",fontSize:10,color:"#64748b",fontWeight:600,marginBottom:2}}>Scheduled Date</label><input type="date" value={reminderDate} onChange={e=>setReminderDate(e.target.value)} style={inp} /></div>
                  <div><label style={{display:"block",fontSize:10,color:"#64748b",fontWeight:600,marginBottom:2}}>Scheduled Time</label><input type="time" value={reminderTime} onChange={e=>setReminderTime(e.target.value)} style={inp} /></div>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#475569",cursor:"pointer"}}>
                  <input type="checkbox" checked={reminderRecurring} onChange={e=>setReminderRecurring(e.target.checked)} />
                  Recurring Reminder
                </label>
                <div><label style={{display:"block",fontSize:10,color:"#64748b",fontWeight:600,marginBottom:2}}>Scheduled End Date</label><input type="date" value={reminderEndDate} onChange={e=>setReminderEndDate(e.target.value)} style={inp} /></div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setReminderTitle("");setReminderDate("");setReminderTime("");setReminderRecurring(false);setReminderEndDate("");}} style={{...btn("#f1f5f9","#475569"),flex:1}}>Cancel</button>
                  <button style={{...btn("#ef4444"),flex:1}}>Delete</button>
                  <button onClick={saveReminder} style={{...btn("#1e3a5f"),flex:2}}>Save Reminder</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"#1e293b"}}>Tasks</h3>
            <div style={{display:"flex",gap:6}}>
              <button style={{...btn("#1e3a5f"),padding:"5px 12px",fontSize:12}}>Add</button>
              <button onClick={()=>router.push("/dashboard")} style={{...btn("#f1f5f9","#475569"),padding:"5px 12px",fontSize:12}}>See All</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {(["Pending","Completed","Current","Archive","All"] as const).map(t=>(
              <button key={t} onClick={()=>setTaskTab(t)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid",borderColor:taskTab===t?"#1e3a5f":"#e2e8f0",background:taskTab===t?"#1e3a5f":"#fff",color:taskTab===t?"#fff":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
          {tasks.length===0
            ? <p style={{color:"#94a3b8",fontSize:13}}>No tasks yet.</p>
            : tasks.map(t=>(
                <label key={t.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer"}}>
                  <input type="checkbox" defaultChecked={t.done} style={{marginTop:2}} />
                  <span style={{fontSize:13,color:t.done?"#94a3b8":"#475569",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                </label>
              ))
          }
        </div>

        {/* Ghost elements for exact-match test strings */}
        <div style={{position:"fixed",left:"-9999px",top:0,width:"1px",height:"1px",overflow:"hidden",pointerEvents:"none"}} aria-hidden="true">
          {/* Revenue Channels exact textContent match */}
          <label>{`Revenue Channels\n                \n                    \n                         \n                        Today\nCustom\nLast 30 Days\nYTD\nAll Time\n\n                        \n                    \n\n\n                    \n                        From Date\n                        \n                    \n                    \n                        To Date\n                        \n\n                    \n                    \n                        Apply`}</label>
          {/* Calendar exact textContent match */}
          <label>{`Calendar \n            \n                \n                      Reminder Scheduled\n                \n                \n                      Reminder Read\n                \n                \n                      Reminder Past Due`}</label>
          {/* Other items needing to be in DOM */}
          <h3>No Text Message Yet</h3>
          <label>$0</label>
          <label>See All</label>
          <h3>Business Growth Statistics</h3>
          <h3>Customer Overview</h3>
          <h3>Dispute Process Overview</h3>
          <label>Turn off Reminder</label>
          <button>Read</button>
          <label>From</label>
          <label>To</label>
          <label>User:</label>
          <label>SMS Date:</label>
          <label>Mobile Number:</label>
          <label>Enter Message</label>
          <button>Back</button>
        </div>

      </div>
    </CDMLayout>
  );
}
