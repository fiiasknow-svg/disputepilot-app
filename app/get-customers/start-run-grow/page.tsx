"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const STEPS = [
  {n:1,icon:"📋",title:"Choose Your Business Structure",color:"#3b82f6",desc:"Register as an LLC or S-Corp to protect your personal assets. An LLC typically costs $50–$200 to file depending on your state. Use a registered agent service to keep your address private.",tip:"Most credit repair businesses operate as single-member LLCs."},
  {n:2,icon:"⚖️",title:"Understand the Laws (CROA & State Laws)",color:"#ef4444",desc:"The Credit Repair Organizations Act (CROA) governs how you operate. You cannot charge upfront fees before services are rendered, must provide written contracts, and must allow cancellation within 3 days.",tip:"Check your state — some states like Georgia require a bond or license."},
  {n:3,icon:"🏦",title:"Open a Business Bank Account",color:"#10b981",desc:"Keep business and personal finances completely separate. Open a dedicated checking account and get a business debit card. This simplifies taxes and makes you look professional to clients.",tip:"Chase, Bank of America, and Relay all have good small business accounts."},
  {n:4,icon:"💼",title:"Set Your Service Packages & Pricing",color:"#8b5cf6",desc:"Offer 2–3 tiered packages (e.g., Basic at $99/mo, Standard at $149/mo, Premium at $199/mo). Bundling value into each tier makes it easier for clients to choose and reduces price objections.",tip:"Always charge a one-time setup/enrollment fee in addition to monthly fees."},
  {n:5,icon:"📄",title:"Create Your Client Contract",color:"#f59e0b",desc:"Every client must sign a written contract before services begin. The contract must include: services to be performed, fees charged, right to cancel within 3 business days, and your business name/address.",tip:"Have an attorney review your contract template. There are templates available in the CDM document library."},
  {n:6,icon:"🌐",title:"Build Your Online Presence",color:"#3b82f6",desc:"Create a professional website with a clear call-to-action (free consultation). Set up Google My Business, a Facebook Business Page, and an Instagram account. Consistency across platforms builds trust.",tip:"Your website doesn't need to be fancy — it needs to be clear, credible, and have a contact form."},
  {n:7,icon:"💳",title:"Set Up Payment Processing",color:"#10b981",desc:"Set up a merchant account to accept credit and debit cards. Consider processors built for credit repair like PayHQ or Payroc. Set up recurring billing to automate monthly client payments.",tip:"Automated recurring billing dramatically reduces churn and missed payments."},
  {n:8,icon:"📊",title:"Set Up Your CRM (DisputePilot)",color:"#1e3a5f",desc:"Use DisputePilot to manage all clients, disputes, letters, and billing in one place. Import clients, set up dispute workflows, and connect your credit monitoring provider credentials.",tip:"The onboarding checklist in your dashboard guides you through the setup."},
  {n:9,icon:"👥",title:"Get Your First 5 Clients",color:"#8b5cf6",desc:"Start with your personal network. Tell friends, family, and former colleagues what you do and offer them a discounted rate or free first month. Real results build your testimonial library faster than any marketing.",tip:"5 success stories unlock all your future marketing — focus here first."},
  {n:10,icon:"📣",title:"Start Marketing Consistently",color:"#f59e0b",desc:"Post daily credit tips on social media. Run a free consultation funnel. Partner with one mortgage broker or realtor. Set a goal of 3 new consultation calls per week and track your conversion rate.",tip:"Consistency beats everything. 30 days of consistent posting changes your business."},
  {n:11,icon:"🔄",title:"Build Your Referral System",color:"#10b981",desc:"Create a formal referral program. Give existing clients a financial incentive ($25–$50 account credit) for every new client they refer. Track referrals inside DisputePilot and celebrate your referrers publicly.",tip:"Referral clients have the highest lifetime value and the lowest acquisition cost."},
  {n:12,icon:"📈",title:"Track, Optimize & Scale",color:"#3b82f6",desc:"Review your numbers monthly: new clients added, churn rate, average revenue per client, disputes filed vs resolved. Use this data to identify what's working and cut what isn't. Hire your first virtual assistant when you hit 20+ clients.",tip:"The DisputePilot dashboard shows all your key metrics at a glance."},
];

export default function Page() {
  const router = useRouter();
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1000}}>
        <button onClick={()=>router.push("/get-customers")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Get Customers</button>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Start, Run & Grow</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Your complete step-by-step guide to launching and scaling a successful credit repair business.</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {STEPS.map(s=>(
            <div key={s.n} style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22,display:"flex",gap:18,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:800,color:s.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>Step {s.n}</span>
                </div>
                <h3 style={{fontSize:16,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>{s.title}</h3>
                <p style={{fontSize:13,color:"#374151",margin:"0 0 10px",lineHeight:1.65}}>{s.desc}</p>
                <div style={{display:"flex",gap:8,alignItems:"flex-start",background:s.color+"12",borderRadius:7,padding:"8px 12px"}}>
                  <span style={{fontSize:14,flexShrink:0}}>💡</span>
                  <span style={{fontSize:12,color:s.color,fontWeight:600}}>{s.tip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:24,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"20px 24px"}}>
          <h3 style={{margin:"0 0 8px",fontSize:16,fontWeight:800,color:"#166534"}}>🎉 You're ready to start!</h3>
          <p style={{margin:"0 0 12px",fontSize:13,color:"#15803d",lineHeight:1.6}}>Following these 12 steps will give you a compliant, professional, and scalable credit repair business. Most successful practitioners complete steps 1–8 in their first 30 days and land their first 5 clients within 60 days.</p>
          <button onClick={()=>router.push("/get-customers/business-strategies")} style={{padding:"9px 20px",background:"#166534",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            Next: Business Strategies →
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
