"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "Funding Specialist",
  subtitle: "Help clients access business and personal funding after credit repair.",
  description: "Learn how to guide clients toward funding opportunities once their credit improves — from secured business credit cards and SBA loans to DUNS numbers, shelf corporations, and credit-based business funding strategies.",
  level: "Advanced",
  totalHours: "5 hours",
  icon: "💰",
  color: "#16a34a",
  certTitle: "Certified Funding Specialist",
  modules: [
    { title: "Funding Foundations", lessons: [
      { title: "Why Funding is the Next Step After Repair", duration: "8 min", type: "video" },
      { title: "Personal vs Business Credit — Key Differences", duration: "9 min", type: "video" },
      { title: "How Lenders Evaluate Creditworthiness", duration: "7 min", type: "reading" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Building Business Credit", lessons: [
      { title: "Setting Up Your Business Entity for Credit", duration: "10 min", type: "video" },
      { title: "Getting a DUNS Number & Business Listings", duration: "8 min", type: "video" },
      { title: "Net-30 Vendor Accounts That Report", duration: "9 min", type: "reading" },
      { title: "Business Credit Cards — Secured & Unsecured", duration: "8 min", type: "video" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Loan & Funding Products", lessons: [
      { title: "SBA Loans — Types, Eligibility & Process", duration: "11 min", type: "video" },
      { title: "Business Lines of Credit", duration: "9 min", type: "video" },
      { title: "Equipment Financing & Invoice Factoring", duration: "7 min", type: "reading" },
      { title: "Personal Loans vs Business Loans", duration: "8 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Funding Strategy & Client Coaching", lessons: [
      { title: "Building a 90-Day Funding Roadmap", duration: "10 min", type: "video" },
      { title: "When Clients Are Ready to Apply for Funding", duration: "8 min", type: "reading" },
      { title: "Common Funding Mistakes to Avoid", duration: "8 min", type: "video" },
      { title: "Adding Funding Services to Your Business", duration: "9 min", type: "reading" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
