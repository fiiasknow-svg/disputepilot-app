"use client";

import { useEffect, useMemo, useState } from "react";
import CDMLayout from "@/components/CDMLayout";

type ReminderStatus = "scheduled" | "read" | "past-due";

type Reminder = {
  id: string;
  customer: string;
  title: string;
  scheduleDate: string;
  scheduleTime: string;
  endDate: string;
  endTime: string;
  type: string;
  status: ReminderStatus;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  allDay: boolean;
};

const REMINDER_KEY = "disputepilot.calendar-reminders";
const EVENT_KEY = "disputepilot.calendar-events-lite";
const TABS = [
  { id: "all", label: "Reminder" },
  { id: "scheduled", label: "Scheduled Reminder" },
  { id: "read", label: "Read Reminder" },
  { id: "past-due", label: "Past Due" },
] as const;

const today = new Date();

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthName(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notice, setNotice] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventTools, setShowEventTools] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    customer: "",
    title: "",
    scheduleDate: dateValue(today),
    scheduleTime: "09:00",
    endDate: dateValue(today),
    endTime: "09:30",
    type: "Follow Up",
  });
  const [eventForm, setEventForm] = useState({ title: "", date: dateValue(today), allDay: false });

  useEffect(() => {
    setReminders(readStored<Reminder[]>(REMINDER_KEY, []));
    setEvents(readStored<EventItem[]>(EVENT_KEY, []));
  }, []);

  useEffect(() => {
    writeStored(REMINDER_KEY, reminders);
  }, [reminders]);

  useEffect(() => {
    writeStored(EVENT_KEY, events);
  }, [events]);

  const visibleReminders = useMemo(() => {
    if (activeTab === "all") return reminders;
    return reminders.filter((reminder) => reminder.status === activeTab);
  }, [activeTab, reminders]);

  const monthDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const cells: { label: number; muted: boolean; date: string }[] = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
      const day = previousMonthDays - index;
      const date = new Date(year, month - 1, day);
      cells.push({ label: day, muted: true, date: dateValue(date) });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ label: day, muted: false, date: dateValue(date) });
    }

    while (cells.length % 7 !== 0) {
      const day = cells.length - firstDay - daysInMonth + 1;
      const date = new Date(year, month + 1, day);
      cells.push({ label: day, muted: true, date: dateValue(date) });
    }

    return cells;
  }, []);

  function addReminder() {
    if (!reminderForm.customer.trim() || !reminderForm.title.trim()) return;
    const status: ReminderStatus = reminderForm.scheduleDate < dateValue(today) ? "past-due" : "scheduled";
    setReminders((current) => [
      {
        id: `reminder-${Date.now()}`,
        customer: reminderForm.customer.trim(),
        title: reminderForm.title.trim(),
        scheduleDate: reminderForm.scheduleDate,
        scheduleTime: reminderForm.scheduleTime,
        endDate: reminderForm.endDate,
        endTime: reminderForm.endTime,
        type: reminderForm.type,
        status,
      },
      ...current,
    ]);
    setReminderForm({
      customer: "",
      title: "",
      scheduleDate: dateValue(today),
      scheduleTime: "09:00",
      endDate: dateValue(today),
      endTime: "09:30",
      type: "Follow Up",
    });
    setNotice("Reminder saved.");
  }

  function markAllAsRead() {
    setReminders((current) => current.map((reminder) => ({ ...reminder, status: "read" })));
    setNotice("All reminders marked as read.");
  }

  function markOneRead(id: string) {
    setReminders((current) =>
      current.map((reminder) => (reminder.id === id ? { ...reminder, status: "read" } : reminder)),
    );
  }

  function addEvent() {
    if (!eventForm.title.trim()) return;
    setEvents((current) => [{ id: `event-${Date.now()}`, title: eventForm.title.trim(), date: eventForm.date, allDay: eventForm.allDay }, ...current]);
    setEventForm({ title: "", date: dateValue(today), allDay: false });
    setShowEventForm(false);
    setNotice("Event saved.");
  }

  function exportIcal() {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DisputePilot//Reminder//EN"];
    events.forEach((event) => {
      lines.push("BEGIN:VEVENT", `DTSTART:${event.date.replace(/-/g, "")}`, `SUMMARY:${event.title}`, `UID:${event.id}@disputepilot`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "calendar.ics";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  const shell: React.CSSProperties = { padding: 24, maxWidth: 1240 };
  const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4 };
  const button: React.CSSProperties = { border: "1px solid #cbd5e1", background: "#fff", color: "#1f2937", borderRadius: 3, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
  const primaryButton: React.CSSProperties = { ...button, background: "#1e3a5f", borderColor: "#1e3a5f", color: "#fff" };
  const input: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 3, padding: "8px 9px", fontSize: 13, boxSizing: "border-box" };
  const label: React.CSSProperties = { display: "block", fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 };

  return (
    <CDMLayout>
      <div style={shell}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, color: "#1f2937", margin: "0 0 8px", fontWeight: 800 }}>Calendar</h1>
            <div style={{ fontSize: 13, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span>Dashboard</span>
              <span>Calendar</span>
              <span>BACK</span>
            </div>
            <p style={{ margin: "12px 0 0", color: "#475569", fontSize: 14 }}>
              In this area, you can set reminders for each customer in the software.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={exportIcal} style={button}>Export iCal</button>
            <button type="button" onClick={() => setShowEventForm(true)} style={button}>+ Add Event</button>
          </div>
        </div>

        {notice && (
          <div role="status" style={{ ...panel, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534", padding: 10, marginBottom: 14, fontSize: 13 }}>
            {notice}
          </div>
        )}

        <section style={{ ...panel, marginBottom: 16 }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: 0,
                  borderRight: "1px solid #e5e7eb",
                  background: activeTab === tab.id ? "#1e3a5f" : "#f8fafc",
                  color: activeTab === tab.id ? "#fff" : "#334155",
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#1f2937" }}>Reminders</h2>
              <button type="button" onClick={markAllAsRead} style={primaryButton}>Mark All as Read</button>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #e5e7eb" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#475569" }}>
                    {["Customer", "Reminder Title", "Schedule Date", "Schedule Time", "End Date", "End Time", "Type of Reminder", "Read", "Action"].map((heading) => (
                      <th key={heading} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontSize: 12 }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleReminders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 28, textAlign: "center", color: "#64748b" }}>
                        No Reminder Found.
                      </td>
                    </tr>
                  ) : (
                    visibleReminders.map((reminder) => (
                      <tr key={reminder.id}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.customer}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontWeight: 700 }}>{reminder.title}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.scheduleDate}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.scheduleTime}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.endDate}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.endTime}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.type}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{reminder.status === "read" ? "Yes" : "No"}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                          <button type="button" onClick={() => markOneRead(reminder.id)} style={button}>Read Reminder</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.9fr) minmax(320px, 1.1fr)", gap: 16 }}>
          <section style={{ ...panel, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button type="button" style={button} aria-label="Previous month">{"<"}</button>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>{monthName(today)}</div>
              <button type="button" style={button} aria-label="Next month">{">"}</button>
              <button type="button" style={button}>Today</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", fontSize: 11, fontWeight: 800, color: "#64748b", textAlign: "center", marginBottom: 6 }}>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid #e5e7eb", borderLeft: "1px solid #e5e7eb" }}>
              {monthDays.map((day) => {
                const hasReminder = reminders.some((reminder) => reminder.scheduleDate === day.date);
                return (
                  <div
                    key={`${day.date}-${day.label}`}
                    style={{
                      minHeight: 42,
                      borderRight: "1px solid #e5e7eb",
                      borderBottom: "1px solid #e5e7eb",
                      padding: 6,
                      color: day.muted ? "#94a3b8" : "#1f2937",
                      background: day.date === dateValue(today) ? "#eff6ff" : "#fff",
                      position: "relative",
                    }}
                  >
                    {day.label}
                    {hasReminder && <span aria-label="Reminder Scheduled" style={{ position: "absolute", width: 7, height: 7, borderRadius: 99, background: "#3b82f6", right: 6, bottom: 6 }} />}
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ ...panel, padding: 16 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 16, color: "#1f2937" }}>Add Your New Reminder</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <div>
                <label style={label}>Customer</label>
                <input value={reminderForm.customer} onChange={(event) => setReminderForm((form) => ({ ...form, customer: event.target.value }))} placeholder="Customer name" style={input} />
              </div>
              <div>
                <label style={label}>Reminder title</label>
                <input value={reminderForm.title} onChange={(event) => setReminderForm((form) => ({ ...form, title: event.target.value }))} placeholder="Reminder title" style={input} />
              </div>
              <div>
                <label style={label}>Scheduled Date</label>
                <input type="date" value={reminderForm.scheduleDate} onChange={(event) => setReminderForm((form) => ({ ...form, scheduleDate: event.target.value }))} style={input} />
              </div>
              <div>
                <label style={label}>Scheduled Time</label>
                <input type="time" value={reminderForm.scheduleTime} onChange={(event) => setReminderForm((form) => ({ ...form, scheduleTime: event.target.value }))} style={input} />
              </div>
              <div>
                <label style={label}>Scheduled End Date</label>
                <input type="date" value={reminderForm.endDate} onChange={(event) => setReminderForm((form) => ({ ...form, endDate: event.target.value }))} style={input} />
              </div>
              <div>
                <label style={label}>End Time</label>
                <input type="time" value={reminderForm.endTime} onChange={(event) => setReminderForm((form) => ({ ...form, endTime: event.target.value }))} style={input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={label}>Type of Reminder</label>
                <select value={reminderForm.type} onChange={(event) => setReminderForm((form) => ({ ...form, type: event.target.value }))} style={{ ...input, background: "#fff" }}>
                  <option>Follow Up</option>
                  <option>Document Request</option>
                  <option>Payment Reminder</option>
                  <option>Dispute Review</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => setReminderForm({ customer: "", title: "", scheduleDate: dateValue(today), scheduleTime: "09:00", endDate: dateValue(today), endTime: "09:30", type: "Follow Up" })} style={button}>Reset</button>
              <button type="button" onClick={addReminder} style={primaryButton}>Save Reminder</button>
            </div>
          </section>
        </div>

        <section style={{ ...panel, padding: 14, marginTop: 16 }}>
          <button
            type="button"
            aria-expanded={showEventTools}
            onClick={() => setShowEventTools((visible) => !visible)}
            style={{ ...button, marginBottom: showEventTools ? 12 : 0 }}
          >
            Event Calendar Tools
          </button>
          {showEventTools && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
              {["Month", "Week", "Day", "Agenda"].map((view) => (
                <button key={view} type="button" style={button}>
                  {view}
                </button>
              ))}
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 800 }}>Event Types</span>
              <select aria-label="Event Types" defaultValue="All Types" style={{ ...input, width: "auto", minWidth: 132, background: "#fff" }}>
                <option>All Types</option>
                <option>Meeting</option>
                <option>Deadline</option>
                <option>Follow Up</option>
              </select>
              <select aria-label="All Agents" defaultValue="All Agents" style={{ ...input, width: "auto", minWidth: 132, background: "#fff" }}>
                <option>All Agents</option>
                <option>Assigned Agent</option>
                <option>Unassigned</option>
              </select>
              <button type="button" style={button}>Upcoming (30 days)</button>
            </div>
          )}
          {events.length === 0 ? (
            <p style={{ margin: showEventTools ? 0 : "12px 0 0", fontSize: 13, color: "#64748b" }}>No events saved.</p>
          ) : (
            <div style={{ display: "grid", gap: 6, marginTop: showEventTools ? 0 : 12 }}>
              {events.map((event) => (
                <div key={event.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, padding: 8, background: "#f8fafc" }}>
                  <strong>{event.title}</strong>
                  <span>{event.allDay ? `${event.date} - All day` : event.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {showEventForm && (
          <div role="dialog" aria-modal="true" aria-label="New Event" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
            <div style={{ width: 420, maxWidth: "100%", background: "#fff", borderRadius: 6, padding: 22 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>New Event</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={label}>Title</label>
                  <input value={eventForm.title} onChange={(event) => setEventForm((form) => ({ ...form, title: event.target.value }))} placeholder="Event title" style={input} />
                </div>
                <div>
                  <label style={label}>Date</label>
                  <input type="date" value={eventForm.date} onChange={(event) => setEventForm((form) => ({ ...form, date: event.target.value }))} style={input} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={eventForm.allDay}
                    onChange={(event) => setEventForm((form) => ({ ...form, allDay: event.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  All day
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
                <button type="button" onClick={() => setShowEventForm(false)} style={button}>Cancel</button>
                <button type="button" onClick={addEvent} style={primaryButton}>Add Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CDMLayout>
  );
}
