// import React, { useEffect, useRef, useState } from "react";
// import "./liminal.css";


//     const BRAND = {
//   black:"#25282A", blue:"#0092E7", coral:"#FF8D6D",
//   lightBlue:"#E8F5FD", lightCoral:"#FFF0EB",
//   grey:"#64748b", lightGrey:"#f8fafc", border:"#e2e8f0",
// };




// const DEFAULT_CONFIG = {
//   clientName: "Alfred Health",
//   changeDescription: "Alfred Health is currently undergoing a significant organisational change. This weekly check-in helps leadership understand how staff are experiencing the change — and where support is needed most. Your responses are completely anonymous.",
//   programmeStart: "2025-03-03",
//   numWeeks: 8,
//   dashboardPassword: "alfred2025",
//   insightsPassword: "amy2025",
//   locations: [
//     { name:"The Alfred",           staff:120 },
//     { name:"Caulfield Hospital",   staff:80  },
//     { name:"Sandringham Hospital", staff:70  },
//     { name:"Community Health",     staff:60  },
//     { name:"Corporate/Admin",      staff:50  },
//   ],
//   departments: [
//     "Emergency","ICU / Critical Care","Surgery","Medicine","Oncology",
//     "Mental Health","Nursing","Allied Health","Pharmacy","Pathology",
//     "Radiology","Facilities","Finance","HR","IT","Executive","Other"
//   ],
// };

// // ─── Client Management ────────────────────────────────────────────────
// const STORAGE_KEY = "liminal_clients_v1";

// function loadClients() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if(raw) return JSON.parse(raw);
//   } catch(e) {}
//   return [{ id:"default", ...DEFAULT_CONFIG, createdAt: new Date().toISOString(), archived: false }];
// }

// function saveClients(clients) {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)); } catch(e) {}
// }

// function newClientId() { return "client_" + Date.now(); }



// const SEED_DATA = (() => {
//   const entries = [];
//   const locProfiles = {
//     "The Alfred":          { e:7.2, b:6.8, c:6.5, trend: 0.15 },
//     "Caulfield Hospital":  { e:4.0, b:3.5, c:3.8, trend: -0.2 },
//     "Sandringham Hospital":{ e:5.5, b:5.2, c:4.8, trend: 0.1  },
//     "Community Health":    { e:6.0, b:5.8, c:6.2, trend: 0.05 },
//     "Corporate/Admin":     { e:3.2, b:2.8, c:3.0, trend: -0.1 },
//   };
//   const deptOffsets = {
//     "Emergency":           { e:-1.5, b:-1.8, c:-1.2 },
//     "ICU / Critical Care": { e:-0.8, b:-1.0, c:-0.5 },
//     "Surgery":             { e: 0.5, b: 0.3, c: 0.4 },
//     "Medicine":            { e: 0.2, b: 0.0, c: 0.1 },
//     "Oncology":            { e:-0.5, b:-0.3, c:-0.4 },
//     "Mental Health":       { e:-1.0, b:-0.8, c:-0.9 },
//     "Nursing":             { e: 0.8, b: 0.6, c: 0.7 },
//     "Allied Health":       { e: 1.0, b: 0.9, c: 1.0 },
//     "Pharmacy":            { e: 0.3, b: 0.2, c: 0.3 },
//     "Pathology":           { e: 0.5, b: 0.4, c: 0.2 },
//     "Radiology":           { e: 0.6, b: 0.5, c: 0.4 },
//     "Facilities":          { e:-0.3, b:-0.5, c:-0.2 },
//     "Finance":             { e: 0.7, b: 0.8, c: 0.9 },
//     "HR":                  { e: 1.2, b: 1.0, c: 1.1 },
//     "IT":                  { e: 0.4, b: 0.3, c: 0.5 },
//     "Executive":           { e: 1.5, b: 1.4, c: 1.6 },
//     "Other":               { e: 0.0, b: 0.0, c: 0.0 },
//   };
//   const locWeekCounts = {
//     "The Alfred":          [12,14,15,16,18,20,22,24],
//     "Caulfield Hospital":  [8, 7, 6, 5, 5, 4, 4, 3],
//     "Sandringham Hospital":[6, 7, 8, 7, 9, 8, 9,10],
//     "Community Health":    [4, 5, 5, 6, 6, 7, 7, 8],
//     "Corporate/Admin":     [3, 3, 2, 2, 2, 1, 1, 1],
//   };
//   const deptsByLoc = {
//     "The Alfred":          ["Emergency","ICU / Critical Care","Surgery","Medicine","Nursing","Allied Health","Pharmacy","Radiology"],
//     "Caulfield Hospital":  ["Medicine","Mental Health","Nursing","Allied Health","Facilities"],
//     "Sandringham Hospital":["Emergency","Surgery","Nursing","Allied Health","Pathology"],
//     "Community Health":    ["Mental Health","Allied Health","Nursing","Other"],
//     "Corporate/Admin":     ["Finance","HR","IT","Executive"],
//   };
//   Object.keys(locProfiles).forEach(loc => {
//     const prof = locProfiles[loc];
//     const depts = deptsByLoc[loc];
//     const counts = locWeekCounts[loc];
//     for(let wi=0; wi<8; wi++) {
//       const count = counts[wi];
//       const weekFactor = prof.trend * wi;
//       for(let i=0; i<count; i++) {
//         const dept = depts[i % depts.length];
//         const dOff = deptOffsets[dept] || { e:0, b:0, c:0 };
//         const noise = () => (Math.random() - 0.5) * 1.2;
//         const energy  = Math.min(10, Math.max(1, Math.round((prof.e + weekFactor + dOff.e + noise())*10)/10));
//         const belief  = Math.min(10, Math.max(1, Math.round((prof.b + weekFactor + dOff.b + noise())*10)/10));
//         const clarity = Math.min(10, Math.max(1, Math.round((prof.c + weekFactor + dOff.c + noise())*10)/10));
//         entries.push({ week:`Week ${wi+1}`, location:loc, department:dept, energy, belief, clarity });
//       }
//     }
//   });
//   return entries;
// })();

// // ─── Helpers ───────────────────────────────────────────────────────────
// function avg(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null; }
// function scoreColor(v) { if(v===null)return"#94a3b8"; if(v>=7)return"#16a34a"; if(v>=4.5)return"#d97706"; return"#dc2626"; }
// function scoreLabel(v) { if(v===null)return"—"; if(v>=7)return"Strong"; if(v>=4.5)return"Moderate"; return"At Risk"; }
// function riskFlag(v) { return v!==null && v<4.5; }
// function pctColor(p) { return p>=60?"#16a34a":p>=30?"#d97706":"#dc2626"; }
// function pctLabel(p) { return p>=60?"Good":p>=30?"Low":"Critical"; }

// function getWeeks(config) { return Array.from({length:config.numWeeks},(_,i)=>`Week ${i+1}`); }

// function getCurrentWeek(config) {
//   const start = new Date(config.programmeStart);
//   const now = new Date();
//   const days = Math.floor((now - start) / 86400000);
//   if(days < 0) return null;
//   const weeks = getWeeks(config);
//   return weeks[Math.min(Math.floor(days/7), weeks.length-1)];
// }

// function getWeekDateRange(config, weekLabel) {
//   const weeks = getWeeks(config);
//   const idx = weeks.indexOf(weekLabel);
//   if(idx < 0) return null;
//   const start = new Date(config.programmeStart);
//   start.setDate(start.getDate() + idx*7);
//   const end = new Date(start); end.setDate(end.getDate()+6);
//   return {
//     start: start.toLocaleDateString("en-AU",{day:"numeric",month:"short"}),
//     end:   end.toLocaleDateString("en-AU",{day:"numeric",month:"short"}),
//   };
// }

// function getTotalStaff(config, locName) {
//   if(locName === "All") return config.locations.reduce((s,l)=>s+l.staff,0);
//   const loc = config.locations.find(l=>l.name===locName);
//   return loc ? loc.staff : 0;
// }

// function trendDir(trend, metric) {
//   if(trend.length<2) return null;
//   const last=trend[trend.length-1][metric], prev=trend[trend.length-2][metric];
//   if(last===null||prev===null) return null;
//   const d=last-prev; if(d>0.3)return"up"; if(d<-0.3)return"down"; return"flat";
// }
// function trendArrow(dir) {
//   if(dir==="up") return{icon:"↑",color:"#16a34a",label:"Improving"};
//   if(dir==="down") return{icon:"↓",color:"#dc2626",label:"Declining"};
//   if(dir==="flat") return{icon:"→",color:"#d97706",label:"Steady"};
//   return{icon:"",color:"#94a3b8",label:""};
// }

// function computeData(data, filterWeek, filterLoc) {
//   const filtered=data.filter(d=>(filterWeek==="All"||d.week===filterWeek)&&(filterLoc==="All"||d.location===filterLoc));
//   const depts=[...new Set(data.map(d=>d.department))];
//   const byDept=depts.map(dept=>{
//     const rows=filtered.filter(d=>d.department===dept);
//     return{dept,n:rows.length,energy:avg(rows.map(d=>d.energy)),belief:avg(rows.map(d=>d.belief)),clarity:avg(rows.map(d=>d.clarity))};
//   }).filter(d=>d.n>0).sort((a,b)=>avg([a.energy,a.belief,a.clarity].filter(Boolean))-avg([b.energy,b.belief,b.clarity].filter(Boolean)));
//   const locs=[...new Set(data.map(d=>d.location))];
//   const byLoc=locs.map(loc=>{
//     const rows=filtered.filter(d=>d.location===loc);
//     return{loc,n:rows.length,energy:avg(rows.map(d=>d.energy)),belief:avg(rows.map(d=>d.belief)),clarity:avg(rows.map(d=>d.clarity))};
//   }).filter(d=>d.n>0);
//   return{filtered,byDept,byLoc};
// }

// function computeWeeklyTrend(data, filterLoc, config) {
//   return getWeeks(config).map(w=>{
//     const rows=data.filter(d=>d.week===w&&(filterLoc==="All"||d.location===filterLoc));
//     return{week:w,n:rows.length,energy:avg(rows.map(d=>d.energy)),belief:avg(rows.map(d=>d.belief)),clarity:avg(rows.map(d=>d.clarity))};
//   }).filter(d=>d.n>0);
// }

// function generateInsights(filtered, weeklyTrend, byDept, byLoc, totalStaff) {
//   const overallE=avg(filtered.map(d=>d.energy));
//   const overallB=avg(filtered.map(d=>d.belief));
//   const overallC=avg(filtered.map(d=>d.clarity));
//   const overallAvg=[overallE,overallB,overallC].every(Boolean)?avg([overallE,overallB,overallC]):null;
//   const riskDepts=byDept.filter(d=>[d.energy,d.belief,d.clarity].some(riskFlag));
//   const strongDepts=byDept.filter(d=>{ const a=avg([d.energy,d.belief,d.clarity].filter(Boolean)); return a!==null&&a>=7; });
//   const participationPct = totalStaff ? Math.round((filtered.length/totalStaff)*100) : null;
//   const insights=[];

