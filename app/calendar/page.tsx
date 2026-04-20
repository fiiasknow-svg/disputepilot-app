"use client";
import { useState, useEffect, useRef } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EVENT_COLORS: Record<string,string> = {
  reminder:"#f59e0b", appointment:"#3b82f6", followup:"#8b5cf6",
  deadline:"#ef4444", other:"#10b981", lead:"#06b6d4", invoice:"#f97316", dispute:"#dc2626",
};
const RECURRENCE = ["none","daily","weekly","monthly","yearly"];
const REMINDER_OPTS = ["none","15 min before","1 hour before","1 day before","1 week before"];
const AGENTS = ["Alice Johnson","Bob Smith","Carol Davis","David Lee","Eve Martinez"];
const HOURS = Array.from({length:24},(_,i)=>{ const h=i%12||12; return `${h}:00 ${i<12?"AM":"PM"}`; });

type ViewType = "month"|"week"|"day"|"agenda";

function pad(n: number) { return String(n).padStart(2,"0"); }
function dateStr(y:number,m:number,d:number) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function fmtDate(iso: string) { return new Date(iso+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); }
function fmtTime(t: string) { if(!t) return ""; const [h,m]=t.split(":").map(Number); const ap=h<12?"AM":"PM"; return `${h%12||12}:${pad(m)} ${ap}`; }
function isWeekend(dow: number) { return dow===0||dow===6; }

