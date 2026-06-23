"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#080b14",surface:"#0e1320",panel:"#131926",border:"#1e2a3a",
  blue:"#3b82f6",cyan:"#06b6d4",amber:"#f59e0b",green:"#22c55e",
  red:"#ef4444",purple:"#a855f7",pink:"#ec4899",text:"#e2e8f0",muted:"#64748b",dim:"#334155",
};

function Pill({text,color=C.blue,size="sm"}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:size==="sm"?"2px 10px":"4px 14px",fontSize:size==="sm"?11:13,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function Panel({children,style={}}) {
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}}>{children}</div>;
}
function SL({children}) {
  return <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}
function Btn({children,onClick,color=C.blue,disabled=false,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"#2a2a3a":color,color:disabled?C.muted:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.6:1,...style}}>{children}</button>;
}
function ScoreBar({value}) {
  const c=value>=80?C.green:value>=60?C.amber:C.red;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,background:C.bg,borderRadius:4,height:6}}>
        <div style={{background:c,width:`${Math.min(100,value)}%`,height:"100%",borderRadius:4,transition:"width 0.8s",boxShadow:`0 0 6px ${c}66`}}/>
      </div>
      <span style={{color:c,fontWeight:700,fontSize:12,minWidth:28}}>{value}</span>
    </div>
  );
}

// ── Real IG Avatar with profile_picture_url fallback ──────
function IGAvatar({username,profilePicUrl,color,size=40}) {
  const [src,setSrc]=useState(profilePicUrl||`https://unavatar.io/instagram/${username}`);
  const [ok,setOk]=useState(true);
  const initials=username.replace(/_/g," ").split(" ").map(w=>w[0]?.toUpperCase()||"").join("").slice(0,2);
  useEffect(()=>{
    setSrc(profilePicUrl||`https://unavatar.io/instagram/${username}`);
    setOk(true);
  },[username,profilePicUrl]);
  return (
    <div style={{width:size,height:size,borderRadius:size*0.25,border:`2px solid ${color}`,overflow:"hidden",flexShrink:0,background:color+"22"}}>
      {ok?<img src={src} alt={username} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={()=>setOk(false)}/>
        :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:size*0.28,background:`linear-gradient(135deg,${color}22,${color}44)`}}>{initials}</div>}
    </div>
  );
}