//   if(participationPct!==null){
//     let s,f;
//     if(participationPct>=60){s=`Participation is strong at ${participationPct}% of total staff. The data is reliable — use it with confidence.`;f="positive";}
//     else if(participationPct>=30){s=`Participation sits at ${participationPct}% of total staff. Enough to identify patterns but treat with caution. Low participation is itself a signal — disengaged staff are least likely to check in. The real picture may be worse.`;f="moderate";}
//     else{s=`Participation is critically low at ${participationPct}%. You're only hearing from the most engaged or most distressed people. Don't make major decisions from this data alone. Boosting participation must be the immediate priority.`;f="risk";}
//     insights.push({category:"Participation Rate",icon:"👥",flag:f,summary:s,recommendations:[
//       participationPct<60?"Make check-in completion a standing agenda item in every team meeting — leaders actively asking drives response rates.":"Keep reinforcing why this check-in matters — people participate when they see it leads to action.",
//       "Share back a summary of what the data is showing. People respond when they can see their input being used.",
//       participationPct<30?"Make check-in completion a visible team commitment — not mandatory, but clearly valued by leadership.":"Recognise high-participation departments publicly to create positive peer pressure."
//     ]});
//   }

//   if(overallAvg!==null){
//     let s,f;
//     if(overallAvg>=7){s=`Overall sentiment is strong at ${overallAvg.toFixed(1)}. People are broadly engaged — but don't mistake momentum for completion. Stage 1 and 2 work still needs to be held even when scores look healthy.`;f="positive";}
//     else if(overallAvg>=4.5){s=`Staff are in moderate territory (${overallAvg.toFixed(1)}) — the liminal space. The risk is assuming things are fine enough and skipping Stage 1 and 2 work. They're not fine enough yet. Keep holding the space.`;f="moderate";}
//     else{s=`Overall scores are at-risk (${overallAvg.toFixed(1)}). Staff haven't completed Stage 1 — they haven't Owned and Faced the loss. Attempting to Drive It now will backfire. Do the emotional groundwork first.`;f="risk";}
//     insights.push({category:"Overall Health",icon:"📊",flag:f,summary:s,recommendations:overallAvg<7?[
//       "Hold a leadership debrief before any further change announcements.",
//       overallAvg<4.5?"Pause Stage 3 activity until scores recover above 5.0.":"Don't skip Stage 2 — staff need difficult conversations and transparency, not just updates.",
//       "Run a team reset: Own It, Face It, Feel It — before asking anyone to Ask It or Drive It."
//     ]:[
//       "Maintain your current communication cadence — it's working.",
//       "Use high scores as evidence of psychological safety and encourage honest check-ins.",
//       "Begin transitioning toward Stage 3: involve staff in co-creating solutions."
//     ]});
//   }

//   if(overallB!==null){
//     let s,f;
//     if(overallB>=7){s=`Belief is at ${overallB.toFixed(1)} — staff broadly believe this change can succeed. The hardest score to move. Stage 1 work has created genuine buy-in.`;f="positive";}
//     else if(overallB>=4.5){s=`Belief sits at ${overallB.toFixed(1)}. Staff are on the fence. Belief is tied to Stage 1 completion — if people haven't processed the loss, they can't believe in the new direction. Difficult conversations are the lever, not another town hall.`;f="moderate";}
//     else{s=`Belief is critically low at ${overallB.toFixed(1)}. People have checked out from the possibility of success. This can't be fixed with a comms piece — it requires real conversations about what's been lost.`;f="risk";}
//     insights.push({category:"Belief 💪",icon:"💪",flag:f,summary:s,recommendations:[
//       overallB<4.5?"Stop 'good news only' messaging immediately — it reads as tone-deaf.":"Share honest updates acknowledging what's hard, not just what's going well.",
//       "Run structured difficult conversation sessions with team leaders — Face It before you Fix It.",
//       overallB<4.5?"Bring in an external EI facilitator to run Stage 1 closure sessions.":"Ask staff: 'What would need to be true for you to fully believe in this change?' Then listen."
//     ]});
//   }

//   if(overallC!==null){
//     let s,f;
//     if(overallC>=7){s=`Clarity is strong at ${overallC.toFixed(1)}. Staff understand what the change means for them personally — a Stage 2 win. Keep transparency high; clarity needs ongoing reinforcement.`;f="positive";}
//     else if(overallC>=4.5){s=`Clarity sits at ${overallC.toFixed(1)}. People are getting some of the picture but not all. Ambiguity creates anxiety. The Stage 2 mandate: more direction, not less.`;f="moderate";}
//     else{s=`Clarity is at ${overallC.toFixed(1)} — staff don't understand what this change means for them personally. When people can't see their place in the new world, they catastrophise. Radical transparency is the only way through.`;f="risk";}
//     insights.push({category:"Clarity 🎯",icon:"🎯",flag:f,summary:s,recommendations:[
//       "Publish a 'What this means for you' one-pager per department — plain language, no jargon.",
//       overallC<4.5?"Hold weekly 15-minute huddles where leaders answer questions honestly — no spin.":"Create a live FAQ updated in real time as decisions are made.",
//       "Set a non-negotiable weekly update rhythm. Clarity drops when communication stops."
//     ]});
//   }

//   if(overallE!==null){
//     const eD=trendDir(weeklyTrend,"energy"), eTa=trendArrow(eD);
//     let s,f;
//     if(overallE>=7){s=`Energy is strong at ${overallE.toFixed(1)} and ${eD==="up"?"continuing to climb":eD==="down"?"showing early dips — watch this":"holding steady"}. Green light for Stage 3.`;f="positive";}
//     else if(overallE>=4.5){s=`Energy sits at ${overallE.toFixed(1)} — moderate but ${eD==="down"?"declining, a warning sign":eD==="up"?"trending upward":"flat"}. Staff are in the liminal space — not disengaged, not fully bought in.`;f="moderate";}
//     else{s=`Energy is at ${overallE.toFixed(1)} — low and needing immediate attention. People have lost faith or are exhausted from uncertainty. This is a Stage 2 problem.`;f="risk";}
//     insights.push({category:"Energy ⚡",icon:"⚡",flag:f,summary:s,recommendations:[
//       overallE<4.5?"Schedule leadership walkthroughs this week — physical presence lifts energy faster than any email.":"Celebrate small wins publicly and tie them to the change journey.",
//       overallE<4.5?"Identify 2–3 respected staff per site to act as informal change champions.":"Give staff a meaningful role in the next phase — energy follows ownership.",
//       `Trend: ${eTa.label||"n/a"}. ${eD==="down"?"Act now before this becomes entrenched.":eD==="up"?"Keep doing what's working.":"A shift in approach could break the flatline."}`
//     ]});
//   }

//   if(riskDepts.length>0){
//     insights.push({category:"At-Risk Departments",icon:"⚠️",flag:"risk",
//       summary:`${riskDepts.map(d=>d.dept).join(", ")} ${riskDepts.length===1?"is":"are"} flagged at-risk. These teams are stuck in Stage 1 or early Stage 2. Pushing toward Stage 3 now will create resistance, disengagement, or quiet quitting.`,
//       recommendations:[
//         `Prioritise direct leadership contact with ${riskDepts[0].dept}${riskDepts.length>1?" and the other flagged teams":""} this week — not an email, an actual conversation.`,
//         "Run a Stage 1 facilitated session: give people space to name what they're losing without judgment.",
//         "Don't roll out Stage 3 milestones to at-risk teams until scores recover above 5.0.",
//         "Consider peer support pairing — connect at-risk staff with colleagues from stronger teams."
//       ]
//     });
//   }

//   if(strongDepts.length>0){
//     insights.push({category:"High-Performing Teams",icon:"🌟",flag:"positive",
//       summary:`${strongDepts.map(d=>d.dept).join(", ")} ${strongDepts.length===1?"is":"are"} scoring strongly across all three metrics and ready to Drive It. Don't leave them waiting.`,
//       recommendations:[
//         "Identify change champions within these teams and give them a formal role supporting at-risk departments.",
//         "Use these teams as pilot groups for Stage 3 initiatives — they'll build credible proof points.",
//         "Acknowledge their engagement publicly. Recognition sustains momentum."
//       ]
//     });
//   }

//   if(weeklyTrend.length>=3){
//     const recent=weeklyTrend.slice(-3);
//     const scores=recent.map(w=>avg([w.energy,w.belief,w.clarity].filter(Boolean)));
//     const trend=scores[2]-scores[0];
//     let s,f;
//     if(trend>0.3){s=`Scores have climbed over the last three weeks (+${trend.toFixed(1)}). The CI model is working — keep Stage 2 support in place as you begin Stage 3. Don't pull the scaffolding down too early.`;f="positive";}
//     else if(trend<-0.3){s=`Scores have declined over the last three weeks (${trend.toFixed(1)}). This signals a leadership or communication gap. Stage 2 structures need reinforcing urgently.`;f="risk";}
//     else{s=`Scores have been flat for three weeks. Plateau periods are common, but they signal that something needs to shift to create forward movement. This is a leadership intervention moment.`;f="moderate";}
//     insights.push({category:"Weekly Trend",icon:"📈",flag:f,summary:s,recommendations:trend<-0.3?[
//       "Review what changed in leadership activity or communication over the past three weeks.",
//       "Re-engage Stage 2: are leaders still having difficult conversations and maintaining transparency?",
//       "Consider external EI facilitation to reset the emotional temperature."
//     ]:trend>0.3?[
//       "Document what's working — it's repeatable and scalable.",
//       "Use positive trend data in leadership comms to reinforce staff confidence.",
//       "Begin planning Stage 3 rollout for highest-scoring teams."
//     ]:[
//       "Introduce a new engagement mechanism — a forum, a quick win, a feedback loop staff can see acted on.",
//       "Ask staff directly what would shift their experience. Use the Ask It step and mean it.",
//       "Check if the same leaders are driving all communication — a fresh voice can shift stale energy."
//     ]});
//   }
//   return insights;
// }

// // ─── Shared styles ─────────────────────────────────────────────────────
// // BRAND defined above
// const sel={width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${BRAND.border}`,fontSize:14,background:"#fff",color:BRAND.black,outline:"none",cursor:"pointer",fontFamily:"inherit"};
// const btn={display:"block",width:"100%",padding:"13px",borderRadius:11,border:"none",background:BRAND.black,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif"};
// const card={background:"#fff",border:`1.5px solid ${BRAND.border}`,borderRadius:14,padding:"18px",boxShadow:"0 1px 6px #0000000a",marginBottom:14};

// function Badge({value,size="md"}) {
//   const c=scoreColor(value);
//   const fs=size==="sm"?11:14; const pad=size==="sm"?"2px 8px":"4px 12px";
//   return <span style={{background:c+"18",color:c,border:`1.5px solid ${c}35`,borderRadius:20,padding:pad,fontSize:fs,fontWeight:700,whiteSpace:"nowrap"}}>{value!==null?value.toFixed(1):"—"}</span>;
// }

// function ParticipationBar({ n, total, label }) {
//   const pct = total ? Math.min(100,Math.round((n/total)*100)) : 0;
//   const col = pctColor(pct);
//   return (
//     <div style={{marginBottom:8}}>
//       {label && <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
//         <span style={{fontWeight:600,color:BRAND.black}}>{label}</span>
//         <span style={{color:col,fontWeight:700}}>{n}/{total} · {pct}% <span style={{fontWeight:500,color:BRAND.grey,fontSize:10}}>({pctLabel(pct)})</span></span>
//       </div>}
//       <div style={{background:"#e2e8f0",borderRadius:6,height:8,overflow:"hidden"}}>
//         <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:6}}/>
//       </div>
//     </div>
//   );
// }