export default function Page() {
  const today = new Date();
  const [view, setView] = useState<ViewType>("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(dateStr(today.getFullYear(),today.getMonth(),today.getDate()));
  const [events, setEvents] = useState<any[]>([]);
  const [autoEvents, setAutoEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any|null>(null);
  const [saving, setSaving] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<string|null>(null);
  const EMPTY_FORM = { title:"", description:"", date:selectedDate, start_time:"09:00", end_time:"10:00", all_day:true, type:"reminder", client_id:"", assigned_agent:"", location:"", recurrence:"none", reminder:"none", color:"" };
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();

  async function load() {
    const [evts, cli, leads, inv, disp] = await Promise.all([
      supabase.from("calendar_events").select("*").order("date").order("start_time"),
      supabase.from("clients").select("id,first_name,last_name,dob"),
      supabase.from("leads").select("id,first_name,last_name,follow_up_date").not("follow_up_date","is",null),
      supabase.from("invoices").select("id,amount,due_date,status,clients(first_name,last_name)").eq("status","pending").not("due_date","is",null),
      supabase.from("disputes").select("id,account_name,bureau,status").neq("status","resolved"),
    ]);
    setEvents(evts.data||[]);
    setClients(cli.data||[]);
    // Build auto-events
    const auto: any[] = [];
    (leads.data||[]).forEach((l:any)=>{ if(l.follow_up_date) auto.push({ id:`lead-${l.id}`, title:`Follow-up: ${l.first_name} ${l.last_name}`, date:l.follow_up_date, type:"lead", auto:true, color:EVENT_COLORS.lead }); });
    (inv.data||[]).forEach((i:any)=>{ if(i.due_date) auto.push({ id:`inv-${i.id}`, title:`Invoice due: ${i.clients?.first_name||""} ${i.clients?.last_name||""} ($${i.amount||0})`, date:i.due_date, type:"invoice", auto:true, color:EVENT_COLORS.invoice }); });
    // Client birthdays
    (cli.data||[]).forEach((c:any)=>{ if(c.dob) { const bd=new Date(c.dob); const thisYear=new Date(`${today.getFullYear()}-${pad(bd.getMonth()+1)}-${pad(bd.getDate())}`); auto.push({ id:`bday-${c.id}`, title:`🎂 Birthday: ${c.first_name} ${c.last_name}`, date:thisYear.toISOString().slice(0,10), type:"reminder", auto:true, color:"#ec4899" }); } });
    setAutoEvents(auto);
  }

  useEffect(()=>{ load(); },[]);

  // All events combined
  const allEvents = [...events, ...autoEvents];

  function eventsForDate(d: string) {
    let out = allEvents.filter(e=>e.date===d||e.date?.startsWith(d));
    if(typeFilter!=="all") out=out.filter(e=>e.type===typeFilter);
    if(agentFilter!=="all") out=out.filter(e=>e.assigned_agent===agentFilter);
    if(search) out=out.filter(e=>e.title?.toLowerCase().includes(search.toLowerCase())||e.description?.toLowerCase().includes(search.toLowerCase()));
    return out;
  }

  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(dateStr(today.getFullYear(),today.getMonth(),today.getDate())); }
  function prevPeriod() {
    if(view==="month"||view==="agenda") { month===0?( setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1); }
    else if(view==="week") { const d=new Date(selectedDate); d.setDate(d.getDate()-7); setSelectedDate(d.toISOString().slice(0,10)); setYear(d.getFullYear()); setMonth(d.getMonth()); }
    else { const d=new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().slice(0,10)); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  }
  function nextPeriod() {
    if(view==="month"||view==="agenda") { month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1); }
    else if(view==="week") { const d=new Date(selectedDate); d.setDate(d.getDate()+7); setSelectedDate(d.toISOString().slice(0,10)); setYear(d.getFullYear()); setMonth(d.getMonth()); }
    else { const d=new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().slice(0,10)); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  }

  function navLabel() {
    if(view==="month"||view==="agenda") return `${MONTHS[month]} ${year}`;
    if(view==="day") return fmtDate(selectedDate);
    // week
    const d=new Date(selectedDate+"T12:00:00");
    const dow=d.getDay();
    const start=new Date(d); start.setDate(d.getDate()-dow);
    const end=new Date(start); end.setDate(start.getDate()+6);
    return `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${end.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
  }

  function getWeekDates() {
    const d=new Date(selectedDate+"T12:00:00"); const dow=d.getDay();
    return Array.from({length:7},(_,i)=>{ const x=new Date(d); x.setDate(d.getDate()-dow+i); return x.toISOString().slice(0,10); });
  }

  function openAdd(date?: string) {
    setEditingEvent(null);
    setForm({...EMPTY_FORM, date:date||selectedDate});
    setShowForm(true);
  }
  function openEdit(e: any) {
    if(e.auto) return; // can't edit auto-events
    setEditingEvent(e);
    setForm({ title:e.title||"", description:e.description||"", date:e.date||"", start_time:e.start_time||"09:00", end_time:e.end_time||"10:00", all_day:e.all_day!==false, type:e.type||"reminder", client_id:e.client_id||"", assigned_agent:e.assigned_agent||"", location:e.location||"", recurrence:e.recurrence||"none", reminder:e.reminder||"none", color:e.color||"" });
    setShowForm(true);
  }

  async function save() {
    if(!form.title||!form.date) return;
    setSaving(true);
    const payload={...form, color:form.color||(EVENT_COLORS[form.type]||"#3b82f6")};
    if(editingEvent) await supabase.from("calendar_events").update(payload).eq("id",editingEvent.id);
    else await supabase.from("calendar_events").insert([payload]);
    setSaving(false); setShowForm(false); setEditingEvent(null); setForm({...EMPTY_FORM});
    load();
  }

  async function deleteEvent(id: string) {
    await supabase.from("calendar_events").delete().eq("id",id);
    setEvents(e=>e.filter(x=>x.id!==id));
  }

  function exportIcal() {
    const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//DisputePilot//Calendar//EN"];
    events.forEach(e=>{
      lines.push("BEGIN:VEVENT",`DTSTART:${e.date?.replace(/-/g,"")}T${(e.start_time||"090000").replace(/:/g,"")}00`,`DTEND:${e.date?.replace(/-/g,"")}T${(e.end_time||"100000").replace(/:/g,"")}00`,`SUMMARY:${e.title||""}`,`DESCRIPTION:${e.description||""}`,`UID:${e.id}@disputepilot`,"END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob=new Blob([lines.join("\r\n")],{type:"text/calendar"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="calendar.ics"; a.click();
  }

  function isToday(d: string) { return d===dateStr(today.getFullYear(),today.getMonth(),today.getDate()); }
  function isPast(d: string) { return d<dateStr(today.getFullYear(),today.getMonth(),today.getDate()); }

  const evtChip = (e: any, compact=false) => {
    const color=e.color||(EVENT_COLORS[e.type]||"#94a3b8");
    return (
      <div key={e.id}
        onClick={ev=>{ev.stopPropagation(); openEdit(e);}}
        onMouseEnter={()=>setHoveredEvent(e.id)}
        onMouseLeave={()=>setHoveredEvent(null)}
        style={{ position:"relative", fontSize:compact?10:11, background:color+"22", color, borderLeft:`3px solid ${color}`, borderRadius:3, padding:compact?"1px 4px":"2px 5px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:e.auto?"default":"pointer", opacity:e.auto?0.85:1 }}>
        {!form.all_day&&e.start_time && <span style={{ opacity:0.7, marginRight:3 }}>{fmtTime(e.start_time)}</span>}
        {e.title}
        {hoveredEvent===e.id && !compact && (
          <div style={{ position:"absolute", top:"100%", left:0, zIndex:200, background:"#1e293b", color:"#fff", borderRadius:7, padding:"8px 12px", fontSize:12, minWidth:180, boxShadow:"0 4px 16px rgba(0,0,0,0.2)", pointerEvents:"none" }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>{e.title}</div>
            {e.start_time&&!e.all_day&&<div style={{ opacity:0.7 }}>{fmtTime(e.start_time)}{e.end_time?` – ${fmtTime(e.end_time)}`:""}</div>}
            {e.location&&<div style={{ opacity:0.7 }}>📍 {e.location}</div>}
            {e.description&&<div style={{ opacity:0.7, marginTop:4 }}>{e.description}</div>}
            {e.auto&&<div style={{ color:"#06b6d4", marginTop:4, fontSize:11 }}>Auto-imported</div>}
          </div>
        )}
      </div>
    );
  };

  // Sidebar upcoming: next 30 days
  const upcomingFiltered = (() => {
    const next30=new Date(); next30.setDate(next30.getDate()+30);
    const from=dateStr(today.getFullYear(),today.getMonth(),today.getDate());
    const to=next30.toISOString().slice(0,10);
    let out=allEvents.filter(e=>e.date>=from&&e.date<=to);
    if(typeFilter!=="all") out=out.filter(e=>e.type===typeFilter);
    if(search) out=out.filter(e=>e.title?.toLowerCase().includes(search.toLowerCase()));
    return out.sort((a,b)=>a.date.localeCompare(b.date));
  })();

  // Agenda: next 60 days grouped by date
  const agendaDates = (() => {
    const dates: Record<string,any[]> = {};
    const from=dateStr(year,month,1);
    const dEnd=new Date(year,month+1,0);
    const to=dEnd.toISOString().slice(0,10);
    allEvents.filter(e=>e.date>=from&&e.date<=to).forEach(e=>{
      if(!dates[e.date]) dates[e.date]=[];
      dates[e.date].push(e);
    });
    return Object.entries(dates).sort(([a],[b])=>a.localeCompare(b));
  })();

  // Week view dates
  const weekDates = getWeekDates();

  const inp: React.CSSProperties = { width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, boxSizing:"border-box" };
  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:3 };

  return (
    <CDMLayout>
      <div style={{ padding:24, maxWidth:1300 }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0, color:"#1e293b" }}>Calendar</h1>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={exportIcal} style={{ padding:"8px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, color:"#475569" }}>📅 Export iCal</button>
            <button onClick={()=>openAdd()} style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, padding:"9px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>+ Add Event</button>
          </div>
        </div>

        {/* View + Nav controls */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          {/* View toggle */}
          <div style={{ display:"flex", border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
            {(["month","week","day","agenda"] as ViewType[]).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:"7px 16px", border:"none", cursor:"pointer", fontSize:13, fontWeight:view===v?700:500, background:view===v?"#1e3a5f":"#fff", color:view===v?"#fff":"#64748b", textTransform:"capitalize" }}>
                {v}
              </button>
            ))}
          </div>

          {/* Nav */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={goToday} style={{ padding:"7px 14px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Today</button>
            <button onClick={prevPeriod} style={{ padding:"7px 12px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontWeight:700, fontSize:15 }}>‹</button>
            <span style={{ fontSize:15, fontWeight:700, minWidth:220, textAlign:"center" }}>{navLabel()}</span>
            <button onClick={nextPeriod} style={{ padding:"7px 12px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer", fontWeight:700, fontSize:15 }}>›</button>
          </div>

          {/* Search + filters */}
          <div style={{ display:"flex", gap:8 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events…"
              style={{ padding:"7px 12px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, outline:"none", width:160 }} />
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, background:"#fff" }}>
              <option value="all">All Types</option>
              {Object.keys(EVENT_COLORS).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select value={agentFilter} onChange={e=>setAgentFilter(e.target.value)} style={{ padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:13, background:"#fff" }}>
              <option value="all">All Agents</option>
              {AGENTS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>

          {/* ── MAIN CALENDAR AREA ── */}
          <div>

            {/* MONTH VIEW */}
            {view==="month" && (
              <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid #f1f5f9" }}>
                  {DAYS.map(d=><div key={d} style={{ textAlign:"center", padding:"10px 0", fontSize:12, fontWeight:700, color:"#94a3b8" }}>{d}</div>)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
                  {Array.from({length:firstDay}).map((_,i)=>(
                    <div key={`e-${i}`} style={{ minHeight:100, background:"#f9fafb", borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9" }} />
                  ))}
                  {Array.from({length:daysInMonth}).map((_,i)=>{
                    const day=i+1; const ds=dateStr(year,month,day);
                    const dow=new Date(ds+"T12:00:00").getDay();
                    const dayEvts=eventsForDate(ds);
                    const sel=selectedDate===ds; const tod=isToday(ds); const past=isPast(ds);
                    return (
                      <div key={day} onClick={()=>{ setSelectedDate(ds); }}
                        style={{ minHeight:100, padding:"5px 6px", borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9", cursor:"pointer", background:sel?"#eff6ff":tod?"#fef9c3":isWeekend(dow)?"#fafafa":"#fff", position:"relative" }}
                        onDoubleClick={()=>openAdd(ds)}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:tod?800:500, width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:tod?"#1e3a5f":"transparent", color:tod?"#fff":past?"#94a3b8":"#374151" }}>
                            {day}
                          </span>
                          {dayEvts.length>0&&<span style={{ fontSize:9, color:"#94a3b8" }}>{dayEvts.length}</span>}
                        </div>
                        {dayEvts.slice(0,3).map(e=>evtChip(e))}
                        {dayEvts.length>3&&<div style={{ fontSize:10, color:"#94a3b8" }}>+{dayEvts.length-3} more</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {view==="week" && (
              <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"50px repeat(7,1fr)", borderBottom:"1px solid #f1f5f9" }}>
                  <div />
                  {weekDates.map(d=>{
                    const dd=new Date(d+"T12:00:00"); const tod=isToday(d);
                    return (
                      <div key={d} onClick={()=>setSelectedDate(d)} style={{ textAlign:"center", padding:"10px 4px", cursor:"pointer", background:tod?"#eff6ff":"transparent", borderRight:"1px solid #f1f5f9" }}>
                        <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>{DAYS[dd.getDay()]}</div>
                        <div style={{ fontSize:18, fontWeight:tod?800:500, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:tod?"#1e3a5f":"transparent", color:tod?"#fff":"#374151", margin:"0 auto" }}>{dd.getDate()}</div>
                        {eventsForDate(d).length>0&&<div style={{ fontSize:10, color:"#3b82f6", fontWeight:600 }}>{eventsForDate(d).length} event{eventsForDate(d).length!==1?"s":""}</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ maxHeight:500, overflowY:"auto" }}>
                  {Array.from({length:14},(_,h)=>h+7).map(h=>(
                    <div key={h} style={{ display:"grid", gridTemplateColumns:"50px repeat(7,1fr)", borderBottom:"1px solid #f8fafc", minHeight:52 }}>
                      <div style={{ padding:"4px 8px", fontSize:11, color:"#94a3b8", textAlign:"right", paddingTop:6 }}>{h===12?"12 PM":h<12?`${h} AM`:`${h-12} PM`}</div>
                      {weekDates.map(d=>{
                        const tod=isToday(d);
                        const slotEvts=eventsForDate(d).filter(e=>{ if(e.all_day) return false; const eh=parseInt(e.start_time?.split(":")?.[0]||"0"); return eh===h; });
                        const allDayEvts=h===7?eventsForDate(d).filter(e=>e.all_day):[];
                        return (
                          <div key={d} onClick={()=>{ setSelectedDate(d); openAdd(d); }}
                            style={{ borderLeft:"1px solid #f1f5f9", padding:"2px 3px", cursor:"pointer", background:tod?"#f0f9ff":"transparent" }}>
                            {allDayEvts.map(e=>evtChip(e,true))}
                            {slotEvts.map(e=>evtChip(e,true))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {view==="day" && (
              <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", background:isToday(selectedDate)?"#eff6ff":"#fff" }}>
                  <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>{fmtDate(selectedDate)}</h2>
                  {isToday(selectedDate)&&<span style={{ fontSize:12, color:"#3b82f6", fontWeight:600 }}>Today</span>}
                </div>
                {/* All-day events */}
                {eventsForDate(selectedDate).filter(e=>e.all_day).length>0&&(
                  <div style={{ padding:"8px 16px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" }}>
                    <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, marginBottom:4 }}>ALL DAY</div>
                    {eventsForDate(selectedDate).filter(e=>e.all_day).map(e=>evtChip(e))}
                  </div>
                )}
                <div style={{ maxHeight:520, overflowY:"auto" }}>
                  {Array.from({length:14},(_,h)=>h+7).map(h=>{
                    const slotEvts=eventsForDate(selectedDate).filter(e=>{ if(e.all_day) return false; const eh=parseInt(e.start_time?.split(":")?.[0]||"0"); return eh===h; });
                    return (
                      <div key={h} style={{ display:"grid", gridTemplateColumns:"64px 1fr", borderBottom:"1px solid #f8fafc", minHeight:56 }}>
                        <div style={{ padding:"6px 12px 0", fontSize:12, color:"#94a3b8", textAlign:"right", fontWeight:500 }}>{h===12?"12:00 PM":h<12?`${h}:00 AM`:`${h-12}:00 PM`}</div>
                        <div style={{ padding:"4px 8px", borderLeft:"1px solid #f1f5f9", cursor:"pointer" }} onClick={()=>openAdd(selectedDate)}>
                          {slotEvts.map(e=>(
                            <div key={e.id} onClick={ev=>{ev.stopPropagation();openEdit(e);}}
                              style={{ background:(e.color||EVENT_COLORS[e.type]||"#3b82f6")+"22", borderLeft:`4px solid ${e.color||EVENT_COLORS[e.type]||"#3b82f6"}`, borderRadius:5, padding:"6px 10px", marginBottom:4, cursor:e.auto?"default":"pointer" }}>
                              <div style={{ fontWeight:600, fontSize:13, color:"#1e293b" }}>{e.title}</div>
                              {e.start_time&&!e.all_day&&<div style={{ fontSize:11, color:"#64748b" }}>{fmtTime(e.start_time)}{e.end_time?` – ${fmtTime(e.end_time)}`:""}</div>}
                              {e.location&&<div style={{ fontSize:11, color:"#94a3b8" }}>📍 {e.location}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AGENDA VIEW */}
            {view==="agenda" && (
              <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                {agendaDates.length===0
                  ? <div style={{ padding:40, textAlign:"center", color:"#94a3b8" }}><div style={{ fontSize:32, marginBottom:8 }}>📅</div><div style={{ fontWeight:600 }}>No events this month</div><div style={{ fontSize:13 }}>Double-click a date or click + Add Event to get started.</div></div>
                  : agendaDates.map(([date,evts])=>(
                    <div key={date}>
                      <div style={{ padding:"10px 20px", background:"#f8fafc", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:isToday(date)?"#1e3a5f":"#1e293b" }}>{fmtDate(date)}</div>
                        {isToday(date)&&<span style={{ background:"#1e3a5f", color:"#fff", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700 }}>Today</span>}
                        {isPast(date)&&!isToday(date)&&<span style={{ background:"#ef4444"+"22", color:"#ef4444", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:700 }}>Past</span>}
                      </div>
                      {evts.map(e=>(
                        <div key={e.id} onClick={()=>openEdit(e)}
                          style={{ padding:"12px 20px", borderBottom:"1px solid #f8fafc", display:"flex", gap:12, alignItems:"flex-start", cursor:e.auto?"default":"pointer" }}>
                          <div style={{ width:12, height:12, borderRadius:3, background:e.color||EVENT_COLORS[e.type]||"#94a3b8", flexShrink:0, marginTop:3 }} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, fontSize:14 }}>{e.title}</div>
                            <div style={{ fontSize:12, color:"#64748b", marginTop:2, display:"flex", gap:12, flexWrap:"wrap" }}>
                              {!e.all_day&&e.start_time&&<span>🕐 {fmtTime(e.start_time)}{e.end_time?` – ${fmtTime(e.end_time)}`:""}</span>}
                              {e.location&&<span>📍 {e.location}</span>}
                              {e.assigned_agent&&<span>👤 {e.assigned_agent}</span>}
                              {e.auto&&<span style={{ color:"#06b6d4" }}>Auto-imported</span>}
                            </div>
                            {e.description&&<div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>{e.description}</div>}
                          </div>
                          <span style={{ background:(e.color||EVENT_COLORS[e.type]||"#94a3b8")+"22", color:e.color||EVENT_COLORS[e.type]||"#64748b", borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:600, textTransform:"capitalize", flexShrink:0 }}>{e.type}</span>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Selected day panel */}
            <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700 }}>{fmtDate(selectedDate)}</h3>
                <button onClick={()=>openAdd(selectedDate)} style={{ fontSize:12, background:"#1e3a5f", color:"#fff", border:"none", borderRadius:5, padding:"4px 10px", cursor:"pointer" }}>+ Add</button>
              </div>
              {eventsForDate(selectedDate).length===0
                ? <p style={{ padding:"12px 16px", color:"#94a3b8", fontSize:13, margin:0 }}>No events. Click + Add or double-click a cell.</p>
                : eventsForDate(selectedDate).map(e=>{
                  const color=e.color||EVENT_COLORS[e.type]||"#94a3b8";
                  return (
                    <div key={e.id} style={{ padding:"10px 14px", borderBottom:"1px solid #f8fafc", display:"flex", gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:color, marginTop:4, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{e.title}</div>
                        {!e.all_day&&e.start_time&&<div style={{ fontSize:11, color:"#64748b" }}>{fmtTime(e.start_time)}{e.end_time?` – ${fmtTime(e.end_time)}`:""}</div>}
                        {e.location&&<div style={{ fontSize:11, color:"#94a3b8" }}>📍 {e.location}</div>}
                        {e.description&&<div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{e.description}</div>}
                        {e.auto&&<div style={{ fontSize:10, color:"#06b6d4", marginTop:2 }}>Auto-imported</div>}
                      </div>
                      {!e.auto&&<button onClick={()=>deleteEvent(e.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:15, alignSelf:"flex-start" }}>×</button>}
                    </div>
                  );
                })}
            </div>

            {/* Upcoming 30 days */}
            <div style={{ background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9" }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700 }}>Upcoming (30 days) <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>({upcomingFiltered.length})</span></h3>
              </div>
              <div style={{ maxHeight:300, overflowY:"auto" }}>
                {upcomingFiltered.length===0
                  ? <p style={{ padding:"12px 16px", color:"#94a3b8", fontSize:13, margin:0 }}>No upcoming events.</p>
                  : upcomingFiltered.slice(0,20).map(e=>{
                    const color=e.color||EVENT_COLORS[e.type]||"#94a3b8";
                    const past=isPast(e.date)&&!isToday(e.date);
                    return (
                      <div key={e.id} onClick={()=>{ setSelectedDate(e.date); const d=new Date(e.date+"T12:00:00"); setYear(d.getFullYear()); setMonth(d.getMonth()); }}
                        style={{ padding:"8px 14px", borderBottom:"1px solid #f8fafc", display:"flex", gap:8, cursor:"pointer", opacity:past?0.6:1 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:color, marginTop:4, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{e.title}</div>
                          <div style={{ fontSize:11, color:"#94a3b8" }}>{fmtDate(e.date)}{!e.all_day&&e.start_time?` · ${fmtTime(e.start_time)}`:""}</div>
                        </div>
                        {past&&<span style={{ fontSize:9, color:"#ef4444", fontWeight:700 }}>PAST</span>}
                        {e.auto&&<span style={{ fontSize:9, color:"#06b6d4", fontWeight:700 }}>AUTO</span>}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ background:"#fff", borderRadius:10, padding:14, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:"#1e293b" }}>Event Types</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {Object.entries(EVENT_COLORS).map(([type,color])=>(
                  <div key={type} style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:color, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#475569", textTransform:"capitalize" }}>{type}</span>
                    <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8" }}>{allEvents.filter(e=>e.type===type).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ADD / EDIT EVENT MODAL ── */}
        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:28, width:520, maxHeight:"92vh", overflowY:"auto" }}>
              <h2 style={{ margin:"0 0 18px", fontSize:18, fontWeight:700 }}>{editingEvent?"Edit Event":"New Event"}</h2>

              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Title *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inp} placeholder="Event title…" />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp} />
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, fontWeight:600, marginBottom:2 }}>
                    <input type="checkbox" checked={form.all_day} onChange={e=>setForm(f=>({...f,all_day:e.target.checked}))} />
                    All day
                  </label>
                </div>
              </div>

              {!form.all_day && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div>
                    <label style={lbl}>Start Time</label>
                    <input type="time" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>End Time</label>
                    <input type="time" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))} style={inp} />
                  </div>
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={lbl}>Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ ...inp, background:"#fff" }}>
                    {["reminder","appointment","followup","deadline","other"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Color</label>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input type="color" value={form.color||EVENT_COLORS[form.type]||"#3b82f6"} onChange={e=>setForm(f=>({...f,color:e.target.value}))}
                      style={{ width:40, height:36, padding:2, border:"1px solid #e2e8f0", borderRadius:6, cursor:"pointer" }} />
                    <input value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{ ...inp, flex:1 }} placeholder="#3b82f6" />
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={lbl}>Linked Client</label>
                  <select value={form.client_id} onChange={e=>setForm(f=>({...f,client_id:e.target.value}))} style={{ ...inp, background:"#fff" }}>
                    <option value="">— None —</option>
                    {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Assigned To</label>
                  <select value={form.assigned_agent} onChange={e=>setForm(f=>({...f,assigned_agent:e.target.value}))} style={{ ...inp, background:"#fff" }}>
                    <option value="">— Unassigned —</option>
                    {AGENTS.map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Location</label>
                <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} style={inp} placeholder="Office, Zoom, phone…" />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={lbl}>Recurrence</label>
                  <select value={form.recurrence} onChange={e=>setForm(f=>({...f,recurrence:e.target.value}))} style={{ ...inp, background:"#fff" }}>
                    {RECURRENCE.map(r=><option key={r} value={r}>{r==="none"?"Does not repeat":r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Reminder</label>
                  <select value={form.reminder} onChange={e=>setForm(f=>({...f,reminder:e.target.value}))} style={{ ...inp, background:"#fff" }}>
                    {REMINDER_OPTS.map(r=><option key={r} value={r}>{r==="none"?"No reminder":r}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Description / Notes</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  style={{ ...inp, minHeight:60, resize:"vertical" } as React.CSSProperties} placeholder="Optional notes…" />
              </div>

              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                {editingEvent&&<button onClick={()=>{ deleteEvent(editingEvent.id); setShowForm(false); }} style={{ padding:"9px 16px", border:"1px solid #fecaca", borderRadius:7, background:"#fff5f5", cursor:"pointer", color:"#ef4444", fontWeight:600 }}>Delete</button>}
                <button onClick={()=>{ setShowForm(false); setEditingEvent(null); }} style={{ padding:"9px 20px", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", cursor:"pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding:"9px 20px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>
                  {saving?"Saving…":editingEvent?"Save Changes":"Add Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
