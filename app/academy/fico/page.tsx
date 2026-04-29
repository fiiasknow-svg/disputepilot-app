"use client";
import AcademyPage, { CourseData } from "@/components/AcademyPage";

const course: CourseData = {
  title: "FICO Score Specialist",
  subtitle: "Understand every scoring model and learn how to maximize any client's score.",
  description: "Go deep on FICO — all score versions, the 5 weighted factors, how lenders use scores, score simulators, and proven tactics to push clients from 580 to 750+ in the shortest time possible.",
  level: "Advanced",
  totalHours: "5 hours",
  icon: "📊",
  color: "#0369a1",
  certTitle: "Certified FICO Score Specialist",
  modules: [
    { title: "FICO Score Models", lessons: [
      { title: "FICO 8 vs FICO 9 vs VantageScore", duration: "10 min", type: "video" },
      { title: "Industry-Specific Scores (Auto, Mortgage)", duration: "8 min", type: "video" },
      { title: "Which Lenders Use Which Models", duration: "7 min", type: "reading" },
      { title: "Module 1 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "The 5 Score Factors", lessons: [
      { title: "Payment History — 35%", duration: "9 min", type: "video" },
      { title: "Credit Utilization — 30%", duration: "10 min", type: "video" },
      { title: "Length of Credit History — 15%", duration: "7 min", type: "reading" },
      { title: "Credit Mix — 10%", duration: "7 min", type: "video" },
      { title: "New Credit & Hard Inquiries — 10%", duration: "8 min", type: "video" },
      { title: "Module 2 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Score Optimization Strategies", lessons: [
      { title: "The Fastest Ways to Raise a Score", duration: "11 min", type: "video" },
      { title: "Rapid Rescore — How & When to Use It", duration: "9 min", type: "video" },
      { title: "Strategic Utilization Management", duration: "8 min", type: "reading" },
      { title: "Removing Negative Items vs Adding Positives", duration: "9 min", type: "video" },
      { title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ]},
    { title: "Score Simulators & Client Coaching", lessons: [
      { title: "Using Score Simulators Effectively", duration: "8 min", type: "video" },
      { title: "Setting Score Goals with Clients", duration: "7 min", type: "reading" },
      { title: "Common Score Myths to Correct", duration: "8 min", type: "video" },
      { title: "Final Assessment", duration: "15 min", type: "quiz" },
    ]},
  ],
};

export default function Page() { return <AcademyPage course={course} />; }
