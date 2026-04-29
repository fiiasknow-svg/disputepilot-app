"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PRODUCTS = [
  {name:"SBA Loans",range:"$50K–$5M",term:"5–25 years",rate:"Prime + 2–4%",credit:"680+",time:"30–90 days",comm:"$500–$2,000",icon:"🏛️",color:"#3b82f6",desc:"Government-backed loans with the best rates available. Ideal for clients who have improved their credit through your service."},
  {name:"Business Line of Credit",range:"$10K–$250K",term:"Revolving",rate:"8–24% APR",credit:"620+",time:"3–14 days",comm:"$200–$800",icon:"💳",color:"#10b981",desc:"Flexible revolving credit line. Clients draw what they need and repay. Great for cash flow management."},
  {name:"Equipment Financing",range:"$5K–$500K",term:"12–84 months",rate:"6–18%",credit:"600+",time:"24–48 hours",comm:"$150–$1,000",icon:"⚙️",color:"#8b5cf6",desc:"Financing specifically for business equipment. The equipment serves as collateral, so credit requirements are more flexible."},
  {name:"Invoice Factoring",range:"Up to $500K",term:"Ongoing",rate:"1–5% per 30 days",credit:"No minimum",time:"24–48 hours",comm:"$100–$500",icon:"📄",color:"#f59e0b",desc:"Sell outstanding invoices at a discount for immediate cash. Credit score of the business owner matters less than the creditworthiness of their customers."},
  {name:"Merchant Cash Advance",range:"$5K–$250K",term:"3–18 months",rate:"Factor 1.15–1.45",credit:"550+",time:"24–72 hours",comm:"$100–$600",icon:"⚡",color:"#ef4444",desc:"Fast access to capital based on future credit card sales. Highest approval rates but most expensive option — use as a last resort."},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Offer Business Funding</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Help your clients access business capital and earn $200–$2,000 per funded deal — with no lending license required.</p>
        </div>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"16px 20px",marginBottom:24,display:"flex",gap:12}}>
          <span style={{fontSize:20}}>💡</span>
          <div style={{fontSize:13,color:"#166534",lineHeight:1.6}}><strong>Why this is powerful:</strong> Many of your clients are small business owners. After you repair their personal credit, they become eligible for business funding they couldn't access before. You've already built the relationship — this is a natural next conversation that earns you $200–$2,000 per referral.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
          {PRODUCTS.map(p=>(
            <div key={p.name} style={{...card,borderLeft:`4px solid ${p.color}`}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flex:1,minWidth:180}}>
                  <span style={{fontSize:28}}>{p.icon}</span>
                  <div>
                    <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:800,color:"#1e293b"}}>{p.name}</h3>
                    <p style={{margin:0,fontSize:12,color:"#64748b",lineHeight:1.55}}>{p.desc}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  {[["Funding Range",p.range],["Term",p.term],["Rate",p.rate],["Min Credit",p.credit],["Time to Fund",p.time],["Your Commission",p.comm]].map(([l,v])=>(
                    <div key={String(l)} style={{textAlign:"center",minWidth:70}}>
                      <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:13,fontWeight:700,color:l==="Your Commission"?"#10b981":"#1e293b"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Introduce Business Funding to Your Clients</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {[
              {icon:"🗣️",title:"The Conversation",desc:"After delivering credit results: 'Now that your personal credit is strong, have you thought about business funding? Many of my clients qualify for $50K–$250K in business credit once their scores are in range.'"},
              {icon:"📋",title:"The Qualification Check",desc:"Ask: 1) Do you have a registered business? 2) How long have you been in business? 3) What's your monthly revenue? 4) What do you need the funding for? This tells you which product fits."},
              {icon:"🤝",title:"The Referral",desc:"Submit their information to our funding partner through your referral link. The funding specialist takes it from there. You get paid at closing."},
              {icon:"💰",title:"The Commission",desc:"Commissions range from $200–$2,000 depending on the funded amount and product type. Most deals close within 2 weeks. Payment arrives within 30 days of funding."},
            ].map(s=>(
              <div key={s.title} style={{padding:"14px 16px",background:"#f8fafc",borderRadius:8}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:4}}>{s.title}</div>
                    <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CDMLayout>
  );
}
