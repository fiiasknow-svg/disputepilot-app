"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const INCLUDED = [
  {icon:"📝",title:"Dispute Letter Drafting","desc":"Our certified specialists draft customized dispute letters for each negative item based on the violation type and bureau."},
  {icon:"📬",title:"Bureau Submission","desc":"Letters are sent directly to Equifax, Experian, and TransUnion via certified mail or electronic submission."},
  {icon:"📊",title:"Response Tracking","desc":"All bureau responses are tracked and logged in your DisputePilot account so you're always up to date."},
  {icon:"🔄",title:"Round Management","desc":"Specialists manage multiple dispute rounds automatically, escalating when needed without you lifting a finger."},
  {icon:"📞",title:"Client Status Updates","desc":"Your clients receive automatic email updates when disputes are sent, responded to, or resolved."},
  {icon:"📁",title:"Documentation","desc":"All dispute documentation, letters, and responses are stored in the client's DisputePilot file."},
];

const PRICING = [
  {name:"Pay Per Dispute",price:"$15",unit:"/per dispute",color:"#3b82f6",desc:"Perfect for low-volume practitioners. Pay only for what you use with no minimum commitment.",features:["No monthly minimum","Per-item pricing","Full letter drafting","Bureau submission included"]},
  {name:"Starter Bundle",price:"$149",unit:"/month",color:"#10b981",desc:"Up to 15 disputes per month. Ideal for practices with 10–20 active clients.",features:["Up to 15 disputes/mo","All 3 bureaus","Priority queue","Monthly summary report"]},
  {name:"Growth Bundle",price:"$299",unit:"/month",color:"#8b5cf6",desc:"Up to 40 disputes per month. Built for growing practices with 25–50 active clients.",features:["Up to 40 disputes/mo","Dedicated specialist","Same-week turnaround","Weekly status reports"]},
  {name:"Enterprise",price:"Custom",unit:"",color:"#1e3a5f",desc:"For large practices with 50+ active clients and high dispute volume. Custom pricing and SLA.",features:["Unlimited disputes","Dedicated team","API integration","SLA guarantee"]},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Dispute Outsourcing</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Scale your credit repair business without hiring — hand off dispute processing to our certified specialists.</p>
        </div>
        <div style={{background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",borderRadius:10,padding:"20px 24px",color:"#fff",marginBottom:24,display:"flex",gap:24,flexWrap:"wrap"}}>
          {[["100%","Compliance Rate"],["48hr","Avg Turnaround"],["3X","Faster Scaling"],["$0","Hiring Cost"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900}}>{v}</div>
              <div style={{fontSize:12,opacity:0.8}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
          {INCLUDED.map(i=>(
            <div key={i.title} style={{...card,padding:"18px 20px"}}>
              <div style={{fontSize:24,marginBottom:8}}>{i.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:4}}>{i.title}</div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.55}}>{i.desc}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {PRICING.map(p=>(
            <div key={p.name} style={{...card,borderTop:`4px solid ${p.color}`,textAlign:"center",padding:"20px 16px"}}>
              <div style={{fontSize:14,fontWeight:800,color:p.color,marginBottom:8}}>{p.name}</div>
              <div style={{fontSize:30,fontWeight:900,color:"#1e293b",lineHeight:1}}>{p.price}<span style={{fontSize:13,fontWeight:500,color:"#64748b"}}>{p.unit}</span></div>
              <p style={{fontSize:12,color:"#64748b",margin:"10px 0 14px",lineHeight:1.5}}>{p.desc}</p>
              <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
                {p.features.map(f=><div key={f} style={{fontSize:12,color:"#374151"}}>✓ {f}</div>)}
              </div>
              <button style={{width:"100%",padding:"9px 0",background:p.color,color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer"}}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </CDMLayout>
  );
}
