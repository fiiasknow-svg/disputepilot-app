"use client";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const STRATEGIES = [
  {
    icon:"📱", title:"Social Media Marketing", color:"#3b82f6",
    desc:"Social media is the highest-ROI channel for credit repair. Facebook and Instagram allow you to target people who are actively searching for financial help.",
    tactics:[
      "Post daily credit tips (e.g., '3 things that hurt your credit score') to build credibility",
      "Share before/after credit score screenshots (with client permission) — these go viral in your niche",
      "Run a Facebook or Instagram Live every week answering credit questions for free",
      "Join local Facebook community groups and answer credit questions without pitching",
      "Run targeted ads to people 25–55 interested in home buying, car buying, or financial improvement",
    ],
    metric:"Target: 3–5 posts per week, 1 live per week",
  },
  {
    icon:"🤝", title:"Referral Partnerships", color:"#10b981",
    desc:"Strategic referral partnerships are the highest-converting source of new clients. These professionals need credit-ready clients and will refer anyone who isn't there yet.",
    tactics:[
      "Mortgage brokers/loan officers — they lose deals every day because clients have bad credit",
      "Real estate agents — same problem, same urgency",
      "Auto dealerships (finance managers) — they see declined buyers every week",
      "Insurance agents — credit affects insurance rates, so they have motivated clients too",
      "Payday loan / check cashing businesses — their entire customer base needs credit repair",
    ],
    metric:"Target: 3–5 active referral partners sending leads each month",
  },
  {
    icon:"📣", title:"Content Marketing & SEO", color:"#8b5cf6",
    desc:"Publishing consistent, helpful content builds trust and brings in free, high-intent traffic from people searching for credit repair help.",
    tactics:[
      "Start a YouTube channel posting 2 videos per week on credit topics (easy beginner content)",
      "Write blog posts targeting keywords like 'how to remove late payments' or 'credit repair near [city]'",
      "Create a free downloadable guide (e.g., 'The 7-Step Credit Repair Checklist') to collect email addresses",
      "Appear as a guest on local or financial podcasts to reach new audiences",
      "Answer credit questions on Reddit (r/personalfinance, r/CRedit) and build credibility",
    ],
    metric:"Target: 2 YouTube videos/week, 2 blog posts/month",
  },
  {
    icon:"🎙️", title:"Networking & Community", color:"#f59e0b",
    desc:"In-person and online networking puts you in front of people who can send you clients consistently — often for free.",
    tactics:[
      "Attend local BNI (Business Network International) chapters — one chapter can generate 10+ referrals/month",
      "Host free local credit education workshops at libraries, churches, or community centers",
      "Sponsor local sports teams, church events, or community boards for affordable visibility",
      "Join your local Chamber of Commerce and attend monthly mixers",
      "Partner with financial coaches, CPAs, and bookkeepers who work with individuals",
    ],
    metric:"Target: 2 networking events/month, 1 hosted workshop per quarter",
  },
  {
    icon:"💰", title:"Paid Advertising", color:"#ef4444",
    desc:"Once you have a working offer and a solid conversion process, paid ads can accelerate your client acquisition dramatically.",
    tactics:[
      "Facebook/Instagram lead ads targeting: age 25–55, interests: mortgage, car buying, financial wellness",
      "Google Ads targeting: 'credit repair [city]', 'how to fix credit score', 'remove collections'",
      "YouTube pre-roll ads on financial content channels",
      "Retargeting ads to people who visited your website but didn't convert",
      "Start with $10–$20/day and scale what works — track cost per lead carefully",
    ],
    metric:"Target: Cost per lead under $15, cost per client under $150",
  },
  {
    icon:"📧", title:"Email Marketing & Nurture Sequences", color:"#14b8a6",
    desc:"Most prospects need multiple touches before they become clients. Email is the most cost-effective way to stay in front of them.",
    tactics:[
      "Build your list with a free lead magnet (checklist, quiz, or mini-course)",
      "Send a 5-email welcome sequence to new subscribers educating them on credit repair",
      "Send a weekly 'Credit Tip Tuesday' email to your entire list",
      "Automate a re-engagement campaign for leads who haven't converted in 30 days",
      "Include a clear call-to-action in every email (book a call, reply with questions)",
    ],
    metric:"Target: 30% open rate, email list growing by 50+ subscribers/month",
  },
];

export default function Page() {
  const router = useRouter();
  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:1050}}>
        <button onClick={()=>router.push("/get-customers")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Get Customers</button>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 6px",color:"#1e293b"}}>Business Strategies</h1>
          <p style={{color:"#64748b",fontSize:15,margin:0}}>Proven marketing and outreach strategies for credit repair professionals — with specific tactics and metrics.</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {STRATEGIES.map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:24,borderLeft:`4px solid ${s.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{fontSize:28}}>{s.icon}</span>
                <h2 style={{fontSize:17,fontWeight:800,margin:0,color:"#1e293b"}}>{s.title}</h2>
              </div>
              <p style={{fontSize:13,color:"#64748b",margin:"0 0 14px",lineHeight:1.65}}>{s.desc}</p>
              <ul style={{margin:"0 0 14px",paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
                {s.tactics.map((t,j)=>(
                  <li key={j} style={{fontSize:13,color:"#374151",lineHeight:1.55}}>{t}</li>
                ))}
              </ul>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:s.color+"15",borderRadius:20,padding:"5px 14px"}}>
                <span style={{fontSize:12,fontWeight:700,color:s.color}}>📊 {s.metric}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:24,background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",borderRadius:10,padding:"20px 24px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>Ready to start acquiring clients?</div>
            <div style={{fontSize:13,opacity:0.85}}>See our step-by-step client acquisition funnel guide.</div>
          </div>
          <button onClick={()=>router.push("/get-customers/get-customers")} style={{padding:"9px 20px",background:"#fff",color:"#1e3a5f",border:"none",borderRadius:7,fontWeight:800,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
            View Client Acquisition →
          </button>
        </div>
      </div>
    </CDMLayout>
  );
}
