"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "Compliance Specialist",
  subtitle: "Stay legally compliant and protect your credit repair business from regulatory risk.",
  description: "A comprehensive deep-dive into CROA, state-level credit repair laws, required contracts, advertising rules, and operational best practices to keep your business legally protected.",
  level: "Advanced",
  totalHours: "5.5 hours",
  icon: "📋",
  color: "#10b981",
  certTitle: "Certified Compliance Specialist",
  modules: [
    { title: "Credit Repair Organizations Act (CROA)", lessons: [
      { title: "What is CROA?", duration: "9 min", type: "video" },
      { title: "Prohibited Practices Under CROA", duration: "10 min", type: "video" },
      { title: "CROA Required Disclosures", duration: "8 min", type: "reading" },
      { title: "The 3-Day Right to Cancel Rule", duration: "7 min", type: "video" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Service Contracts & Written Agreements", lessons: [
      { title: "What Every Credit Repair Contract Must Include", duration: "10 min", type: "video" },
      { title: "Allowed vs Prohibited Contract Terms", duration: "8 min", type: "reading" },
      { title: "Using Digital Signatures Legally", duration: "7 min", type: "video" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "State Laws & Licensing", lessons: [
      { title: "States That Require Credit Repair Licensing", duration: "11 min", type: "video" },
      { title: "State Bonding & Registration Requirements", duration: "9 min", type: "reading" },
      { title: "Operating Across State Lines", duration: "8 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Advertising & Marketing Compliance", lessons: [
      { title: "FTC Rules on Credit Repair Advertising", duration: "10 min", type: "video" },
      { title: "What You Cannot Claim in Ads", duration: "9 min", type: "reading" },
      { title: "Endorsements, Testimonials & Results", duration: "8 min", type: "video" },
      { title: "Social Media & Online Marketing Rules", duration: "7 min", type: "reading" },
      { title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Risk Management & Best Practices", lessons: [
      { title: "Building a Compliance-First Operation", duration: "10 min", type: "video" },
      { title: "Employee Training for Compliance", duration: "8 min", type: "reading" },
      { title: "Responding to CFPB & State AG Actions", duration: "9 min", type: "video" },
      { title: "Final Assessment", duration: "20 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