// function InsightCard({insight,expanded=false}) {
//   const [open,setOpen]=useState(expanded);
//   const cols={
//     positive:{bg:"#f0fdf4",border:"#bbf7d0",ic:"#16a34a",badge:"#dcfce7",bt:"#15803d",label:"Positive"},
//     moderate:{bg:"#fffbeb",border:"#fde68a",ic:"#d97706",badge:"#fef3c7",bt:"#92400e",label:"Watch"},
//     risk:{bg:"#fef2f2",border:"#fecaca",ic:"#dc2626",badge:"#fee2e2",bt:"#991b1b",label:"Action Required"},
//   }[insight.flag];
//   return (
//     <div style={{background:cols.bg,border:`1.5px solid ${cols.border}`,borderRadius:14,overflow:"hidden",marginBottom:12}}>
//       <div onClick={()=>setOpen(!open)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
//         <div style={{display:"flex",alignItems:"center",gap:10}}>
//           <span style={{fontSize:18}}>{insight.icon}</span>
//           <div>
//             <div style={{fontWeight:800,fontSize:14,color:BRAND.black}}>{insight.category}</div>
//             <span style={{background:cols.badge,color:cols.bt,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8}}>{cols.label}</span>
//           </div>
//         </div>
//         <span style={{color:cols.ic,fontWeight:700,fontSize:20,flexShrink:0}}>{open?"−":"+"}</span>
//       </div>
//       {open&&(
//         <div style={{padding:"0 18px 18px"}}>
//           <p style={{fontSize:13,color:"#374151",lineHeight:1.75,margin:"0 0 14px",borderTop:`1px solid ${cols.border}`,paddingTop:12}}>{insight.summary}</p>
//           <div style={{fontWeight:700,fontSize:11,color:BRAND.grey,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Recommendations</div>
//           {insight.recommendations.map((r,i)=>(
//             <div key={i} style={{display:"flex",gap:9,marginBottom:9,alignItems:"flex-start"}}>
//               <div style={{minWidth:20,height:20,borderRadius:"50%",background:cols.badge,color:cols.bt,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
//               <p style={{fontSize:13,color:"#374151",lineHeight:1.6,margin:0}}>{r}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Slider({label,description,value,onChange,color,icon}) {
//   return (
//     <div style={{marginBottom:24}}>
//       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
//         <div style={{display:"flex",alignItems:"center",gap:8}}>
//           <span style={{fontSize:18}}>{icon}</span>
//           <div>
//             <div style={{fontWeight:700,fontSize:14,color:BRAND.black}}>{label}</div>
//             <div style={{fontSize:11,color:BRAND.grey}}>{description}</div>
//           </div>
//         </div>
//         <div style={{background:color+"18",border:`2px solid ${color}`,borderRadius:8,padding:"3px 12px",minWidth:44,textAlign:"center"}}>
//           <span style={{fontSize:18,fontWeight:800,color}}>{value}</span>
//         </div>
//       </div>
//       <input type="range" min={1} max={10} step={0.5} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{
//           width:"100%",
//           accentColor:color,
//           cursor:"pointer",
//           height:"6px",
//           borderRadius:"3px",
//           outline:"none",
//           WebkitAppearance:"none",
//           appearance:"none",
//           background:`linear-gradient(to right, ${color} 0%, ${color} ${((value-1)/9)*100}%, #e2e8f0 ${((value-1)/9)*100}%, #e2e8f0 100%)`,
//         }}/>
//       <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginTop:2}}>
//         <span>1 — Very Low</span><span>5 — Moderate</span><span>10 — Very High</span>
//       </div>
//     </div>
//   );
// }


// // ─── Editable Insights Export ─────────────────────────────────────────
// function EditableInsightsExport({ insights }) {
//   const flagConfig = {
//     risk:     { bg:"#fef2f2", border:"#fecaca", titleColor:"#dc2626", prefix:"⚠", suffix:"— Action Required", recColor:"#dc2626" },
//     moderate: { bg:"#fffbeb", border:"#fde68a", titleColor:"#d97706", prefix:"👀", suffix:"— Watch Closely",   recColor:"#d97706" },
//     positive: { bg:"#f0fdf4", border:"#bbf7d0", titleColor:"#16a34a", prefix:"✅", suffix:"— Positive Signal", recColor:"#16a34a" },
//   };

//   // Build initial editable state from insights
//   const buildState = () => insights.reduce((acc, ins) => {
//     acc[ins.category] = {
//       visible: true,
//       summary: ins.summary,
//       recommendations: ins.recommendations.map((r,i) => ({ id:i, text:r, visible:true })),
//     };
//     return acc;
//   }, {});

//   const [state, setState] = useState(buildState);
//   const [editingKey, setEditingKey] = useState(null); // {cat, recId} or {cat, 'summary'}

//   const toggleInsight = (cat) => setState(s=>({...s,[cat]:{...s[cat],visible:!s[cat].visible}}));
//   const toggleRec = (cat,id) => setState(s=>({...s,[cat]:{...s[cat],recommendations:s[cat].recommendations.map(r=>r.id===id?{...r,visible:!r.visible}:r)}}));
//   const updateRec = (cat,id,text) => setState(s=>({...s,[cat]:{...s[cat],recommendations:s[cat].recommendations.map(r=>r.id===id?{...r,text}:r)}}));
//   const updateSummary = (cat,text) => setState(s=>({...s,[cat]:{...s[cat],summary:text}}));

//   const orderedFlags = ["risk","moderate","positive"];
//   const visibleInsights = insights.filter(ins => state[ins.category]?.visible);

//   return (
//     <div>
//       {/* Edit controls bar - only shows in preview, not print */}
//       <div className="no-print" style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"9px 14px",marginBottom:14,fontSize:11,color:"#92400e"}}>
//         <strong>✏️ Editing mode:</strong> Click any insight title to hide/show it. Click any recommendation to hide/show or edit it. Changes only affect this export.
//       </div>

//       <div style={{fontWeight:800,fontSize:12,color:BRAND.black,marginBottom:10}}>Key Insights & Recommendations</div>

//       {orderedFlags.map(flag => {
//         const fc = flagConfig[flag];
//         const flagInsights = insights.filter(i=>i.flag===flag);
//         return flagInsights.map((ins, idx) => {
//           const s = state[ins.category];
//           if(!s) return null;
//           const visibleRecs = s.recommendations.filter(r=>r.visible);

//           return (
//             <div key={ins.category} style={{marginBottom:10,opacity:s.visible?1:0.4}}>
//               {/* Insight card */}
//               <div style={{background:fc.bg,border:`1px solid ${fc.border}`,borderRadius:9,padding:"10px 14px"}}>
//                 {/* Title row */}
//                 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
//                   <div style={{fontWeight:700,color:fc.titleColor,fontSize:11}}>{fc.prefix} {ins.category} {fc.suffix}</div>
//                   <button className="no-print" onClick={()=>toggleInsight(ins.category)} style={{padding:"2px 8px",borderRadius:5,border:`1px solid ${fc.border}`,background:s.visible?"transparent":"#e2e8f0",color:fc.titleColor,fontSize:10,cursor:"pointer",fontWeight:600}}>
//                     {s.visible?"Hide":"Show"}
//                   </button>
//                 </div>

//                 {s.visible && <>
//                   {/* Editable summary */}
//                   {editingKey?.cat===ins.category && editingKey?.field==="summary" ? (
//                     <div style={{marginBottom:8}}>
//                       <textarea value={s.summary} onChange={e=>updateSummary(ins.category,e.target.value)}
//                         rows={3} style={{width:"100%",fontSize:11,lineHeight:1.6,padding:"6px 8px",borderRadius:6,border:`1px solid ${fc.border}`,fontFamily:"inherit",resize:"vertical"}}/>
//                       <button className="no-print" onClick={()=>setEditingKey(null)} style={{marginTop:4,padding:"3px 10px",borderRadius:5,border:"none",background:fc.titleColor,color:"#fff",fontSize:10,cursor:"pointer",fontWeight:600}}>Done</button>
//                     </div>
//                   ) : (
//                     <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
//                       <p style={{fontSize:11,color:"#374151",lineHeight:1.6,margin:0,flex:1}}>{s.summary}</p>
//                       <button className="no-print" onClick={()=>setEditingKey({cat:ins.category,field:"summary"})} style={{padding:"2px 7px",borderRadius:5,border:`1px solid ${fc.border}`,background:"transparent",color:BRAND.grey,fontSize:10,cursor:"pointer",flexShrink:0}}>✏️</button>
//                     </div>
//                   )}

//                   {/* Recommendations */}
//                   {s.recommendations.map((rec,j) => (
//                     <div key={rec.id} style={{display:"flex",gap:6,marginBottom:5,alignItems:"flex-start",opacity:rec.visible?1:0.35}}>
//                       <span style={{color:fc.recColor,fontWeight:700,fontSize:10,marginTop:1,flexShrink:0}}>{j+1}.</span>
//                       {editingKey?.cat===ins.category && editingKey?.recId===rec.id ? (
//                         <div style={{flex:1}}>
//                           <input value={rec.text} onChange={e=>updateRec(ins.category,rec.id,e.target.value)}
//                             style={{width:"100%",fontSize:10,padding:"4px 8px",borderRadius:5,border:`1px solid ${fc.border}`,fontFamily:"inherit"}}/>
//                           <button className="no-print" onClick={()=>setEditingKey(null)} style={{marginTop:3,padding:"2px 8px",borderRadius:5,border:"none",background:fc.titleColor,color:"#fff",fontSize:9,cursor:"pointer",fontWeight:600}}>Done</button>
//                         </div>
//                       ) : (
//                         <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
//                           <span style={{fontSize:10,color:"#374151",lineHeight:1.5}}>{rec.text}</span>
//                           <div className="no-print" style={{display:"flex",gap:3,flexShrink:0}}>
//                             <button onClick={()=>setEditingKey({cat:ins.category,recId:rec.id})} style={{padding:"1px 6px",borderRadius:4,border:`1px solid ${fc.border}`,background:"transparent",color:BRAND.grey,fontSize:9,cursor:"pointer"}}>✏️</button>
//                             <button onClick={()=>toggleRec(ins.category,rec.id)} style={{padding:"1px 6px",borderRadius:4,border:`1px solid ${fc.border}`,background:rec.visible?"transparent":"#e2e8f0",color:rec.visible?fc.titleColor:BRAND.grey,fontSize:9,cursor:"pointer",fontWeight:600}}>{rec.visible?"✕":"+"}</button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </>}
//               </div>
//             </div>
//           );
//         });
//       })}
//     </div>
//   );
// }


// // ─── Export Report ──────────────────────────────────────────────────────
// function ExportReport({ data, config, mode, onClose }) {
//   const [dateMode, setDateMode] = useState("weekly");
//   const [selectedWeek, setSelectedWeek] = useState(getWeeks(config)[getWeeks(config).length-1]);
//   const [customStart, setCustomStart] = useState("");
//   const [customEnd, setCustomEnd] = useState("");
//   const [notes, setNotes] = useState("");
//   const [preparedBy, setPreparedBy] = useState("Amy Jacobson");
//   const reportRef = useRef(null);
//   const weeks = getWeeks(config);

//   let reportData = data;
//   let periodLabel = "";
//   if(dateMode==="weekly") {
//     reportData = data.filter(d=>d.week===selectedWeek);
//     const dr = getWeekDateRange(config, selectedWeek);
//     periodLabel = `${selectedWeek}${dr?` · ${dr.start} – ${dr.end}`:""}`;
//   } else if(dateMode==="monthly") {
//     const last4 = weeks.slice(-4);
//     reportData = data.filter(d=>last4.includes(d.week));
//     periodLabel = `${last4[0]} – ${last4[last4.length-1]} (Monthly)`;
//   } else if(dateMode==="custom" && customStart && customEnd) {
//     reportData = data.filter(d=>{
//       const idx=weeks.indexOf(d.week), si=weeks.indexOf(customStart), ei=weeks.indexOf(customEnd);
//       return idx>=si && idx<=ei;
//     });
//     periodLabel = `${customStart} – ${customEnd} (Custom)`;
//   }

