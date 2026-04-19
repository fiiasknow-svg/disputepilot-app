"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "Credit Repair Specialist",
  subtitle: "Master the complete credit repair process from client intake to dispute resolution.",
  description: "Learn how to run a professional credit repair business — from understanding credit reports to writing effective dispute letters, managing clients, and scaling your practice.",
  level: "Beginner",
  totalHours: "6 hours",
  icon: "🔧",
  color: "#1e3a5f",
  certTitle: "Certified Credit Repair Specialist",
  modules: [
    { title: "Introduction to Credit Repair", lessons: [
      { title: "What is Credit Repair?", duration: "8 min", type: "video" },
      { title: "How Credit Reports Work", duration: "10 min", type: "video" },
      { title: "The 3 Major Bureaus Explained", duration: "7 min", type: "reading" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Reading & Analyzing Credit Reports", lessons: [
      { title: "How to Pull a 3-Bureau Report", duration: "9 min", type: "video" },
      { title: "Identifying Negative Items", duration: "11 min", type: "video" },
      { title: "Accounts, Inquiries & Public Records", duration: "8 min", type: "reading" },
      { title: "Practice: Annotating a Sample Report", duration: "12 min", type: "reading" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "The Dispute Process", lessons: [
      { title: "How the Dispute Process Works", duration: "10 min", type: "video" },
      { title: "Grounds for Disputing an Item", duration: "9 min", type: "video" },
      { title: "Round 1 vs Round 2 Strategies", duration: "8 min", type: "reading" },
      { title: "Working with Metro 2 Format", duration: "11 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Writing Dispute Letters", lessons: [
      { title: "Anatomy of a Dispute Letter", duration: "9 min", type: "video" },
      { title: "Standard Dispute Letter Templates", duration: "8 min", type: "reading" },
      { title: "Goodwill & Pay-for-Delete Letters", duration: "10 min", type: "video" },
      { title: "Method of Verification Letters", duration: "7 min", type: "reading" },
      { title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Client Management & Business Basics", lessons: [
      { title: "Client Onboarding Best Practices", duration: "10 min", type: "video" },
      { title: "Setting Realistic Client Expectations", duration: "8 min", type: "video" },
      { title: "CROA Compliance Overview", duration: "9 min", type: "reading" },
      { title: "Pricing Your Services", duration: "7 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
