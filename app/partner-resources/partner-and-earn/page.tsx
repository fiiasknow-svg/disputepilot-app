"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const TIERS = [
  {name:"Bronze",refs:"1–5 referrals",monthly:"$25/ref/mo",annual:"$300/ref/yr",color:"#cd7f32",perks:["Referral dashboard access","Monthly payout via PayPal","Marketing materials kit"]},
  {name:"Silver",refs:"6–15 referrals",monthly:"$40/ref/mo",annual:"$480/ref/yr",color:"#94a3b8",perks:["Everything in Bronze","Priority support","Co-branded landing page","Quarterly bonus"]},
  {name:"Gold",refs:"16–30 referrals",monthly:"$60/ref/mo",annual:"$720/ref/yr",color:"#f59e0b",perks:["Everything in Silver","Dedicated partner manager","Custom onboarding for referrals","Weekly payouts"]},
  {name:"Platinum",refs:"31+ referrals",monthly:"$100/ref/mo",annual:"$1,200/ref/yr",color:"#8b5cf6",perks:["Everything in Gold","Revenue share bonuses","Featured in DisputePilot directory","Annual retreat invitation"]},
];

export default function Page() {
  const router = useRouter();
  const [refCount, setRefCount] = useState(10);
  const monthly = refCount >= 31 ? refCount*100 : refCount >= 16 ? refCount*60 : refCount >= 6 ? refCount*40 : refCount*25;
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Partner & Earn</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Refer other credit repair businesses to DisputePilot and earn recurring monthly commissions for every active referral.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {TIERS.map(t=>(
            <div key={t.name} style={{...card,borderTop:`4px solid ${t.color}`,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:t.color,marginBottom:4}}>{t.name}</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>{t.refs}</div>
              <div style={{fontSize:26,fontWeight:900,color:"#1e293b",marginBottom:2}}>{t.monthly}</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>per referral/month</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {t.perks.map(p=><div key={p} style={{fontSize:11,color:"#374151",textAlign:"left"}}>✓ {p}</div>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{...card,marginBottom:24}}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 16px",color:"#1e293b"}}>Earnings Calculator</h3>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",marginBottom:16}}>
            <div style={{flex:1,minWidth:200}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>How many businesses can you refer? <strong style={{color:"#1e3a5f"}}>{refCount}</strong></label>
              <input type="range" min={1} max={50} value={refCount} onChange={e=>setRefCount(Number(e.target.value))} style={{width:"100%",accentColor:"#1e3a5f"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8",marginTop:2}}><span>1</span><span>25</span><span>50</span></div>
            </div>
            <div style={{textAlign:"center",padding:"16px 24px",background:"#f0fdf4",borderRadius:10}}>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>Monthly Earnings</div>
              <div style={{fontSize:34,fontWeight:900,color:"#10b981"}}>${monthly.toLocaleString()}</div>
              <div style={{fontSize:12,color:"#64748b"}}>${(monthly*12).toLocaleString()}/year</div>
            </div>
          </div>
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Refer</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[
              {n:"1",icon:"🔗",title:"Get Your Link",desc:"Your unique referral link is in Account Settings → Partner Program."},
              {n:"2",icon:"📣",title:"Share It",desc:"Share your link in Facebook groups, YouTube, LinkedIn, or one-on-one with other practitioners."},
              {n:"3",icon:"✍️",title:"They Sign Up",desc:"When they create a paid DisputePilot account using your link, they're tracked as your referral."},
              {n:"4",icon:"💰",title:"Earn Monthly",desc:"You earn your tier commission every month their account stays active. Commissions are paid on the 15th."},
            ].map(s=>(
              <div key={s.n} style={{textAlign:"center",padding:"16px 12px",background:"#f8fafc",borderRadius:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#1e3a5f",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,margin:"0 auto 8px"}}>{s.n}</div>
                <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:4}}>{s.title}</div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
