"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const PACKAGES = [
  {dest:"Las Vegas, NV",nights:3,icon:"🎰",retail:"$450",yourCost:"$0",desc:"3 nights at a 3-star hotel in Las Vegas for 2 adults. A perfect enrollment incentive for new clients.",included:["Hotel accommodation (3 nights)","Complimentary breakfast","Welcome gift card","Certificate valid 18 months"]},
  {dest:"Orlando, FL",nights:4,icon:"🎢",retail:"$680",yourCost:"$0",desc:"4 nights near Disney World for a family of 4. Extremely effective for family-oriented clients.",included:["Hotel accommodation (4 nights)","Theme park area hotel","Family-friendly property","Certificate valid 18 months"]},
  {dest:"Cancún, Mexico",nights:5,icon:"🏖️",retail:"$1,200",yourCost:"$0",desc:"5-night all-inclusive resort experience. Premium incentive for your higher-tier service packages.",included:["All-inclusive resort (5 nights)","Meals and drinks","Beach access","Certificate valid 24 months"]},
  {dest:"New York City, NY",nights:3,icon:"🗽",retail:"$700",yourCost:"$0",desc:"3 nights in Manhattan for 2 adults. Great incentive for clients in the Northeast.",included:["Hotel accommodation (3 nights)","Times Square area hotel","Breakfast included","Certificate valid 18 months"]},
];

export default function Page() {
  const router = useRouter();
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/partner-resources")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Partner Resources</button>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Offer Free Vacations</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Use free vacation certificates as a client acquisition incentive — at no cost to you. Close more deals by giving more value.</p>
        </div>
        <div style={{background:"linear-gradient(135deg,#ec4899,#8b5cf6)",borderRadius:12,padding:"24px 28px",color:"#fff",marginBottom:24}}>
          <h2 style={{margin:"0 0 8px",fontSize:20,fontWeight:800}}>✈️ "Sign up today and get a FREE vacation!"</h2>
          <p style={{margin:"0 0 16px",fontSize:14,opacity:0.9,lineHeight:1.6}}>Vacation certificates cost you nothing but dramatically increase your conversion rate. Prospects who are on the fence say yes when they know they're getting a $450–$1,200 vacation included with their credit repair service.</p>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[["$0","Your Cost"],["40%+","Higher Close Rate"],["18 mo","Certificate Validity"],["4","Destinations"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"10px 16px"}}>
                <div style={{fontSize:22,fontWeight:900}}>{v}</div>
                <div style={{fontSize:11,opacity:0.8}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:24}}>
          {PACKAGES.map(p=>(
            <div key={p.dest} style={card}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:32}}>{p.icon}</span>
                <div>
                  <h3 style={{margin:"0 0 2px",fontSize:16,fontWeight:800,color:"#1e293b"}}>{p.dest}</h3>
                  <div style={{fontSize:13,color:"#64748b"}}>{p.nights} nights for 2 guests</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Retail Value</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#10b981"}}>{p.retail}</div>
                  <div style={{fontSize:11,color:"#10b981",fontWeight:700}}>FREE to client</div>
                </div>
              </div>
              <p style={{fontSize:13,color:"#374151",margin:"0 0 10px",lineHeight:1.6}}>{p.desc}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {p.included.map(i=><span key={i} style={{background:"#f0fdf4",color:"#166534",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>✓ {i}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 14px",color:"#1e293b"}}>How to Offer Vacation Certificates to Clients</h3>
          <ol style={{margin:0,paddingLeft:20,display:"flex",flexDirection:"column",gap:8}}>
            {["Sign up for a vacation certificate account through our partner link (takes 5 minutes).","Choose which package tier to offer — Las Vegas or Orlando work best for most markets.","In your sales script, mention: 'When you enroll today, I'm also including a free 3-night vacation — just for getting started.'","After the client signs and pays their enrollment fee, send them the certificate activation link.","Certificates cost you nothing upfront — you pay a small activation fee ($15–$25) only if/when the client redeems it.","Track your close rate before and after adding vacations — most practitioners see a 30–50% improvement."].map((s,i)=>(
              <li key={i} style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </CDMLayout>
  );
}
