"use client";
import { useState, useEffect } from "react";
import CDMLayout from "@/components/CDMLayout";
import { supabase } from "@/lib/supabase";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EVENT_C: Record<string, string> = { reminder: "#f59e0b", appointment: "#3b82f6", followup: "#8b5cf6", deadline: "#ef4444", other: "#10b981" };

export default function Page() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", type: "reminder" });
  const [saving, setSaving] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  async function load() {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    const { data } = await supabase.from("calendar_events").select("*").gte("date", start).lte("date", end);
    setEvents(data || []);
  }

  useEffect(() => { load(); }, [year, month]);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr || e.date?.startsWith(dateStr));
  }

  function openDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setForm(f => ({ ...f, date: dateStr }));
  }

  async function save() {
    if (!form.title || !form.date) return;
    setSaving(true);
    await supabase.from("calendar_events").insert([form]);
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", description: "", date: selectedDate || "", type: "reminder" });
    load();
  }

  async function deleteEvent(id: string) {
    await supabase.from("calendar_events").delete().eq("id", id);
    setEvents(e => e.filter(x => x.id !== id));
  }

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate || e.date?.startsWith(selectedDate)) : [];
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1000 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1e293b" }}>Calendar</h1>
          <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, date: `${year}-${String(month + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}` })); }}
            style={{ background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add Event</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <button onClick={prevMonth} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>‹</button>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f1f5f9" }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: "center", padding: "10px 0", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} style={{ minHeight: 76, background: "#fafafa", borderRight: "1px solid #f8fafc", borderBottom: "1px solid #f8fafc" }} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvts = getEventsForDay(day);
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const sel = selectedDate === dateStr;
                return (
                  <div key={day} onClick={() => openDay(day)}
                    style={{ minHeight: 76, padding: "6px 8px", borderRight: "1px solid #f8fafc", borderBottom: "1px solid #f8fafc", cursor: "pointer", background: sel ? "#eff6ff" : isToday(day) ? "#fef9c3" : "#fff" }}>
                    <div style={{ fontWeight: isToday(day) ? 800 : 500, fontSize: 14, color: isToday(day) ? "#1e3a5f" : "#374151", marginBottom: 3 }}>{day}</div>
                    {dayEvts.slice(0, 2).map(e => (
                      <div key={e.id} style={{ fontSize: 11, background: (EVENT_C[e.type] || "#94a3b8") + "22", color: EVENT_C[e.type] || "#64748b", borderRadius: 3, padding: "2px 4px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    ))}
                    {dayEvts.length > 2 && <div style={{ fontSize: 10, color: "#94a3b8" }}>+{dayEvts.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {selectedDate ? (
              <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</h3>
                  <button onClick={() => setShowForm(true)} style={{ fontSize: 12, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>+ Add</button>
                </div>
                {selectedEvents.length === 0 ? <p style={{ padding: 14, color: "#94a3b8", fontSize: 13 }}>No events. Click + Add.</p>
                  : selectedEvents.map(e => (
                    <div key={e.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: EVENT_C[e.type] || "#94a3b8", marginTop: 3, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
                        {e.description && <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{e.description}</div>}
                        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{e.type}</div>
                      </div>
                      <button onClick={() => deleteEvent(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}>×</button>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, textAlign: "center", color: "#94a3b8" }}>
                <p style={{ fontSize: 14 }}>Click a date to view or add events.</p>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>This Month ({events.length})</h3>
              </div>
              {events.length === 0 ? <p style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 13 }}>No events this month.</p>
                : events.slice(0, 5).map(e => (
                  <div key={e.id} style={{ padding: "9px 16px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: EVENT_C[e.type] || "#94a3b8" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{e.date}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>New Event</h2>
              {[["Title", "title", "text"], ["Date", "date", "date"]].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14 }}>
                  {Object.keys(EVENT_C).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, minHeight: 60, resize: "vertical", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving…" : "Add Event"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
