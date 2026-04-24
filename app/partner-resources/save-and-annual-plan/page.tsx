"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PLANS = [
  {name:"Basic",monthly:79,annual:63,features:["Up to 25 clients","3 bureau disputes","Letter vault access","Basic reporting","Email support"],color:"#3b82f6"},
  {name:"Standard",monthly:149,annual:119,features:["Up to 75 clients","Unlimited disputes","Automation workflows","Advanced reporting","Priority support","Client portal"],color:"#10b981",popular:true},
  {name:"Premium",monthly:249,annual:199,features:["Unlimited clients","Everything in Standard","Dispute outsourcing credits","API access","White-label portal","Dedicated account manager"],color:"#8b5cf6"},
];

export default function Page() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly"|"annual">("annual");
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:900}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Save with Annual Plan</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Switch to annual billing and save up to 20% on your DisputePilot subscription — pay once, run all year.</p>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:8,padding:4,gap:4}}>
            {(["monthly","annual"] as const).map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{padding:"8px 20px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:billing===b?"#fff":"transparent",color:billing===b?"#1e293b":"#64748b",boxShadow:billing===b?"0 1px 4px rgba(0,0,0,0.08)":"none",transition:"all 0.2s"}}>
                {b.charAt(0).toUpperCase()+b.slice(1)} {b==="annual"&&<span style={{background:"#10b981",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:11,marginLeft:4}}>Save 20%</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:28}}>
          {PLANS.map(p=>(
            <div key={p.name} style={{...card,borderTop:`4px solid ${p.color}`,textAlign:"center",position:"relative"}}>
              {p.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#10b981",color:"#fff",borderRadius:20,padding:"3px 14px",fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>Most Popular</div>}
              <div style={{fontSize:16,fontWeight:800,color:p.color,marginBottom:10}}>{p.name}</div>
              <div style={{fontSize:38,fontWeight:900,color:"#1e293b",lineHeight:1}}>
                ${billing==="monthly"?p.monthly:p.annual}
              </div>
              <div style={{fontSize:13,color:"#94a3b8",marginBottom:4}}>/month</div>
              {billing==="annual"&&(
                <div style={{fontSize:12,color:"#10b981",fontWeight:700,marginBottom:4}}>
                  Save ${(p.monthly-p.annual)*12}/year
                </div>
              )}
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:18}}>{billing==="annual"?`Billed $${p.annual*12}/year`:"Billed monthly"}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20,textAlign:"left"}}>
                {p.features.map(f=><div key={f} style={{fontSize:13,color:"#374151"}}>✓ {f}</div>)}
              </div>
              <button style={{width:"100%",padding:"10px 0",background:p.color,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                {billing==="annual"?"Switch to Annual":"Get Started"}
              </button>
            </div>
          ))}
        </div>
        <div style={{...card,background:"#fffbeb",border:"1px solid #fde68a"}}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 10px",color:"#92400e"}}>💰 What You Save on Annual Billing</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {PLANS.map(p=>(
              <div key={p.name} style={{textAlign:"center",padding:"12px 16px",background:"#fff",borderRadius:8}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:4}}>{p.name} Plan</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:2}}>Monthly: ${p.monthly*12}/yr</div>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>Annual: ${p.annual*12}/yr</div>
                <div style={{fontSize:22,fontWeight:900,color:"#10b981"}}>Save ${(p.monthly-p.annual)*12}</div>
                <div style={{fontSize:11,color:"#10b981"}}>per year</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
