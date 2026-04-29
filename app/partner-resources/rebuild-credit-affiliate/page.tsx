"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PRODUCTS = [
  {name:"Credit Strong",type:"Credit Builder Loan",logo:"💪",comm:"$10 flat",recurring:false,minScore:"No minimum",color:"#10b981",
    desc:"Clients make monthly payments into a savings account. The payment history is reported to all 3 bureaus, building credit fast. Great for clients with thin credit files.",
    ideal:"Clients with no credit or very thin credit history"},
  {name:"Kikoff",type:"Credit Line Account",logo:"🟢",comm:"$12 flat",recurring:false,minScore:"No minimum",color:"#14b8a6",
    desc:"$750 revolving credit line used only for purchases on the Kikoff store. Reported to 2 bureaus. Fast score boost from added utilization.",
    ideal:"Clients who need to add a revolving account quickly"},
  {name:"Chime Credit Builder",type:"Secured Card",logo:"🔵",comm:"$15 flat",recurring:false,minScore:"No minimum",color:"#3b82f6",
    desc:"No hard pull, no minimum deposit required. Linked to a Chime checking account. Payments reported monthly to all 3 bureaus.",
    ideal:"Clients rebuilding after bankruptcy or serious derogatory items"},
  {name:"OpenSky Secured Visa",type:"Secured Credit Card",logo:"🌅",comm:"$20 flat",recurring:false,minScore:"No minimum",color:"#f59e0b",
    desc:"No credit check required. Client deposits $200–$3,000 as a security deposit. Visa network accepted everywhere. 3-bureau reporting.",
    ideal:"Clients who have been denied everywhere else"},
  {name:"Experian Boost",type:"Score Booster",logo:"🔷",comm:"N/A",recurring:false,minScore:"Any",color:"#8b5cf6",
    desc:"Free tool that adds utility and phone payment history to the Experian credit file. Can add 10–15 points instantly. Recommend to all clients at no cost.",
    ideal:"Every client — no downside, always recommend"},
  {name:"Self Lender",type:"Credit Builder Loan",logo:"🏦",comm:"$12 flat",recurring:false,minScore:"No minimum",color:"#ef4444",
    desc:"Clients choose a monthly payment amount ($25–$150) and pay over 24 months. The money saves and they receive a lump sum at the end. 3-bureau reporting.",
    ideal:"Clients who need both credit building and forced savings"},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:20};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Rebuild Credit Affiliate</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Recommend credit builder products to your clients and earn commissions while accelerating their credit building.</p>
        </div>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"14px 20px",marginBottom:24,display:"flex",gap:12}}>
          <span style={{fontSize:20}}>💡</span>
          <div style={{fontSize:13,color:"#166534",lineHeight:1.6}}><strong>Strategy tip:</strong> Dispute removal + credit building works faster than dispute removal alone. Always recommend at least one credit builder product to clients with fewer than 3 open positive accounts. Your clients get better results, and you earn an extra commission.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
          {PRODUCTS.map(p=>(
            <div key={p.name} style={{...card,display:"flex",gap:16,alignItems:"flex-start",borderLeft:`4px solid ${p.color}`}}>
              <div style={{fontSize:28,flexShrink:0}}>{p.logo}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:6}}>
                  <div>
                    <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:800,color:"#1e293b"}}>{p.name}</h3>
                    <span style={{background:p.color+"18",color:p.color,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{p.type}</span>
                  </div>
                  <div style={{display:"flex",gap:12,flexShrink:0}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>Commission</div><div style={{fontSize:15,fontWeight:800,color:"#10b981"}}>{p.comm}</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>Min Score</div><div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{p.minScore}</div></div>
                  </div>
                </div>
                <p style={{margin:"0 0 8px",fontSize:13,color:"#374151",lineHeight:1.6}}>{p.desc}</p>
                <div style={{fontSize:12,color:"#64748b"}}>✅ <strong>Ideal for:</strong> {p.ideal}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Present Credit Builder Products to Clients</h3>
          <ol style={{margin:0,paddingLeft:20,display:"flex",flexDirection:"column",gap:8}}>
            {["During the initial consultation, note how many open positive accounts the client has.","If they have fewer than 3 open positive accounts, recommend adding a credit builder product alongside your dispute service.","Frame it as: 'While we remove the negatives, we also want to add positives. This dual approach gets you results in half the time.'","Use your affiliate link to direct them to the product — you'll earn the commission automatically.","Log the product recommendation in their DisputePilot client file under Notes.","Follow up monthly to ensure they're making on-time payments — late payments will hurt, not help."].map((s,i)=>(
              <li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </CDMLayout>
  );
}
