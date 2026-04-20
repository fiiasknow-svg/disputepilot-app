"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CDMLayout from "@/components/CDMLayout";

const STEPS = ["pending","sent","responded","resolved"];
const STATUS_COLORS: Record<string,string> = {pending:"#f59e0b",sent:"#8b5cf6",responded:"#3b82f6",resolved:"#10b981",deleted:"#ef4444"};
const BUREAU_COLORS: Record<string,string> = {equifax:"#ef4444",experian:"#3b82f6",transunion:"#10b981"};
const TABS = ["Overview","Letters Sent","Bureau Response","Round History","Timeline"];
const OUTCOMES = ["Not Yet Received","Verified","Deleted","Updated","No Change","In Dispute"];
const OUTCOME_COLORS: Record<string,string> = {Verified:"#ef4444",Deleted:"#10b981",Updated:"#3b82f6","No Change":"#94a3b8","Not Yet Received":"#f59e0b","In Dispute":"#8b5cf6"};
const LETTER_TEMPLATES = [
  "Standard FCRA Dispute Letter","Method of Verification Letter","Debt Validation Letter","Cease & Desist Letter","Pay for Delete Letter","Goodwill Adjustment Letter","Identity Theft Dispute Letter","Section 609 Challenge Letter","Second Round Escalation Letter","Metro 2 Compliance Letter",
];
const DISPUTE_REASONS = [
  "Not My Account","Account Paid in Full","Incorrect Balance","Incorrect Late Payment","Account Closed — Still Reporting","Incorrect Personal Information","Duplicate Account","Inquiry Not Authorized","Fraud / Identity Theft","Incorrect Credit Limit","Wrong Account Status","Incorrect High Balance",
];
const ACCT_TYPES = ["Credit Card","Auto Loan","Mortgage","Student Loan","Medical Collection","Personal Loan","Charge-Off","Collection Account","Public Record","Inquiry","Other"];

type Round = { round: number; status: string; letterSent: string; bureauResponse: string; outcome: string; date: string };

