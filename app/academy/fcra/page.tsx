"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "FCRA Specialist",
  subtitle: "Deep knowledge of the Fair Credit Reporting Act and how to use it for your clients.",
  description: "Become an expert in the FCRA — consumer rights, credit bureau obligations, dispute procedures, and civil remedies. Essential knowledge for every credit repair professional.",
  level: "Intermediate",
  totalHours: "5 hours",
  icon: "⚖️",
  color: "#3b82f6",
  certTitle: "Certified FCRA Specialist",
  modules: [
    { title: "FCRA Foundations", lessons: [
      { title: "History & Purpose of the FCRA", duration: "9 min", type: "video" },
      { title: "Who the FCRA Covers", duration: "7 min", type: "reading" },
      { title: "Key Definitions in the FCRA", duration: "10 min", type: "video" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Consumer Rights Under the FCRA", lessons: [
      { title: "Right to Access Your Credit File", duration: "8 min", type: "video" },
      { title: "Right to Dispute Inaccurate Information", duration: "10 min", type: "video" },
      { title: "Right to Know Who Has Accessed Your Report", duration: "7 min", type: "reading" },
      { title: "Opt-Out Rights & Prescreened Offers", duration: "6 min", type: "reading" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Credit Bureau & Furnisher Obligations", lessons: [
      { title: "CRA Dispute Investigation Requirements", duration: "11 min", type: "video" },
      { title: "The 30-Day Investigation Window", duration: "8 min", type: "video" },
      { title: "Furnisher Duties After a Dispute", duration: "9 min", type: "reading" },
      { title: "Reinsertion Rules & Notifications", duration: "8 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "FCRA in Dispute Practice", lessons: [
      { title: "Citing FCRA Violations in Letters", duration: "10 min", type: "video" },
      { title: "Section 609 & Section 611 Letters", duration: "9 min", type: "reading" },
      { title: "Statute of Limitations on Negative Items", duration: "8 min", type: "video" },
      { title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Civil Remedies & Enforcement", lessons: [
      { title: "Willful vs Negligent FCRA Violations", duration: "9 min", type: "video" },
      { title: "Statutory & Actual Damages", duration: "8 min", type: "reading" },
      { title: "Filing Complaints with the CFPB", duration: "7 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
