"use client";
import { useState } from "react";
import CDMLayout from "@/components/CDMLayout";

export type Lesson = { title: string; duration: string; type: "video" | "reading" | "quiz" };
export type Module = { title: string; lessons: Lesson[] };
export type CourseData = {
  title: string;
  subtitle: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  totalHours: string;
  icon: string;
  color: string;
  modules: Module[];
  certTitle: string;
};

const LEVEL_C: Record<string, string> = { Beginner: "#10b981", Intermediate: "#3b82f6", Advanced: "#8b5cf6" };
const TYPE_ICON: Record<string, string> = { video: "▶", reading: "📄", quiz: "✏️" };

export default function AcademyPage({ course }: { course: CourseData }) {
  const allLessons = course.modules.flatMap(m => m.lessons);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<{ module: number; lesson: number } | null>(null);
  const [expandedModule, setExpandedModule] = useState<number>(0);

  const totalLessons = allLessons.length;
  const doneCount = completed.size;
  const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const allDone = doneCount === totalLessons;

  function lessonKey(mi: number, li: number) { return `${mi}-${li}`; }
  function toggleDone(mi: number, li: number) {
    const key = lessonKey(mi, li);
    setCompleted(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  }

  const activeL = activeLesson !== null
    ? course.modules[activeLesson.module]?.lessons[activeLesson.lesson]
    : null;

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)`, borderRadius: 12, padding: "24px 28px", marginBottom: 24, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ fontSize: 48, lineHeight: 1 }}>{course.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{course.title}</h1>
                <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 700 }}>{course.level}</span>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 20, fontSize: 13, opacity: 0.85 }}>
                <span>📚 {totalLessons} lessons</span>
                <span>⏱ {course.totalHours}</span>
                <span>🏅 Certificate of Completion</span>
              </div>
            </div>
            <div style={{ textAlign: "center" as const, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px 20px", minWidth: 100 }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{pct}%</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Complete</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{doneCount}/{totalLessons} lessons</div>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.2)", borderRadius: 20, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 20, transition: "width 0.4s" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

          {/* Module list */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {course.modules.map((mod, mi) => {
              const modDone = mod.lessons.filter((_, li) => completed.has(lessonKey(mi, li))).length;
              const isExpanded = expandedModule === mi;
              return (
                <div key={mi} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  <button onClick={() => setExpandedModule(isExpanded ? -1 : mi)}
                    style={{ width: "100%", padding: "14px 16px", background: isExpanded ? "#f8fafc" : "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left" as const }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: modDone === mod.lessons.length ? course.color : "#f1f5f9", color: modDone === mod.lessons.length ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      {modDone === mod.lessons.length ? "✓" : mi + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{mod.title}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{modDone}/{mod.lessons.length} completed</div>
                    </div>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{isExpanded ? "▲" : "▼"}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f1f5f9" }}>
                      {mod.lessons.map((lesson, li) => {
                        const key = lessonKey(mi, li);
                        const done = completed.has(key);
                        const isActive = activeLesson?.module === mi && activeLesson?.lesson === li;
                        return (
                          <div key={li} onClick={() => setActiveLesson({ module: mi, lesson: li })}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: isActive ? "#eff6ff" : "transparent", borderLeft: isActive ? `3px solid ${course.color}` : "3px solid transparent", borderBottom: li < mod.lessons.length - 1 ? "1px solid #f8fafc" : "none" }}>
                            <button onClick={e => { e.stopPropagation(); toggleDone(mi, li); }}
                              style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done ? course.color : "#e2e8f0"}`, background: done ? course.color : "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", padding: 0 }}>
                              {done ? "✓" : ""}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, color: done ? "#94a3b8" : "#1e293b", fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>{lesson.title}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{TYPE_ICON[lesson.type]} {lesson.type} · {lesson.duration}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Content area */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {activeL ? (
              <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                {activeL.type === "video" && (
                  <div style={{ background: "#0f172a", aspectRatio: "16/9", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, cursor: "pointer" }}>▶</div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>{activeL.title} · {activeL.duration}</p>
                  </div>
                )}
                {activeL.type === "reading" && (
                  <div style={{ background: "#f8fafc", aspectRatio: "16/9", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 40 }}>📄</span>
                    <p style={{ color: "#64748b", fontSize: 14, margin: 0, fontWeight: 600 }}>{activeL.title}</p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>Reading · {activeL.duration}</p>
                  </div>
                )}
                {activeL.type === "quiz" && (
                  <div style={{ background: "#fef9c3", aspectRatio: "16/9", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 40 }}>✏️</span>
                    <p style={{ color: "#92400e", fontSize: 14, margin: 0, fontWeight: 700 }}>Knowledge Check</p>
                    <p style={{ color: "#92400e", fontSize: 12, margin: 0 }}>{activeL.title} · {activeL.duration}</p>
                  </div>
                )}
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{activeL.title}</h2>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>Module {(activeLesson?.module ?? 0) + 1} · {activeL.duration}</p>
                  </div>
                  <button onClick={() => toggleDone(activeLesson!.module, activeLesson!.lesson)}
                    style={{ padding: "8px 18px", background: completed.has(lessonKey(activeLesson!.module, activeLesson!.lesson)) ? "#10b981" : course.color, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    {completed.has(lessonKey(activeLesson!.module, activeLesson!.lesson)) ? "✓ Completed" : "Mark Complete"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 10, padding: "32px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", textAlign: "center" as const }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{course.icon}</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Start {course.title}</h2>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>{course.subtitle}</p>
                <button onClick={() => { setExpandedModule(0); setActiveLesson({ module: 0, lesson: 0 }); }}
                  style={{ padding: "10px 24px", background: course.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                  Begin Course →
                </button>
              </div>
            )}

            {/* Course overview cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>Course Details</p>
                {[["Level", course.level], ["Duration", course.totalHours], ["Lessons", `${totalLessons} lessons`], ["Certificate", "Included"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>Your Progress</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {course.modules.map((mod, mi) => {
                    const done = mod.lessons.every((_, li) => completed.has(lessonKey(mi, li)));
                    return <div key={mi} style={{ flex: 1, height: 6, borderRadius: 3, background: done ? course.color : "#f1f5f9" }} />;
                  })}
                </div>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{doneCount} of {totalLessons} lessons complete</p>
                {allDone && <p style={{ fontSize: 13, color: "#10b981", fontWeight: 700, margin: "6px 0 0" }}>🎉 Course complete! Claim your certificate below.</p>}
              </div>
            </div>

            {/* Certificate */}
            <div style={{ background: allDone ? "#f0fdf4" : "#f8fafc", border: `1px solid ${allDone ? "#86efac" : "#e2e8f0"}`, borderRadius: 10, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: allDone ? "#166534" : "#64748b" }}>🏅 {course.certTitle}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: allDone ? "#166534" : "#94a3b8" }}>
                  {allDone ? "You have completed all lessons. Download your certificate." : `Complete all ${totalLessons} lessons to earn your certificate.`}
                </p>
              </div>
              <button disabled={!allDone}
                style={{ padding: "9px 20px", background: allDone ? "#10b981" : "#e2e8f0", color: allDone ? "#fff" : "#94a3b8", border: "none", borderRadius: 7, cursor: allDone ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" as const }}>
                {allDone ? "Download Certificate" : `${totalLessons - doneCount} lessons left`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
