"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PROCESSORS = [
  {name:"PayHQ",logo:"💳",fee:"2.9% + $0.30",monthly:"$25/mo",setup:"Free",rating:5,best:"Best for credit repair",desc:"Purpose-built for subscription-based businesses like credit repair. Supports recurring billing, ACH, and has low chargeback risk compared to standard processors.",pros:["Built for credit repair industry","Low chargeback rates","Recurring billing included","Same-day and next-day deposits"],link:"#"},
  {name:"Payroc",logo:"🔐",fee:"2.75% + $0.15",monthly:"$20/mo",setup:"Free",rating:5,best:"Best for high volume",desc:"High-volume merchant account with strong fraud protection and credit repair compliance. Excellent for businesses processing over $10,000/month.",pros:["Competitive rates at volume","Strong fraud protection","Credit repair compliant","Dedicated account manager"],link:"#"},
  {name:"Stripe",logo:"⚡",fee:"2.9% + $0.30",monthly:"$0/mo",setup:"Free",rating:4,best:"Easiest to set up",desc:"The fastest way to start accepting payments online. No monthly fee — you pay only when you process. Best for new businesses just getting started.",pros:["No monthly fee","5-minute setup","Great developer tools","Supports subscriptions"],link:"#"},
  {name:"Square",logo:"🟦",fee:"2.6% + $0.10",monthly:"$0/mo",setup:"Free",rating:4,best:"Best for in-person",desc:"Ideal if you take payments in person or at events. Free card reader, easy POS, and no monthly fee make this great for new practitioners.",pros:["Free card reader","No monthly fee","Simple invoicing","In-person payments"],link:"#"},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Merchant Accounts</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Accept credit cards, run recurring billing, and get paid reliably with processors built for the credit repair industry.</p>
        </div>
        <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:"14px 20px",marginBottom:24,display:"flex",gap:12}}>
          <span style={{fontSize:20}}>⚠️</span>
          <div style={{fontSize:13,color:"#9a3412",lineHeight:1.6}}><strong>Important:</strong> Many standard payment processors (Square standard, PayPal, Venmo) flag and shut down credit repair businesses. Always use a processor that explicitly supports the credit repair industry and discloses your business type upfront during the application.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
          {PROCESSORS.map(p=>(
            <div key={p.name} style={{...card,borderLeft:`4px solid ${p.rating===5?"#10b981":"#3b82f6"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:28}}>{p.logo}</span>
                  <div>
                    <h3 style={{margin:"0 0 2px",fontSize:17,fontWeight:800,color:"#1e293b"}}>{p.name}</h3>
                    <span style={{background:"#dcfce7",color:"#166534",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{p.best}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  {[["Processing Fee",p.fee],["Monthly Fee",p.monthly],["Setup",p.setup]].map(([l,v])=>(
                    <div key={String(l)} style={{textAlign:"center"}}>
                      <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{fontSize:13,color:"#64748b",margin:"0 0 12px",lineHeight:1.6}}>{p.desc}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {p.pros.map(pr=><span key={pr} style={{background:"#f0fdf4",color:"#166534",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>✓ {pr}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Apply</h3>
          <ol style={{margin:0,paddingLeft:20,display:"flex",flexDirection:"column",gap:10}}>
            {["Choose the processor that fits your volume and needs above.","Click 'Apply Now' and complete the merchant application — be transparent about your credit repair business type.","Submit required documents: business license, EIN, articles of incorporation, voided check.","Approval typically takes 1–5 business days.","Configure your merchant account in DisputePilot under Billing → Credit Card Setup.","Test a $1 charge before going live with clients."].map((s,i)=>(
              <li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </CDMLayout>
  );
}
