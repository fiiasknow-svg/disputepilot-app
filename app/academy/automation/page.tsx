"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "Automation Specialist",
  subtitle: "Automate your credit repair business and scale without adding more hours.",
  description: "Learn how to set up email workflows, auto-dispute scheduling, client onboarding sequences, and billing automation using DisputePilot so your business runs itself.",
  level: "Intermediate",
  totalHours: "4.5 hours",
  icon: "⚡",
  color: "#7c3aed",
  certTitle: "Certified Automation Specialist",
  modules: [
    { title: "Automation Fundamentals", lessons: [
      { title: "Why Automation is Essential for Scale", duration: "8 min", type: "video" },
      { title: "Triggers, Conditions & Actions Explained", duration: "9 min", type: "video" },
      { title: "Mapping Your Business Workflows", duration: "8 min", type: "reading" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Client Onboarding Automation", lessons: [
      { title: "Automating the New Client Welcome Sequence", duration: "10 min", type: "video" },
      { title: "Auto-Sending Portal Access & Documents", duration: "9 min", type: "video" },
      { title: "Setting Up the Initial Dispute Round", duration: "8 min", type: "reading" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Email & Notification Workflows", lessons: [
      { title: "Building a Nurture Email Sequence", duration: "10 min", type: "video" },
      { title: "Dispute Status Update Notifications", duration: "8 min", type: "video" },
      { title: "Payment Reminder Automation", duration: "7 min", type: "reading" },
      { title: "Birthday & Anniversary Automations", duration: "6 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Dispute & Letter Automation", lessons: [
      { title: "Auto-Scheduling Dispute Rounds", duration: "10 min", type: "video" },
      { title: "Bulk Letter Generation Workflows", duration: "9 min", type: "video" },
      { title: "Setting Bureau Response Timers", duration: "8 min", type: "reading" },
      { title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Advanced Automation & Reporting", lessons: [
      { title: "Building Multi-Step Conditional Workflows", duration: "11 min", type: "video" },
      { title: "Automation Analytics & Optimization", duration: "9 min", type: "reading" },
      { title: "Common Automation Mistakes to Avoid", duration: "8 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
