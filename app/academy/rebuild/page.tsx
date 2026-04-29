"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "Rebuild Credit Specialist",
  subtitle: "Help clients build strong credit from scratch or after repair.",
  description: "Once disputes are won, clients need to build positive credit history. Learn the most effective strategies — secured cards, credit builder loans, authorized user accounts, and utilization management.",
  level: "Beginner",
  totalHours: "4 hours",
  icon: "📈",
  color: "#8b5cf6",
  certTitle: "Certified Rebuild Credit Specialist",
  modules: [
    { title: "Credit Rebuilding Foundations", lessons: [
      { title: "Why Rebuilding Matters After Repair", duration: "8 min", type: "video" },
      { title: "The 5 Credit Score Factors Explained", duration: "10 min", type: "video" },
      { title: "Starting Score vs Rebuilt Score Expectations", duration: "7 min", type: "reading" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Secured Credit Cards", lessons: [
      { title: "How Secured Cards Work", duration: "9 min", type: "video" },
      { title: "Best Secured Cards That Graduate to Unsecured", duration: "8 min", type: "reading" },
      { title: "Optimal Usage & Utilization Strategy", duration: "9 min", type: "video" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Credit Builder Loans & Products", lessons: [
      { title: "Credit Builder Loans Explained", duration: "8 min", type: "video" },
      { title: "Self Lender, Kikoff & Other Platforms", duration: "7 min", type: "reading" },
      { title: "Becoming an Authorized User", duration: "9 min", type: "video" },
      { title: "Tradeline Rentals — Risks & Benefits", duration: "8 min", type: "reading" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Building a 700+ Score Plan", lessons: [
      { title: "12-Month Credit Rebuilding Roadmap", duration: "11 min", type: "video" },
      { title: "Managing Utilization Below 10%", duration: "8 min", type: "video" },
      { title: "Payment History — Never Miss a Due Date", duration: "7 min", type: "reading" },
      { title: "When to Apply for New Credit", duration: "8 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
