"use client";

import CDMLayout from "@/components/CDMLayout";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const Icons = {
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const calendarDays = [];
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <CDMLayout>
      <PageHeader 
        title="Calendar" 
        description="Manage appointments, tasks, and reminders"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Calendar" }]}
      />
      
      <div style={{ padding: "24px" }}>
        {/* Calendar Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={prevMonth}
                style={{ 
                  padding: "8px", 
                  backgroundColor: "#fff", 
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <Icons.ChevronLeft />
              </button>
              <button 
                onClick={nextMonth}
                style={{ 
                  padding: "8px", 
                  backgroundColor: "#fff", 
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <Icons.ChevronRight />
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", backgroundColor: "#fff", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <button 
                onClick={() => setView("month")}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: view === "month" ? "#3b82f6" : "#fff",
                  color: view === "month" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Month
              </button>
              <button 
                onClick={() => setView("week")}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: view === "week" ? "#3b82f6" : "#fff",
                  color: view === "week" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Week
              </button>
              <button 
                onClick={() => setView("day")}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: view === "day" ? "#3b82f6" : "#fff",
                  color: view === "day" ? "#fff" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Day
              </button>
            </div>
            
            <button style={{ 
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer"
            }}>
              <Icons.Plus />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {/* Week Days Header */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0"
          }}>
            {weekDays.map(day => (
              <div key={day} style={{ 
                padding: "12px", 
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                textTransform: "uppercase"
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)",
            minHeight: "400px"
          }}>
            {calendarDays.map((day, index) => (
              <div key={index} style={{ 
                minHeight: "100px",
                borderRight: (index % 7) !== 6 ? "1px solid #f1f5f9" : "none",
                borderBottom: "1px solid #f1f5f9",
                padding: "8px",
                backgroundColor: day ? "#fff" : "#f8fafc"
              }}>
                {day && (
                  <div>
                    <span style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {day}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ 
          display: "flex", 
          gap: "24px", 
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#3b82f6", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Appointments</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#22c55e", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Tasks</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#f59e0b", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Reminders</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Important</span>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
