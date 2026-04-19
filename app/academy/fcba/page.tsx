"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "FCBA Specialist",
  subtitle: "Leverage the Fair Credit Billing Act to dispute billing errors and unauthorized charges.",
  description: "Learn how the FCBA empowers consumers to dispute billing errors on credit card statements, challenge unauthorized charges, and remove inaccurate items from credit profiles.",
  level: "Intermediate",
  totalHours: "3.5 hours",
  icon: "💳",
  color: "#f59e0b",
  certTitle: "Certified FCBA Specialist",
  modules: [
    { title: "FCBA Fundamentals", lessons: [
      { title: "What is the FCBA?", duration: "7 min", type: "video" },
      { title: "FCBA vs FCRA — Key Differences", duration: "8 min", type: "reading" },
      { title: "Who Is Protected by the FCBA?", duration: "6 min", type: "video" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Billing Errors & Disputes", lessons: [
      { title: "What Counts as a Billing Error?", duration: "9 min", type: "video" },
      { title: "Unauthorized Charges & Fraud", duration: "8 min", type: "video" },
      { title: "Undelivered Goods & Services", duration: "7 min", type: "reading" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "The FCBA Dispute Process", lessons: [
      { title: "How to File an FCBA Dispute", duration: "10 min", type: "video" },
      { title: "The 60-Day Dispute Window", duration: "7 min", type: "reading" },
      { title: "Creditor Response Requirements", duration: "8 min", type: "video" },
      { title: "Writing an FCBA Dispute Letter", duration: "9 min", type: "reading" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "FCBA in Credit Repair Practice", lessons: [
      { title: "Using FCBA Disputes to Remove Negative Items", duration: "10 min", type: "video" },
      { title: "Chargeback vs FCBA Dispute", duration: "8 min", type: "reading" },
      { title: "FCBA Remedies & Creditor Violations", duration: "9 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
