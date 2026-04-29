"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "FDCPA Specialist",
  subtitle: "Master the Fair Debt Collection Practices Act and protect your clients from illegal collection tactics.",
  description: "Understand the FDCPA inside and out — prohibited collector practices, consumer rights, debt validation strategies, and how to leverage the law to remove collection accounts from credit reports.",
  level: "Intermediate",
  totalHours: "4.5 hours",
  icon: "🛡️",
  color: "#ef4444",
  certTitle: "Certified FDCPA Specialist",
  modules: [
    { title: "FDCPA Overview", lessons: [
      { title: "History & Purpose of the FDCPA", duration: "8 min", type: "video" },
      { title: "Who Is a \"Debt Collector\" Under the FDCPA?", duration: "7 min", type: "reading" },
      { title: "Types of Debt Covered", duration: "6 min", type: "video" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Prohibited Collection Practices", lessons: [
      { title: "Harassment & Abuse Prohibitions", duration: "9 min", type: "video" },
      { title: "False & Misleading Representations", duration: "10 min", type: "video" },
      { title: "Unfair Practices — What Collectors Cannot Do", duration: "8 min", type: "reading" },
      { title: "Time & Place Restrictions on Calls", duration: "7 min", type: "video" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Consumer Rights & Debt Validation", lessons: [
      { title: "The Right to Debt Validation", duration: "10 min", type: "video" },
      { title: "Writing a Debt Validation Letter", duration: "9 min", type: "reading" },
      { title: "The 30-Day Validation Window", duration: "7 min", type: "video" },
      { title: "Cease & Desist Letters", duration: "8 min", type: "reading" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Removing Collections via the FDCPA", lessons: [
      { title: "Using FDCPA Violations to Dispute Accounts", duration: "11 min", type: "video" },
      { title: "Pay-for-Delete Negotiations", duration: "9 min", type: "video" },
      { title: "Goodwill Adjustment Letters for Collections", duration: "8 min", type: "reading" },
      { title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "FDCPA Enforcement & Civil Remedies", lessons: [
      { title: "Filing FDCPA Complaints with the FTC & CFPB", duration: "8 min", type: "video" },
      { title: "Actual & Statutory Damages Under the FDCPA", duration: "9 min", type: "reading" },
      { title: "Class Action Suits Against Collectors", duration: "7 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
