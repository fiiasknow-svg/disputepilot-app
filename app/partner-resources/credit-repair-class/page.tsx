"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const MODULES = [
  {n:1,title:"Understanding Credit Reports",duration:"45 min",lessons:6,icon:"📋",desc:"How credit reports work, the 3 bureaus, what each section means, and how to read a credit report like a professional."},
  {n:2,title:"FICO Score Factors",duration:"30 min",lessons:4,icon:"📊",desc:"Deep dive into the 5 FICO score factors, how they're weighted, and exactly what moves the score up or down."},
  {n:3,title:"Your Rights Under FCRA & FDCPA",duration:"60 min",lessons:8,icon:"⚖️",desc:"Complete coverage of the Fair Credit Reporting Act and Fair Debt Collection Practices Act — what collectors can and can't do."},
  {n:4,title:"How to Dispute Items",duration:"50 min",lessons:7,icon:"📝",desc:"Step-by-step dispute process for all 3 bureaus, round management strategy, and how to escalate when items come back verified."},
  {n:5,title:"Building Positive Credit",duration:"35 min",lessons:5,icon:"📈",desc:"Credit builder loans, secured cards, authorized user strategies, and how to optimize utilization for maximum score impact."},
  {n:6,title:"Maintaining Great Credit",duration:"25 min",lessons:4,icon:"🏆",desc:"Long-term credit maintenance habits, monitoring services, how to avoid common mistakes that cause score drops."},
];

export default function Page() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<number|null>(null);
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Credit Repair Class</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>White-label our complete credit education course and offer it to clients as a premium add-on or standalone product.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div style={{...card,background:"linear-gradient(135deg,#1e3a5f,#14b8a6)",color:"#fff"}}>
            <div style={{fontSize:32,marginBottom:12}}>🎓</div>
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800}}>White-Label Credit Course</h3>
            <p style={{margin:"0 0 16px",fontSize:13,opacity:0.9,lineHeight:1.6}}>Fully branded with your company name and logo. Your clients see it as YOUR proprietary course — not ours.</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[["6","Modules"],["34","Lessons"],["4.5hr","Content"],["100%","White-Label"]].map(([v,l])=>(
                <div key={l} style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900}}>{v}</div><div style={{fontSize:11,opacity:0.8}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={card}>
            <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Use This Course</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {icon:"💰",text:"Sell it as a standalone product at $97–$297 — pure profit for you."},
                {icon:"🎁",text:"Bundle it with your credit repair service as a free bonus to increase perceived value."},
                {icon:"🎯",text:"Use it as a lead magnet: offer Module 1 free to attract prospects, then upsell to full course or service."},
                {icon:"👥",text:"Offer it to partner businesses (realtors, auto dealers) for their clients — positions you as the expert."},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",background:"#f8fafc",borderRadius:7}}>
                  <span style={{fontSize:16}}>{s.icon}</span>
                  <span style={{fontSize:13,color:"#374151",lineHeight:1.5}}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 16px",color:"#1e293b"}}>Course Modules</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {MODULES.map(m=>(
              <div key={m.n} onClick={()=>setActiveModule(activeModule===m.n?null:m.n)}
                style={{border:"1px solid #f1f5f9",borderRadius:8,overflow:"hidden",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:activeModule===m.n?"#eff6ff":"#fff"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#14b8a6",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0}}>{m.n}</div>
                  <span style={{fontSize:18}}>{m.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{m.title}</div>
                    <div style={{fontSize:12,color:"#94a3b8"}}>{m.duration} · {m.lessons} lessons</div>
                  </div>
                  <span style={{color:"#94a3b8",fontSize:18}}>{activeModule===m.n?"▲":"▼"}</span>
                </div>
                {activeModule===m.n&&(
                  <div style={{padding:"12px 16px",background:"#f8fafc",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#374151",lineHeight:1.6}}>{m.desc}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
