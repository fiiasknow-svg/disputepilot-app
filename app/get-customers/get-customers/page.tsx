"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const LEAD_SOURCES = [
  {icon:"👥",title:"Referral Network",color:"#10b981",monthly:"8–15",costPer:"$0–$50",conv:"35–50%",
    steps:["Identify 10 potential referral partners in your area","Schedule a 30-min coffee meeting with each","Bring business cards and a one-page partner overview","Offer them something in return (cross-promotion, referral fee, etc.)","Follow up monthly with updates on clients you helped"]},
  {icon:"📱",title:"Social Media Organic",color:"#3b82f6",monthly:"4–10",costPer:"$0",conv:"10–20%",
    steps:["Post credit tips daily on Facebook and Instagram","Use Reels/Shorts for maximum reach — credit score facts perform well","Add a 'Book a Free Consultation' link in your bio","Engage with comments within 1 hour of posting","Run weekly Q&A sessions or credit score challenges"]},
  {icon:"💰",title:"Paid Facebook / Instagram Ads",color:"#8b5cf6",monthly:"10–30",costPer:"$8–$20",conv:"15–25%",
    steps:["Create a lead generation ad with a free credit score quiz or consultation offer","Target: ages 25–55, interests in home buying, car loans, debt freedom","Use a simple landing page with one CTA (book consultation)","Set daily budget at $15–$30 and track cost per lead","Scale winning ads; kill ads with cost per lead over $25"]},
  {icon:"🌐",title:"Google Ads & SEO",color:"#f59e0b",monthly:"5–20",costPer:"$15–$40",conv:"20–35%",
    steps:["Target high-intent keywords: 'credit repair [city]', 'remove collections from credit report'","Create location-specific landing pages for each service area","Optimize your Google My Business listing with photos and reviews","Build backlinks from local business directories","SEO takes 3–6 months but delivers free, high-intent leads long-term"]},
];

const FUNNEL_STEPS = [
  {n:1,title:"Awareness",icon:"👁️",color:"#3b82f6",desc:"Prospect discovers you via social media, Google, referral, or word of mouth."},
  {n:2,title:"Interest",icon:"🤔",color:"#8b5cf6",desc:"They visit your website or Facebook page to learn more about your services."},
  {n:3,title:"Free Offer",icon:"🎁",color:"#f59e0b",desc:"They opt in for a free credit score analysis, guide, or consultation — this is the key conversion point."},
  {n:4,title:"Consultation",icon:"📞",color:"#10b981",desc:"You have a 15–30 minute call to understand their situation and present your solution."},
  {n:5,title:"Enrollment",icon:"✍️",color:"#1e3a5f",desc:"They sign the service agreement and pay the enrollment fee. They're now a client."},
  {n:6,title:"Results & Referrals",icon:"🌟",color:"#10b981",desc:"You deliver results, ask for a review, and activate their referral incentive."},
];

const SCRIPTS = [
  {title:"Opening a Referral Conversation with a Realtor",text:`"Hey [Name], I work with credit repair clients who are trying to get mortgage-ready. I know you probably lose deals every year because buyers don't qualify. I'd love to be your go-to resource — I'll fix your clients' credit and send them right back to you. Can we grab coffee this week?"`},
  {title:"Response When Someone Asks 'How Much Does It Cost?'",text:`"Great question! My fees depend on the scope of work — most clients pay between $99–$199 per month with an enrollment fee. But here's the thing — before I ever talk about price, I want to look at your credit report with you for free. That way I can tell you exactly what needs to be done and give you a realistic timeline. Sound good?"`},
  {title:"Handling 'I Can Fix It Myself'",text:`"Absolutely — the information is free and you can do this yourself. The question is time, knowledge, and follow-through. Most people who try to DIY it give up within 30 days because the bureaus send confusing responses and the process stalls. My clients pay me to do the heavy lifting so they can focus on their life. But I totally respect the DIY approach — want me to send you some free resources either way?"`},
];

export default function Page() {
  const router = useRouter();
  const [activeSource, setActiveSource] = useState(0);
  const src = LEAD_SOURCES[activeSource];

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1050}}>
        <button onClick={()=>router.push("/get-customers")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Get Customers</button>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Get Customers</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Your client acquisition playbook — lead sources, conversion funnels, and word-for-word scripts.</p>
        </div>

        {/* Lead Sources */}
        <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",marginBottom:24,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9"}}>
            <h2 style={{margin:0,fontSize:15,fontWeight:800,color:"#1e293b"}}>Top Lead Sources for Credit Repair</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"240px 1fr"}}>
            <div style={{borderRight:"1px solid #f1f5f9"}}>
              {LEAD_SOURCES.map((s,i)=>(
                <div key={i} onClick={()=>setActiveSource(i)}
                  style={{padding:"14px 18px",cursor:"pointer",borderBottom:"1px solid #f8fafc",background:i===activeSource?"#eff6ff":"transparent",borderLeft:i===activeSource?`3px solid ${s.color}`:"3px solid transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{s.icon}</span>
                    <span style={{fontSize:13,fontWeight:i===activeSource?700:500,color:i===activeSource?"#1e293b":"#64748b"}}>{s.title}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:24}}>
              <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
                {[["Avg Leads/Month",src.monthly,src.color],["Cost Per Lead",src.costPer,"#64748b"],["Conversion Rate",src.conv,"#10b981"]].map(([l,v,c])=>(
                  <div key={String(l)} style={{padding:"10px 16px",background:"#f8fafc",borderRadius:8,flex:1,minWidth:100}}>
                    <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:18,fontWeight:800,color:c as string}}>{v}</div>
                  </div>
                ))}
              </div>
              <h3 style={{fontSize:14,fontWeight:700,color:"#374151",margin:"0 0 10px"}}>Action Steps</h3>
              <ol style={{margin:0,paddingLeft:20,display:"flex",flexDirection:"column",gap:8}}>
                {src.steps.map((step,i)=><li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:24,marginBottom:24}}>
          <h2 style={{fontSize:15,fontWeight:800,margin:"0 0 20px",color:"#1e293b"}}>Client Conversion Funnel</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:0,position:"relative"}}>
            {FUNNEL_STEPS.map((s,i)=>(
              <div key={i} style={{textAlign:"center",position:"relative",zIndex:1}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  {i>0&&<div style={{flex:1,height:2,background:"#e2e8f0",marginTop:-16}}/>}
                  <div style={{width:40,height:40,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto",flexShrink:0}}>{s.icon}</div>
                  {i<5&&<div style={{flex:1,height:2,background:"#e2e8f0",marginTop:-16}}/>}
                </div>
                <div style={{marginTop:8,fontSize:11,fontWeight:700,color:s.color}}>{s.title}</div>
                <div style={{marginTop:4,fontSize:11,color:"#64748b",lineHeight:1.5,padding:"0 4px"}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Scripts */}
        <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:24,marginBottom:24}}>
          <h2 style={{fontSize:15,fontWeight:800,margin:"0 0 20px",color:"#1e293b"}}>Word-for-Word Sales Scripts</h2>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {SCRIPTS.map((s,i)=>(
              <div key={i} style={{padding:18,background:"#f8fafc",borderRadius:8,borderLeft:"3px solid #3b82f6"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:8}}>{s.title}</div>
                <p style={{margin:0,fontSize:13,color:"#475569",fontStyle:"italic",lineHeight:1.7}}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
