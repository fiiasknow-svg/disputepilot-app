"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PROVIDERS = [
  {name:"SmartCredit",logo:"🔵",monthly:"$19.95/client",comm:"$10/mo",annual:"$120/yr",features:["3-Bureau Monitoring","Score Simulator","Dispute Tool","$1M ID Protection"],color:"#3b82f6"},
  {name:"MyFreeScore360",logo:"🟢",monthly:"$29.95/client",comm:"$15/mo",annual:"$180/yr",features:["3-Bureau Reports","Daily Updates","Credit Alerts","Score Tracking"],color:"#10b981"},
  {name:"IdentityIQ",logo:"🟣",monthly:"$24.95/client",comm:"$12/mo",annual:"$144/yr",features:["Credit Monitoring","ID Theft Insurance","Dark Web Scanning","Family Plan Option"],color:"#8b5cf6"},
  {name:"mySCOREIQ",logo:"🟠",monthly:"$19.99/client",comm:"$10/mo",annual:"$120/yr",features:["Real FICO Scores","3-Bureau Monitoring","Score Alerts","Credit Simulator"],color:"#f59e0b"},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Monitoring Commissions</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Earn $10–$15/month per client by enrolling them in credit monitoring — with zero extra work on your part.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
          {[{label:"Avg Commission/Client",val:"$120/yr",color:"#10b981"},{label:"With 50 Clients",val:"$6,000/yr",color:"#3b82f6"},{label:"With 100 Clients",val:"$12,000+/yr",color:"#8b5cf6"}].map(s=>(
            <div key={s.label} style={{...card,borderTop:`4px solid ${s.color}`,padding:"16px 20px"}}>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:28,fontWeight:900,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
          {PROVIDERS.map(p=>(
            <div key={p.name} style={{...card,display:"flex",gap:20,alignItems:"flex-start",borderLeft:`4px solid ${p.color}`}}>
              <div style={{fontSize:32,flexShrink:0}}>{p.logo}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8}}>
                  <h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#1e293b"}}>{p.name}</h3>
                  <div style={{display:"flex",gap:12}}>
                    {[["Client Pays",p.monthly],["You Earn",p.comm],["Annual Earnings",p.annual]].map(([l,v])=>(
                      <div key={String(l)} style={{textAlign:"center"}}>
                        <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>{l}</div>
                        <div style={{fontSize:14,fontWeight:800,color:l==="You Earn"?p.color:"#1e293b"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {p.features.map(f=><span key={f} style={{background:p.color+"15",color:p.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{f}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Enroll Clients & Earn Commissions</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[
              {n:"1",icon:"📋",title:"Sign Up as Affiliate",desc:"Register with your preferred monitoring provider using our partner affiliate link."},
              {n:"2",icon:"🔗",title:"Get Your Affiliate Link",desc:"Each provider gives you a unique link or promo code to track your client enrollments."},
              {n:"3",icon:"👥",title:"Enroll Your Clients",desc:"During onboarding, direct clients to sign up for monitoring using your link or add their credentials in DisputePilot."},
              {n:"4",icon:"💰",title:"Receive Monthly Payments",desc:"Commissions are paid monthly via PayPal or direct deposit as long as the client remains enrolled."},
            ].map(s=>(
              <div key={s.n} style={{textAlign:"center",padding:"16px 12px",background:"#f8fafc",borderRadius:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#1e3a5f",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,margin:"0 auto 10px"}}>{s.n}</div>
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