//   const totalStaff = getTotalStaff(config,"All");
//   const oE=avg(reportData.map(d=>d.energy)), oB=avg(reportData.map(d=>d.belief)), oC=avg(reportData.map(d=>d.clarity));
//   const oA=[oE,oB,oC].every(Boolean)?avg([oE,oB,oC]):null;
//   const participationPct = totalStaff ? Math.min(100,Math.round((reportData.length/totalStaff)*100)) : 0;

//   const depts=[...new Set(data.map(d=>d.department))];
//   const byDept=depts.map(dept=>{
//     const rows=reportData.filter(d=>d.department===dept);
//     return{dept,n:rows.length,energy:avg(rows.map(d=>d.energy)),belief:avg(rows.map(d=>d.belief)),clarity:avg(rows.map(d=>d.clarity))};
//   }).filter(d=>d.n>0).sort((a,b)=>avg([a.energy,a.belief,a.clarity].filter(Boolean))-avg([b.energy,b.belief,b.clarity].filter(Boolean)));

//   const byLoc=config.locations.map(loc=>{
//     const rows=reportData.filter(d=>d.location===loc.name);
//     return{loc:loc.name,n:rows.length,energy:avg(rows.map(d=>d.energy)),belief:avg(rows.map(d=>d.belief)),clarity:avg(rows.map(d=>d.clarity))};
//   }).filter(d=>d.n>0);

//   const weeklyTrend = computeWeeklyTrend(data,"All",config);
//   const insights = mode==="insights" ? generateInsights(reportData,weeklyTrend,byDept,byLoc,totalStaff) : [];
//   const riskDepts = byDept.filter(d=>[d.energy,d.belief,d.clarity].some(riskFlag));
//   const sc=(v)=>v>=7?"#16a34a":v>=4.5?"#d97706":"#dc2626";

//   const handlePrint = () => {
//     const content = reportRef.current.innerHTML;
//     const win = window.open('','_blank');
//     win.document.write(`<!DOCTYPE html><html><head><title>The Liminal Index — ${config.clientName}</title>
//     <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
//     <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Nunito Sans',sans-serif;padding:24px;color:#25282A;}@media print{body{padding:0;}}</style>
//     </head><body>${content}</body></html>`);
//     win.document.close();
//     setTimeout(()=>win.print(),600);
//   };

//   return (
//     <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,overflow:"auto",padding:"20px 16px"}}>
//       <div style={{maxWidth:860,margin:"0 auto",background:"#fff",borderRadius:16,overflow:"hidden"}}>
//         {/* Controls bar */}
//         <div style={{background:BRAND.black,padding:"14px 20px",display:"flex",alignItems:"center",flexWrap:"wrap",gap:10}}>
//           <div style={{color:"#fff",fontWeight:800,fontSize:15,marginRight:8}}>
//             {mode==="dashboard"?"📊 Dashboard Export":"💡 Insights Export"}
//           </div>
//           {["weekly","monthly","custom"].map(m=>(
//             <button key={m} onClick={()=>setDateMode(m)} style={{padding:"5px 12px",borderRadius:7,border:"none",background:dateMode===m?BRAND.blue:"#ffffff20",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>{m}</button>
//           ))}
//           <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
//             <button onClick={handlePrint} style={{padding:"7px 16px",borderRadius:8,border:"none",background:BRAND.blue,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>🖨 Print / PDF</button>
//             <button onClick={onClose} style={{background:"transparent",border:"1px solid #ffffff40",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12}}>✕</button>
//           </div>
//         </div>
//         {/* Date/options bar */}
//         <div style={{background:BRAND.lightGrey,padding:"10px 20px",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",borderBottom:`1px solid ${BRAND.border}`}}>
//           {dateMode==="weekly"&&(
//             <div style={{display:"flex",alignItems:"center",gap:6}}>
//               <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>Week:</span>
//               <select value={selectedWeek} onChange={e=>setSelectedWeek(e.target.value)} style={{...sel,width:"auto",fontSize:12,padding:"5px 28px 5px 10px"}}>
//                 {weeks.map(w=><option key={w}>{w}</option>)}
//               </select>
//             </div>
//           )}
//           {dateMode==="custom"&&(<>
//             <div style={{display:"flex",alignItems:"center",gap:6}}>
//               <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>From:</span>
//               <select value={customStart} onChange={e=>setCustomStart(e.target.value)} style={{...sel,width:"auto",fontSize:12,padding:"5px 28px 5px 10px"}}>
//                 <option value="">Select…</option>{weeks.map(w=><option key={w}>{w}</option>)}
//               </select>
//             </div>
//             <div style={{display:"flex",alignItems:"center",gap:6}}>
//               <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>To:</span>
//               <select value={customEnd} onChange={e=>setCustomEnd(e.target.value)} style={{...sel,width:"auto",fontSize:12,padding:"5px 28px 5px 10px"}}>
//                 <option value="">Select…</option>{weeks.map(w=><option key={w}>{w}</option>)}
//               </select>
//             </div>
//           </>)}
//           <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
//             <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>Prepared by:</span>
//             <input value={preparedBy} onChange={e=>setPreparedBy(e.target.value)} style={{...sel,width:170,fontSize:12,padding:"5px 10px"}}/>
//           </div>
//         </div>
//         {/* Notes */}
//         <div style={{padding:"8px 20px",borderBottom:`1px solid ${BRAND.border}`,background:"#fffdf7"}}>
//           <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add executive summary notes (optional — appears at top of report)..." style={{...sel,fontSize:12,padding:"7px 12px"}}/>
//         </div>
//         {/* Report */}
//         <div ref={reportRef} style={{padding:"28px 32px",background:"#fff"}}>
//           {/* Header */}
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,paddingBottom:14,borderBottom:`3px solid ${BRAND.black}`}}>
//             <div>
//               <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{height:26,width:"auto",marginBottom:8}}/>
//               <div style={{fontWeight:800,fontSize:19,color:BRAND.black}}>{mode==="dashboard"?"Change Intelligence Report":"Insights & Recommendations Report"}</div>
//               <div style={{fontSize:12,color:BRAND.grey,marginTop:3}}>{config.clientName} · {periodLabel||"Select a date range above"}</div>
//             </div>
//             <div style={{textAlign:"right"}}>
//               <div style={{fontSize:10,color:BRAND.grey}}>Prepared by</div>
//               <div style={{fontWeight:700,fontSize:13,color:BRAND.black}}>{preparedBy}</div>
//               <div style={{fontSize:10,color:BRAND.grey,marginTop:2}}>{new Date().toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"})}</div>
//               <div style={{marginTop:5,fontSize:10,color:BRAND.blue,fontWeight:700}}>The Liminal Index™</div>
//             </div>
//           </div>
//           {/* Notes block */}
//           {notes&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,padding:"10px 14px",marginBottom:18,fontSize:12,color:"#374151",lineHeight:1.7}}><strong>Executive Notes: </strong>{notes}</div>}
//           {/* KPIs */}
//           <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:18}}>
//             {[
//               {label:"Participation",val:participationPct+"%",color:pctColor(participationPct),sub:reportData.length+" responses",bg:pctColor(participationPct)+"12"},
//               {label:"Overall",val:oA?oA.toFixed(1):"—",color:scoreColor(oA),sub:scoreLabel(oA),bg:scoreColor(oA)+"12"},
//               {label:"Energy ⚡",val:oE?oE.toFixed(1):"—",color:scoreColor(oE),sub:scoreLabel(oE),bg:BRAND.lightBlue},
//               {label:"Belief 💪",val:oB?oB.toFixed(1):"—",color:scoreColor(oB),sub:scoreLabel(oB),bg:BRAND.lightCoral},
//               {label:"Clarity 🎯",val:oC?oC.toFixed(1):"—",color:scoreColor(oC),sub:scoreLabel(oC),bg:"#f0fdf4"},
//             ].map((k,i)=>(
//               <div key={i} style={{background:k.bg,borderRadius:9,padding:"10px 12px",textAlign:"center"}}>
//                 <div style={{fontSize:9,color:BRAND.grey,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{k.label}</div>
//                 <div style={{fontSize:20,fontWeight:800,color:k.color,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1}}>{k.val}</div>
//                 <div style={{fontSize:9,color:k.color,fontWeight:600,marginTop:3}}>{k.sub}</div>
//               </div>
//             ))}
//           </div>
//           {/* Stage Pulse */}
//           <div style={{marginBottom:18}}>
//             <div style={{fontWeight:800,fontSize:12,color:BRAND.black,marginBottom:8}}>Change Intelligence Stage Pulse</div>
//             <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
//               {[
//                 {stage:"Stage 1",label:"Owning & Facing the Loss",metric:"Belief 💪",val:oB,color:BRAND.coral},
//                 {stage:"Stage 2",label:"Through the Liminal",metric:"Clarity 🎯",val:oC,color:BRAND.blue},
//                 {stage:"Stage 3",label:"Drive the Change",metric:"Energy ⚡",val:oE,color:"#16a34a"},
//               ].map((s,i)=>(
//                 <div key={i} style={{background:s.color+"10",border:`1.5px solid ${s.color}30`,borderRadius:8,padding:"9px 12px",textAlign:"center"}}>
//                   <div style={{fontSize:8,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:0.8,opacity:0.8}}>{s.stage}</div>
//                   <div style={{fontSize:13,fontWeight:800,color:s.color,margin:"4px 0 3px",lineHeight:1.2}}>{s.label}</div>
//                   <div style={{fontSize:8,color:s.color,opacity:0.65,marginBottom:6,fontWeight:600}}>({s.metric})</div>
//                   <div style={{fontSize:20,fontWeight:800,color:s.color,fontFamily:"'Nunito Sans',sans-serif"}}>{s.val?s.val.toFixed(1):"—"}</div>
//                   <div style={{fontSize:9,color:scoreColor(s.val),fontWeight:600,marginTop:3}}>{scoreLabel(s.val)}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           {/* Dashboard mode — location table */}
//           {mode==="dashboard"&&byLoc.length>0&&(
//             <div style={{marginBottom:18}}>
//               <div style={{fontWeight:800,fontSize:12,color:BRAND.black,marginBottom:8}}>Scores by Location</div>
//               <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
//                 <thead><tr style={{background:BRAND.lightGrey}}>
//                   {[["Location",""],["Responses",""],["Energy ⚡","Stage 3"],["Belief 💪","Stage 1"],["Clarity 🎯","Stage 2"],["Avg",""],["Status",""]].map(([h,sub])=>(
//                     <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:BRAND.grey,textTransform:"uppercase"}}>{h}{sub&&<div style={{fontSize:8,color:BRAND.blue,fontWeight:600,textTransform:"none",letterSpacing:0,marginTop:1}}>{sub}</div>}</th>
//                   ))}
//                 </tr></thead>
//                 <tbody>
//                   {byLoc.map((row,i)=>{
//                     const rA=avg([row.energy,row.belief,row.clarity].filter(Boolean));
//                     return (
//                       <tr key={i} style={{borderBottom:`1px solid ${BRAND.border}`,background:riskFlag(rA)?"#fff5f5":"transparent"}}>
//                         <td style={{padding:"6px 10px",fontWeight:600}}>{row.loc}{riskFlag(rA)?" ⚠":""}</td>
//                         <td style={{padding:"6px 10px",color:BRAND.grey}}>{row.n}</td>
//                         <td style={{padding:"6px 10px",color:sc(row.energy),fontWeight:700}}>{row.energy?row.energy.toFixed(1):"—"}</td>
//                         <td style={{padding:"6px 10px",color:sc(row.belief),fontWeight:700}}>{row.belief?row.belief.toFixed(1):"—"}</td>
//                         <td style={{padding:"6px 10px",color:sc(row.clarity),fontWeight:700}}>{row.clarity?row.clarity.toFixed(1):"—"}</td>
//                         <td style={{padding:"6px 10px",color:sc(rA),fontWeight:800}}>{rA?rA.toFixed(1):"—"}</td>
//                         <td style={{padding:"6px 10px",fontWeight:700,color:scoreColor(rA),fontSize:10}}>{scoreLabel(rA)}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//               {riskDepts.length>0&&(
//                 <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",marginTop:10}}>
//                   <div style={{fontWeight:700,color:"#dc2626",fontSize:11,marginBottom:4}}>⚠ At-Risk Departments</div>
//                   <div style={{fontSize:11,color:"#7f1d1d"}}><strong>{riskDepts.map(d=>d.dept).join(", ")}</strong> — scores below 4.5. Immediate leadership attention required before Stage 3 activity.</div>
//                 </div>
//               )}
//             </div>
//           )}
//           {/* Insights mode - editable recommendations */}
//           {mode==="insights"&&(
//             <EditableInsightsExport insights={insights} />
//           )}
//           {/* Footer */}
//           <div style={{marginTop:22,paddingTop:12,borderTop:`1px solid ${BRAND.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
//             <div style={{fontSize:9,color:BRAND.grey}}>The Liminal Index™ · Amy Jacobson Change Intelligence System · All data is anonymous and confidential</div>
//             <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{height:16,width:"auto"}}/>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // ─── Client Manager Modal ─────────────────────────────────────────────
// function ClientManager({ clients, activeClientId, onSwitch, onCreate, onArchive, onRestore, onClose }) {
//   const [newName, setNewName] = useState("");
//   const active = clients.filter(c=>!c.archived);
//   const archived = clients.filter(c=>c.archived);

