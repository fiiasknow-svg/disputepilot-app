"use client";
export const dynamic = "force-dynamic";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type RevFilter = "Today"|"Custom"|"Last 30 Days"|"YTD"|"All Time";
type TaskTab = "Pending"|"Completed"|"Current"|"Archive"|"All";
type TaskItem = {id:number,text:string,done:boolean,archived?:boolean};
type MessageItem = {id:number,tab:"Customer"|"Affiliate"|"Text",from:string,subject:string,date:string,read:boolean};

export default function Page() {
  const router = useRouter();
  const now = new Date();
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const taskSectionRef = useRef<HTMLDivElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [revFilter, setRevFilter] = useState<RevFilter>("All Time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueStatus, setRevenueStatus] = useState("Revenue range ready: All Time.");
  const [msgTab, setMsgTab] = useState<"Customer"|"Affiliate"|"Text">("Customer");
  const [msgDetail, setMsgDetail] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {id:1,tab:"Customer",from:"Taylor Client",subject:"Question about my dispute round",date:"2026-05-20",read:false},
    {id:2,tab:"Affiliate",from:"Referral Partner",subject:"New referral sent",date:"2026-05-19",read:false},
    {id:3,tab:"Text",from:"(555) 010-0199",subject:"Can you call me today?",date:"2026-05-18",read:false},
    {id:4,tab:"Customer",from:"Morgan Lee",subject:"Uploaded new documents",date:"2026-05-17",read:true},
    {id:5,tab:"Customer",from:"Jordan Smith",subject:"Portal login help",date:"2026-05-16",read:true},
  ]);
  const [messageLimit, setMessageLimit] = useState(1);
  const [messageStatus, setMessageStatus] = useState("Showing latest messages.");
  const [taskTab, setTaskTab] = useState<TaskTab>("Pending");
  const [reminders, setReminders] = useState<{id:number,title:string,date:string,time:string,recurring:boolean,endDate:string}[]>([]);
  const [selectedReminderId, setSelectedReminderId] = useState<number | null>(null);
  const [reminderStatus, setReminderStatus] = useState("Select a calendar day to schedule a reminder.");
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderRecurring, setReminderRecurring] = useState(false);
  const [reminderEndDate, setReminderEndDate] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadNote, setLeadNote] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [localLeads, setLocalLeads] = useState<{id:number,phone:string,email:string,note:string}[]>([]);
  const [searchStatus, setSearchStatus] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([
    {id:1,text:"Review new client applications",done:false},
    {id:2,text:"Send Round 2 dispute letters",done:false},
    {id:3,text:"Follow up on overdue invoices",done:true},
    {id:4,text:"Archive completed onboarding checklist",done:true,archived:true},
  ]);

  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthLabel = `${MONTHS[calMonth]} ${calYear}`;

  const currentMessages = messages.filter(m => m.tab === msgTab);
  const visibleMessages = currentMessages.slice(0, messageLimit);
  const visibleTasks = tasks.filter(t => {
    if (taskTab === "All") return true;
    if (taskTab === "Completed") return t.done && !t.archived;
    if (taskTab === "Pending") return !t.done && !t.archived;
    if (taskTab === "Current") return !t.done && !t.archived;
    return Boolean(t.archived);
  });

  function applyRevenueFilter() {
    if (revFilter === "Custom") {
      if (!fromDate || !toDate) {
        setRevenueStatus("Choose both From Date and To Date before applying a custom range.");
        return;
      }
      if (fromDate > toDate) {
        setRevenueStatus("Custom revenue range is invalid: From Date must be before To Date.");
        return;
      }
      setRevenueStatus(`Applied revenue range: Custom ${fromDate} through ${toDate}.`);
      return;
    }
    const suffix = fromDate || toDate ? ` using ${fromDate || "any start"} through ${toDate || "any end"}` : "";
    setRevenueStatus(`Applied revenue filter: ${revFilter}${suffix}.`);
  }

  function focusCustomerSearch() {
    searchSectionRef.current?.scrollIntoView({behavior:"smooth", block:"center"});
    searchInputRef.current?.focus();
    setSearchStatus("Customer search is ready. Enter a name, phone, or email.");
  }

  function openTaskSection() {
    setShowTaskForm(true);
    setTaskStatus("Task form ready. Add the next task below.");
    taskSectionRef.current?.scrollIntoView({behavior:"smooth", block:"center"});
    window.setTimeout(() => taskInputRef.current?.focus(), 0);
  }

  function runCustomerSearch() {
    const q = searchQ.trim();
    if (!q) {
      setSearchStatus("Enter a name, phone, or email before searching.");
      return;
    }
    setSearchStatus(`Searched for "${q}". No local customer match was found.`);
  }

  function clearCustomerSearch() {
    setSearchQ("");
    setSearchStatus("");
    searchInputRef.current?.focus();
  }

  function createLead() {
    if (!leadPhone.trim() && !leadEmail.trim()) {
      setLeadStatus("Enter at least a phone number or email before creating a lead.");
      return;
    }
    const lead = {id:Date.now(), phone:leadPhone.trim(), email:leadEmail.trim(), note:leadNote.trim()};
    setLocalLeads(prev => [lead, ...prev]);
    setLeadStatus(`Created local lead${lead.email ? ` for ${lead.email}` : lead.phone ? ` for ${lead.phone}` : ""}.`);
    setLeadPhone(""); setLeadEmail(""); setLeadNote("");
  }

  function markMessagesRead() {
    const unread = currentMessages.filter(m => !m.read).length;
    setMessages(prev => prev.map(m => m.tab === msgTab ? {...m, read:true} : m));
    setMessageStatus(unread ? `Marked ${unread} ${msgTab.toLowerCase()} message${unread === 1 ? "" : "s"} as read.` : `All ${msgTab.toLowerCase()} messages were already read.`);
  }

  function loadMoreMessages() {
    if (messageLimit >= currentMessages.length) {
      setMessageStatus(`All ${msgTab.toLowerCase()} messages loaded.`);
      return;
    }
    const nextLimit = Math.min(messageLimit + 2, currentMessages.length);
    setMessageLimit(nextLimit);
    setMessageStatus(`Loaded ${nextLimit} of ${currentMessages.length} ${msgTab.toLowerCase()} messages.`);
  }

  function selectCalendarDate(dateStr: string) {
    setSelectedDate(dateStr);
    setReminderDate(dateStr);
    setReminderStatus(`Selected ${dateStr}. Reminder scheduled date is ready.`);
    const reminder = reminders.find(r => r.date === dateStr);
    setSelectedReminderId(reminder?.id ?? null);
  }

  function saveReminder() {
    if (!reminderTitle.trim()) {
      setReminderStatus("Enter a reminder title before saving.");
      return;
    }
    const reminder = {id:Date.now(), title:reminderTitle.trim(), date:reminderDate, time:reminderTime, recurring:reminderRecurring, endDate:reminderEndDate};
    setReminders(r => [...r, reminder]);
    setSelectedReminderId(reminder.id);
    setReminderStatus(`Saved reminder "${reminder.title}"${reminder.date ? ` for ${reminder.date}` : ""}.`);
    setReminderTitle(""); setReminderDate(""); setReminderTime(""); setReminderRecurring(false); setReminderEndDate("");
  }

  function deleteReminder() {
    if (selectedReminderId === null) {
      setReminderStatus("Select a reminder before deleting.");
      return;
    }
    const reminder = reminders.find(r => r.id === selectedReminderId);
    setReminders(r => r.filter(item => item.id !== selectedReminderId));
    setSelectedReminderId(null);
    setReminderStatus(`Deleted reminder${reminder ? ` "${reminder.title}"` : ""}.`);
  }

  function addTask() {
    const text = newTaskText.trim();
    if (!text) {
      setTaskStatus("Enter a task title before adding.");
      return;
    }
    setTasks(prev => [{id:Date.now(), text, done:false}, ...prev]);
    setNewTaskText("");
    setShowTaskForm(false);
    setTaskTab("All");
    setTaskStatus(`Added task "${text}".`);
  }

  function toggleTask(id: number, done: boolean) {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done, archived:false} : t));
    const task = tasks.find(t => t.id === id);
    setTaskStatus(`${done ? "Completed" : "Reopened"} task${task ? ` "${task.text}"` : ""}.`);
  }

  const inp: React.CSSProperties = {width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,boxSizing:"border-box",outline:"none"};
  const btn = (bg:string,color="#fff"): React.CSSProperties => ({background:bg,color,border:"none",borderRadius:6,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13});

  return (
    <CDMLayout>
      <div className="cdm-dashboard-page" style={{padding:24,maxWidth:1400}}>

        {/* Quick action buttons */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>router.push("/leads")} style={btn("#1e3a5f")}>Add Quick Lead</button>
          <button onClick={()=>router.push("/clients")} style={btn("#3b82f6")}>Add New Customer</button>
          <button onClick={focusCustomerSearch} style={btn("#8b5cf6")}>Customer Search</button>
          <button onClick={()=>router.push("/academy/credit-repair")} style={btn("#f59e0b")}>Training Videos</button>
        </div>

        {/* CDM stat cards */}
        <div className="cdm-dashboard-stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {([
            {label:"Total Customers",val:"1",color:"#1e3a5f",icon:"CU"},
            {label:"Total Current Leads",val:"0",color:"#8b5cf6",icon:"LD"},
            {label:"Total Bureau Disputes",val:"0",color:"#3b82f6",icon:"BD"},
            {label:"Total Deletion",val:"0",color:"#10b981",icon:"DL"},
          ] as const).map(s=>(
            <div key={s.label} style={{background:"#fff",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderTop:`3px solid ${s.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <h3 style={{margin:0,fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".04em"}}>{s.label}</h3>
                  <p style={{margin:"6px 0 0",fontSize:28,fontWeight:800,color:s.color}}>{s.val}</p>
                </div>
                <span style={{fontSize:12,fontWeight:800,color:s.color,border:`1px solid ${s.color}`,borderRadius:6,padding:"4px 6px",lineHeight:1}}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Channels + Training */}
        <div className="cdm-dashboard-revenue-grid" style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,marginBottom:20}}>
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
                <button onClick={applyRevenueFilter} style={btn("#1e3a5f")}>Apply</button>
              </div>
            )}
            {revFilter!=="Custom" && (
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>From Date</label><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12,width:"100%"}} /></div>
                <div style={{flex:1}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>To Date</label><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",fontSize:12,width:"100%"}} /></div>
                <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={applyRevenueFilter} style={btn("#1e3a5f")}>Apply</button></div>
              </div>
            )}
            <p style={{margin:"0 0 12px",fontSize:12,color:revenueStatus.includes("invalid")||revenueStatus.includes("Choose")?"#b45309":"#2563eb",fontWeight:600}}>{revenueStatus}</p>
            <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:10,padding:"20px 24px",textAlign:"center"}}>
              <label style={{display:"block",fontSize:11,color:"rgba(255,255,255,.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>Total Revenue</label>
              <p style={{margin:"8px 0 0",fontSize:36,fontWeight:800,color:"#10b981"}}>$0</p>
            </div>
            <div className="cdm-dashboard-revenue-cards" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:12}}>
              {[
                ["Credit Cards","$0"],
                ["Customer Checks","$0"],
                ["Customer Cash","$0"],
                ["Paid Invoices","$0"],
                ["Past due Invoices","$0"],
                ["Commissions Due","$0"],
              ].map(([label,value])=>(
                <div key={label} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10}}>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:700}}>{label}</div>
                  <div style={{fontSize:18,color:"#1e293b",fontWeight:800,marginTop:3}}>{value}</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>0% From Last 30 Days</div>
                </div>
              ))}
            </div>
          </div>

          {/* Training links */}
          <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Training &amp; Resources</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {label:"Claim Your Free Gifts",href:"/billing"},
                {label:"CDM Credit Boss Skool NEW",href:"/academy"},
                {label:"Your First Dispute",href:"/disputes"},
                {label:"Full Walkthrough",href:"/academy"},
                {label:"1 to 1",href:"https://clientdisputemanager.com/coaching", external:true},
                {label:"Group Training",href:"/academy"},
                {label:"Free Mastermind",href:"/partner-resources/community"},
                {label:"Help Center",href:"https://help.clientdisputemanager.com", external:true},
                {label:"Task",action:openTaskSection},
                {label:"Start-Run-Grow Training",href:"/get-customers/start-run-grow"},
              ].map(l=> "action" in l ? (
                <button key={l.label} type="button" onClick={l.action} style={{display:"block",width:"100%",textAlign:"left",padding:"7px 10px",background:"#f8fafc",border:"none",borderRadius:6,textDecoration:"none",color:"#1e293b",fontSize:12,fontWeight:500,cursor:"pointer"}}>{l.label}</button>
              ) : (
                <a key={l.label} href={l.href} target={"external" in l && l.external ? "_blank" : undefined} rel={"external" in l && l.external ? "noreferrer" : undefined} style={{display:"block",padding:"7px 10px",background:"#f8fafc",borderRadius:6,textDecoration:"none",color:"#1e293b",fontSize:12,fontWeight:500}}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="cdm-dashboard-overview-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <section style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700,color:"#1e293b"}}>Customer Overview</h3>
            <div className="cdm-dashboard-mini-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[
                ["1","Active Clients"],
                ["1","No Portal"],
                ["0","Current Leads"],
                ["0","Follow Up"],
                ["1","Past Due"],
                ["0","Completed"],
                ["0","Cancelled"],
              ].map(([value,label])=>(
                <div key={label} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:"#1e3a5f"}}>{value}</div>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:700}}>{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700,color:"#1e293b"}}>Dispute Process Overview</h3>
            <div className="cdm-dashboard-mini-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[
                ["0","Bureau Disputes"],
                ["0","Bureau Items Repaired"],
                ["0","Bureau Items Deleted"],
                ["0","Accounts In-Dispute"],
                ["0","Negative Accounts"],
                ["0","Creditor In-Dispute"],
                ["0","Collector In-Dispute"],
              ].map(([value,label])=>(
                <div key={label} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:"#1e3a5f"}}>{value}</div>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:700}}>{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Customer Search + Quick Lead + Messages + Calendar/Reminders */}
        <div className="cdm-dashboard-workflow-grid" style={{display:"grid",gridTemplateColumns:"260px 1fr 300px",gap:16,marginBottom:20}}>

          {/* Left: Search + Quick Lead */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div ref={searchSectionRef} style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Search Your Customer Here</h3>
              <input ref={searchInputRef} value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Name, phone, email..." style={{...inp,marginBottom:8}} />
              <div style={{display:"flex",gap:6}}>
                <button onClick={runCustomerSearch} style={{...btn("#1e3a5f"),flex:1,padding:"7px"}}>Search</button>
                <button onClick={clearCustomerSearch} style={{...btn("#f1f5f9","#475569"),flex:1,padding:"7px"}}>Clear</button>
              </div>
              {searchStatus && <p style={{margin:"8px 0 0",fontSize:12,color:searchStatus.startsWith("Enter")?"#b45309":"#2563eb",fontWeight:600}}>{searchStatus}</p>}
            </div>

            <div style={{background:"#fff",borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
              <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Quick Lead Generation</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Phone</label><input value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="Phone" style={inp} /></div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Email</label><input value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} placeholder="Email" style={inp} /></div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Note</label><textarea value={leadNote} onChange={e=>setLeadNote(e.target.value)} rows={2} style={{...inp,resize:"vertical"}} /></div>
                <button onClick={createLead} style={btn("#8b5cf6")}>Create</button>
              </div>
              {leadStatus && <p style={{margin:"10px 0 0",fontSize:12,color:leadStatus.startsWith("Enter")?"#b45309":"#2563eb",fontWeight:600}}>{leadStatus}</p>}
              {localLeads.length > 0 && (
                <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                  {localLeads.map(lead => (
                    <div key={lead.id} style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:7,padding:"7px 9px",fontSize:12,color:"#4c1d95"}}>
                      Local lead: {lead.email || lead.phone}{lead.note ? ` - ${lead.note}` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Messages */}
          <div style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)",display:"flex",flexDirection:"column"}}>
            <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700,color:"#1e293b"}}>Customer/Affiliate/Text Messages</h3>
            <div style={{display:"flex",gap:0,borderBottom:"2px solid #f1f5f9",marginBottom:16}}>
              {(["Customer","Affiliate","Text"] as const).map(t=>(
                <button key={t} onClick={()=>{setMsgTab(t);setMsgDetail(false);setMessageLimit(1);setMessageStatus(`Showing latest ${t.toLowerCase()} messages.`);}} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:msgTab===t?700:500,color:msgTab===t?"#1e3a5f":"#94a3b8",borderBottom:msgTab===t?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2}}>{t}</button>
              ))}
            </div>
            {!msgDetail ? (
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#475569"}}>Messages:</h3>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={markMessagesRead} style={btn("#f1f5f9","#475569")}>Read All</button>
                    <button onClick={loadMoreMessages} style={btn("#f1f5f9","#475569")}>Load More</button>
                  </div>
                </div>
                <p style={{margin:"0 0 10px",fontSize:12,color:"#2563eb",fontWeight:600}}>{messageStatus}</p>
                <p style={{margin:"0 0 10px",fontSize:12,color:"#94a3b8"}}>There is no new message yet. Please click on below "See All" button for more info.</p>
                <div style={{flex:1,minHeight:160}}>
                  {visibleMessages.length === 0
                    ? (msgTab==="Text"
                      ? <h3 style={{color:"#94a3b8",fontWeight:400,fontSize:14}}>No Text Message Yet</h3>
                      : <p style={{color:"#94a3b8",fontSize:14}}>There is no new message yet. Please click on below "See All" button for more info.</p>)
                    : visibleMessages.map(m => (
                      <div key={m.id} style={{padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:7,marginBottom:6,background:m.read?"#f8fafc":"#eff6ff"}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                          <strong style={{fontSize:12,color:"#1e293b"}}>{m.from}</strong>
                          <span style={{fontSize:11,color:m.read?"#64748b":"#2563eb",fontWeight:700}}>{m.read?"Read":"Unread"}</span>
                        </div>
                        <div style={{fontSize:12,color:"#475569"}}>{m.subject}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{m.date}</div>
                      </div>
                    ))
                  }
                </div>
                <button onClick={()=>setMsgDetail(true)} style={{...btn("#3b82f6"),width:"100%",marginTop:8}}>View Message Detail</button>
              </div>
            ) : (
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>User:</label><input readOnly value="-" style={inp} /></div>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>SMS Date:</label><input readOnly value="-" style={inp} /></div>
                </div>
                <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>Mobile Number:</label><input readOnly value="-" style={inp} /></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>From</label><input readOnly value="-" style={inp} /></div>
                  <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:2}}>To</label><input readOnly value="-" style={inp} /></div>
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
                  const isSelected=selectedDate===dateStr;
                  return <button key={d} onClick={()=>selectCalendarDate(dateStr)} aria-pressed={isSelected} style={{textAlign:"center",fontSize:11,padding:"4px 2px",borderRadius:4,background:isSelected?"#f59e0b":isToday?"#1e3a5f":hasR?"#3b82f611":"transparent",color:isSelected||isToday?"#fff":"#475569",fontWeight:isSelected||isToday?700:400,border:isSelected?"1px solid #b45309":hasR?"1px solid #3b82f6":"1px solid transparent",cursor:"pointer"}}>{d}{isSelected ? " selected" : ""}</button>;
                })}
              </div>
              {selectedDate && <p style={{margin:"8px 0 0",fontSize:12,color:"#2563eb",fontWeight:600}}>Selected date: {selectedDate}</p>}
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
              <p style={{margin:"0 0 10px",fontSize:12,color:reminderStatus.startsWith("Enter")||reminderStatus.startsWith("Select a reminder")?"#b45309":"#2563eb",fontWeight:600}}>{reminderStatus}</p>
              {reminders.length===0
                ? (
                    <div style={{margin:"0 0 12px"}}>
                      <h3 style={{fontSize:13,color:"#94a3b8",fontWeight:400,margin:"0 0 4px"}}>No Reminder Yet</h3>
                      <p style={{fontSize:13,color:"#94a3b8",margin:0}}>There is no new reminder yet. Please click on below "See All" button for more info.</p>
                    </div>
                  )
                : reminders.map(r=>(
                    <button key={r.id} onClick={()=>{setSelectedReminderId(r.id);setReminderStatus(`Selected reminder "${r.title}".`);}} style={{width:"100%",textAlign:"left",padding:"8px 10px",background:selectedReminderId===r.id?"#dbeafe":"#eff6ff",borderRadius:7,border:selectedReminderId===r.id?"1px solid #2563eb":"1px solid transparent",borderLeft:"3px solid #3b82f6",marginBottom:6,cursor:"pointer"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{r.title}</div>
                      {r.date && <div style={{fontSize:11,color:"#64748b"}}>{r.date}{r.time?" at "+r.time:""}</div>}
                    </button>
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
                  <button onClick={()=>{setReminderTitle("");setReminderDate("");setReminderTime("");setReminderRecurring(false);setReminderEndDate("");setReminderStatus("Reminder form cleared.");}} style={{...btn("#f1f5f9","#475569"),flex:1}}>Cancel</button>
                  <button onClick={deleteReminder} disabled={selectedReminderId === null} style={{...btn(selectedReminderId === null ? "#fecaca" : "#ef4444"),flex:1,cursor:selectedReminderId === null ? "not-allowed" : "pointer"}}>Delete</button>
                  <button onClick={saveReminder} style={{...btn("#1e3a5f"),flex:2}}>Save Reminder</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div id="tasks" ref={taskSectionRef} tabIndex={-1} style={{background:"#fff",borderRadius:10,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"#1e293b"}}>Tasks</h3>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setShowTaskForm(o=>!o);setTaskStatus("Task form ready.");}} style={{...btn("#1e3a5f"),padding:"5px 12px",fontSize:12}}>Add</button>
              <button onClick={()=>router.push("/dashboard")} style={{...btn("#f1f5f9","#475569"),padding:"5px 12px",fontSize:12}}>See All</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {(["Pending","Completed","Current","Archive","All"] as const).map(t=>(
              <button key={t} onClick={()=>setTaskTab(t)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid",borderColor:taskTab===t?"#1e3a5f":"#e2e8f0",background:taskTab===t?"#1e3a5f":"#fff",color:taskTab===t?"#fff":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
          {showTaskForm && (
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input ref={taskInputRef} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} placeholder="Task title" style={{...inp,flex:1}} />
              <button onClick={addTask} style={btn("#10b981")}>Save Task</button>
            </div>
          )}
          {taskStatus && <p style={{margin:"0 0 10px",fontSize:12,color:taskStatus.startsWith("Enter")?"#b45309":"#2563eb",fontWeight:600}}>{taskStatus}</p>}
          {visibleTasks.length===0
            ? <p style={{color:"#94a3b8",fontSize:13}}>No tasks yet.</p>
            : visibleTasks.map(t=>(
                <label key={t.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer"}}>
                  <input type="checkbox" checked={t.done} onChange={e=>toggleTask(t.id, e.target.checked)} style={{marginTop:2}} />
                  <span style={{fontSize:13,color:t.done?"#94a3b8":"#475569",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                </label>
              ))
          }
          <p style={{color:"#94a3b8",fontSize:13,margin:"12px 0 0"}}>There is no new message yet. You can add Tasks from below form.</p>
        </div>

      </div>
    </CDMLayout>
  );
}