// ── Strategy Modal ────────────────────────────────────────
function StrategyModal({account,onSave,onClose}) {
  const [form,setForm]=useState(account.strategy||{positioning:"",audience:"",goal:"",style:"",language:"中文为主，适当加马来西亚华人口语"});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.blue}`,borderRadius:18,padding:24,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><div style={{color:C.text,fontWeight:800,fontSize:17}}>账号策略档案</div><div style={{color:C.muted,fontSize:12}}>@{account.username}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {[
          {l:"账号定位 *",k:"positioning",p:"例：马来西亚华人电商教育 / 手表销售 / 健身"},
          {l:"目标受众 *",k:"audience",p:"例：25-40岁想做电商的马来西亚华人"},
          {l:"想要的结果 *",k:"goal",p:"例：涨粉到10万 + 每月卖出50个产品"},
          {l:"内容风格",k:"style",p:"例：真实故事 + 干货教育 + 偶尔娱乐"},
          {l:"语言风格",k:"language",p:"例：中文为主，适当加马来西亚口语"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{f.l}</div>
            <textarea value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} rows={2}
              style={{width:"100%",background:C.bg,border:`1px solid ${form[f.k]?C.blue:C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn onClick={onClose} color={C.panel} style={{flex:1,color:C.muted,border:`1px solid ${C.border}`}}>取消</Btn>
          <Btn onClick={()=>onSave(form)} color={C.blue} style={{flex:2}}>💾 保存策略</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Account Modal ────────────────────────────────
function AccountModal({editing,onSave,onClose}) {
  const colors=[C.purple,C.amber,C.pink,C.cyan,C.blue,C.green,"#f97316","#e11d48"];
  const [form,setForm]=useState(editing||{username:"",name:"",token:"",color:C.purple});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const valid=form.username&&form.token;
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.blue}`,borderRadius:18,padding:24,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontWeight:800,fontSize:17}}>{editing?"编辑账号":"添加 IG 账号"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {/* Preview */}
        <div style={{display:"flex",alignItems:"center",gap:12,background:C.panel,borderRadius:12,padding:14,marginBottom:16}}>
          <IGAvatar username={form.username||"instagram"} color={form.color} size={52}/>
          <div>
            <div style={{color:C.text,fontWeight:700}}>{form.name||"账号名称"}</div>
            <div style={{color:C.muted,fontSize:12}}>@{form.username||"username"}</div>
          </div>
        </div>
        {[
          {l:"IG 用户名（不含@）*",k:"username",p:"eugene_mkting55",type:"text"},
          {l:"显示名称",k:"name",p:"Eugene Marketing",type:"text"},
          {l:"Access Token *",k:"token",p:"粘贴你的 IG Access Token（保密）",type:"password"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{f.l}</div>
            <input type={f.type} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:8}}>主题颜色</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {colors.map(c=><div key={c} onClick={()=>set("color",c)} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:`2px solid ${form.color===c?"#fff":"transparent"}`,boxShadow:form.color===c?`0 0 8px ${c}`:"none"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={onClose} color={C.panel} style={{flex:1,color:C.muted,border:`1px solid ${C.border}`}}>取消</Btn>
          <Btn onClick={()=>valid&&onSave({...form,id:editing?.id||Date.now(),strategy:editing?.strategy||{}})} disabled={!valid} color={C.blue} style={{flex:2}}>
            {editing?"保存修改":"✚ 添加账号"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
const NAVS=[
  {id:"home",label:"总部",icon:"⚡"},
  {id:"videos",label:"视频",icon:"🎬"},
  {id:"analyze",label:"分析",icon:"🧬"},
  {id:"script",label:"脚本",icon:"✍️"},
  {id:"trends",label:"爆款",icon:"🔥"},
  {id:"accounts",label:"账号",icon:"⚙️"},
];

const PLATFORMS=["Instagram","Facebook","TikTok","小红书","抖音"];
const FORMATS=["Reel","Carousel","Photo","Story","Live"];

export default function App() {
  const [nav,setNav]=useState("home");
  const [accounts,setAccounts]=useState(()=>{try{const s=localStorage.getItem("ig_v4_accounts");return s?JSON.parse(s):[{id:1,username:"eugene_mkting55",name:"Eugene Marketing",color:C.purple,token:process.env.NEXT_PUBLIC_DEFAULT_TOKEN||"",strategy:{}}];}catch{return [{id:1,username:"eugene_mkting55",name:"Eugene Marketing",color:C.purple,token:"",strategy:{}}];}});
  const [activeId,setActiveId]=useState(1);
  const [posts,setPosts]=useState({});
  const [profiles,setProfiles]=useState({});
  const [insights,setInsights]=useState({});
  const [trends,setTrends]=useState(null);
  const [competitor,setCompetitor]=useState(null);
  const [competitors,setCompetitors]=useState("");
  const [syncing,setSyncing]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [loadingTrends,setLoadingTrends]=useState(false);
  const [loadingComp,setLoadingComp]=useState(false);
  const [toast,setToast]=useState(null);
  const [strategyModal,setStrategyModal]=useState(null);
  const [accountModal,setAccountModal]=useState(null);
  const [topic,setTopic]=useState("");
  const [format,setFormat]=useState("Reel");
  const [selectedPlatforms,setSelectedPlatforms]=useState(["Instagram","TikTok"]);
  const [scriptMode,setScriptMode]=useState("quick");
  const [script,setScript]=useState("");
  const [scriptLoading,setScriptLoading]=useState(false);
  const [trendsNiche,setTrendsNiche]=useState("");

  const activeAcc=accounts.find(a=>a.id===activeId)||accounts[0];
  const activePosts=posts[activeId]||[];
  const activeProfile=profiles[activeId];
  const activeInsight=insights[activeId];
  const sortedPosts=[...activePosts].sort((a,b)=>b.engagement_rate-a.engagement_rate);

  useEffect(()=>{try{localStorage.setItem("ig_v4_accounts",JSON.stringify(accounts));}catch{};},[accounts]);

  const showToast=(msg,color=C.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),4000);};

  async function syncAccount(acc) {
    if(!acc?.token){showToast("⚠️ 请先设置 Access Token",C.amber);setAccountModal(acc);return;}
    setSyncing(true);
    try {
      const res=await fetch(`/api/ig?token=${encodeURIComponent(acc.token)}`);
      const data=await res.json();
      if(data.error){showToast("❌ "+data.error,C.red);}
      else {
        setPosts(p=>({...p,[acc.id]:data.posts||[]}));
        setProfiles(p=>({...p,[acc.id]:data.profile}));
        showToast(`✅ 同步成功！${data.synced} 条内容`);
      }
    }catch(e){showToast("❌ "+e.message,C.red);}
    setSyncing(false);
  }

  async function analyzeAccount() {
    if(!activePosts.length){showToast("请先同步数据",C.amber);return;}
    setAnalyzing(true);
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({posts:activePosts,strategy:activeAcc?.strategy||{}})});
      const data=await res.json();
      if(data.error)showToast("❌ "+data.error,C.red);
      else{setInsights(i=>({...i,[activeId]:data.analysis}));showToast("✅ AI 分析完成！");}
    }catch(e){showToast("❌ "+e.message,C.red);}
    setAnalyzing(false);
  }

  async function fetchTrends() {
    if(!trendsNiche){showToast("请输入行业",C.amber);return;}
    setLoadingTrends(true);
    try {
      const res=await fetch("/api/trends",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({niche:trendsNiche,language:activeAcc?.strategy?.language||"中文为主"})});
      const data=await res.json();
      if(data.error)showToast("❌ "+data.error,C.red);
      else{setTrends(data.trends);showToast("✅ 爆款分析完成！");}
    }catch(e){showToast("❌ "+e.message,C.red);}
    setLoadingTrends(false);
  }

  async function analyzeCompetitors() {
    const list=competitors.split(/[,，\n]/).map(s=>s.trim().replace("@","")).filter(Boolean);
    if(!list.length){showToast("请输入对标账号",C.amber);return;}
    setLoadingComp(true);
    try {
      const res=await fetch("/api/competitor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({competitors:list,strategy:activeAcc?.strategy||{}})});
      const data=await res.json();
      if(data.error)showToast("❌ "+data.error,C.red);
      else{setCompetitor(data.result);showToast("✅ 竞品分析完成！");}
    }catch(e){showToast("❌ "+e.message,C.red);}
    setLoadingComp(false);
  }

  async function generateScript() {
    if(!topic){showToast("请输入主题",C.amber);return;}
    setScriptLoading(true);setScript("");
    try {
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:format,topic,platforms:selectedPlatforms,strategy:activeAcc?.strategy||{},mode:scriptMode})});
      const data=await res.json();
      setScript(data.content||data.error||"生成失败");
    }catch(e){setScript("❌ "+e.message);}
    setScriptLoading(false);
  }

  function saveStrategy(strategy) {
    setAccounts(prev=>prev.map(a=>a.id===strategyModal.id?{...a,strategy}:a));
    setStrategyModal(null);showToast("✅ 策略档案已保存！");
  }

  function saveAccount(acc) {
    setAccounts(prev=>{const e=prev.find(a=>a.id===acc.id);return e?prev.map(a=>a.id===acc.id?acc:a):[...prev,acc];});
    setAccountModal(null);showToast("✅ 账号已保存！");
  }

  const avgER=activePosts.length?(activePosts.reduce((s,p)=>s+parseFloat(p.engagement_rate||0),0)/activePosts.length).toFixed(1):0;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 12px ${C.blue}44`}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontWeight:800,fontSize:14,letterSpacing:-0.3}}>IG Pro</div>
          <div style={{color:C.muted,fontSize:9,letterSpacing:1}}>JES GROUP · 内容情报系统 v4</div>
        </div>
        {/* Account switcher */}
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {accounts.slice(0,6).map(acc=>(
            <div key={acc.id} onClick={()=>setActiveId(acc.id)} title={`@${acc.username}`}
              style={{cursor:"pointer",borderRadius:10,border:`2px solid ${activeId===acc.id?acc.color:"transparent"}`,transition:"all 0.2s",opacity:activeId===acc.id?1:0.55}}>
              <IGAvatar username={acc.username} profilePicUrl={profiles[acc.id]?.profile_picture_url} color={acc.color} size={30}/>
            </div>
          ))}
          <div onClick={()=>setAccountModal({id:Date.now(),username:"",name:"",token:"",color:C.blue,strategy:{}})}
            style={{width:30,height:30,borderRadius:8,background:C.panel,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontSize:18}}>+</div>
        </div>
      </div>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:58,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,zIndex:200,boxShadow:"0 4px 20px #0009",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* Content */}
      <div style={{flex:1,padding:"16px",maxWidth:800,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* ── HOME ── */}
        {nav==="home"&&(
          <div>
            {/* Active Account Hero */}
            <div style={{background:`linear-gradient(135deg,${activeAcc?.color||C.blue}18,${C.purple}08)`,border:`1px solid ${activeAcc?.color||C.blue}35`,borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <IGAvatar username={activeAcc?.username||"instagram"} profilePicUrl={activeProfile?.profile_picture_url} color={activeAcc?.color||C.blue} size={68}/>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontSize:20,fontWeight:800}}>@{activeAcc?.username}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:2}}>{activeAcc?.name}</div>
                  {activeAcc?.strategy?.positioning&&<div style={{color:activeAcc.color,fontSize:11,marginTop:4}}>📌 {activeAcc.strategy.positioning}</div>}
                  {activeAcc?.strategy?.goal&&<div style={{color:C.muted,fontSize:11,marginTop:2}}>🎯 {activeAcc.strategy.goal}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:activeAcc?.color||C.blue,fontSize:30,fontWeight:800,lineHeight:1}}>
                    {activeProfile?.followers_count!=null?activeProfile.followers_count.toLocaleString():"--"}
                  </div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2}}>粉丝</div>
                  {activeProfile?.media_count&&<div style={{color:C.muted,fontSize:10}}>{activeProfile.media_count} 条内容</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>syncAccount(activeAcc)} disabled={syncing} color={C.green} style={{flex:1,padding:"9px"}}>
                  {syncing?"⏳ 同步中...":"🔄 同步数据"}
                </Btn>
                <Btn onClick={()=>setStrategyModal(activeAcc)} color={C.blue+"22"} style={{flex:1,padding:"9px",color:C.blue,border:`1px solid ${C.blue}44`}}>
                  📌 策略档案
                </Btn>
                <Btn onClick={()=>setAccountModal(activeAcc)} color={C.panel} style={{padding:"9px 14px",color:C.muted,border:`1px solid ${C.border}`}}>
                  ✏️
                </Btn>
              </div>
            </div>

            {/* Stats */}
            {activePosts.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                {[
                  {l:"帖子数",v:activePosts.length,c:C.purple},
                  {l:"平均互动率",v:`${avgER}%`,c:C.blue},
                  {l:"总赞数",v:activePosts.reduce((s,p)=>s+(p.likes||0),0).toLocaleString(),c:C.pink},
                ].map(s=><Panel key={s.l} style={{padding:"14px 16px"}}><div style={{color:C.muted,fontSize:10}}>{s.l}</div><div style={{color:s.c,fontSize:22,fontWeight:800,marginTop:4}}>{s.v}</div></Panel>)}
              </div>
            )}

            {/* All Accounts */}
            <Panel style={{marginBottom:16}}>
              <SL>所有账号</SL>
              {accounts.map(acc=>(
                <div key={acc.id} onClick={()=>setActiveId(acc.id)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"opacity 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <IGAvatar username={acc.username} profilePicUrl={profiles[acc.id]?.profile_picture_url} color={acc.color} size={42}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:activeId===acc.id?acc.color:C.text,fontWeight:700,fontSize:13}}>{acc.name}</div>
                    <div style={{color:C.muted,fontSize:11}}>@{acc.username}</div>
                    {acc.strategy?.positioning&&<div style={{color:acc.color,fontSize:10,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📌 {acc.strategy.positioning}</div>}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{color:acc.color,fontWeight:700,fontSize:15}}>{profiles[acc.id]?.followers_count?.toLocaleString()||"--"}</div>
                    <div style={{color:C.muted,fontSize:10}}>粉丝</div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={e=>{e.stopPropagation();syncAccount(acc);}} style={{background:C.green+"22",color:C.green,border:`1px solid ${C.green}33`,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>同步</button>
                    <button onClick={e=>{e.stopPropagation();setStrategyModal(acc);}} style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}33`,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>策略</button>
                  </div>
                </div>
              ))}
              <button onClick={()=>setAccountModal({id:Date.now(),username:"",name:"",token:"",color:C.purple,strategy:{}})}
                style={{width:"100%",marginTop:12,background:"none",border:`1px dashed ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,fontSize:13,cursor:"pointer"}}>
                ✚ 添加新账号
              </button>
            </Panel>

            {/* Quick AI insight */}
            {activeInsight&&(
              <Panel>
                <SL>🤖 最新 AI 洞察</SL>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {activeInsight.best_post_type&&<Pill text={`最佳类型：${activeInsight.best_post_type}`} color={C.blue}/>}
                  {activeInsight.best_time&&<Pill text={`最佳时间：${activeInsight.best_time}`} color={C.amber}/>}
                </div>
                {activeInsight.tomorrow_idea&&(
                  <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12}}>
                    <div style={{color:C.green,fontSize:11,marginBottom:4}}>💡 明天发什么</div>
                    <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{activeInsight.tomorrow_idea}</div>
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {nav==="videos"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <IGAvatar username={activeAcc?.username} profilePicUrl={activeProfile?.profile_picture_url} color={activeAcc?.color||C.blue} size={36}/>
                <div>
                  <div style={{color:C.text,fontWeight:700,fontSize:14}}>@{activeAcc?.username}</div>
                  <div style={{color:C.muted,fontSize:11}}>{activePosts.length} 条内容</div>
                </div>
              </div>
              <Btn onClick={()=>syncAccount(activeAcc)} disabled={syncing} color={C.green} style={{padding:"8px 14px",fontSize:12}}>
                {syncing?"同步中...":"🔄 同步"}
              </Btn>
            </div>
            {activePosts.length===0&&<Panel><div style={{color:C.muted,textAlign:"center",padding:"30px 0"}}>请先同步数据</div></Panel>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sortedPosts.map((post,i)=>(
                <Panel key={post.ig_post_id||i}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    {post.thumbnail_url&&(
                      <a href={post.permalink} target="_blank" rel="noreferrer" style={{flexShrink:0}}>
                        <img src={post.thumbnail_url} style={{width:70,height:70,borderRadius:10,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                      </a>
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.text,fontSize:12,lineHeight:1.5,marginBottom:8}}>{post.caption?.substring(0,120)||"(无文案)"}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                        <Pill text={post.type||"POST"} color={C.cyan}/>
                        <Pill text={`❤️${post.likes||0}`} color={C.pink}/>
                        <Pill text={`💬${post.comments||0}`} color={C.blue}/>
                        <Pill text={`🔖${post.saves||0}`} color={C.purple}/>
                        {post.video_views>0&&<Pill text={`▶️${post.video_views}`} color={C.amber}/>}
                        <Pill text={`👁${post.reach||0}`} color={C.muted}/>
                      </div>
                      {/* Video Analysis */}
                      {activeInsight?.video_analysis?.[i]&&(
                        <div style={{background:C.bg,borderRadius:8,padding:10}}>
                          <div style={{color:C.muted,fontSize:10,marginBottom:8}}>AI 视频诊断</div>
                          <div style={{marginBottom:8}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:C.muted,fontSize:11}}>Hook 强度</span></div>
                            <ScoreBar value={activeInsight.video_analysis[i].hook_score||0}/>
                            <div style={{color:C.amber,fontSize:11,marginTop:3}}>{activeInsight.video_analysis[i].hook_feedback}</div>
                          </div>
                          <div style={{marginBottom:8}}>
                            <div style={{color:C.muted,fontSize:11,marginBottom:3}}>CTA 强度</div>
                            <ScoreBar value={activeInsight.video_analysis[i].cta_score||0}/>
                            <div style={{color:C.cyan,fontSize:11,marginTop:3}}>{activeInsight.video_analysis[i].cta_feedback}</div>
                          </div>
                          {activeInsight.video_analysis[i].improvement&&(
                            <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:6,padding:8}}>
                              <span style={{color:C.green,fontSize:11}}>💡 {activeInsight.video_analysis[i].improvement}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:parseFloat(post.engagement_rate)>5?C.green:parseFloat(post.engagement_rate)>3?C.amber:C.muted,fontWeight:800,fontSize:18}}>{post.engagement_rate}%</div>
                      <div style={{color:C.muted,fontSize:10}}>互动率</div>
                      {post.permalink&&<a href={post.permalink} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11,textDecoration:"none",display:"block",marginTop:6}}>▶ 查看</a>}
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYZE ── */}
        {nav==="analyze"&&(
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>AI 内容分析引擎</SL>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <IGAvatar username={activeAcc?.username} profilePicUrl={activeProfile?.profile_picture_url} color={activeAcc?.color||C.blue} size={44}/>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontWeight:700}}>@{activeAcc?.username}</div>
                  <div style={{color:C.muted,fontSize:12}}>{activePosts.length} 条内容 · {activeAcc?.strategy?.positioning||"⚠️ 未设置策略档案"}</div>
                </div>
                {!activeAcc?.strategy?.positioning&&<Btn onClick={()=>setStrategyModal(activeAcc)} color={C.amber} style={{fontSize:12,padding:"6px 12px"}}>设置策略</Btn>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>syncAccount(activeAcc)} disabled={syncing} color={C.green+"22"} style={{flex:1,color:C.green,border:`1px solid ${C.green}44`}}>
                  {syncing?"同步中...":"🔄 同步"}
                </Btn>
                <Btn onClick={analyzeAccount} disabled={analyzing||activePosts.length===0} color={C.purple} style={{flex:2}}>
                  {analyzing?"🧠 分析中...":"🤖 开始 AI 分析"}
                </Btn>
              </div>
            </Panel>

            {activeInsight&&(
              <div>
                <Panel style={{marginBottom:16}}>
                  <SL>分析结果</SL>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    {[
                      {l:"最佳内容类型",v:activeInsight.best_post_type,c:C.blue},
                      {l:"最佳发布时间",v:activeInsight.best_time,c:C.amber},
                      {l:"最强 Hook",v:activeInsight.best_hook,c:C.purple},
                      {l:"热门话题",v:(activeInsight.top_topics||[]).slice(0,2).join("、"),c:C.green},
                    ].filter(s=>s.v).map(s=>(
                      <div key={s.l} style={{background:s.c+"11",border:`1px solid ${s.c}33`,borderRadius:10,padding:12}}>
                        <div style={{color:C.muted,fontSize:10,marginBottom:4}}>{s.l}</div>
                        <div style={{color:s.c,fontWeight:700,fontSize:13}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {activeInsight.tomorrow_idea&&(
                    <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12,marginBottom:12}}>
                      <div style={{color:C.green,fontWeight:700,marginBottom:6}}>💡 明天发什么</div>
                      <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{activeInsight.tomorrow_idea}</div>
                    </div>
                  )}
                  {(activeInsight.recommendations||[]).length>0&&(
                    <div>
                      <SL>可执行建议</SL>
                      {activeInsight.recommendations.map((r,i)=>(
                        <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                          <div style={{color:C.green,fontWeight:700}}>✓</div>
                          <div style={{color:C.text,fontSize:13,lineHeight:1.6}}>{r}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
                {(activeInsight.video_analysis||[]).length>0&&(
                  <Panel>
                    <SL>逐条视频诊断</SL>
                    {activeInsight.video_analysis.map((v,i)=>(
                      <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.text,fontSize:12,marginBottom:8}}>{v.caption}...</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                          <div>
                            <div style={{color:C.muted,fontSize:10,marginBottom:4}}>Hook 强度</div>
                            <ScoreBar value={v.hook_score||0}/>
                            <div style={{color:C.amber,fontSize:11,marginTop:3}}>{v.hook_feedback}</div>
                          </div>
                          <div>
                            <div style={{color:C.muted,fontSize:10,marginBottom:4}}>CTA 强度</div>
                            <ScoreBar value={v.cta_score||0}/>
                            <div style={{color:C.cyan,fontSize:11,marginTop:3}}>{v.cta_feedback}</div>
                          </div>
                        </div>
                        {v.improvement&&<div style={{background:C.green+"11",borderRadius:8,padding:8}}><span style={{color:C.green,fontSize:12}}>💡 {v.improvement}</span></div>}
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCRIPT ── */}
        {nav==="script"&&(
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>跨平台脚本生成器</SL>
              {activeAcc?.strategy?.positioning&&(
                <div style={{background:C.blue+"11",border:`1px solid ${C.blue}33`,borderRadius:8,padding:10,marginBottom:14}}>
                  <div style={{color:C.muted,fontSize:10,marginBottom:2}}>策略档案</div>
                  <div style={{color:C.blue,fontSize:12}}>📌 {activeAcc.strategy.positioning}</div>
                  {activeAcc.strategy.goal&&<div style={{color:C.muted,fontSize:11}}>🎯 {activeAcc.strategy.goal}</div>}
                </div>
              )}
              {/* Mode */}
              <div style={{marginBottom:12}}>
                <div style={{color:C.muted,fontSize:11,marginBottom:6}}>脚本模式</div>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"quick",label:"⚡ 快速脚本",desc:"对着拍用"},{id:"full",label:"📦 完整套装",desc:"跨平台版本"}].map(m=>(
                    <div key={m.id} onClick={()=>setScriptMode(m.id)} style={{flex:1,background:scriptMode===m.id?C.purple+"22":C.bg,border:`1px solid ${scriptMode===m.id?C.purple:C.border}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"center"}}>
                      <div style={{color:scriptMode===m.id?C.purple:C.text,fontWeight:700,fontSize:13}}>{m.label}</div>
                      <div style={{color:C.muted,fontSize:11}}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Format */}
              <div style={{marginBottom:12}}>
                <div style={{color:C.muted,fontSize:11,marginBottom:6}}>内容格式</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {FORMATS.map(f=><div key={f} onClick={()=>setFormat(f)} style={{background:format===f?C.blue+"22":C.bg,border:`1px solid ${format===f?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:format===f?C.blue:C.muted,fontSize:12}}>{f}</div>)}
                </div>
              </div>
              {/* Platforms */}
              {scriptMode==="full"&&(
                <div style={{marginBottom:12}}>
                  <div style={{color:C.muted,fontSize:11,marginBottom:6}}>目标平台（可多选）</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {PLATFORMS.map(p=><div key={p} onClick={()=>setSelectedPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{background:selectedPlatforms.includes(p)?C.purple+"22":C.bg,border:`1px solid ${selectedPlatforms.includes(p)?C.purple:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:selectedPlatforms.includes(p)?C.purple:C.muted,fontSize:12}}>{p}</div>)}
                  </div>
                </div>
              )}
              {/* Topic */}
              <div style={{display:"flex",gap:8}}>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：第一年做电商亏了RM50K的真实经历）"
                  style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontSize:13,outline:"none"}}
                  onKeyDown={e=>e.key==="Enter"&&generateScript()}/>
                <Btn onClick={generateScript} disabled={scriptLoading||!topic} color={C.purple}>
                  {scriptLoading?"生成中...":"✨ 生成"}
                </Btn>
              </div>
            </Panel>
            {scriptLoading&&<Panel><div style={{color:C.muted,textAlign:"center",padding:"32px 0"}}>🧠 Claude 正在为你生成专属脚本...</div></Panel>}
            {script&&(
              <Panel>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <SL>生成结果</SL>
                  <button onClick={()=>navigator.clipboard.writeText(script).then(()=>showToast("✅ 已复制！"))} style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:6,padding:"4px 12px",fontSize:11,cursor:"pointer"}}>📋 复制</button>
                </div>
                <div style={{color:C.text,fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:16,borderLeft:`3px solid ${C.purple}`}}>{script}</div>
              </Panel>
            )}
          </div>
        )}

        {/* ── TRENDS / 爆款 ── */}
        {nav==="trends"&&(
          <div>
            {/* Market Trends */}
            <Panel style={{marginBottom:16}}>
              <SL>🔥 市场爆款分析</SL>
              <div style={{color:C.muted,fontSize:12,marginBottom:12,lineHeight:1.6}}>
                AI 根据马来西亚华人市场趋势，分析你的行业当前什么内容在爆
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={trendsNiche} onChange={e=>setTrendsNiche(e.target.value)} placeholder="输入你的行业（如：电商、手表、时装、健身）"
                  style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}
                  onKeyDown={e=>e.key==="Enter"&&fetchTrends()}/>
                <Btn onClick={fetchTrends} disabled={loadingTrends||!trendsNiche} color={C.amber}>
                  {loadingTrends?"分析中...":"🔥 分析"}
                </Btn>
              </div>
              {/* Quick niche buttons */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["电商","手表","时装","健身","美食","旅游","个人品牌"].map(n=>(
                  <div key={n} onClick={()=>setTrendsNiche(n)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",color:C.muted,fontSize:11}}>{n}</div>
                ))}
              </div>
            </Panel>

            {loadingTrends&&<Panel><div style={{color:C.muted,textAlign:"center",padding:"32px 0"}}>🔥 AI 正在分析市场爆款趋势...</div></Panel>}

            {trends&&(
              <div>
                {/* Weekly insights */}
                {trends.weekly_insights&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>本周市场洞察</SL>
                    <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{trends.weekly_insights}</div>
                  </Panel>
                )}
                {/* Trending topics */}
                {(trends.trending_topics||[]).length>0&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>🔥 爆款话题</SL>
                    {trends.trending_topics.map((t,i)=>(
                      <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div style={{color:C.text,fontWeight:700,fontSize:14}}>{t.topic}</div>
                          <div style={{display:"flex",gap:4,flexShrink:0}}>
                            {(t.platforms||[]).map(p=><Pill key={p} text={p} color={C.blue}/>)}
                          </div>
                        </div>
                        <div style={{color:C.muted,fontSize:12,marginBottom:6}}>{t.why_trending}</div>
                        {t.sample_hook&&(
                          <div style={{background:C.purple+"11",border:`1px solid ${C.purple}33`,borderRadius:8,padding:8}}>
                            <div style={{color:C.muted,fontSize:10,marginBottom:2}}>示例Hook</div>
                            <div style={{color:C.purple,fontSize:12}}>"{t.sample_hook}"</div>
                          </div>
                        )}
                        <div style={{marginTop:8}}>
                          <ScoreBar value={t.virality_score||0}/>
                        </div>
                      </div>
                    ))}
                  </Panel>
                )}
                {/* Action items */}
                {(trends.action_items||[]).length>0&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>今天就可以做</SL>
                    {trends.action_items.map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.green,fontWeight:700}}>✓</div>
                        <div style={{color:C.text,fontSize:13}}>{a}</div>
                      </div>
                    ))}
                  </Panel>
                )}
                {/* Avoid */}
                {(trends.avoid_topics||[]).length>0&&(
                  <Panel>
                    <SL>⚠️ 现在不要碰</SL>
                    {trends.avoid_topics.map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"6px 0"}}>
                        <div style={{color:C.red}}>✕</div>
                        <div style={{color:C.muted,fontSize:13}}>{a}</div>
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            )}

            {/* Competitor Analysis */}
            <Panel style={{marginTop:16}}>
              <SL>🎯 对标账号分析 + 二次创作</SL>
              <div style={{color:C.muted,fontSize:12,marginBottom:12,lineHeight:1.6}}>
                输入你的对标账号，AI 分析他们的爆款规律，帮你生成专属的二次创作脚本
              </div>
              <textarea value={competitors} onChange={e=>setCompetitors(e.target.value)}
                placeholder={"输入对标账号（每行一个或逗号分隔）\n例如：\n@creator1\n@creator2\n@creator3"}
                rows={4} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit",marginBottom:10}}/>
              <Btn onClick={analyzeCompetitors} disabled={loadingComp||!competitors} color={C.purple} style={{width:"100%"}}>
                {loadingComp?"分析中...":"🎯 分析对标账号 + 生成二次创作脚本"}
              </Btn>
            </Panel>

            {loadingComp&&<Panel style={{marginTop:16}}><div style={{color:C.muted,textAlign:"center",padding:"32px 0"}}>🧠 AI 正在分析对标账号并生成二次创作脚本...</div></Panel>}

            {competitor&&(
              <div style={{marginTop:16}}>
                {/* Competitor insights */}
                {(competitor.competitor_insights||[]).length>0&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>竞品分析</SL>
                    {competitor.competitor_insights.map((c,i)=>(
                      <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:6}}>{c.account}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {(c.best_content_types||[]).map(t=><Pill key={t} text={t} color={C.cyan}/>)}
                        </div>
                        <div style={{color:C.muted,fontSize:12,marginBottom:4}}><span style={{color:C.amber}}>爆款公式：</span>{c.winning_formula}</div>
                        <div style={{color:C.muted,fontSize:12}}><span style={{color:C.green}}>做得好：</span>{c.what_works}</div>
                        {(c.hook_patterns||[]).length>0&&(
                          <div style={{marginTop:8,background:C.bg,borderRadius:8,padding:8}}>
                            <div style={{color:C.muted,fontSize:10,marginBottom:4}}>常用Hook</div>
                            {c.hook_patterns.map((h,j)=><div key={j} style={{color:C.purple,fontSize:12,marginBottom:2}}>"{h}"</div>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </Panel>
                )}

                {/* Recreation scripts */}
                {(competitor.recreation_scripts||[]).length>0&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>✨ 二次创作脚本</SL>
                    {competitor.recreation_scripts.map((s,i)=>(
                      <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.muted,fontSize:11,marginBottom:4}}>原概念：{s.original_concept}</div>
                        <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:8}}>你的版本：{s.your_version_title}</div>
                        <div style={{background:C.bg,borderRadius:8,padding:12}}>
                          <div style={{marginBottom:8}}><span style={{color:C.amber,fontSize:11}}>Hook（0-3秒）</span><div style={{color:C.text,fontSize:13,marginTop:2}}>{s.your_hook}</div></div>
                          <div style={{marginBottom:8}}><span style={{color:C.blue,fontSize:11}}>内容结构</span><div style={{color:C.text,fontSize:13,marginTop:2}}>{s.your_structure}</div></div>
                          <div style={{marginBottom:8}}><span style={{color:C.green,fontSize:11}}>CTA</span><div style={{color:C.text,fontSize:13,marginTop:2}}>{s.your_cta}</div></div>
                          <div><span style={{color:C.purple,fontSize:11}}>差异化</span><div style={{color:C.muted,fontSize:12,marginTop:2}}>{s.differentiation}</div></div>
                        </div>
                      </div>
                    ))}
                  </Panel>
                )}

                {/* Market gaps */}
                {(competitor.market_gaps||[]).length>0&&(
                  <Panel style={{marginBottom:16}}>
                    <SL>💎 市场空缺（你可以抢占的）</SL>
                    {competitor.market_gaps.map((g,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.amber,fontWeight:700}}>💎</div>
                        <div style={{color:C.text,fontSize:13}}>{g}</div>
                      </div>
                    ))}
                  </Panel>
                )}

                {/* Weekly plan */}
                {(competitor.weekly_plan||[]).length>0&&(
                  <Panel>
                    <SL>本周发布计划</SL>
                    {competitor.weekly_plan.map((p,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.green,fontWeight:700}}>✓</div>
                        <div style={{color:C.text,fontSize:13}}>{p}</div>
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {nav==="accounts"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <SL>账号管理</SL>
              <Btn onClick={()=>setAccountModal({id:Date.now(),username:"",name:"",token:"",color:C.purple,strategy:{}})} color={C.blue} style={{fontSize:12,padding:"8px 16px"}}>
                ✚ 添加账号
              </Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {accounts.map(acc=>(
                <Panel key={acc.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <IGAvatar username={acc.username} profilePicUrl={profiles[acc.id]?.profile_picture_url} color={acc.color} size={52}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.text,fontWeight:700,fontSize:14}}>{acc.name}</div>
                      <div style={{color:C.muted,fontSize:12}}>@{acc.username}</div>
                      {acc.strategy?.positioning&&<div style={{color:acc.color,fontSize:11,marginTop:2}}>📌 {acc.strategy.positioning}</div>}
                      {acc.strategy?.goal&&<div style={{color:C.muted,fontSize:11}}>🎯 {acc.strategy.goal}</div>}
                      <div style={{color:acc.token?C.green:C.red,fontSize:10,marginTop:2}}>{acc.token?"✅ Token 已设置":"⚠️ 需要设置 Token"}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                      <button onClick={()=>setAccountModal(acc)} style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>✏️ 编辑</button>
                      <button onClick={()=>setStrategyModal(acc)} style={{background:C.amber+"22",color:C.amber,border:`1px solid ${C.amber}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>📌 策略</button>
                      <button onClick={()=>syncAccount(acc)} style={{background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>🔄 同步</button>
                      {accounts.length>1&&<button onClick={()=>{if(confirm("确定删除？"))setAccounts(p=>p.filter(a=>a.id!==acc.id));}} style={{background:C.red+"22",color:C.red,border:`1px solid ${C.red}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>删除</button>}
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,background:"none",border:"none",padding:"9px 2px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:nav===n.id?`2px solid ${C.blue}`:"2px solid transparent"}}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span style={{color:nav===n.id?C.blue:C.muted,fontSize:9,fontWeight:nav===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {strategyModal&&<StrategyModal account={strategyModal} onSave={saveStrategy} onClose={()=>setStrategyModal(null)}/>}
      {accountModal&&<AccountModal editing={accountModal.username?accountModal:null} onSave={saveAccount} onClose={()=>setAccountModal(null)}/>}
    </div>
  );
}