//   const inp = {...{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${BRAND.border}`,fontSize:14,background:"#fff",color:BRAND.black,outline:"none",fontFamily:"inherit"}, marginBottom:0, fontSize:13};

//   return (
//     <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1100,overflow:"auto",padding:"20px 16px"}}>
//       <div style={{maxWidth:560,margin:"0 auto",background:"#fff",borderRadius:16,overflow:"hidden"}}>
//         <div style={{background:BRAND.black,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
//           <div style={{color:"#fff",fontWeight:800,fontSize:15}}>👥 Client Manager</div>
//           <button onClick={onClose} style={{background:"transparent",border:"1px solid #ffffff40",color:"#fff",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12}}>✕ Close</button>
//         </div>
//         <div style={{padding:"22px"}}>

//           {/* Create new client */}
//           <div style={{background:BRAND.lightBlue,border:`1px solid ${BRAND.blue}25`,borderRadius:12,padding:"16px",marginBottom:20}}>
//             <div style={{fontWeight:800,fontSize:13,color:BRAND.black,marginBottom:10}}>➕ Create New Client</div>
//             <div style={{display:"flex",gap:8}}>
//               <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newName.trim()&&onCreate(newName.trim())&&setNewName("")} placeholder="Organisation name (e.g. Mercy Health)" style={{...inp,flex:1}}/>
//               <button onClick={()=>{ if(newName.trim()){ onCreate(newName.trim()); setNewName(""); }}} style={{padding:"9px 16px",borderRadius:9,border:"none",background:BRAND.blue,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Create</button>
//             </div>
//             <div style={{fontSize:10,color:BRAND.grey,marginTop:6}}>Each client gets their own isolated configuration, data and passwords.</div>
//           </div>

//           {/* Active clients */}
//           <div style={{marginBottom:16}}>
//             <div style={{fontWeight:800,fontSize:13,color:BRAND.black,marginBottom:10}}>Active Clients ({active.length})</div>
//             {active.map(client=>(
//               <div key={client.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,border:`1.5px solid ${client.id===activeClientId?BRAND.blue:BRAND.border}`,background:client.id===activeClientId?BRAND.lightBlue:"#fff",marginBottom:8}}>
//                 <div style={{flex:1}}>
//                   <div style={{fontWeight:700,fontSize:14,color:BRAND.black}}>{client.clientName}</div>
//                   <div style={{fontSize:11,color:BRAND.grey}}>Created {new Date(client.createdAt).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div>
//                 </div>
//                 <div style={{display:"flex",gap:6}}>
//                   {client.id!==activeClientId&&(
//                     <button onClick={()=>onSwitch(client.id)} style={{padding:"5px 12px",borderRadius:7,border:"none",background:BRAND.blue,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Switch</button>
//                   )}
//                   {client.id===activeClientId&&(
//                     <span style={{padding:"5px 10px",borderRadius:7,background:BRAND.blue,color:"#fff",fontSize:11,fontWeight:700}}>Active</span>
//                   )}
//                   {active.length>1&&(
//                     <button onClick={()=>onArchive(client.id)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:"#fee2e2",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer"}} title="Archive this client">Archive</button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Archived clients */}
//           {archived.length>0&&(
//             <div>
//               <div style={{fontWeight:800,fontSize:13,color:BRAND.grey,marginBottom:10}}>Archived ({archived.length})</div>
//               {archived.map(client=>(
//                 <div key={client.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,border:`1.5px solid ${BRAND.border}`,background:BRAND.lightGrey,marginBottom:8,opacity:0.7}}>
//                   <div style={{flex:1}}>
//                     <div style={{fontWeight:700,fontSize:14,color:BRAND.grey}}>{client.clientName}</div>
//                     <div style={{fontSize:11,color:BRAND.grey}}>Created {new Date(client.createdAt).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div>
//                   </div>
//                     <button onClick={()=>onRestore(client.id)} style={{padding:"5px 12px",borderRadius:7,background:BRAND.lightGrey,color:BRAND.grey,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${BRAND.border}`}}>Restore</button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// // ─── Settings Panel ─────────────────────────────────────────────────────
// function SettingsPanel({ config, setConfig, onClose }) {
//   const [draft, setDraft] = useState(JSON.parse(JSON.stringify(config)));
//   const [saved, setSaved] = useState(false);

//   const save = () => { setConfig(draft); setSaved(true); setTimeout(()=>setSaved(false),2000); };
//   const upd = (key,val) => setDraft(d=>({...d,[key]:val}));
//   const addLoc = () => setDraft(d=>({...d,locations:[...d.locations,{name:"New Location",staff:50}]}));
//   const updLoc = (i,key,val) => setDraft(d=>{ const l=[...d.locations]; l[i]={...l[i],[key]:val}; return {...d,locations:l}; });
//   const remLoc = (i) => setDraft(d=>({...d,locations:d.locations.filter((_,j)=>j!==i)}));
//   const addDept = () => setDraft(d=>({...d,departments:[...d.departments,"New Department"]}));
//   const updDept = (i,val) => setDraft(d=>{ const deps=[...d.departments]; deps[i]=val; return {...d,departments:deps}; });
//   const remDept = (i) => setDraft(d=>({...d,departments:d.departments.filter((_,j)=>j!==i)}));

//   const inp = {...sel, marginBottom:0, fontSize:13};
//   const lbl = {display:"block",fontSize:11,fontWeight:700,color:BRAND.grey,textTransform:"uppercase",letterSpacing:0.7,marginBottom:5};

//   return (
//     <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,overflow:"auto",padding:"20px 16px"}}>
//       <div style={{maxWidth:680,margin:"0 auto",background:"#fff",borderRadius:16,overflow:"hidden"}}>
//         <div style={{background:BRAND.black,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
//           <div style={{color:"#fff",fontWeight:800,fontSize:15}}>⚙️ Client Settings</div>
//           <button onClick={onClose} style={{background:"transparent",border:"1px solid #ffffff40",color:"#fff",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12}}>✕ Close</button>
//         </div>
//         <div style={{padding:"22px",overflowY:"auto",maxHeight:"80vh"}}>

//           {/* Client info */}
//           <div style={{...card,marginBottom:14}}>
//             <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:14}}>Client Information</div>
//             <div style={{marginBottom:12}}>
//               <label style={lbl}>Client / Organisation Name</label>
//               <input value={draft.clientName} onChange={e=>upd("clientName",e.target.value)} style={inp}/>
//             </div>
//             <div>
//               <label style={lbl}>Change Description (shown on Check-In screen)</label>
//               <textarea value={draft.changeDescription} onChange={e=>upd("changeDescription",e.target.value)} rows={4} style={{...inp,resize:"vertical",lineHeight:1.6,padding:"9px 12px",width:"100%"}}/>
//               <div style={{fontSize:10,color:BRAND.grey,marginTop:4}}>This paragraph explains the change context to staff before they submit their check-in.</div>
//             </div>
//           </div>

//           {/* Programme */}
//           <div style={{...card,marginBottom:14}}>
//             <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:14}}>Programme Dates</div>
//             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
//               <div>
//                 <label style={lbl}>Start Date (Monday of Week 1)</label>
//                 <input type="date" value={draft.programmeStart} onChange={e=>upd("programmeStart",e.target.value)} style={inp}/>
//               </div>
//               <div>
//                 <label style={lbl}>Number of Weeks</label>
//                 <input type="number" min={1} max={52} value={draft.numWeeks} onChange={e=>upd("numWeeks",parseInt(e.target.value)||1)} style={inp}/>
//               </div>
//             </div>
//           </div>

//           {/* Passwords */}
//           <div style={{...card,marginBottom:14}}>
//             <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:14}}>Access Passwords</div>
//             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
//               <div>
//                 <label style={lbl}>Dashboard Password</label>
//                 <input value={draft.dashboardPassword} onChange={e=>upd("dashboardPassword",e.target.value)} style={inp}/>
//                 <div style={{fontSize:10,color:BRAND.grey,marginTop:4}}>Share with client — Dashboard access only</div>
//               </div>
//               <div>
//                 <label style={lbl}>Insights Password (Amy only)</label>
//                 <input value={draft.insightsPassword} onChange={e=>upd("insightsPassword",e.target.value)} style={inp}/>
//                 <div style={{fontSize:10,color:BRAND.grey,marginTop:4}}>Keep private — full access including Insights</div>
//               </div>
//             </div>
//           </div>

//           {/* Locations */}
//           <div style={{...card,marginBottom:14}}>
//             <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
//               <div>
//                 <div style={{fontWeight:800,fontSize:14,color:BRAND.black}}>Locations & Staff Headcount</div>
//                 <div style={{fontSize:10,color:BRAND.grey,marginTop:2}}>Headcount is used to calculate participation rate</div>
//               </div>
//               <button onClick={addLoc} style={{padding:"5px 12px",borderRadius:7,border:"none",background:BRAND.blue,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add</button>
//             </div>
//             {draft.locations.map((loc,i)=>(
//               <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 90px 32px",gap:8,marginBottom:8,alignItems:"center"}}>
//                 <input value={loc.name} onChange={e=>updLoc(i,"name",e.target.value)} style={{...inp}} placeholder="Location name"/>
//                 <input type="number" value={loc.staff} onChange={e=>updLoc(i,"staff",parseInt(e.target.value)||0)} style={{...inp,textAlign:"center"}} placeholder="Staff"/>
//                 <button onClick={()=>remLoc(i)} style={{width:32,height:36,borderRadius:7,border:"none",background:"#fee2e2",color:"#dc2626",fontSize:16,cursor:"pointer",fontWeight:700}}>×</button>
//               </div>
//             ))}
//           </div>

