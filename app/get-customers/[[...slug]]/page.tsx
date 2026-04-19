"use client";
import CDMLayout from "@/components/CDMLayout";

const SECTIONS: Record<string, { title: string; desc: string }> = {
  "": { title: "Get Customers", desc: "Resources and strategies to grow your credit repair client base." },
  "start-run-grow": { title: "Start, Run & Grow", desc: "Step-by-step guidance for launching and scaling your credit repair business." },
  "business-strategies": { title: "Business Strategies", desc: "Proven marketing and outreach strategies for credit repair professionals." },
};

export default function Page({ params }: { params: { slug?: string[] } }) {
  const key = params.slug?.join("/") ?? "";
  const section = SECTIONS[key] ?? { title: "Get Customers", desc: "This section is coming soon." };

  return (
    <CDMLayout>
      <div style={{ padding: 32, maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#1e293b" }}>{section.title}</h1>
        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32 }}>{section.desc}</p>
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "28px 32px", textAlign: "center" as const }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0369a1", margin: "0 0 8px" }}>Content Coming Soon</h2>
          <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.6 }}>
            This section is being built out. Check back soon for resources, guides, and tools to help you grow your business.
          </p>
        </div>
      </div>
    </CDMLayout>
  );
}
