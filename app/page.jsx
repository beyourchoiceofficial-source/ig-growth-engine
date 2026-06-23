"use client";
import { useState, useEffect, useCallback } from "react";

const T = {
  bg:"#07090f", surface:"#0c0f1a", card:"#111827", border:"#1c2537",
  blue:"#4f8ef7", violet:"#7c6af7", cyan:"#22d3ee", emerald:"#10b981",
  amber:"#f59e0b", rose:"#f43f5e", pink:"#ec4899", text:"#f0f4ff", muted:"#64748b", dim:"#1e2a3a",
};

const PLATFORM_COLORS = { Instagram:"#e1306c", Facebook:"#1877f2", TikTok:"#69c9d0", "小红书":"#ff2442", 抖音:"#161823" };
const FORMATS = ["Reel","Carousel","Photo","Story","Live"];
const PLATFORMS = ["Instagram","Facebook","TikTok","小红书","抖音"];
const COLORS = [T.violet,T.amber,T.pink,T.cyan,T.blue,T.emerald,"#f97316","#e11d48"];

/* ── Helpers ── */
function Badge({children,color=T.blue}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}33`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
}
function Card({children,style={},onClick}) {
  return <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:20,...style,cursor:onClick?"pointer":"default"}}>{children}</div>;
}
function Lbl({children}) {
  return <div style={{color:T.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>{children}</div>;
}
function Btn({children,onClick,color=T.blue,disabled=false,full=false,ghost=false,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{background:ghost?"transparent":disabled?T.dim:color,color:ghost?color:disabled?T.muted:"#fff",border:ghost?`1px solid ${color}44`:"none",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,width:full?"100%":"auto",...style}}>{children}</button>;
}
function ScoreRing({score,color,size=72,label=""}) {
  const r=size*0.37,cx=size/2,cy=size/2,circ=2*Math.PI*r,dash=(score/100)*circ*0.75;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(135deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={size*0.075} strokeDasharray={`${circ*0.75} ${circ}`} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.075} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color}88)`,transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{color,fontWeight:800,fontSize:size*0.2,lineHeight:1}}>{score}</div>
        {label&&<div style={{color:T.muted,fontSize:size*0.11,letterSpacing:1}}>{label}</div>}
      </div>
    </div>
  );
}
function Sparkline({data,color=T.blue,width=120,height=32}) {
  if(!data?.length||data.length<2) return null;
  const max=Math.max(...data,0.01),min=Math.min(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-min)/range)*(height-6)-3}`).join(" ");
  const last=pts.split(" ").pop()?.split(",");
  return <svg width={width} height={height} style={{overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>{last&&<circle cx={last[0]} cy={last[1]} r="3" fill={color}/>}</svg>;
}
function Avatar({username,picUrl,color,size=40}) {
  const [ok,setOk]=useState(false);
  const initials=(username||"?").replace(/_/g," ").split(" ").map(w=>w[0]?.toUpperCase()||"").join("").slice(0,2);
  useEffect(()=>{setOk(false);},[username]);
  return (
    <div style={{width:size,height:size,borderRadius:size*0.26,border:`2px solid ${color}`,overflow:"hidden",flexShrink:0,background:color+"22"}}>
      <img src={picUrl||`https://unavatar.io/instagram/${username}`} alt={username} style={{width:"100%",height:"100%",objectFit:"cover",display:ok?"block":"none"}} onLoad={()=>setOk(true)} onError={()=>setOk(false)}/>
      {!ok&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:size*0.3,background:`linear-gradient(135deg,${color}18,${color}33)`}}>{initials}</div>}
    </div>
  );
}
function Toast({msg,color}) {
  return <div style={{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",background:color,color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,zIndex:300,boxShadow:`0 4px 24px ${color}66`,whiteSpace:"nowrap",pointerEvents:"none"}}>{msg}</div>;
}

/* ── Modals ── */
function StrategyModal({account,onSave,onClose}) {
  const [f,setF]=useState(account.strategy||{positioning:"",audience:"",goal:"",style:"",language:"中文为主，适当加马来西亚华人口语"});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.surface,border:`1px solid ${T.blue}55`,borderRadius:20,padding:28,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div><div style={{color:T.text,fontWeight:800,fontSize:18}}>策略档案</div><div style={{color:T.muted,fontSize:12}}>@{account.username}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {[{l:"账号定位 *",k:"positioning",p:"例：马来西亚华人电商教育"},{l:"目标受众 *",k:"audience",p:"例：25-40岁想做电商的华人"},{l:"想要的结果 *",k:"goal",p:"例：涨粉10万 + 卖产品"},{l:"内容风格",k:"style",p:"例：真实故事 + 干货"},{l:"语言风格",k:"language",p:"例：中文为主，马来西亚口语"}].map(fi=>(
          <div key={fi.k} style={{marginBottom:14}}>
            <div style={{color:T.muted,fontSize:11,marginBottom:5}}>{fi.l}</div>
            <textarea value={f[fi.k]} onChange={e=>s(fi.k,e.target.value)} placeholder={fi.p} rows={2} style={{width:"100%",background:T.bg||T.card,border:`1px solid ${f[fi.k]?T.blue:T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={onClose} ghost color={T.muted} style={{flex:1}}>取消</Btn>
          <Btn onClick={()=>onSave(f)} color={T.blue} style={{flex:2}}>💾 保存策略</Btn>
        </div>
      </div>
    </div>
  );
}

function AccountModal({editing,onSave,onClose}) {
  const [f,setF]=useState(editing||{username:"",name:"",token:"",color:T.violet});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.surface,border:`1px solid ${T.blue}55`,borderRadius:20,padding:28,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:T.text,fontWeight:800,fontSize:18}}>{editing?.username?"编辑账号":"添加账号"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,background:T.card,borderRadius:12,padding:16,marginBottom:20}}>
          <Avatar username={f.username||"instagram"} color={f.color} size={54}/>
          <div><div style={{color:T.text,fontWeight:700,fontSize:15}}>{f.name||"账号名称"}</div><div style={{color:T.muted,fontSize:12}}>@{f.username||"username"}</div></div>
        </div>
        {[{l:"IG 用户名（不含@）*",k:"username",p:"eugene_mkting55",t:"text"},{l:"显示名称",k:"name",p:"Eugene Marketing",t:"text"},{l:"Access Token *",k:"token",p:"粘贴你的 IG Access Token",t:"password"}].map(fi=>(
          <div key={fi.k} style={{marginBottom:14}}>
            <div style={{color:T.muted,fontSize:11,marginBottom:5}}>{fi.l}</div>
            <input type={fi.t} value={f[fi.k]} onChange={e=>s(fi.k,e.target.value)} placeholder={fi.p} style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <div style={{color:T.muted,fontSize:11,marginBottom:8}}>主题颜色</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>s("color",c)} style={{width:30,height:30,borderRadius:8,background:c,cursor:"pointer",border:`2px solid ${f.color===c?"#fff":"transparent"}`,boxShadow:f.color===c?`0 0 10px ${c}`:"none",transition:"all 0.2s"}}/>)}</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={onClose} ghost color={T.muted} style={{flex:1}}>取消</Btn>
          <Btn onClick={()=>f.username&&f.token&&onSave({...f,strategy:editing?.strategy||{}})} disabled={!f.username||!f.token} color={T.blue} style={{flex:2}}>{editing?.username?"保存修改":"✚ 添加账号"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
const NAVS=[{id:"home",label:"总部",icon:"⚡"},{id:"videos",label:"视频",icon:"🎬"},{id:"analyze",label:"分析",icon:"🧬"},{id:"script",label:"脚本",icon:"✍️"},{id:"score",label:"评分",icon:"🎯"},{id:"trends",label:"爆款",icon:"🔥"},{id:"roadmap",label:"规划",icon:"🗺️"},{id:"accounts",label:"账号",icon:"⚙️"}];

export default function IGPro() {
  const [nav,setNav]=useState("home");
  const [accounts,setAccounts]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [posts,setPosts]=useState({});
  const [profiles,setProfiles]=useState({});
  const [insights,setInsights]=useState({});
  const [roadmaps,setRoadmaps]=useState({});
  const [trends,setTrends]=useState(null);
  const [competitor,setCompetitor]=useState(null);
  const [syncing,setSyncing]=useState({});
  const [analyzing,setAnalyzing]=useState(false);
  const [loadingTrends,setLoadingTrends]=useState(false);
  const [loadingComp,setLoadingComp]=useState(false);
  const [loadingRoadmap,setLoadingRoadmap]=useState(false);
  const [toast,setToast]=useState(null);
  const [strategyModal,setStrategyModal]=useState(null);
  const [accountModal,setAccountModal]=useState(null);
  const [expandedPost,setExpandedPost]=useState(null);
  // Script
  const [topic,setTopic]=useState("");
  const [format,setFormat]=useState("Reel");
  const [selPlatforms,setSelPlatforms]=useState(["Instagram","TikTok"]);
  const [scriptMode,setScriptMode]=useState("quick");
  const [script,setScript]=useState("");
  const [scriptLoading,setScriptLoading]=useState(false);
  // Trends
  const [trendsNiche,setTrendsNiche]=useState("");
  const [competitors,setCompetitors]=useState("");
  // Video Score
  const [scoreForm,setScoreForm]=useState({hook:"",duration:"",cover:"",cta:"",caption:""});
  const [scoreResult,setScoreResult]=useState(null);
  const [scoring,setScoring]=useState(false);

  const acc=accounts.find(a=>a.id===activeId||a.username===activeId)||accounts[0];
  const accPosts=posts[acc?.username]||[];
  const accProfile=profiles[acc?.username];
  const accInsight=insights[acc?.username];
  const accRoadmap=roadmaps[acc?.username];
  const sortedPosts=[...accPosts].sort((a,b)=>b.engagement_rate-a.engagement_rate);
  const avgER=accPosts.length?(accPosts.reduce((s,p)=>s+parseFloat(p.engagement_rate||0),0)/accPosts.length).toFixed(1):0;
  const erHistory=sortedPosts.slice(0,8).reverse().map(p=>parseFloat(p.engagement_rate||0));

  const showToast=(msg,color=T.emerald)=>{setToast({msg,color});setTimeout(()=>setToast(null),4000);};

  // Load accounts from Supabase on mount
  useEffect(()=>{
    fetch("/api/accounts").then(r=>r.json()).then(d=>{
      if(d.accounts?.length){
        setAccounts(d.accounts);
        setActiveId(d.accounts[0].username);
        // Auto sync all accounts
        d.accounts.forEach(a=>{ if(a.token) autoSync(a); });
      }
    }).catch(()=>{});
  },[]);

  // Load insights from Supabase
  useEffect(()=>{
    if(!accounts.length) return;
    const sbUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!sbUrl||!sbKey) return;
    accounts.forEach(async a=>{
      try {
        const r=await fetch(`${sbUrl}/rest/v1/ai_insights?username=eq.${a.username}&order=analyzed_at.desc&limit=1`,{headers:{apikey:sbKey,Authorization:`Bearer ${sbKey}`}});
        const d=await r.json();
        if(d?.length) setInsights(prev=>({...prev,[a.username]:d[0]}));
      } catch {}
    });
  },[accounts]);

  async function autoSync(a) {
    try {
      const res=await fetch(`/api/ig?token=${encodeURIComponent(a.token)}`);
      const data=await res.json();
      if(!data.error){
        setPosts(p=>({...p,[a.username]:data.posts||[]}));
        setProfiles(p=>({...p,[a.username]:data.profile}));
      }
    } catch {}
  }

  async function syncAccount(a) {
    if(!a?.token){showToast("⚠️ 请先设置 Access Token",T.amber);setAccountModal(a);return;}
    setSyncing(p=>({...p,[a.username]:true}));
    try {
      const res=await fetch(`/api/ig?token=${encodeURIComponent(a.token)}`);
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setPosts(p=>({...p,[a.username]:data.posts||[]})); setProfiles(p=>({...p,[a.username]:data.profile})); showToast(`✅ 同步成功！${data.synced} 条内容`); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setSyncing(p=>({...p,[a.username]:false}));
  }

  async function analyze() {
    if(!accPosts.length){showToast("请先同步数据",T.amber);return;}
    setAnalyzing(true);
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({posts:accPosts,strategy:acc?.strategy||{},username:acc?.username})});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setInsights(i=>({...i,[acc.username]:data.analysis})); showToast("✅ AI 分析完成！"); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setAnalyzing(false);
  }

  async function scoreVideo() {
    setScoring(true); setScoreResult(null);
    try {
      const res=await fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...scoreForm,username:acc?.username,pastPosts:accPosts,strategy:acc?.strategy})});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setScoreResult(data.result); showToast("✅ 视频评分完成！"); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setScoring(false);
  }

  async function genScript(mode,topic2,weaknesses) {
    const t=topic2||topic;
    if(!t){showToast("请输入主题",T.amber);return;}
    setScriptLoading(true); setScript(""); if(nav!=="script") setNav("script");
    try {
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:format,topic:t,platforms:selPlatforms,strategy:acc?.strategy,mode:mode||scriptMode,styleDna:accInsight?.style_dna,weaknesses})});
      const data=await res.json();
      setScript(data.content||data.error||"生成失败");
    } catch(e){setScript("❌ "+e.message);}
    setScriptLoading(false);
  }

  async function generateRoadmap() {
    setLoadingRoadmap(true);
    try {
      const res=await fetch("/api/roadmap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({strategy:acc?.strategy||{},currentFollowers:accProfile?.followers_count||0,platform:"Instagram"})});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setRoadmaps(r=>({...r,[acc.username]:data.roadmap})); showToast("✅ 路线图生成完成！"); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setLoadingRoadmap(false);
  }

  async function fetchTrends() {
    if(!trendsNiche) return;
    setLoadingTrends(true);
    try {
      const res=await fetch("/api/trends",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({niche:trendsNiche,language:acc?.strategy?.language})});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setTrends(data.trends); showToast("✅ 爆款趋势分析完成！"); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setLoadingTrends(false);
  }

  async function analyzeCompetitors() {
    const list=competitors.split(/[,，\n]/).map(s=>s.trim().replace("@","")).filter(Boolean);
    if(!list.length) return;
    setLoadingComp(true);
    try {
      const res=await fetch("/api/competitor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({competitors:list,strategy:acc?.strategy})});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else { setCompetitor(data.result); showToast("✅ 竞品分析完成！"); }
    } catch(e){showToast("❌ "+e.message,T.rose);}
    setLoadingComp(false);
  }

  async function saveAccount(a) {
    try {
      const res=await fetch("/api/accounts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});
      const data=await res.json();
      if(data.error) showToast("❌ "+data.error,T.rose);
      else {
        setAccounts(prev=>{const e=prev.find(x=>x.username===a.username);return e?prev.map(x=>x.username===a.username?{...x,...data.account}:x):[...prev,{...a,...data.account}];});
        if(!activeId) setActiveId(a.username);
        setAccountModal(null); showToast("✅ 账号已保存！");
        if(a.token) autoSync(a);
      }
    } catch(e){showToast("❌ "+e.message,T.rose);}
  }

  async function saveStrategy(strategy) {
    const updated={...strategyModal,strategy};
    await saveAccount(updated);
    setStrategyModal(null); showToast("✅ 策略档案已保存！");
  }

  async function deleteAccount(username) {
    if(!confirm("确定删除？")) return;
    await fetch("/api/accounts",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({username})});
    setAccounts(prev=>prev.filter(a=>a.username!==username));
    showToast("✅ 账号已删除");
  }

  const phaseColors=[T.blue,T.violet,T.emerald,T.amber];

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <header style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 18px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:50}}>
        <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.blue},${T.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 0 16px ${T.blue}44`}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{color:T.text,fontWeight:800,fontSize:15,letterSpacing:-0.5}}>IG Pro</div>
          <div style={{color:T.muted,fontSize:9,letterSpacing:1.5,textTransform:"uppercase"}}>Content Intelligence · JES Group</div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {accounts.slice(0,6).map(a=>(
            <div key={a.username} onClick={()=>setActiveId(a.username)} title={`@${a.username}`}
              style={{cursor:"pointer",borderRadius:11,border:`2px solid ${(acc?.username===a.username)?a.color:"transparent"}`,transition:"all 0.2s",opacity:acc?.username===a.username?1:0.45,boxShadow:acc?.username===a.username?`0 0 12px ${a.color}55`:"none"}}>
              <Avatar username={a.username} picUrl={profiles[a.username]?.profile_picture_url} color={a.color} size={30}/>
            </div>
          ))}
          <div onClick={()=>setAccountModal({username:"",name:"",token:"",color:T.violet,strategy:{}})} style={{width:30,height:30,borderRadius:8,background:T.card,border:`1px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.muted,fontSize:18}}>+</div>
        </div>
      </header>

      {toast&&<Toast msg={toast.msg} color={toast.color}/>}

      <main style={{flex:1,padding:"20px 18px",maxWidth:820,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* ── HOME ── */}
        {nav==="home"&&(
          <div>
            {accounts.length===0?(
              <Card style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:48,marginBottom:16}}>⚡</div>
                <div style={{color:T.text,fontWeight:700,fontSize:18,marginBottom:8}}>欢迎使用 IG Pro</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:24}}>添加你的第一个 Instagram 账号开始</div>
                <Btn onClick={()=>setAccountModal({username:"",name:"",token:"",color:T.violet,strategy:{}})} color={T.blue}>✚ 添加账号</Btn>
              </Card>
            ):(
              <>
                {/* Hero */}
                <div style={{background:`linear-gradient(135deg,${acc?.color||T.blue}18 0%,${T.violet}08 100%)`,border:`1px solid ${acc?.color||T.blue}35`,borderRadius:20,padding:24,marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:18}}>
                    <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color||T.blue} size={72}/>
                    <div style={{flex:1}}>
                      <div style={{color:T.text,fontSize:22,fontWeight:800,letterSpacing:-0.5}}>@{acc?.username}</div>
                      <div style={{color:T.muted,fontSize:12,marginTop:2}}>{acc?.name}</div>
                      {acc?.strategy?.positioning&&<div style={{color:acc.color,fontSize:11,marginTop:6}}>📌 {acc.strategy.positioning}</div>}
                      {acc?.strategy?.goal&&<div style={{color:T.muted,fontSize:11,marginTop:2}}>🎯 {acc.strategy.goal}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{color:acc?.color||T.blue,fontSize:34,fontWeight:800,letterSpacing:-1,lineHeight:1}}>{accProfile?.followers_count!=null?accProfile.followers_count.toLocaleString():"—"}</div>
                      <div style={{color:T.muted,fontSize:11,marginTop:2}}>粉丝</div>
                      {accProfile?.media_count&&<div style={{color:T.muted,fontSize:10}}>{accProfile.media_count} 条内容</div>}
                    </div>
                  </div>
                  {/* Stats */}
                  {accPosts.length>0&&(
                    <div style={{display:"flex",gap:10,marginBottom:16}}>
                      {[{l:"平均互动率",v:`${avgER}%`,c:T.blue},{l:"帖子数",v:accPosts.length,c:T.violet},{l:"总赞数",v:accPosts.reduce((s,p)=>s+(p.likes||0),0).toLocaleString(),c:T.pink},{l:"总播放",v:accPosts.reduce((s,p)=>s+(p.video_views||0),0).toLocaleString(),c:T.cyan}].map(st=>(
                        <div key={st.l} style={{flex:1,background:T.bg+"88",borderRadius:10,padding:"10px 12px"}}>
                          <div style={{color:T.muted,fontSize:9,letterSpacing:1}}>{st.l}</div>
                          <div style={{color:st.c,fontSize:18,fontWeight:800,marginTop:3}}>{st.v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Sparkline */}
                  {erHistory.length>1&&(
                    <div style={{marginBottom:16,background:T.bg+"66",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{color:T.muted,fontSize:11}}>互动率趋势</div>
                      <Sparkline data={erHistory} color={acc?.color||T.blue} width={160} height={32}/>
                      <div style={{color:acc?.color||T.blue,fontWeight:700,fontSize:13,marginLeft:"auto"}}>{avgER}% avg</div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:10}}>
                    <Btn onClick={()=>syncAccount(acc)} disabled={syncing[acc?.username]} color={T.emerald} style={{flex:1}}>{syncing[acc?.username]?"⏳ 同步中...":"🔄 同步数据"}</Btn>
                    <Btn onClick={()=>setStrategyModal(acc)} ghost color={T.blue} style={{flex:1}}>📌 策略档案</Btn>
                    <Btn onClick={()=>setAccountModal(acc)} ghost color={T.muted} style={{padding:"10px 14px"}}>✏️</Btn>
                  </div>
                </div>

                {/* All accounts */}
                <Card style={{marginBottom:16}}>
                  <Lbl>所有账号</Lbl>
                  {accounts.map(a=>(
                    <div key={a.username} onClick={()=>setActiveId(a.username)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                      <Avatar username={a.username} picUrl={profiles[a.username]?.profile_picture_url} color={a.color} size={44}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:acc?.username===a.username?a.color:T.text,fontWeight:700,fontSize:14}}>{a.name}</div>
                        <div style={{color:T.muted,fontSize:11}}>@{a.username}</div>
                        {a.strategy?.positioning&&<div style={{color:a.color,fontSize:10,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📌 {a.strategy.positioning}</div>}
                      </div>
                      {(posts[a.username]?.length>1)&&<Sparkline data={[...posts[a.username]].sort((x,y)=>new Date(x.published_at)-new Date(y.published_at)).slice(-6).map(p=>parseFloat(p.engagement_rate||0))} color={a.color} width={60} height={24}/>}
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{color:a.color,fontWeight:700,fontSize:16}}>{profiles[a.username]?.followers_count?.toLocaleString()||"—"}</div>
                        <div style={{color:T.muted,fontSize:10}}>粉丝</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setAccountModal({username:"",name:"",token:"",color:T.violet,strategy:{}})} style={{width:"100%",marginTop:14,background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"10px",color:T.muted,fontSize:13,cursor:"pointer"}}>✚ 添加新账号</button>
                </Card>

                {/* AI insight */}
                {accInsight&&(
                  <Card>
                    <Lbl>🤖 最新 AI 洞察</Lbl>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                      <ScoreRing score={accInsight.overall_score||0} color={acc?.color||T.blue} size={64} label="总分"/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {accInsight.best_post_type&&<Badge color={T.blue}>最佳类型：{accInsight.best_post_type}</Badge>}
                          {accInsight.best_time&&<Badge color={T.amber}>最佳时间：{accInsight.best_time}</Badge>}
                        </div>
                        {accInsight.tomorrow_idea&&<div style={{background:T.emerald+"11",border:`1px solid ${T.emerald}33`,borderRadius:10,padding:"10px 14px"}}>
                          <div style={{color:T.emerald,fontSize:10,marginBottom:4}}>💡 明天发什么</div>
                          <div style={{color:T.text,fontSize:13,lineHeight:1.7}}>{accInsight.tomorrow_idea}</div>
                        </div>}
                      </div>
                    </div>
                    {accInsight.growth_bottleneck&&<div style={{background:T.rose+"11",border:`1px solid ${T.rose}33`,borderRadius:10,padding:"10px 14px"}}>
                      <div style={{color:T.rose,fontSize:10,marginBottom:4}}>⚠️ 增长瓶颈</div>
                      <div style={{color:T.text,fontSize:13}}>{accInsight.growth_bottleneck}</div>
                    </div>}
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {nav==="videos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color||T.blue} size={38}/>
                <div><div style={{color:T.text,fontWeight:700,fontSize:14}}>@{acc?.username}</div><div style={{color:T.muted,fontSize:11}}>{accPosts.length} 条内容</div></div>
              </div>
              <Btn onClick={()=>syncAccount(acc)} disabled={syncing[acc?.username]} color={T.emerald} style={{fontSize:12,padding:"8px 14px"}}>{syncing[acc?.username]?"同步中...":"🔄 同步"}</Btn>
            </div>
            {accPosts.length===0&&<Card><div style={{color:T.muted,textAlign:"center",padding:"40px 0"}}>还没有数据，请先同步</div></Card>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {sortedPosts.map((post,i)=>{
                const va=accInsight?.video_analysis?.[i];
                const isOpen=expandedPost===post.ig_post_id;
                const weaknesses=va?[va.hook_score<70&&"Hook太弱",va.cta_score<70&&"CTA不够强",va.content_score<70&&"内容结构散"].filter(Boolean):[];
                return (
                  <Card key={post.ig_post_id||i} onClick={()=>setExpandedPost(isOpen?null:post.ig_post_id)}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      {post.thumbnail_url&&<a href={post.permalink} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{flexShrink:0}}><img src={post.thumbnail_url} style={{width:72,height:72,borderRadius:10,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/></a>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:T.text,fontSize:13,lineHeight:1.5,marginBottom:8}}>{post.caption?.substring(0,100)||"(无文案)"}</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          <Badge color={T.cyan}>{post.type||"POST"}</Badge>
                          <Badge color={T.pink}>❤️ {post.likes||0}</Badge>
                          <Badge color={T.blue}>💬 {post.comments||0}</Badge>
                          <Badge color={T.violet}>🔖 {post.saves||0}</Badge>
                          {post.video_views>0&&<Badge color={T.amber}>▶️ {post.video_views}</Badge>}
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{color:parseFloat(post.engagement_rate)>5?T.emerald:parseFloat(post.engagement_rate)>3?T.amber:T.muted,fontWeight:800,fontSize:20,lineHeight:1}}>{post.engagement_rate}%</div>
                        <div style={{color:T.muted,fontSize:10,marginTop:2}}>互动率</div>
                        <div style={{color:isOpen?T.blue:T.dim,fontSize:16,marginTop:6}}>{isOpen?"▲":"▼"}</div>
                      </div>
                    </div>
                    {isOpen&&(
                      <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:16}}>
                        {va?(
                          <>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                              {[{l:"Hook",v:va.hook_score||0,n:va.hook_feedback},{l:"内容",v:va.content_score||0,n:va.content_feedback},{l:"CTA",v:va.cta_score||0,n:va.cta_feedback}].map(m=>(
                                <div key={m.l} style={{background:T.bg,borderRadius:10,padding:12,textAlign:"center"}}>
                                  <ScoreRing score={m.v} color={m.v>=80?T.emerald:m.v>=60?T.amber:T.rose} size={52} label={m.l}/>
                                  <div style={{color:T.muted,fontSize:10,marginTop:6,lineHeight:1.4}}>{m.n}</div>
                                </div>
                              ))}
                            </div>
                            {va.why_stopped&&<div style={{background:T.rose+"11",border:`1px solid ${T.rose}33`,borderRadius:10,padding:12,marginBottom:10}}><div style={{color:T.rose,fontSize:10,marginBottom:4}}>⚠️ 推流中断原因</div><div style={{color:T.text,fontSize:13}}>{va.why_stopped}</div></div>}
                            {va.rewrite_hook&&<div style={{background:T.emerald+"11",border:`1px solid ${T.emerald}33`,borderRadius:10,padding:12,marginBottom:10}}><div style={{color:T.emerald,fontSize:10,marginBottom:4}}>💡 改进版 Hook</div><div style={{color:T.text,fontSize:13}}>"{va.rewrite_hook}"</div></div>}
                            {weaknesses.length>0&&(
                              <Btn onClick={e=>{e.stopPropagation();setTopic(post.caption?.substring(0,50)||"改进版视频");genScript("fix",post.caption?.substring(0,50),weaknesses);}} color={T.violet} full>⚡ 根据弱点生成改进版脚本</Btn>
                            )}
                          </>
                        ):(
                          <div style={{color:T.muted,textAlign:"center",padding:"20px 0",fontSize:13}}>先去「分析」页面运行 AI 分析，即可看到详细诊断</div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ANALYZE ── */}
        {nav==="analyze"&&(
          <div>
            <Card style={{marginBottom:16}}>
              <Lbl>AI 内容分析引擎</Lbl>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color||T.blue} size={48}/>
                <div style={{flex:1}}><div style={{color:T.text,fontWeight:700}}>@{acc?.username}</div><div style={{color:T.muted,fontSize:12}}>{accPosts.length} 条内容 · {acc?.strategy?.positioning||"⚠️ 请设置策略档案"}</div></div>
                {!acc?.strategy?.positioning&&<Btn onClick={()=>setStrategyModal(acc)} color={T.amber} style={{fontSize:12,padding:"7px 14px"}}>设置策略</Btn>}
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={()=>syncAccount(acc)} disabled={syncing[acc?.username]} ghost color={T.emerald} style={{flex:1}}>{syncing[acc?.username]?"同步中...":"🔄 先同步"}</Btn>
                <Btn onClick={analyze} disabled={analyzing||accPosts.length===0} color={T.violet} style={{flex:2}}>{analyzing?"🧠 分析中...":"🤖 开始 AI 分析"}</Btn>
              </div>
            </Card>
            {accInsight&&(
              <div>
                <Card style={{marginBottom:16}}>
                  <div style={{display:"flex",gap:20,alignItems:"center",marginBottom:20}}>
                    <ScoreRing score={accInsight.overall_score||0} color={acc?.color||T.blue} size={90} label="总分"/>
                    <div style={{flex:1}}>
                      <Lbl>分析结果</Lbl>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                        {[{l:"最佳类型",v:accInsight.best_post_type,c:T.blue},{l:"最佳时间",v:accInsight.best_time,c:T.amber},{l:"最强Hook",v:accInsight.best_hook,c:T.violet}].filter(s=>s.v).map(s=><Badge key={s.l} color={s.c}>{s.l}：{s.v}</Badge>)}
                      </div>
                      {accInsight.style_dna&&<div style={{color:T.muted,fontSize:11}}>🧬 内容DNA：{accInsight.style_dna}</div>}
                    </div>
                  </div>
                  {accInsight.tomorrow_idea&&<div style={{background:T.emerald+"11",border:`1px solid ${T.emerald}33`,borderRadius:12,padding:14,marginBottom:12}}><div style={{color:T.emerald,fontWeight:700,marginBottom:6}}>💡 明天发什么</div><div style={{color:T.text,fontSize:13,lineHeight:1.7}}>{accInsight.tomorrow_idea}</div><Btn onClick={()=>{setTopic(accInsight.tomorrow_idea);genScript("quick",accInsight.tomorrow_idea);}} color={T.violet} style={{marginTop:10,fontSize:12,padding:"7px 14px"}}>✨ 立刻生成脚本</Btn></div>}
                  {accInsight.growth_bottleneck&&<div style={{background:T.rose+"11",border:`1px solid ${T.rose}33`,borderRadius:12,padding:14,marginBottom:12}}><div style={{color:T.rose,fontWeight:700,marginBottom:6}}>⚠️ 增长瓶颈</div><div style={{color:T.text,fontSize:13}}>{accInsight.growth_bottleneck}</div></div>}
                  {accInsight.recommendations?.length>0&&<div>{<Lbl>可执行建议</Lbl>}{accInsight.recommendations.map((r,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{color:T.emerald,fontWeight:700}}>✓</div><div style={{color:T.text,fontSize:13,lineHeight:1.6}}>{r}</div></div>)}</div>}
                </Card>
                {accInsight.video_analysis?.length>0&&(
                  <Card>
                    <Lbl>逐条视频诊断</Lbl>
                    {accInsight.video_analysis.map((v,i)=>(
                      <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{color:T.text,fontSize:12,marginBottom:10}}>{v.caption}...</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                          {[{l:"Hook",v:v.hook_score||0,n:v.hook_feedback},{l:"内容",v:v.content_score||0,n:v.content_feedback},{l:"CTA",v:v.cta_score||0,n:v.cta_feedback}].map(m=>(
                            <div key={m.l} style={{background:T.bg,borderRadius:8,padding:10,textAlign:"center"}}>
                              <ScoreRing score={m.v} color={m.v>=80?T.emerald:m.v>=60?T.amber:T.rose} size={48} label={m.l}/>
                              <div style={{color:T.muted,fontSize:10,marginTop:6}}>{m.n}</div>
                            </div>
                          ))}
                        </div>
                        {v.why_stopped&&<div style={{background:T.rose+"11",border:`1px solid ${T.rose}22`,borderRadius:8,padding:10,marginBottom:8}}><span style={{color:T.rose,fontSize:11}}>⚠️ {v.why_stopped}</span></div>}
                        {v.rewrite_script&&<div style={{background:T.violet+"11",border:`1px solid ${T.violet}22`,borderRadius:8,padding:10,marginBottom:8}}><div style={{color:T.violet,fontSize:10,marginBottom:4}}>⚡ 改进版脚本</div><div style={{color:T.text,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{v.rewrite_script}</div></div>}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCRIPT ── */}
        {nav==="script"&&(
          <div>
            <Card style={{marginBottom:16}}>
              <Lbl>跨平台脚本生成器</Lbl>
              {acc?.strategy?.positioning&&<div style={{background:T.blue+"11",border:`1px solid ${T.blue}22`,borderRadius:10,padding:"10px 14px",marginBottom:16}}><div style={{color:T.muted,fontSize:10,marginBottom:2}}>当前策略</div><div style={{color:T.blue,fontSize:12}}>📌 {acc.strategy.positioning} · 🎯 {acc.strategy.goal}</div>{accInsight?.style_dna&&<div style={{color:T.muted,fontSize:11,marginTop:2}}>🧬 {accInsight.style_dna}</div>}</div>}
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {[{id:"quick",label:"⚡ 快速脚本",desc:"对着拍用"},{id:"full",label:"📦 完整套装",desc:"跨5平台"}].map(m=>(
                  <div key={m.id} onClick={()=>setScriptMode(m.id)} style={{flex:1,background:scriptMode===m.id?T.violet+"22":T.card,border:`1px solid ${scriptMode===m.id?T.violet:T.border}`,borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                    <div style={{color:scriptMode===m.id?T.violet:T.text,fontWeight:700,fontSize:13}}>{m.label}</div>
                    <div style={{color:T.muted,fontSize:11,marginTop:2}}>{m.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:T.muted,fontSize:11,marginBottom:6}}>内容格式</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{FORMATS.map(f=><div key={f} onClick={()=>setFormat(f)} style={{background:format===f?T.blue+"22":T.card,border:`1px solid ${format===f?T.blue:T.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",color:format===f?T.blue:T.muted,fontSize:12,fontWeight:format===f?700:400,transition:"all 0.15s"}}>{f}</div>)}</div>
              </div>
              {scriptMode==="full"&&<div style={{marginBottom:12}}><div style={{color:T.muted,fontSize:11,marginBottom:6}}>目标平台</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{PLATFORMS.map(p=><div key={p} onClick={()=>setSelPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{background:selPlatforms.includes(p)?(PLATFORM_COLORS[p]||T.violet)+"22":T.card,border:`1px solid ${selPlatforms.includes(p)?PLATFORM_COLORS[p]||T.violet:T.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",color:selPlatforms.includes(p)?PLATFORM_COLORS[p]||T.violet:T.muted,fontSize:12,fontWeight:selPlatforms.includes(p)?700:400,transition:"all 0.15s"}}>{p}</div>)}</div></div>}
              <div style={{display:"flex",gap:10}}>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：第一年创业亏了RM50K）" style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",color:T.text,fontSize:13,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&genScript()}/>
                <Btn onClick={()=>genScript()} disabled={scriptLoading||!topic} color={T.violet}>{scriptLoading?"生成中...":"✨ 生成"}</Btn>
              </div>
            </Card>
            {scriptLoading&&<Card><div style={{color:T.muted,textAlign:"center",padding:"36px 0"}}>🧠 Claude 正在生成专属脚本...</div></Card>}
            {script&&<Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><Lbl>生成结果</Lbl><button onClick={()=>navigator.clipboard.writeText(script).then(()=>showToast("✅ 已复制！"))} style={{background:T.blue+"22",color:T.blue,border:`1px solid ${T.blue}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>📋 复制</button></div><div style={{color:T.text,fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",background:T.bg,borderRadius:12,padding:18,borderLeft:`3px solid ${T.violet}`}}>{script}</div></Card>}
          </div>
        )}

        {/* ── VIDEO SCORE ── */}
        {nav==="score"&&(
          <div>
            <Card style={{marginBottom:16}}>
              <Lbl>🎯 视频爆款评分器</Lbl>
              <div style={{color:T.muted,fontSize:13,marginBottom:16,lineHeight:1.6}}>填写你准备发布的视频信息，AI 预测爆款概率并给出改进建议</div>
              {[
                {l:"封面文字 *",k:"cover",p:"例：我亏了RM50K才学会这件事",rows:1},
                {l:"开场 Hook（0-3秒说什么）*",k:"hook",p:"例：做电商3年，我亏了超过RM50K，就因为不知道这件事",rows:2},
                {l:"结尾 CTA",k:"cta",p:"例：保存这个视频，评论告诉我你现在卖什么",rows:1},
                {l:"视频文案/字幕",k:"caption",p:"可以填视频的主要内容...",rows:3},
              ].map(fi=>(
                <div key={fi.k} style={{marginBottom:14}}>
                  <div style={{color:T.muted,fontSize:11,marginBottom:5}}>{fi.l}</div>
                  <textarea value={scoreForm[fi.k]} onChange={e=>setScoreForm(p=>({...p,[fi.k]:e.target.value}))} placeholder={fi.p} rows={fi.rows} style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
                </div>
              ))}
              <div style={{marginBottom:16}}>
                <div style={{color:T.muted,fontSize:11,marginBottom:5}}>视频时长（秒）</div>
                <input type="number" value={scoreForm.duration} onChange={e=>setScoreForm(p=>({...p,duration:e.target.value}))} placeholder="例：45" style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <Btn onClick={scoreVideo} disabled={scoring||!scoreForm.hook} color={T.amber} full>{scoring?"🧠 评分中...":"🎯 AI 评分 + 生成改进版"}</Btn>
            </Card>

            {scoring&&<Card><div style={{color:T.muted,textAlign:"center",padding:"36px 0"}}>🧠 AI 正在分析你的视频爆款潜力...</div></Card>}

            {scoreResult&&(
              <div>
                {/* Main score */}
                <Card style={{marginBottom:16}}>
                  <div style={{display:"flex",gap:20,alignItems:"center",marginBottom:20}}>
                    <ScoreRing score={scoreResult.viral_score||0} color={scoreResult.viral_score>=80?T.emerald:scoreResult.viral_score>=60?T.amber:T.rose} size={90} label="爆款率"/>
                    <div style={{flex:1}}>
                      <div style={{color:scoreResult.viral_score>=80?T.emerald:scoreResult.viral_score>=60?T.amber:T.rose,fontWeight:800,fontSize:18,marginBottom:8}}>{scoreResult.verdict}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {scoreResult.predicted_er&&<Badge color={T.blue}>预测互动率：{scoreResult.predicted_er}</Badge>}
                        {scoreResult.best_time&&<Badge color={T.amber}>最佳发布时间：{scoreResult.best_time}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
                    {[{l:"Hook",v:scoreResult.hook_score||0},{l:"内容",v:scoreResult.content_score||0},{l:"CTA",v:scoreResult.cta_score||0}].map(m=>(
                      <div key={m.l} style={{background:T.bg,borderRadius:10,padding:12,textAlign:"center"}}>
                        <ScoreRing score={m.v} color={m.v>=80?T.emerald:m.v>=60?T.amber:T.rose} size={56} label={m.l}/>
                      </div>
                    ))}
                  </div>
                  {scoreResult.strengths?.length>0&&<div style={{background:T.emerald+"11",border:`1px solid ${T.emerald}33`,borderRadius:10,padding:12,marginBottom:10}}><div style={{color:T.emerald,fontSize:10,marginBottom:6}}>✅ 优点</div>{scoreResult.strengths.map((s,i)=><div key={i} style={{color:T.text,fontSize:12,marginBottom:3}}>• {s}</div>)}</div>}
                  {scoreResult.weaknesses?.length>0&&<div style={{background:T.rose+"11",border:`1px solid ${T.rose}33`,borderRadius:10,padding:12,marginBottom:10}}><div style={{color:T.rose,fontSize:10,marginBottom:6}}>❌ 弱点</div>{scoreResult.weaknesses.map((s,i)=><div key={i} style={{color:T.text,fontSize:12,marginBottom:3}}>• {s}</div>)}</div>}
                  {scoreResult.why_might_stop&&<div style={{background:T.amber+"11",border:`1px solid ${T.amber}33`,borderRadius:10,padding:12}}><div style={{color:T.amber,fontSize:10,marginBottom:4}}>⚠️ 可能推流中断原因</div><div style={{color:T.text,fontSize:13}}>{scoreResult.why_might_stop}</div></div>}
                </Card>

                {/* Improvements */}
                <Card style={{marginBottom:16}}>
                  <Lbl>💡 改进建议</Lbl>
                  {scoreResult.improved_cover&&<div style={{marginBottom:12}}><div style={{color:T.muted,fontSize:10,marginBottom:4}}>改进版封面文字</div><div style={{background:T.blue+"11",border:`1px solid ${T.blue}33`,borderRadius:8,padding:12,color:T.blue,fontSize:14,fontWeight:700}}>"{scoreResult.improved_cover}"</div></div>}
                  {scoreResult.improved_hook&&<div style={{marginBottom:12}}><div style={{color:T.muted,fontSize:10,marginBottom:4}}>改进版 Hook（0-3秒）</div><div style={{background:T.violet+"11",border:`1px solid ${T.violet}33`,borderRadius:8,padding:12,color:T.text,fontSize:13}}>"{scoreResult.improved_hook}"</div></div>}
                  {scoreResult.improved_cta&&<div style={{marginBottom:12}}><div style={{color:T.muted,fontSize:10,marginBottom:4}}>改进版 CTA</div><div style={{background:T.emerald+"11",border:`1px solid ${T.emerald}33`,borderRadius:8,padding:12,color:T.text,fontSize:13}}>"{scoreResult.improved_cta}"</div></div>}
                </Card>

                {/* Full improved script */}
                {scoreResult.full_script&&(
                  <Card>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <Lbl>⚡ 完整改进版脚本</Lbl>
                      <button onClick={()=>navigator.clipboard.writeText(scoreResult.full_script).then(()=>showToast("✅ 已复制！"))} style={{background:T.violet+"22",color:T.violet,border:`1px solid ${T.violet}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>📋 复制</button>
                    </div>
                    <div style={{color:T.text,fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",background:T.bg,borderRadius:12,padding:18,borderLeft:`3px solid ${T.violet}`}}>{scoreResult.full_script}</div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TRENDS ── */}
        {nav==="trends"&&(
          <div>
            <Card style={{marginBottom:16}}>
              <Lbl>🔥 市场爆款分析</Lbl>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={trendsNiche} onChange={e=>setTrendsNiche(e.target.value)} placeholder="输入行业（如：电商、手表、健身）" style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&fetchTrends()}/>
                <Btn onClick={fetchTrends} disabled={loadingTrends||!trendsNiche} color={T.amber}>{loadingTrends?"分析中...":"🔥 分析"}</Btn>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["电商","手表","时装","健身","美食","个人品牌"].map(n=><div key={n} onClick={()=>setTrendsNiche(n)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",color:T.muted,fontSize:11}} onMouseEnter={e=>{e.target.style.borderColor=T.amber;e.target.style.color=T.amber;}} onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}>{n}</div>)}
              </div>
            </Card>
            {loadingTrends&&<Card><div style={{color:T.muted,textAlign:"center",padding:"36px 0"}}>🔥 AI 分析市场爆款趋势...</div></Card>}
            {trends&&(
              <div>
                {trends.weekly_insights&&<Card style={{marginBottom:12}}><Lbl>本周洞察</Lbl><div style={{color:T.text,fontSize:13,lineHeight:1.7}}>{trends.weekly_insights}</div></Card>}
                {trends.trending_topics?.length>0&&(
                  <Card style={{marginBottom:12}}>
                    <Lbl>🔥 爆款话题</Lbl>
                    {trends.trending_topics.map((t,i)=>(
                      <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{color:T.text,fontWeight:700,fontSize:14}}>{t.topic}</div>
                          <div style={{display:"flex",gap:5}}>{t.platforms?.map(p=><Badge key={p} color={PLATFORM_COLORS[p]||T.blue}>{p}</Badge>)}</div>
                        </div>
                        <div style={{color:T.muted,fontSize:12,marginBottom:8}}>{t.why_trending}</div>
                        {t.sample_hook&&<div style={{background:T.violet+"11",border:`1px solid ${T.violet}22`,borderRadius:8,padding:"8px 12px",marginBottom:8}}><span style={{color:T.violet,fontSize:12}}>Hook："{t.sample_hook}"</span></div>}
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <div style={{flex:1,background:T.border,borderRadius:4,height:6}}><div style={{background:T.amber,width:`${t.virality_score||0}%`,height:"100%",borderRadius:4,boxShadow:`0 0 6px ${T.amber}66`}}/></div>
                          <span style={{color:T.amber,fontWeight:700,fontSize:12}}>{t.virality_score}</span>
                        </div>
                        <Btn onClick={()=>{setTopic(t.topic);genScript("quick",t.topic);}} color={T.violet} style={{fontSize:11,padding:"6px 12px"}}>✨ 用这个话题生成脚本</Btn>
                      </div>
                    ))}
                  </Card>
                )}
                {trends.action_items?.length>0&&<Card style={{marginBottom:12}}><Lbl>今天就可以做</Lbl>{trends.action_items.map((a,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{color:T.emerald,fontWeight:700}}>✓</div><div style={{color:T.text,fontSize:13}}>{a}</div></div>)}</Card>}
              </div>
            )}
            <Card style={{marginTop:16}}>
              <Lbl>🎯 对标账号 + 二次创作</Lbl>
              <textarea value={competitors} onChange={e=>setCompetitors(e.target.value)} placeholder={"输入对标账号（每行一个）\n@creator1\n@creator2"} rows={3} style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit",marginBottom:10}}/>
              <Btn onClick={analyzeCompetitors} disabled={loadingComp||!competitors} color={T.violet} full>{loadingComp?"分析中...":"🎯 分析 + 生成二次创作脚本"}</Btn>
            </Card>
            {loadingComp&&<Card style={{marginTop:12}}><div style={{color:T.muted,textAlign:"center",padding:"36px 0"}}>🧠 AI 分析对标账号...</div></Card>}
            {competitor&&(
              <div style={{marginTop:12}}>
                {competitor.recreation_scripts?.length>0&&(
                  <Card style={{marginBottom:12}}>
                    <Lbl>✨ 二次创作脚本</Lbl>
                    {competitor.recreation_scripts.map((s,i)=>(
                      <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{color:T.muted,fontSize:11,marginBottom:4}}>原概念：{s.original_concept}</div>
                        <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:10}}>你的版本：{s.your_version_title}</div>
                        <div style={{background:T.card,borderRadius:10,padding:12}}>
                          {[["Hook（0-3秒）",s.your_hook,T.amber],["内容结构",s.your_structure,T.blue],["CTA",s.your_cta,T.emerald],["差异化",s.differentiation,T.violet]].filter(x=>x[1]).map(([l,v,c])=>(
                            <div key={l} style={{marginBottom:8}}><span style={{color:c,fontSize:10}}>{l}</span><div style={{color:T.text,fontSize:13,marginTop:2}}>{v}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
                {competitor.market_gaps?.length>0&&<Card><Lbl>💎 市场空缺</Lbl>{competitor.market_gaps.map((g,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{color:T.amber}}>💎</div><div style={{color:T.text,fontSize:13}}>{g}</div></div>)}</Card>}
              </div>
            )}
          </div>
        )}

        {/* ── ROADMAP ── */}
        {nav==="roadmap"&&(
          <div>
            <Card style={{marginBottom:16}}>
              <Lbl>🗺️ 成长路线图</Lbl>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color||T.blue} size={48}/>
                <div style={{flex:1}}><div style={{color:T.text,fontWeight:700}}>@{acc?.username}</div><div style={{color:T.muted,fontSize:12}}>现有 {accProfile?.followers_count?.toLocaleString()||0} 粉丝 · {acc?.strategy?.goal||"请设置目标"}</div></div>
              </div>
              {!acc?.strategy?.positioning&&<div style={{background:T.amber+"11",border:`1px solid ${T.amber}33`,borderRadius:10,padding:12,marginBottom:14}}><div style={{color:T.amber,fontSize:12}}>⚠️ 请先设置策略档案，路线图会更精准</div></div>}
              <Btn onClick={generateRoadmap} disabled={loadingRoadmap} color={T.blue} full>{loadingRoadmap?"🧠 生成中...":"🗺️ 生成专属路线图"}</Btn>
            </Card>
            {loadingRoadmap&&<Card><div style={{color:T.muted,textAlign:"center",padding:"36px 0"}}>🧠 AI 正在规划你的成长路线图...</div></Card>}
            {accRoadmap&&(
              <div>
                {accRoadmap.phases?.map((phase,i)=>(
                  <Card key={i} style={{marginBottom:12,borderLeft:`3px solid ${phaseColors[i%4]}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div><div style={{color:phaseColors[i%4],fontSize:11,fontWeight:700,letterSpacing:1}}>{phase.phase}</div><div style={{color:T.text,fontWeight:800,fontSize:16,marginTop:2}}>{phase.name}</div><div style={{color:T.muted,fontSize:12,marginTop:2}}>{phase.duration}</div></div>
                      <div style={{textAlign:"right"}}><Badge color={phaseColors[i%4]}>{phase.follower_target}</Badge>{phase.monetization&&phase.monetization!=="暂未变现"&&<div style={{marginTop:6}}><Badge color={T.emerald}>{phase.monetization}</Badge></div>}</div>
                    </div>
                    <div style={{background:T.bg,borderRadius:10,padding:14,marginBottom:12}}>
                      <div style={{color:T.muted,fontSize:10,marginBottom:8}}>每天行动</div>
                      {phase.daily_actions?.map((a,j)=><div key={j} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:j<phase.daily_actions.length-1?`1px solid ${T.border}`:"none"}}><div style={{color:T.emerald,fontWeight:700,flexShrink:0}}>✓</div><div style={{color:T.text,fontSize:12}}>{a}</div></div>)}
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {phase.content_focus&&<Badge color={T.cyan}>内容：{phase.content_focus}</Badge>}
                      {phase.posting_frequency&&<Badge color={T.violet}>频率：{phase.posting_frequency}</Badge>}
                      {phase.key_metric&&<Badge color={T.amber}>指标：{phase.key_metric}</Badge>}
                    </div>
                  </Card>
                ))}
                {accRoadmap.monetization_strategy&&<Card style={{marginBottom:12,borderLeft:`3px solid ${T.emerald}`}}><Lbl>💰 变现策略</Lbl><div style={{color:T.text,fontSize:13,lineHeight:1.7}}>{accRoadmap.monetization_strategy}</div></Card>}
                {accRoadmap.key_milestones?.length>0&&<Card><Lbl>🏆 关键里程碑</Lbl>{accRoadmap.key_milestones.map((m,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{color:T.amber,fontWeight:700}}>🏆</div><div style={{color:T.text,fontSize:13}}>{m}</div></div>)}</Card>}
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {nav==="accounts"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <Lbl>账号管理</Lbl>
              <Btn onClick={()=>setAccountModal({username:"",name:"",token:"",color:T.violet,strategy:{}})} color={T.blue} style={{fontSize:12,padding:"8px 16px"}}>✚ 添加账号</Btn>
            </div>
            {accounts.length===0&&<Card><div style={{color:T.muted,textAlign:"center",padding:"40px 0"}}>还没有账号，点击「添加账号」开始</div></Card>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {accounts.map(a=>(
                <Card key={a.username} style={{borderLeft:`3px solid ${a.color}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <Avatar username={a.username} picUrl={profiles[a.username]?.profile_picture_url} color={a.color} size={56}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:T.text,fontWeight:700,fontSize:15}}>{a.name}</div>
                      <div style={{color:T.muted,fontSize:12}}>@{a.username}</div>
                      {a.strategy?.positioning&&<div style={{color:a.color,fontSize:11,marginTop:3}}>📌 {a.strategy.positioning}</div>}
                      {a.strategy?.goal&&<div style={{color:T.muted,fontSize:11}}>🎯 {a.strategy.goal}</div>}
                      <div style={{color:a.token?T.emerald:T.rose,fontSize:10,marginTop:3}}>{a.token?"✅ Token 已设置（存在数据库）":"⚠️ 需要设置 Token"}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                      <button onClick={()=>setAccountModal(a)} style={{background:T.blue+"22",color:T.blue,border:`1px solid ${T.blue}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>✏️ 编辑</button>
                      <button onClick={()=>setStrategyModal(a)} style={{background:T.amber+"22",color:T.amber,border:`1px solid ${T.amber}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>📌 策略</button>
                      <button onClick={()=>syncAccount(a)} style={{background:T.emerald+"22",color:T.emerald,border:`1px solid ${T.emerald}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>🔄 同步</button>
                      <button onClick={()=>deleteAccount(a.username)} style={{background:T.rose+"22",color:T.rose,border:`1px solid ${T.rose}33`,borderRadius:7,padding:"5px 14px",fontSize:11,cursor:"pointer",fontWeight:600}}>删除</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav style={{background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",position:"sticky",bottom:0,zIndex:50}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,background:"none",border:"none",padding:"9px 2px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:nav===n.id?`2px solid ${T.blue}`:"2px solid transparent",transition:"border-color 0.15s"}}>
            <span style={{fontSize:15}}>{n.icon}</span>
            <span style={{color:nav===n.id?T.blue:T.muted,fontSize:9,fontWeight:nav===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </nav>

      {strategyModal&&<StrategyModal account={strategyModal} onSave={saveStrategy} onClose={()=>setStrategyModal(null)}/>}
      {accountModal&&<AccountModal editing={accountModal?.username?accountModal:null} onSave={saveAccount} onClose={()=>setAccountModal(null)}/>}
    </div>
  );
}