//           {/* Departments */}
//           <div style={{...card,marginBottom:20}}>
//             <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
//               <div style={{fontWeight:800,fontSize:14,color:BRAND.black}}>Departments</div>
//               <button onClick={addDept} style={{padding:"5px 12px",borderRadius:7,border:"none",background:BRAND.blue,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add</button>
//             </div>
//             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
//               {draft.departments.map((dept,i)=>(
//                 <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 32px",gap:6,alignItems:"center"}}>
//                   <input value={dept} onChange={e=>updDept(i,e.target.value)} style={{...inp}}/>
//                   <button onClick={()=>remDept(i)} style={{width:32,height:36,borderRadius:7,border:"none",background:"#fee2e2",color:"#dc2626",fontSize:16,cursor:"pointer",fontWeight:700}}>×</button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button onClick={save} style={{...btn,background:saved?"#16a34a":BRAND.black}}>
//             {saved?"✓ Saved!":"Save Settings"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// ///////////////////////////////////////////////////////////////////////////////////
// // ─── Check-In ───────────────────────────────────────────────────────────
// function CheckIn({onSubmit,config}) {
//   const currentWeek = getCurrentWeek(config);
//   const [location,setLocation]=useState("");
//   const [department,setDepartment]=useState("");
//   const [energy,setEnergy]=useState(5);
//   const [belief,setBelief]=useState(5);
//   const [clarity,setClarity]=useState(5);
//   const [submitted,setSubmitted]=useState(false);
//   const ok=location&&department&&currentWeek;
//   const dateRange = currentWeek ? getWeekDateRange(config,currentWeek) : null;

//   if(!currentWeek) return (
//     <div style={{textAlign:"center",padding:"56px 20px",maxWidth:460,margin:"0 auto"}}>
//       <div style={{width:64,height:64,borderRadius:"50%",background:BRAND.lightCoral,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 18px"}}>📅</div>
//       <h2 style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:22,fontWeight:800,color:BRAND.black,marginBottom:8}}>Programme Not Started Yet</h2>
//       <p style={{color:BRAND.grey,fontSize:14,lineHeight:1.7}}>Check back from {new Date(config.programmeStart).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"})}.</p>
//     </div>
//   );

//   if(submitted) return (
//     <div style={{textAlign:"center",padding:"56px 20px",maxWidth:460,margin:"0 auto"}}>
//       <div style={{width:64,height:64,borderRadius:"50%",background:BRAND.lightBlue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 18px"}}>✓</div>
//       <h2 style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:24,fontWeight:800,color:BRAND.black,marginBottom:8}}>Thank you</h2>
//       <p style={{color:BRAND.grey,fontSize:14,lineHeight:1.7,marginBottom:24}}>Your response has been recorded anonymously.<br/>Your voice matters in this change journey.</p>
//       <div style={{background:BRAND.lightBlue,borderRadius:12,padding:"14px 18px",marginBottom:24,border:`1px solid ${BRAND.blue}30`}}>
//         <p style={{fontSize:12,color:BRAND.blue,fontWeight:600,margin:0}}>"The only thing you have control of in this world is yourself and how you choose to respond."</p>
//         <p style={{fontSize:11,color:BRAND.grey,margin:"5px 0 0"}}>— Amy Jacobson</p>
//       </div>
//       <button onClick={()=>setSubmitted(false)} style={btn}>Submit another response</button>
//     </div>
//   );

//   return (
//     <div style={{maxWidth:560,margin:"0 auto",padding:"24px 16px"}}>
//       <h2 style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:22,fontWeight:800,color:BRAND.black,marginBottom:6}}>Weekly Change Check-In</h2>
//       {config.changeDescription&&(
//         <div style={{background:BRAND.lightGrey,border:`1px solid ${BRAND.border}`,borderRadius:11,padding:"14px 16px",marginBottom:16,fontSize:13,color:BRAND.grey,lineHeight:1.7}}>
//           {config.changeDescription}
//         </div>
//       )}
//       <div style={{background:BRAND.lightBlue,border:`1px solid ${BRAND.blue}30`,borderRadius:11,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
//         <span style={{fontSize:18}}>📅</span>
//         <div>
//           <div style={{fontWeight:700,fontSize:12,color:BRAND.blue}}>{currentWeek}</div>
//           {dateRange&&<div style={{fontSize:11,color:BRAND.grey}}>{dateRange.start} – {dateRange.end}</div>}
//         </div>
//         <div style={{marginLeft:"auto",fontSize:11,color:BRAND.grey}}>Auto-detected</div>
//       </div>
//       <div style={{background:BRAND.lightCoral,border:`1px solid ${BRAND.coral}40`,borderRadius:11,padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
//         <span style={{fontSize:18}}>💡</span>
//         <div>
//           <div style={{fontWeight:700,fontSize:12,color:BRAND.black,marginBottom:2}}>Change Intelligence — Own It first</div>
//           <div style={{fontSize:11,color:BRAND.grey,lineHeight:1.6}}>Before you score, be honest with yourself about where you actually are with this change. No right or wrong answers.</div>
//         </div>
//       </div>
//       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
//         <div>
//           <label style={{display:"block",fontSize:12,fontWeight:600,color:BRAND.grey,marginBottom:5}}>Location *</label>
//           <select value={location} onChange={e=>setLocation(e.target.value)} style={sel}>
//             <option value="">Select…</option>
//             {config.locations.map(l=><option key={l.name}>{l.name}</option>)}
//           </select>
//         </div>
//         <div>
//           <label style={{display:"block",fontSize:12,fontWeight:600,color:BRAND.grey,marginBottom:5}}>Department *</label>
//           <select value={department} onChange={e=>setDepartment(e.target.value)} style={sel}>
//             <option value="">Select…</option>
//             {config.departments.map(d=><option key={d}>{d}</option>)}
//           </select>
//         </div>
//       </div>
//       <div style={{background:"#fff",border:`1.5px solid ${BRAND.border}`,borderRadius:14,padding:"22px 18px",marginBottom:20,boxShadow:"0 2px 10px #0000000a"}}>
//         <div style={{fontWeight:700,fontSize:11,color:BRAND.grey,textTransform:"uppercase",letterSpacing:1,marginBottom:18}}>Rate your experience this week (1–10)</div>
//         <Slider label="Energy" description="How energised do you feel about this change?" value={energy} onChange={setEnergy} color={BRAND.blue} icon="⚡"/>
//         <Slider label="Belief" description="How much do you believe this change will succeed?" value={belief} onChange={setBelief} color={BRAND.coral} icon="💪"/>
//         <Slider label="Clarity" description="How clear are you on what this change means for you?" value={clarity} onChange={setClarity} color="#16a34a" icon="🎯"/>
//       </div>
//       <button onClick={()=>{if(ok){onSubmit({week:currentWeek,location,department,energy,belief,clarity});setSubmitted(true);}}} disabled={!ok} style={{...btn,opacity:ok?1:0.4,cursor:ok?"pointer":"not-allowed"}}>Submit anonymously →</button>
//       {!ok&&<p style={{fontSize:11,color:"#94a3b8",textAlign:"center",marginTop:7}}>Select your location and department to continue</p>}
//     </div>
//   );
// }

// // ─── Dashboard ──────────────────────────────────────────────────────────
// function Dashboard({data,config,onExport}) {
//   const [filterWeek,setFilterWeek]=useState("All");
//   const [filterLoc,setFilterLoc]=useState("All");
//   const weeks=getWeeks(config);
//   const {filtered,byDept,byLoc}=computeData(data,filterWeek,filterLoc);
//   const weeklyTrend=computeWeeklyTrend(data,filterLoc,config);
//   const oE=avg(filtered.map(d=>d.energy)), oB=avg(filtered.map(d=>d.belief)), oC=avg(filtered.map(d=>d.clarity));
//   const oA=[oE,oB,oC].every(Boolean)?avg([oE,oB,oC]):null;
//   const eD=trendDir(weeklyTrend,"energy"), bD=trendDir(weeklyTrend,"belief"), cD=trendDir(weeklyTrend,"clarity");
//   const totalStaff=getTotalStaff(config,filterLoc);
//   const participationPct=Math.min(100,Math.round((filtered.length/totalStaff)*100));
//   const allInsights=generateInsights(filtered,weeklyTrend,byDept,byLoc,totalStaff);
//   const topAlerts=allInsights.filter(i=>i.flag==="risk").slice(0,2);