export default function Page() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [dispute,  setDispute]  = useState<any>(null);
  const [letters,  setLetters]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("Overview");
  const [updating, setUpdating] = useState(false);

  // overview edit state
  const [editMode,      setEditMode]      = useState(false);
  const [editFields,    setEditFields]    = useState<Record<string,string>>({});
  const [savingEdit,    setSavingEdit]    = useState(false);

  // bureau response
  const [response,      setResponse]      = useState("");
  const [outcome,       setOutcome]       = useState("Not Yet Received");
  const [responseDate,  setResponseDate]  = useState("");
  const [savingResp,    setSavingResp]    = useState(false);
  const [respSaved,     setRespSaved]     = useState(false);

  // letter assignment
  const [selTemplate,   setSelTemplate]   = useState(LETTER_TEMPLATES[0]);
  const [assignedLetter,setAssignedLetter]= useState<string|null>(null);

  // round history (local)
  const [rounds, setRounds] = useState<Round[]>([]);
  const [addingRound, setAddingRound] = useState(false);

  useEffect(() => {
    async function load() {
      const [d, l] = await Promise.all([
        supabase.from("disputes").select("*, clients(first_name,last_name,email,mobile_phone)").eq("id",id).single(),
        supabase.from("dispute_letters").select("*").eq("dispute_id",id).order("created_at",{ascending:false}),
      ]);
      if(d.data){
        setDispute(d.data);
        setEditFields({
          account_name:    d.data.account_name||"",
          account_number:  d.data.account_number||"",
          account_type:    d.data.account_type||"",
          bureau:          d.data.bureau||"",
          reason:          d.data.reason||"",
          balance:         String(d.data.balance||""),
          furnisher_name:  d.data.furnisher_name||"",
          furnisher_address:d.data.furnisher_address||"",
        });
        if(d.data.bureau_response) setResponse(d.data.bureau_response);
        if(d.data.response_outcome) setOutcome(d.data.response_outcome);
        if(d.data.response_date)    setResponseDate(d.data.response_date);
        // seed round history from dispute round number
        const roundCount = Number(d.data.round||1);
        const seed: Round[] = Array.from({length:roundCount},(_,i)=>({
          round: i+1,
          status: i<roundCount-1?"resolved":"active",
          letterSent: i===0 ? (new Date(d.data.created_at)).toLocaleDateString() : "—",
          bureauResponse: i<roundCount-1 ? "Verified" : "Not Yet Received",
          outcome: i<roundCount-1 ? "Verified — Escalated to next round" : "Pending",
          date: d.data.created_at,
        }));
        setRounds(seed);
      }
      setLetters(l.data||[]);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await supabase.from("disputes").update({status}).eq("id",id);
    setDispute((d: any)=>({...d,status}));
    setUpdating(false);
  }

  async function saveEdit() {
    setSavingEdit(true);
    await supabase.from("disputes").update(editFields).eq("id",id);
    setDispute((d: any)=>({...d,...editFields}));
    setSavingEdit(false);
    setEditMode(false);
  }

  async function saveBureauResponse() {
    setSavingResp(true);
    await supabase.from("disputes").update({bureau_response:response,response_outcome:outcome,response_date:responseDate,status:"responded"}).eq("id",id);
    setDispute((d: any)=>({...d,bureau_response:response,response_outcome:outcome,response_date:responseDate,status:"responded"}));
    setSavingResp(false);
    setRespSaved(true);
    setTimeout(()=>setRespSaved(false),3000);
  }

  function assignLetter() {
    setAssignedLetter(selTemplate);
  }

  function advanceRound() {
    const nextRound = rounds.length+1;
    setRounds(r=>[...r,{round:nextRound,status:"active",letterSent:"—",bureauResponse:"Not Yet Received",outcome:"Pending",date:new Date().toISOString()}]);
    updateStatus("sent");
    setAddingRound(false);
    supabase.from("disputes").update({round:nextRound}).eq("id",id);
  }

  const inp: React.CSSProperties={width:"100%",padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:14,boxSizing:"border-box",background:"#fff"};
  const card: React.CSSProperties={background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",padding:22};
  const TH: React.CSSProperties={textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",background:"#f8fafc",whiteSpace:"nowrap"};
  const TD: React.CSSProperties={padding:"10px 14px",fontSize:13,color:"#374151",borderTop:"1px solid #f1f5f9"};

  if(loading)return<CDMLayout><div style={{padding:32,color:"#94a3b8"}}>Loading…</div></CDMLayout>;
  if(!dispute)return<CDMLayout><div style={{padding:32}}>Dispute not found. <button onClick={()=>router.push("/disputes")} style={{color:"#3b82f6",background:"none",border:"none",cursor:"pointer"}}>Back</button></div></CDMLayout>;

  const currentStep = STEPS.indexOf(dispute.status);
  const bc = BUREAU_COLORS[dispute.bureau]||"#64748b";

  return (
    <CDMLayout>
      <div style={{padding:24,maxWidth:960}}>
        <button onClick={()=>router.push("/disputes")} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:14,marginBottom:16}}>← Back to Disputes</button>

        {/* ── Header card ── */}
        <div style={{...card,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 8px",color:"#1e293b"}}>{dispute.account_name||"Dispute"}</h1>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{background:bc+"22",color:bc,borderRadius:6,padding:"3px 12px",fontSize:13,fontWeight:700,textTransform:"capitalize"}}>{dispute.bureau}</span>
                <span style={{background:(STATUS_COLORS[dispute.status]||"#94a3b8")+"22",color:STATUS_COLORS[dispute.status]||"#64748b",borderRadius:20,padding:"3px 12px",fontSize:13,fontWeight:700,textTransform:"capitalize"}}>{dispute.status}</span>
                <span style={{background:"#f1f5f9",color:"#64748b",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>Round {dispute.round||1}</span>
                {dispute.account_type&&<span style={{background:"#f1f5f9",color:"#64748b",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{dispute.account_type}</span>}
              </div>
              {dispute.clients&&(
                <p style={{margin:"8px 0 0",fontSize:14,color:"#475569"}}>
                  Client: <strong>{dispute.clients.first_name} {dispute.clients.last_name}</strong>
                  {dispute.clients.email&&<span style={{color:"#94a3b8"}}> · {dispute.clients.email}</span>}
                </p>
              )}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {STEPS.filter(s=>s!==dispute.status&&s!=="deleted").map(s=>(
                <button key={s} onClick={()=>updateStatus(s)} disabled={updating}
                  style={{fontSize:12,padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer",background:"#fff",textTransform:"capitalize",fontWeight:600}}>→ {s}</button>
              ))}
              <button onClick={()=>setEditMode(v=>!v)}
                style={{fontSize:12,padding:"6px 14px",background:editMode?"#1e3a5f":"#f1f5f9",color:editMode?"#fff":"#374151",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer",fontWeight:600}}>
                {editMode?"Cancel Edit":"✏ Edit"}
              </button>
            </div>
          </div>

          {/* Status progress bar */}
          <div style={{display:"flex"}}>
            {STEPS.map((step,i)=>(
              <div key={step} style={{flex:1,textAlign:"center"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  {i>0&&<div style={{flex:1,height:3,background:i<=currentStep?"#1e3a5f":"#e2e8f0"}}/>}
                  <div style={{width:28,height:28,borderRadius:"50%",background:i<=currentStep?"#1e3a5f":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:i<=currentStep?"#fff":"#94a3b8",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
                  {i<STEPS.length-1&&<div style={{flex:1,height:3,background:i<currentStep?"#1e3a5f":"#e2e8f0"}}/>}
                </div>
                <div style={{fontSize:11,color:i<=currentStep?"#1e3a5f":"#94a3b8",marginTop:4,textTransform:"capitalize",fontWeight:i===currentStep?700:400}}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{display:"flex",borderBottom:"2px solid #f1f5f9",marginBottom:20,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 20px",background:"none",border:"none",cursor:"pointer",fontWeight:tab===t?700:500,color:tab===t?"#1e3a5f":"#64748b",borderBottom:tab===t?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2,fontSize:14,whiteSpace:"nowrap"}}>
              {t}{t==="Letters Sent"&&letters.length>0&&<span style={{marginLeft:5,background:"#f1f5f9",borderRadius:10,padding:"1px 6px",fontSize:11,fontWeight:700,color:"#64748b"}}>{letters.length}</span>}
            </button>
          ))}
        </div>

        {/* ═══════════════ OVERVIEW ═══════════════ */}
        {tab==="Overview"&&(
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Dispute Details</h3>
              {editMode&&(
                <button onClick={saveEdit} disabled={savingEdit} style={{padding:"7px 18px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {savingEdit?"Saving…":"Save Changes"}
                </button>
              )}
            </div>

            {editMode?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {([
                  ["account_name","Account Name","text"],["account_number","Account Number","text"],
                  ["balance","Balance","number"],["account_type","Account Type","select-acct"],
                  ["bureau","Bureau","select-bureau"],["reason","Dispute Reason","select-reason"],
                  ["furnisher_name","Furnisher Name","text"],["furnisher_address","Furnisher Address","text"],
                ] as [string,string,string][]).map(([k,l,type])=>(
                  <div key={k} style={type==="text"&&k==="furnisher_address"?{gridColumn:"1/-1"}:{}}>
                    <label style={{display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.03em"}}>{l}</label>
                    {type==="select-bureau"?(
                      <select value={editFields[k]||""} onChange={e=>setEditFields(f=>({...f,[k]:e.target.value}))} style={inp}>
                        <option value="">--</option>
                        {["equifax","experian","transunion"].map(b=><option key={b}>{b}</option>)}
                      </select>
                    ):type==="select-reason"?(
                      <select value={editFields[k]||""} onChange={e=>setEditFields(f=>({...f,[k]:e.target.value}))} style={inp}>
                        <option value="">--</option>
                        {DISPUTE_REASONS.map(r=><option key={r}>{r}</option>)}
                      </select>
                    ):type==="select-acct"?(
                      <select value={editFields[k]||""} onChange={e=>setEditFields(f=>({...f,[k]:e.target.value}))} style={inp}>
                        <option value="">--</option>
                        {ACCT_TYPES.map(a=><option key={a}>{a}</option>)}
                      </select>
                    ):(
                      <input type={type} value={editFields[k]||""} onChange={e=>setEditFields(f=>({...f,[k]:e.target.value}))} style={inp}/>
                    )}
                  </div>
                ))}
              </div>
            ):(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 32px",marginBottom:20}}>
                  {([
                    ["Account Name",      dispute.account_name],
                    ["Account Number",    dispute.account_number||"—"],
                    ["Account Type",      dispute.account_type||"—"],
                    ["Bureau",            <span style={{textTransform:"capitalize"}}>{dispute.bureau}</span>],
                    ["Balance",           dispute.balance?`$${Number(dispute.balance).toLocaleString()}`:"—"],
                    ["Dispute Reason",    dispute.reason||"—"],
                    ["Round",             `Round ${dispute.round||1}`],
                    ["Filed Date",        new Date(dispute.created_at).toLocaleDateString()],
                  ] as [string,React.ReactNode][]).map(([l,v])=>(
                    <div key={String(l)}>
                      <span style={{fontSize:12,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.03em"}}>{l}</span>
                      <p style={{margin:"3px 0 0",fontSize:14,color:"#1e293b",fontWeight:500}}>{v}</p>
                    </div>
                  ))}
                </div>
                {(dispute.furnisher_name||dispute.furnisher_address)&&(
                  <div style={{padding:"14px 16px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid #e2e8f0"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Furnisher / Creditor</div>
                    {dispute.furnisher_name&&<div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{dispute.furnisher_name}</div>}
                    {dispute.furnisher_address&&<div style={{fontSize:13,color:"#64748b",marginTop:2}}>{dispute.furnisher_address}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Letter assignment */}
            <div style={{marginTop:20,padding:"16px",background:"#f8fafc",borderRadius:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>Assign Letter Template</div>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <select value={selTemplate} onChange={e=>setSelTemplate(e.target.value)} style={{...inp,flex:1,minWidth:220}}>
                  {LETTER_TEMPLATES.map(t=><option key={t}>{t}</option>)}
                </select>
                <button onClick={assignLetter} style={{padding:"9px 18px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>Assign Letter</button>
              </div>
              {assignedLetter&&(
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{background:"#dcfce7",color:"#166534",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700}}>✓ Assigned</span>
                  <span style={{fontSize:13,color:"#374151"}}>{assignedLetter}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ LETTERS SENT ═══════════════ */}
        {tab==="Letters Sent"&&(
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Letters Sent ({letters.length})</h3>
              <button onClick={()=>router.push("/letters")} style={{padding:"7px 14px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Create Letter</button>
            </div>

            {/* Assign from template */}
            <div style={{padding:"14px 16px",background:"#f0f9ff",borderRadius:8,border:"1px solid #bae6fd",marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#0369a1",marginBottom:8}}>Assign Letter Template to This Dispute</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <select value={selTemplate} onChange={e=>setSelTemplate(e.target.value)} style={{...inp,flex:1,minWidth:200}}>
                  {LETTER_TEMPLATES.map(t=><option key={t}>{t}</option>)}
                </select>
                <button onClick={assignLetter} style={{padding:"9px 18px",background:"#0369a1",color:"#fff",border:"none",borderRadius:7,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>Assign & Queue</button>
              </div>
              {assignedLetter&&<div style={{marginTop:8,fontSize:12,color:"#0369a1",fontWeight:600}}>✓ Queued: {assignedLetter}</div>}
            </div>

            {letters.length===0?(
              <p style={{color:"#94a3b8",fontSize:14,padding:"24px 0",textAlign:"center"}}>No letters have been sent yet for this dispute.</p>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {letters.map((l,i)=>(
                  <div key={l.id||i} style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{l.title||"Dispute Letter"}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{background:"#8b5cf622",color:"#8b5cf6",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>Round {l.round||1}</span>
                        <span style={{fontSize:12,color:"#94a3b8"}}>{new Date(l.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {l.content&&<p style={{margin:"6px 0 0",fontSize:13,color:"#475569",whiteSpace:"pre-wrap"}}>{l.content.substring(0,250)}…</p>}
                    <div style={{marginTop:8,display:"flex",gap:8}}>
                      <button style={{padding:"4px 10px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:5,fontSize:12,fontWeight:600,cursor:"pointer"}}>View Letter</button>
                      <button style={{padding:"4px 10px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151"}}>Download PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ BUREAU RESPONSE ═══════════════ */}
        {tab==="Bureau Response"&&(
          <div style={card}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Bureau Response — {dispute.bureau?.toUpperCase()}</h3>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Response Outcome</label>
                <select value={outcome} onChange={e=>setOutcome(e.target.value)} style={inp}>
                  {OUTCOMES.map(o=><option key={o}>{o}</option>)}
                </select>
                {outcome!=="Not Yet Received"&&(
                  <div style={{marginTop:8}}>
                    <span style={{background:(OUTCOME_COLORS[outcome]||"#94a3b8")+"22",color:OUTCOME_COLORS[outcome]||"#94a3b8",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>{outcome}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Response Date</label>
                <input type="date" value={responseDate} onChange={e=>setResponseDate(e.target.value)} style={inp}/>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Bureau Response Letter / Notes</label>
              <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder="Paste or type the bureau's response here…"
                style={{...inp,minHeight:180,resize:"vertical"}}/>
            </div>

            {outcome==="Verified"&&(
              <div style={{padding:"12px 16px",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#c2410c",marginBottom:4}}>⚠ Item Verified — Consider Next Steps</div>
                <div style={{fontSize:13,color:"#9a3412"}}>The bureau has verified this item. You may escalate to the next dispute round, send a Method of Verification letter, or advise the client on their options.</div>
                <button onClick={()=>setAddingRound(true)} style={{marginTop:10,padding:"7px 14px",background:"#c2410c",color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  Advance to Round {(dispute.round||1)+1}
                </button>
              </div>
            )}

            {outcome==="Deleted"&&(
              <div style={{padding:"12px 16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#166534",marginBottom:4}}>✅ Item Deleted!</div>
                <div style={{fontSize:13,color:"#15803d"}}>The bureau has deleted this item from the credit report. Update the dispute status to Resolved.</div>
                <button onClick={()=>updateStatus("resolved")} style={{marginTop:10,padding:"7px 14px",background:"#166534",color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  Mark as Resolved
                </button>
              </div>
            )}

            <button onClick={saveBureauResponse} disabled={savingResp}
              style={{padding:"9px 22px",background:respSaved?"#10b981":"#1e3a5f",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:14}}>
              {savingResp?"Saving…":respSaved?"✓ Saved":"Save Response"}
            </button>
          </div>
        )}

        {/* ═══════════════ ROUND HISTORY ═══════════════ */}
        {tab==="Round History"&&(
          <div>
            <div style={{...card,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Round History ({rounds.length} round{rounds.length!==1?"s":""})</h3>
                <button onClick={()=>setAddingRound(true)} style={{padding:"7px 14px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  + New Round
                </button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Round","Status","Letter Sent","Bureau Response","Outcome","Date"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {rounds.map(r=>{
                    const oc=OUTCOME_COLORS[r.bureauResponse]||"#94a3b8";
                    return(
                      <tr key={r.round}>
                        <td style={{...TD,fontWeight:700,color:"#1e293b"}}>Round {r.round}</td>
                        <td style={TD}><span style={{background:(r.status==="active"?"#10b981":"#94a3b8")+"22",color:r.status==="active"?"#10b981":"#94a3b8",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,textTransform:"capitalize"}}>{r.status}</span></td>
                        <td style={TD}>{r.letterSent}</td>
                        <td style={TD}><span style={{background:oc+"22",color:oc,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.bureauResponse}</span></td>
                        <td style={TD}>{r.outcome}</td>
                        <td style={{...TD,whiteSpace:"nowrap"}}>{new Date(r.date).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Round escalation guidance */}
            <div style={{...card,background:"#f8fafc"}}>
              <h4 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#1e293b"}}>Dispute Round Strategy</h4>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {round:"Round 1",desc:"Initial FCRA dispute letter sent to bureaus. Bureaus have 30–45 days to respond.",icon:"📧"},
                  {round:"Round 2",desc:"Follow-up or Method of Verification letter if item was verified. Request proof of investigation.",icon:"🔍"},
                  {round:"Round 3",desc:"Escalation letter with legal references. Cite FCRA § 611 failure to conduct proper investigation.",icon:"⚖️"},
                  {round:"Round 4+",desc:"Direct dispute to furnisher, CFPB complaint, or legal action if necessary.",icon:"🚨"},
                ].map((g,i)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"10px 14px",background:"#fff",borderRadius:8,border:"1px solid #f1f5f9"}}>
                    <span style={{fontSize:20}}>{g.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{g.round}</div>
                      <div style={{fontSize:12,color:"#64748b"}}>{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TIMELINE ═══════════════ */}
        {tab==="Timeline"&&(
          <div style={card}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Dispute Timeline</h3>
            <div style={{position:"relative",paddingLeft:28}}>
              <div style={{position:"absolute",left:11,top:0,bottom:0,width:2,background:"#e2e8f0"}}/>
              {[
                {label:"Dispute created",date:dispute.created_at,color:"#3b82f6",icon:"📋"},
                ...letters.map(l=>({label:`Letter sent: ${l.title||"Dispute Letter"}`,date:l.created_at,color:"#8b5cf6",icon:"📧"})),
                ...(dispute.bureau_response?[{label:`Bureau response received — ${dispute.response_outcome||""}`,date:dispute.updated_at||dispute.created_at,color:OUTCOME_COLORS[dispute.response_outcome||""]||"#f59e0b",icon:"📬"}]:[]),
                ...(dispute.status==="resolved"?[{label:"Dispute resolved ✓",date:dispute.updated_at||dispute.created_at,color:"#10b981",icon:"✅"}]:[]),
              ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:18,position:"relative"}}>
                  <div style={{position:"absolute",left:-22,top:0,width:22,height:22,borderRadius:"50%",background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{item.icon}</div>
                  <div>
                    <p style={{margin:0,fontSize:14,fontWeight:600,color:"#1e293b"}}>{item.label}</p>
                    <p style={{margin:"2px 0 0",fontSize:12,color:"#94a3b8"}}>{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Advance Round Confirm Modal ── */}
      {addingRound&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:420,width:"90%",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
            <h3 style={{margin:"0 0 12px",fontSize:17,fontWeight:800,color:"#1e293b"}}>Advance to Round {rounds.length+1}?</h3>
            <p style={{fontSize:14,color:"#64748b",margin:"0 0 20px"}}>
              This will create Round {rounds.length+1} for this dispute and update the status to <strong>Sent</strong>. Make sure a new letter has been prepared before advancing.
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setAddingRound(false)} style={{padding:"9px 20px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={advanceRound} style={{padding:"9px 20px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:7,fontWeight:700,cursor:"pointer"}}>
                Advance to Round {rounds.length+1}
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
