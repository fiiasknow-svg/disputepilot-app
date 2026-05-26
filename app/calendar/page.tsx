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
  type: string;
  agent: string;
};

const REMINDER_KEY = "disputepilot.calendar-reminders";
const EVENT_KEY = "disputepilot.calendar-events-lite";
const EVENT_TYPES = ["Meeting", "Deadline", "Follow Up"] as const;
const AGENTS = ["Assigned Agent", "Unassigned"] as const;
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
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [eventFormError, setEventFormError] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventTools, setShowEventTools] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateValue(today));
  const [eventView, setEventView] = useState<"Month" | "Week" | "Day" | "Agenda">("Month");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Types");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    customer: "",
    title: "",
    scheduleDate: dateValue(today),
    scheduleTime: "09:00",
    endDate: dateValue(today),
    endTime: "09:30",
    type: "Follow Up",
  });
  const [eventForm, setEventForm] = useState({ title: "", date: dateValue(today), allDay: false, type: "Meeting", agent: "Assigned Agent" });

  useEffect(() => {
    setReminders(readStored<Reminder[]>(REMINDER_KEY, []));
    setEvents(
      readStored<EventItem[]>(EVENT_KEY, []).map((event) => ({
        ...event,
        type: event.type || "Meeting",
        agent: event.agent || "Unassigned",
      })),
    );
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) writeStored(REMINDER_KEY, reminders);
  }, [reminders, storageReady]);

  useEffect(() => {
    if (storageReady) writeStored(EVENT_KEY, events);
  }, [events, storageReady]);

  const visibleReminders = useMemo(() => {
    if (activeTab === "all") return reminders;
    return reminders.filter((reminder) => reminder.status === activeTab);
  }, [activeTab, reminders]);

  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
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
  }, [visibleMonth]);

  const visibleEvents = useMemo(() => {
    const start = dateValue(today);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    const end = dateValue(endDate);

    return events.filter((event) => {
      if (eventTypeFilter !== "All Types" && event.type !== eventTypeFilter) return false;
      if (agentFilter !== "All Agents" && event.agent !== agentFilter) return false;
      if (upcomingOnly && (event.date < start || event.date > end)) return false;
      return true;
    });
  }, [agentFilter, eventTypeFilter, events, upcomingOnly]);

  const selectedReminders = useMemo(
    () => reminders.filter((reminder) => reminder.scheduleDate === selectedDate),
    [reminders, selectedDate],
  );

  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate],
  );

  function addReminder() {
    if (!reminderForm.customer.trim() || !reminderForm.title.trim()) {
      setNotice("Enter customer and reminder title before saving.");
      return;
    }
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
    if (!eventForm.title.trim()) {
      setEventFormError("Enter an event title before adding the event.");
      return;
    }
    setEvents((current) => [{ id: `event-${Date.now()}`, title: eventForm.title.trim(), date: eventForm.date, allDay: eventForm.allDay, type: eventForm.type, agent: eventForm.agent }, ...current]);
    setEventForm({ title: "", date: dateValue(today), allDay: false, type: "Meeting", agent: "Assigned Agent" });
    setEventFormError("");
    setShowEventForm(false);
    setNotice("Event saved.");
  }

  function exportIcal() {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DisputePilot//Reminder//EN"];
    const escapeIcal = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    events.forEach((event) => {
      const details = [`Type: ${event.type}`, `Agent: ${event.agent}`].filter(Boolean).join("\\n");
      lines.push("BEGIN:VEVENT", `DTSTART:${event.date.replace(/-/g, "")}`, `SUMMARY:${escapeIcal(event.title)}`, `DESCRIPTION:${escapeIcal(details)}`, `UID:${event.id}@disputepilot`, "END:VEVENT");
    });
    reminders.forEach((reminder) => {
      lines.push(
        "BEGIN:VTODO",
        `DUE:${reminder.scheduleDate.replace(/-/g, "")}`,
        `SUMMARY:${escapeIcal(reminder.title)}`,
        `DESCRIPTION:${escapeIcal(`Customer: ${reminder.customer}\\nType: ${reminder.type}`)}`,
        `UID:${reminder.id}@disputepilot`,
        reminder.status === "read" ? "STATUS:COMPLETED" : "STATUS:NEEDS-ACTION",
        "END:VTODO",
      );
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "calendar.ics";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function selectCalendarDate(date: string) {
    setSelectedDate(date);
    setReminderForm((form) => ({ ...form, scheduleDate: date, endDate: date }));
    setNotice(`Selected date: ${date}. Reminder scheduled and end dates are ready.`);
  }

  function goToToday() {
    const current = new Date();
    const currentDate = dateValue(current);
    setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    selectCalendarDate(currentDate);
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
            <button type="button" onClick={() => { setShowEventForm(true); setEventFormError(""); }} style={button}>+ Add Event</button>
          </div>
        </div>

        {notice && (
          <div role={notice.startsWith("Enter") ? "alert" : "status"} style={{ ...panel, borderColor: notice.startsWith("Enter") ? "#fed7aa" : "#bbf7d0", background: notice.startsWith("Enter") ? "#fff7ed" : "#f0fdf4", color: notice.startsWith("Enter") ? "#b45309" : "#166534", padding: 10, marginBottom: 14, fontSize: 13 }}>
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
              <button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={button} aria-label="Previous month">{"<"}</button>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>{monthName(visibleMonth)}</div>
              <button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={button} aria-label="Next month">{">"}</button>
              <button type="button" onClick={goToToday} style={button}>Today</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", fontSize: 11, fontWeight: 800, color: "#64748b", textAlign: "center", marginBottom: 6 }}>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid #e5e7eb", borderLeft: "1px solid #e5e7eb" }}>
              {monthDays.map((day) => {
                const hasReminder = reminders.some((reminder) => reminder.scheduleDate === day.date);
                return (
                  <button
                    key={`${day.date}-${day.label}`}
                    type="button"
                    onClick={() => selectCalendarDate(day.date)}
                    aria-pressed={selectedDate === day.date}
                    aria-label={`${day.date}${day.muted ? " outside visible month" : ""}`}
                    style={{
                      minHeight: 42,
                      borderRight: "1px solid #e5e7eb",
                      borderBottom: "1px solid #e5e7eb",
                      padding: 6,
                      color: day.muted ? "#94a3b8" : "#1f2937",
                      background: selectedDate === day.date ? "#dbeafe" : day.date === dateValue(today) ? "#eff6ff" : "#fff",
                      position: "relative",
                      cursor: "pointer",
                      textAlign: "left",
                      font: "inherit",
                      fontWeight: selectedDate === day.date ? 800 : 400,
                    }}
                  >
                    {day.label}
                    {hasReminder && <span aria-label="Reminder Scheduled" style={{ position: "absolute", width: 7, height: 7, borderRadius: 99, background: "#3b82f6", right: 6, bottom: 6 }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
              Selected date: {selectedDate}. {selectedReminders.length} reminder{selectedReminders.length === 1 ? "" : "s"} and {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"} on this date.
            </p>
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
                <button key={view} type="button" onClick={() => setEventView(view as typeof eventView)} aria-pressed={eventView === view} style={{ ...button, background: eventView === view ? "#1e3a5f" : "#fff", borderColor: eventView === view ? "#1e3a5f" : "#cbd5e1", color: eventView === view ? "#fff" : "#1f2937" }}>
                  {view}
                </button>
              ))}
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 800 }}>Event Types</span>
              <select aria-label="Event Types" value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value)} style={{ ...input, width: "auto", minWidth: 132, background: "#fff" }}>
                <option>All Types</option>
                {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
              <select aria-label="All Agents" value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} style={{ ...input, width: "auto", minWidth: 132, background: "#fff" }}>
                <option>All Agents</option>
                {AGENTS.map((agent) => <option key={agent}>{agent}</option>)}
              </select>
              <button type="button" onClick={() => setUpcomingOnly((active) => !active)} aria-pressed={upcomingOnly} style={{ ...button, background: upcomingOnly ? "#1e3a5f" : "#fff", borderColor: upcomingOnly ? "#1e3a5f" : "#cbd5e1", color: upcomingOnly ? "#fff" : "#1f2937" }}>Upcoming (30 days)</button>
              <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 800 }}>
                Showing {eventView} view. Agent is a local event filter.
              </span>
            </div>
          )}
          {visibleEvents.length === 0 ? (
            <p style={{ margin: showEventTools ? 0 : "12px 0 0", fontSize: 13, color: "#64748b" }}>No events saved.</p>
          ) : (
            <div style={{ display: "grid", gap: 6, marginTop: showEventTools ? 0 : 12 }}>
              {visibleEvents.map((event) => (
                <div key={event.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, padding: 8, background: "#f8fafc" }}>
                  <div>
                    <strong>{event.title}</strong>
                    <div style={{ color: "#64748b", fontSize: 12 }}>{event.type} - {event.agent}</div>
                  </div>
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
              {eventFormError && <div role="alert" style={{ border: "1px solid #fed7aa", background: "#fff7ed", color: "#b45309", borderRadius: 4, padding: 9, marginBottom: 12, fontSize: 13 }}>{eventFormError}</div>}
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={label}>Title</label>
                  <input value={eventForm.title} onChange={(event) => setEventForm((form) => ({ ...form, title: event.target.value }))} placeholder="Event title" style={input} />
                </div>
                <div>
                  <label style={label}>Date</label>
                  <input type="date" value={eventForm.date} onChange={(event) => setEventForm((form) => ({ ...form, date: event.target.value }))} style={input} />
                </div>
                <div>
                  <label style={label}>Event Type</label>
                  <select aria-label="Event Type" value={eventForm.type} onChange={(event) => setEventForm((form) => ({ ...form, type: event.target.value }))} style={{ ...input, background: "#fff" }}>
                    {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Assigned Agent</label>
                  <select aria-label="Assigned Agent" value={eventForm.agent} onChange={(event) => setEventForm((form) => ({ ...form, agent: event.target.value }))} style={{ ...input, background: "#fff" }}>
                    {AGENTS.map((agent) => <option key={agent}>{agent}</option>)}
                  </select>
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