//   return (
//     <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>
//       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,flexWrap:"wrap",gap:8}}>
//         <h2 style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:22,fontWeight:800,color:BRAND.black}}>Dashboard</h2>
//         <button onClick={()=>onExport("dashboard")} style={{padding:"8px 16px",borderRadius:9,border:"none",background:BRAND.blue,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>📄 Export Report</button>
//       </div>
//       <p style={{color:BRAND.grey,fontSize:12,marginBottom:16}}>{config.clientName} · Amy Jacobson Change Intelligence System</p>
//       <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
//         {[{l:"Week",v:filterWeek,s:setFilterWeek,o:["All",...weeks]},{l:"Location",v:filterLoc,s:setFilterLoc,o:["All",...config.locations.map(l=>l.name)]}].map(({l,v,s,o})=>(
//           <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
//             <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>{l}:</span>
//             <select value={v} onChange={e=>s(e.target.value)} style={{...sel,width:"auto",fontSize:12,padding:"6px 10px"}}>{o.map(x=><option key={x}>{x}</option>)}</select>
//           </div>
//         ))}
//       </div>
//       {/* Participation */}
//       <div style={{...card,padding:"16px 18px"}}>
//         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
//           <div style={{fontWeight:800,fontSize:14,color:BRAND.black}}>👥 Participation Rate</div>
//           <div style={{display:"flex",alignItems:"center",gap:8}}>
//             <span style={{fontSize:22,fontWeight:800,color:pctColor(participationPct),fontFamily:"'Nunito Sans',sans-serif"}}>{participationPct}%</span>
//             <span style={{fontSize:11,fontWeight:700,color:pctColor(participationPct),background:pctColor(participationPct)+"18",padding:"2px 8px",borderRadius:8}}>{pctLabel(participationPct)}</span>
//           </div>
//         </div>
//         <ParticipationBar n={filtered.length} total={totalStaff}/>
//         <div style={{fontSize:11,color:BRAND.grey,marginTop:6}}>{filtered.length} responses from ~{totalStaff} staff{filterLoc!=="All"?` at ${filterLoc}`:""}</div>
//         {participationPct<30&&<div style={{fontSize:11,color:"#dc2626",fontWeight:600,marginTop:5}}>⚠ Low participation — data may not be representative</div>}
//       </div>
//       {/* KPIs */}
//       <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
//         {[
//           {label:"Overall",val:oA,color:BRAND.black,bg:BRAND.lightGrey,dir:null},
//           {label:"Energy ⚡",val:oE,color:BRAND.blue,bg:BRAND.lightBlue,dir:eD},
//           {label:"Belief 💪",val:oB,color:BRAND.coral,bg:BRAND.lightCoral,dir:bD},
//           {label:"Clarity 🎯",val:oC,color:"#16a34a",bg:"#f0fdf4",dir:cD},
//         ].map(({label,val,color,bg,dir})=>{
//           const ta=dir?trendArrow(dir):null;
//           return (
//             <div key={label} style={{background:bg,border:`1.5px solid ${color}22`,borderRadius:12,padding:"14px 16px"}}>
//               <div style={{fontSize:10,color:BRAND.grey,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}}>{label}</div>
//               <div style={{fontSize:30,fontWeight:800,color,fontFamily:"'Nunito Sans',sans-serif",lineHeight:1}}>{val!==null?val.toFixed(1):"—"}</div>
//               <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5,flexWrap:"wrap"}}>
//                 <span style={{fontSize:11,color:scoreColor(val),fontWeight:600}}>{scoreLabel(val)}</span>
//                 {ta&&ta.label&&<span style={{fontSize:11,color:ta.color,fontWeight:700}}>{ta.icon} {ta.label}</span>}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {topAlerts.length>0&&(
//         <div style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:11,padding:"12px 16px",marginBottom:14}}>
//           <div style={{fontWeight:700,color:"#dc2626",fontSize:13,marginBottom:6}}>⚠ Key Alerts — see Insights tab for full detail</div>
//           {topAlerts.map((ins,i)=>(
//             <div key={i} style={{fontSize:12,color:"#7f1d1d",lineHeight:1.6,marginBottom:i<topAlerts.length-1?4:0}}>
//               <strong>{ins.category}:</strong> {ins.summary.split(".")[0]}.
//             </div>
//           ))}
//         </div>
//       )}
//       {/* Stage Pulse */}
//       <div style={card}>
//         <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:12}}>Change Intelligence Stage Pulse</div>
//         <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
//           {[
//             {stage:"Stage 1",label:"Owning & Facing the Loss",metric:"Belief 💪",val:oB,color:BRAND.coral},
//             {stage:"Stage 2",label:"Through the Liminal",metric:"Clarity 🎯",val:oC,color:BRAND.blue},
//             {stage:"Stage 3",label:"Drive the Change",metric:"Energy ⚡",val:oE,color:"#16a34a"},
//           ].map(({stage,label,metric,val,color})=>(
//             <div key={stage} style={{background:color+"10",border:`1.5px solid ${color}30`,borderRadius:9,padding:"10px 12px",textAlign:"center"}}>
//               <div style={{fontSize:9,fontWeight:700,color,textTransform:"uppercase",letterSpacing:0.8,opacity:0.8}}>{stage}</div>
//               <div style={{fontSize:14,fontWeight:800,color,margin:"4px 0 3px",lineHeight:1.2}}>{label}</div>
//               <div style={{fontSize:9,color,opacity:0.65,marginBottom:8,fontWeight:600}}>({metric})</div>
//               <div style={{fontSize:22,fontWeight:800,color,fontFamily:"'Nunito Sans',sans-serif"}}>{val!==null?val.toFixed(1):"—"}</div>
//               <div style={{fontSize:10,color:scoreColor(val),fontWeight:600,marginTop:3}}>{scoreLabel(val)}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Participation by location */}
//       <div style={card}>
//         <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:12}}>Participation by Location</div>
//         {config.locations.map(loc=>{
//           const n=data.filter(d=>d.location===loc.name&&(filterWeek==="All"||d.week===filterWeek)).length;
//           return <ParticipationBar key={loc.name} n={n} total={loc.staff} label={loc.name}/>;
//         })}
//         <div style={{fontSize:10,color:BRAND.grey,marginTop:6}}>Green ≥60% · Amber 30–59% · Red &lt;30%</div>
//       </div>
//       {/* Weekly trend */}
//       {weeklyTrend.length>0&&(
//         <div style={card}>
//           <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:10}}>Weekly Trend</div>
//           <div style={{overflowX:"auto"}}>
//             <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
//               <thead><tr style={{background:BRAND.lightGrey}}>
//                 {[["Week",""],["Dates",""],["Resp",""],["Energy ⚡","Stage 3"],["Belief 💪","Stage 1"],["Clarity 🎯","Stage 2"],["Avg",""]].map(([h,sub])=>(
//                   <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:BRAND.grey,textTransform:"uppercase"}}>{h}{sub&&<div style={{fontSize:9,color:BRAND.blue,fontWeight:600,textTransform:"none",letterSpacing:0,marginTop:1}}>{sub}</div>}</th>
//                 ))}
//               </tr></thead>
//               <tbody>
//                 {weeklyTrend.map((row,i)=>{
//                   const rA=avg([row.energy,row.belief,row.clarity].filter(Boolean));
//                   const pA=i>0?avg([weeklyTrend[i-1].energy,weeklyTrend[i-1].belief,weeklyTrend[i-1].clarity].filter(Boolean)):null;
//                   const dir=pA!==null&&rA!==null?(rA-pA>0.3?"↑":rA-pA<-0.3?"↓":"→"):"";
//                   const dc=dir==="↑"?"#16a34a":dir==="↓"?"#dc2626":"#d97706";
//                   const dr=getWeekDateRange(config,row.week);
//                   return (
//                     <tr key={i} style={{borderBottom:`1px solid ${BRAND.border}`}}>
//                       <td style={{padding:"8px 10px",fontWeight:600}}>{row.week}</td>
//                       <td style={{padding:"8px 10px",color:BRAND.grey,fontSize:10}}>{dr?`${dr.start}–${dr.end}`:""}</td>
//                       <td style={{padding:"8px 10px",color:BRAND.grey}}>{row.n}</td>
//                       <td style={{padding:"8px 10px"}}><Badge value={row.energy} size="sm"/></td>
//                       <td style={{padding:"8px 10px"}}><Badge value={row.belief} size="sm"/></td>
//                       <td style={{padding:"8px 10px"}}><Badge value={row.clarity} size="sm"/></td>
//                       <td style={{padding:"8px 10px"}}><Badge value={rA} size="sm"/>{dir&&<span style={{color:dc,fontWeight:700,marginLeft:4}}>{dir}</span>}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//       {/* By Location */}
//       <div style={card}>
//         <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:10}}>Scores by Location</div>
//         {byLoc.map((row,i)=>{
//           const rA=avg([row.energy,row.belief,row.clarity].filter(Boolean));
//           return (
//             <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,padding:"10px 12px",background:riskFlag(rA)?"#fff5f5":BRAND.lightGrey,borderRadius:9,border:`1px solid ${riskFlag(rA)?"#fecaca":BRAND.border}`,marginBottom:8}}>
//               <div>
//                 <div style={{fontWeight:700,fontSize:13,color:BRAND.black}}>{row.loc}</div>
//                 <div style={{fontSize:11,color:BRAND.grey}}>{row.n} responses</div>
//               </div>
//               <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
//                 {[{l:"Energy",v:row.energy},{l:"Belief",v:row.belief},{l:"Clarity",v:row.clarity}].map(({l,v})=>(
//                   <div key={l} style={{textAlign:"center"}}>
//                     <div style={{fontSize:9,color:BRAND.grey,fontWeight:600,marginBottom:1}}>{l}</div>
//                     <Badge value={v} size="sm"/>
//                   </div>
//                 ))}
//                 <div style={{textAlign:"center",borderLeft:`1px solid ${BRAND.border}`,paddingLeft:8}}>
//                   <div style={{fontSize:9,color:BRAND.grey,fontWeight:600,marginBottom:1}}>Avg</div>
//                   <Badge value={rA} size="sm"/>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {/* By Department */}
//       <div style={card}>
//         <div style={{fontWeight:800,fontSize:14,color:BRAND.black,marginBottom:4}}>By Department</div>
//         <p style={{fontSize:11,color:BRAND.grey,marginBottom:10}}>Sorted lowest → highest — at-risk first</p>
//         <div style={{overflowX:"auto"}}>
//           <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
//             <thead><tr style={{background:BRAND.lightGrey}}>
//               {[["Department",""],["n",""],["Energy ⚡","Stage 3"],["Belief 💪","Stage 1"],["Clarity 🎯","Stage 2"],["Avg",""],["Status",""]].map(([h,sub])=>(
//                 <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:BRAND.grey,textTransform:"uppercase"}}>{h}</th>
//               ))}
//             </tr></thead>
//             <tbody>
//               {byDept.map((row,i)=>{
//                 const rA=avg([row.energy,row.belief,row.clarity].filter(Boolean));
//                 const ar=riskFlag(rA);
//                 return (
//                   <tr key={i} style={{borderBottom:`1px solid ${BRAND.border}`,background:ar?"#fff5f5":"transparent"}}>
//                     <td style={{padding:"8px 10px",fontWeight:600}}>{row.dept}{ar?" ⚠":""}</td>
//                     <td style={{padding:"8px 10px",color:BRAND.grey}}>{row.n}</td>
//                     <td style={{padding:"8px 10px"}}><Badge value={row.energy} size="sm"/></td>
//                     <td style={{padding:"8px 10px"}}><Badge value={row.belief} size="sm"/></td>
//                     <td style={{padding:"8px 10px"}}><Badge value={row.clarity} size="sm"/></td>
//                     <td style={{padding:"8px 10px"}}><Badge value={rA} size="sm"/></td>
//                     <td style={{padding:"8px 10px",fontWeight:700,color:scoreColor(rA),fontSize:11}}>{scoreLabel(rA)}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Insights Tab ───────────────────────────────────────────────────────
// function InsightsTab({data,config,onExport}) {
//   const [filterLoc,setFilterLoc]=useState("All");
//   const {filtered,byDept,byLoc}=computeData(data,"All",filterLoc);
//   const weeklyTrend=computeWeeklyTrend(data,filterLoc,config);
//   const totalStaff=getTotalStaff(config,filterLoc);
//   const insights=generateInsights(filtered,weeklyTrend,byDept,byLoc,totalStaff);
//   const rc=insights.filter(i=>i.flag==="risk").length;
//   const mc=insights.filter(i=>i.flag==="moderate").length;
//   const pc=insights.filter(i=>i.flag==="positive").length;
//   return (
//     <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>
//       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,flexWrap:"wrap",gap:8}}>
//         <h2 style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:22,fontWeight:800,color:BRAND.black}}>Insights & Recommendations</h2>
//         <button onClick={()=>onExport("insights")} style={{padding:"8px 16px",borderRadius:9,border:"none",background:"#16a34a",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>📄 Export Report</button>
//       </div>
//       <p style={{color:BRAND.grey,fontSize:12,marginBottom:18}}>Grounded in Amy Jacobson's Change Intelligence model — for {config.clientName} leadership action</p>
//       <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18,alignItems:"center"}}>
//         <span style={{fontSize:11,fontWeight:600,color:BRAND.grey}}>Location:</span>
//         <select value={filterLoc} onChange={e=>setFilterLoc(e.target.value)} style={{...sel,width:"auto",fontSize:12,padding:"6px 10px"}}>
//           {["All",...config.locations.map(l=>l.name)].map(o=><option key={o}>{o}</option>)}
//         </select>
//       </div>
//       <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
//         {[
//           {label:"Action Required",count:rc,color:"#dc2626",bg:"#fef2f2",border:"#fecaca"},
//           {label:"Watch Closely",count:mc,color:"#d97706",bg:"#fffbeb",border:"#fde68a"},
//           {label:"Positive Signal",count:pc,color:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0"},
//         ].map(({label,count,color,bg,border})=>(
//           <div key={label} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:11,padding:"14px 10px",textAlign:"center"}}>
//             <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Nunito Sans',sans-serif"}}>{count}</div>
//             <div style={{fontSize:11,color,fontWeight:700}}>{label}</div>
//           </div>
//         ))}
//       </div>
//       <div style={{background:BRAND.lightCoral,border:`1px solid ${BRAND.coral}30`,borderRadius:11,padding:"12px 16px",marginBottom:18,display:"flex",gap:10}}>
//         <span style={{fontSize:18}}>🧠</span>
//         <div>
//           <div style={{fontWeight:700,fontSize:12,color:BRAND.black,marginBottom:3}}>How to read these insights</div>
//           <div style={{fontSize:11,color:BRAND.grey,lineHeight:1.7}}>All interpretations are grounded in the Change Intelligence model. Stage 1 must be complete before Stage 2 is effective. Stage 2 must be held before Stage 3 can succeed. Read in order — don't skip to the recommendations that feel easier.</div>
//         </div>
//       </div>
//       {["risk","moderate","positive"].map(flag=>{
//         const group=insights.filter(i=>i.flag===flag);
//         if(!group.length) return null;
//         const gLabel=flag==="risk"?"⚠️ Action Required":flag==="moderate"?"👀 Watch Closely":"✅ Positive Signals";
//         const gColor=flag==="risk"?"#dc2626":flag==="moderate"?"#d97706":"#16a34a";
//         return (
//           <div key={flag} style={{marginBottom:24}}>
//             <div style={{fontWeight:800,fontSize:14,color:gColor,marginBottom:12}}>{gLabel}</div>
//             {group.map((ins,i)=><InsightCard key={i} insight={ins} expanded={flag==="risk"&&i===0}/>)}
//           </div>
//         );
//       })}
//       <div style={{background:BRAND.lightBlue,border:`1px solid ${BRAND.blue}25`,borderRadius:11,padding:"12px 16px"}}>
//         <div style={{fontSize:12,color:BRAND.blue,fontWeight:700,marginBottom:3}}>A note from Amy</div>
//         <div style={{fontSize:12,color:BRAND.grey,lineHeight:1.7}}>Data tells you what's happening. The Change Intelligence model tells you why — and what to do about it. Don't use these insights to report upward. Use them to act. The teams in these scores are real people navigating real change. They deserve a real response.</div>
//       </div>
//     </div>
//   );
// }

// // ─── Login Screen ───────────────────────────────────────────────────────
// function LoginScreen({config, onDashboard, onInsights}) {
//   const [pass,setPass]=useState("");
//   const [err,setErr]=useState("");
//   const attempt = () => {
//     const normalized = pass.trim();
//     const insightsPassword = (config.insightsPassword || "").trim();
//     const dashboardPassword = (config.dashboardPassword || "").trim();
//     if(normalized===insightsPassword || normalized==="amy2025"){onInsights();setErr("");}
//     else if(normalized===dashboardPassword || normalized==="alfred2025"){onDashboard();setErr("");}
//     else setErr("Incorrect password — please try again.");
//   };
//   return (
//     <div style={{maxWidth:380,margin:"60px auto",padding:"0 16px"}}>
//       <div style={{background:"#fff",borderRadius:14,padding:"36px 28px",border:`1.5px solid ${BRAND.border}`,boxShadow:"0 4px 24px #00000010",textAlign:"center"}}>
//         <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
//           <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{height:28,width:"auto"}}/>
//         </div>
//         <div style={{width:50,height:50,borderRadius:"50%",background:BRAND.lightBlue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px"}}>🔒</div>
//         <h2 style={{fontWeight:800,fontSize:18,color:BRAND.black,marginBottom:5}}>Admin Access</h2>
//         <p style={{fontSize:12,color:BRAND.grey,marginBottom:20}}>Enter your password to access reporting</p>
//         <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="Password" style={{...sel,marginBottom:8,textAlign:"center"}}/>
//         {err&&<p style={{fontSize:11,color:"#dc2626",marginBottom:8}}>{err}</p>}
//         <button onClick={attempt} style={btn}>Access</button>
//         <div style={{marginTop:14,padding:"10px 14px",background:BRAND.lightGrey,borderRadius:8,fontSize:11,color:BRAND.grey,textAlign:"left"}}>
//           <div style={{fontWeight:700,marginBottom:4}}>Access levels:</div>
//           <div>📊 <strong>Dashboard password</strong> — scores, trends & participation</div>
//           <div style={{marginTop:2}}>💡 <strong>Insights password</strong> — full access + Insights tab + Settings</div>
//         </div>
//         <p style={{fontSize:10,color:"#cbd5e1",marginTop:12}}>Demo: dashboard = alfred2025 · insights = amy2025</p>
//       </div>
//     </div>
//   );
// }

// // ─── Root App ────────────────────────────────────────────────────────────
// function App() {
//   const getInitialView = () => {
//     const hash = (window.location.hash || "").replace("#", "").toLowerCase();
//     if (hash === "dashboard") return "dashboard";
//     return "checkin";
//   };
//   const [clients, setClients] = useState(() => loadClients());
//   const [activeClientId, setActiveClientId] = useState(() => loadClients()[0]?.id || "default");
//   const config = clients.find(c=>c.id===activeClientId) || clients[0] || DEFAULT_CONFIG;
//   const setConfig = (newCfg) => {
//     setClients(prev => {
//       const updated = prev.map(c => c.id===activeClientId ? {...newCfg, id:c.id, createdAt:c.createdAt, archived:c.archived, responses:c.responses} : c);
//       saveClients(updated);
//       return updated;
//     });
//   };
//   const [view,setView]=useState(getInitialView);
//   const [accessLevel,setAccessLevel]=useState(null);
//   const [responses,setResponses]=useState(SEED_DATA);
//   const [showSettings,setShowSettings]=useState(false);
//   const [exportMode,setExportMode]=useState(null);
//   const [showClientMgr,setShowClientMgr]=useState(false);

//   const goProtected = (target) => {
//     if(accessLevel==="insights"){ setView(target); return; }
//     if(accessLevel==="dashboard"&&target==="dashboard"){ setView(target); return; }
//     setView("login");
//   };

//   const canSeeInsights = accessLevel==="insights";

//   useEffect(() => {
//     const onHashChange = () => {
//       const hash = (window.location.hash || "").replace("#", "").toLowerCase();
//       if (hash === "dashboard") setView("dashboard");
//       if (hash === "checkin") setView("checkin");
//     };
//     window.addEventListener("hashchange", onHashChange);
//     return () => window.removeEventListener("hashchange", onHashChange);
//   }, []);

//   return (
//     <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Nunito Sans',sans-serif"}}>
//       <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
//       {/* Header */}
//       <div style={{background:BRAND.black,borderBottom:`3px solid ${BRAND.blue}`}}>
//         <div style={{maxWidth:900,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",height:56,justifyContent:"space-between"}}>
//           <div style={{display:"flex",alignItems:"center",gap:12}}>
//             <img src={LOGO_HEADER} alt="Amy Jacobson" style={{height:26,width:"auto",display:"block"}}/>
//             <div style={{width:1,height:24,background:"#ffffff25"}}/>
//             <div>
//               <div style={{color:"#fff",fontSize:12,fontWeight:700}}>The Liminal Index</div>
//               <div style={{color:"#ffffff60",fontSize:10}}>{config.clientName}</div>
//             </div>
//           </div>
//           {canSeeInsights&&(
//             <div style={{display:"flex",gap:8}}>
//               <button onClick={()=>setShowClientMgr(true)} style={{background:"transparent",border:"1px solid #ffffff30",color:"#ffffff80",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>
//                 👥 Clients
//               </button>
//               <button onClick={()=>setShowSettings(true)} style={{background:"transparent",border:"1px solid #ffffff30",color:"#ffffff80",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>
//                 ⚙️ Settings
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       {/* Tabs */}
//       <div style={{background:"#fff",borderBottom:`1px solid ${BRAND.border}`,display:"flex"}}>
//         {[
//           {id:"checkin",  label:"✏️ Check-In",  color:BRAND.blue,  protect:false},
//           {id:"dashboard",label:"📊 Dashboard", color:BRAND.coral, protect:true},
//           ...(canSeeInsights?[{id:"insights",label:"💡 Insights",color:"#16a34a",protect:true}]:[]),
//         ].map(({id,label,color,protect})=>{
//           const active=view===id;
//           return (
//             <button key={id} onClick={()=>protect?goProtected(id):setView(id)} style={{flex:1,padding:"13px 6px",border:"none",borderBottom:active?`3px solid ${color}`:"3px solid transparent",background:"transparent",color:active?color:BRAND.grey,fontSize:13,fontWeight:active?800:600,cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif"}}>
//               {label}
//             </button>
//           );
//         })}
//       </div>
//       {/* Content */}
//       <div style={{minHeight:"calc(100vh - 110px)"}}>
//         {view==="checkin"   &&<CheckIn onSubmit={e=>setResponses(p=>[...p,e])} config={config}/>}
//         {view==="dashboard" &&<Dashboard data={responses} config={config} onExport={m=>setExportMode(m)}/>}
//         {view==="insights"  &&canSeeInsights&&<InsightsTab data={responses} config={config} onExport={m=>setExportMode(m)}/>}
//         {view==="login"     &&<LoginScreen config={config} onDashboard={()=>{setAccessLevel("dashboard");setView("dashboard");}} onInsights={()=>{setAccessLevel("insights");setView("dashboard");}}/>}
//       </div>
//       {/* Footer */}
//       <div style={{borderTop:`1px solid ${BRAND.border}`,padding:"14px 16px",textAlign:"center"}}>
//         <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
//           <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{height:22,width:"auto"}}/>
//           <span style={{fontSize:11,color:BRAND.grey}}>· The Liminal Index™ · All responses are anonymous</span>
//         </div>
//       </div>
//       {/* Modals */}
//       {showSettings&&<SettingsPanel config={config} setConfig={setConfig} onClose={()=>setShowSettings(false)}/>}
//       {exportMode&&<ExportReport data={responses} config={config} mode={exportMode} onClose={()=>setExportMode(null)}/>}
//       {showClientMgr&&<ClientManager
//         clients={clients}
//         activeClientId={activeClientId}
//         onSwitch={(id)=>{ setActiveClientId(id); setResponses(SEED_DATA); setAccessLevel(null); setView("checkin"); setShowClientMgr(false); }}
//         onCreate={(name)=>{
//           const newClient = { id:newClientId(), ...DEFAULT_CONFIG, clientName:name, createdAt:new Date().toISOString(), archived:false };
//           const updated = [...clients, newClient];
//           setClients(updated);
//           saveClients(updated);
//           setActiveClientId(newClient.id);
//           setResponses([]);
//           setAccessLevel(null);
//           setView("checkin");
//           setShowClientMgr(false);
//         }}
//         onArchive={(id)=>{
//           const updated = clients.map(c=>c.id===id?{...c,archived:true}:c);
//           setClients(updated);
//           saveClients(updated);
//           if(id===activeClientId){ const first=updated.find(c=>!c.archived); if(first){ setActiveClientId(first.id); setResponses(SEED_DATA); }}
//         }}
//         onRestore={(id)=>{
//           const updated = clients.map(c=>c.id===id?{...c,archived:false}:c);
//           setClients(updated);
//           saveClients(updated);
//         }}
//         onClose={()=>setShowClientMgr(false)}
//       />}
//     </div>
//   );
// }


// export default App;
