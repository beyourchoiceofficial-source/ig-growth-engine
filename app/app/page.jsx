"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#080b14", surface:"#0e1320", panel:"#131926", border:"#1e2a3a",
  blue:"#3b82f6", cyan:"#06b6d4", amber:"#f59e0b", green:"#22c55e",
  red:"#ef4444", purple:"#a855f7", pink:"#ec4899", text:"#e2e8f0",
  muted:"#64748b", dim:"#334155",
};

// Default accounts - users can add more
const DEFAULT_ACCOUNTS = [
  { id:1, username:"eugene_mkting55", name:"Eugene Marketing", color:C.purple, token:"" },
];

function Pill({text,color=C.blue}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function Panel({children,style={}}) {
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}}>{children}</div>;
}
function SL({children}) {
  return <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}
function Score({value,max=100}) {
  const pct = (value/max)*100;
  const color = pct>=80?C.green:pct>=60?C.amber:C.red;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,background:C.bg,borderRadius:4,height:6}}>
        <div style={{background:color,width:`${pct}%`,height:"100%",borderRadius:4,transition:"width 0.8s"}}/>
      </div>
      <span style={{color,fontWeight:700,fontSize:13,minWidth:32}}>{value}</span>
    </div>
  );
}

// ── IGAvatar ──────────────────────────────────────────────
function IGAvatar({username,color,size=40}) {
  const [ok,setOk]=useState(false);
  const initials = username.replace(/_/g," ").split(" ").map(w=>w[0]?.toUpperCase()||"").join("").slice(0,2);
  return (
    <div style={{width:size,height:size,borderRadius:size*0.25,border:`2px solid ${color}`,overflow:"hidden",flexShrink:0,background:color+"22"}}>
      <img src={`https://unavatar.io/instagram/${username}`} alt={username}
        style={{width:"100%",height:"100%",objectFit:"cover",display:ok?"block":"none"}}
        onLoad={()=>setOk(true)} onError={()=>setOk(false)}/>
      {!ok && <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:size*0.28}}>{initials}</div>}
    </div>
  );
}

// ── Strategy Modal ────────────────────────────────────────
function StrategyModal({account,onSave,onClose}) {
  const [form,setForm]=useState(account.strategy||{
    positioning:"",audience:"",goal:"",style:"",language:"中文为主，适当加马来西亚华人口语"
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.borderHi||C.blue}`,borderRadius:18,padding:24,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{color:C.text,fontWeight:800,fontSize:17}}>账号策略档案</div>
            <div style={{color:C.muted,fontSize:12}}>@{account.username}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {[
          {l:"账号定位",k:"positioning",p:"例：马来西亚华人电商教育 / 手表销售 / 健身"},
          {l:"目标受众",k:"audience",p:"例：25-40岁想做电商的马来西亚华人"},
          {l:"想要的结果",k:"goal",p:"例：涨粉到10万 + 每月卖出50个产品"},
          {l:"内容风格",k:"style",p:"例：真实故事 + 干货教育 + 偶尔娱乐"},
          {l:"语言风格",k:"language",p:"例：中文为主，适当加马来西亚口语"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{f.l}</div>
            <textarea value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} rows={2}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px",color:C.muted,fontSize:14,cursor:"pointer"}}>取消</button>
          <button onClick={()=>onSave(form)} style={{flex:2,background:C.blue,border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>💾 保存策略</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Account Modal ─────────────────────────────────────
function AddAccountModal({onSave,onClose}) {
  const [username,setUsername]=useState("");
  const [token,setToken]=useState("");
  const [name,setName]=useState("");
  const colors=[C.purple,C.amber,C.pink,C.cyan,C.blue,C.green];
  const [color,setColor]=useState(C.purple);
  return (
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.blue}`,borderRadius:18,padding:24,width:"100%",maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontWeight:800,fontSize:17}}>添加 IG 账号</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {/* Preview */}
        <div style={{display:"flex",alignItems:"center",gap:12,background:C.panel,borderRadius:12,padding:14,marginBottom:16}}>
          <IGAvatar username={username||"instagram"} color={color} size={48}/>
          <div>
            <div style={{color:C.text,fontWeight:700}}>{name||"账号名称"}</div>
            <div style={{color:C.muted,fontSize:12}}>@{username||"username"}</div>
          </div>
        </div>
        {[
          {l:"Instagram 用户名（不含@）",v:username,set:setUsername,p:"eugene_mkting55"},
          {l:"显示名称",v:name,set:setName,p:"Eugene Marketing"},
          {l:"Access Token（保密）",v:token,set:setToken,p:"粘贴你的 IG Access Token"},
        ].map(f=>(
          <div key={f.l} style={{marginBottom:12}}>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{f.l}</div>
            <input value={f.v} onChange={e=>f.set(e.target.value)} placeholder={f.p} type={f.l.includes("Token")?"password":"text"}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:8}}>主题颜色</div>
          <div style={{display:"flex",gap:8}}>
            {colors.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,boxShadow:color===c?`0 0 8px ${c}`:"none"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px",color:C.muted,cursor:"pointer"}}>取消</button>
          <button onClick={()=>username&&token&&onSave({id:Date.now(),username,name:name||username,color,token,strategy:{}})}
            disabled={!username||!token}
            style={{flex:2,background:username&&token?C.blue:"#333",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontWeight:700,cursor:username&&token?"pointer":"not-allowed"}}>
            ✚ 添加账号
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
const NAVS=[
  {id:"home",label:"总部",icon:"⚡"},
  {id:"posts",label:"视频",icon:"🎬"},
  {id:"analyze",label:"分析",icon:"🧬"},
  {id:"script",label:"脚本",icon:"✍️"},
  {id:"calendar",label:"日历",icon:"📅"},
  {id:"accounts",label:"账号",icon:"⚙️"},
];

export default function App() {
  const [nav,setNav]=useState("home");
  const [accounts,setAccounts]=useState(()=>{
    try{const s=localStorage.getItem("ig_accounts_v3");return s?JSON.parse(s):DEFAULT_ACCOUNTS;}catch{return DEFAULT_ACCOUNTS;}
  });
  const [activeAccId,setActiveAccId]=useState(1);
  const [posts,setPosts]=useState({});
  const [profiles,setProfiles]=useState({});
  const [insights,setInsights]=useState({});
  const [syncing,setSyncing]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [toast,setToast]=useState(null);
  const [strategyModal,setStrategyModal]=useState(null);
  const [addModal,setAddModal]=useState(false);
  // Script state
  const [topic,setTopic]=useState("");
  const [format,setFormat]=useState("Reel");
  const [platforms,setPlatforms]=useState(["Instagram","TikTok"]);
  const [script,setScript]=useState("");
  const [scriptLoading,setScriptLoading]=useState(false);

  const activeAcc = accounts.find(a=>a.id===activeAccId)||accounts[0];
  const activePosts = posts[activeAccId]||[];
  const activeProfile = profiles[activeAccId];
  const activeInsight = insights[activeAccId];

  useEffect(()=>{
    try{localStorage.setItem("ig_accounts_v3",JSON.stringify(accounts));}catch{}
  },[accounts]);

  const showToast=(msg,color=C.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),4000);};

  async function syncAccount(acc) {
    if(!acc.token) { showToast("请先设置 Access Token",C.red); return; }
    setSyncing(true);
    try {
      const res = await fetch(`/api/ig?token=${encodeURIComponent(acc.token)}`);
      const data = await res.json();
      if(data.error) showToast("❌ "+data.error,C.red);
      else {
        setPosts(p=>({...p,[acc.id]:data.posts||[]}));
        setProfiles(p=>({...p,[acc.id]:data.profile}));
        showToast(`✅ @${data.profile?.username} 同步成功！${data.synced} 条`);
      }
    } catch(e){showToast("❌ "+e.message,C.red);}
    setSyncing(false);
  }

  async function analyzeAccount() {
    if(!activePosts.length){showToast("请先同步数据",C.red);return;}
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({posts:activePosts,strategy:activeAcc.strategy||{}})
      });
      const data = await res.json();
      if(data.error) showToast("❌ "+data.error,C.red);
      else { setInsights(i=>({...i,[activeAccId]:data.analysis})); showToast("✅ AI 分析完成！"); }
    } catch(e){showToast("❌ "+e.message,C.red);}
    setAnalyzing(false);
  }

  async function generateScript() {
    if(!topic){showToast("请输入主题",C.red);return;}
    setScriptLoading(true); setScript("");
    try {
      const res = await fetch("/api/generate",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:format,topic,platforms,strategy:activeAcc.strategy||{}})
      });
      const data = await res.json();
      setScript(data.content||data.error||"生成失败");
    } catch(e){setScript("生成失败: "+e.message);}
    setScriptLoading(false);
  }

  function saveStrategy(strategy) {
    setAccounts(prev=>prev.map(a=>a.id===strategyModal.id?{...a,strategy}:a));
    setStrategyModal(null);
    showToast("✅ 策略档案已保存！");
  }

  function addAccount(acc) {
    setAccounts(prev=>[...prev,acc]);
    setAddModal(false);
    showToast("✅ 账号添加成功！");
  }

  function removeAccount(id) {
    setAccounts(prev=>prev.filter(a=>a.id!==id));
    if(activeAccId===id) setActiveAccId(accounts[0]?.id);
  }

  const avgER = activePosts.length ? (activePosts.reduce((s,p)=>s+parseFloat(p.engagement_rate||0),0)/activePosts.length).toFixed(1) : 0;
  const sortedPosts = [...activePosts].sort((a,b)=>b.engagement_rate-a.engagement_rate);

  // Calendar data
  const PLATFORMS_ALL = ["Instagram","Facebook","TikTok","小红书","抖音"];
  const CONTENT_TYPES = ["教育型🎓","故事型🔥","娱乐型😂","促销型🛒"];
  const today = new Date();
  const calendarDays = Array.from({length:14},(_,i)=>{
    const d = new Date(today);
    d.setDate(d.getDate()+i);
    return d;
  });

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontWeight:800,fontSize:14}}>IG Pro</div>
          <div style={{color:C.muted,fontSize:9,letterSpacing:1}}>JES GROUP · 内容情报系统</div>
        </div>
        {/* Account Switcher */}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {accounts.map(acc=>(
            <div key={acc.id} onClick={()=>setActiveAccId(acc.id)} title={`@${acc.username}`}
              style={{cursor:"pointer",opacity:activeAccId===acc.id?1:0.5,transition:"opacity 0.2s",
                border:`2px solid ${activeAccId===acc.id?acc.color:"transparent"}`,borderRadius:10}}>
              <IGAvatar username={acc.username} color={acc.color} size={30}/>
            </div>
          ))}
          <div onClick={()=>setAddModal(true)} style={{width:30,height:30,borderRadius:8,background:C.panel,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontSize:16}}>+</div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,zIndex:200,boxShadow:"0 4px 20px #0008",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {/* Content */}
      <div style={{flex:1,padding:"16px",maxWidth:800,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* HOME */}
        {nav==="home" && (
          <div>
            {/* Active Account Card */}
            <div style={{background:`linear-gradient(135deg,${activeAcc.color}15,${C.purple}08)`,border:`1px solid ${activeAcc.color}30`,borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <IGAvatar username={activeAcc.username} color={activeAcc.color} size={64}/>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontSize:20,fontWeight:800}}>@{activeAcc.username}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:2}}>{activeAcc.name}</div>
                  {activeAcc.strategy?.positioning && (
                    <div style={{color:activeAcc.color,fontSize:11,marginTop:4}}>📌 {activeAcc.strategy.positioning}</div>
                  )}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:activeAcc.color,fontSize:28,fontWeight:800}}>{activeProfile?.followers_count?.toLocaleString()||"--"}</div>
                  <div style={{color:C.muted,fontSize:11}}>粉丝</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>syncAccount(activeAcc)} disabled={syncing} style={{flex:1,background:C.green,color:"#fff",border:"none",borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:syncing?"not-allowed":"pointer",opacity:syncing?0.6:1}}>
                  {syncing?"⏳ 同步中...":"🔄 同步数据"}
                </button>
                <button onClick={()=>setStrategyModal(activeAcc)} style={{flex:1,background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  📌 策略档案
                </button>
              </div>
            </div>

            {/* Stats */}
            {activePosts.length>0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                {[
                  {l:"帖子总数",v:activePosts.length,c:C.purple},
                  {l:"平均互动率",v:`${avgER}%`,c:C.blue},
                  {l:"总赞数",v:activePosts.reduce((s,p)=>s+(p.likes||0),0).toLocaleString(),c:C.pink},
                ].map(s=>(
                  <Panel key={s.l} style={{padding:"14px 16px"}}>
                    <div style={{color:C.muted,fontSize:10}}>{s.l}</div>
                    <div style={{color:s.c,fontSize:22,fontWeight:800,marginTop:4}}>{s.v}</div>
                  </Panel>
                ))}
              </div>
            )}

            {/* All Accounts Overview */}
            <Panel>
              <SL>所有账号总览</SL>
              {accounts.map(acc=>(
                <div key={acc.id} onClick={()=>{setActiveAccId(acc.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <IGAvatar username={acc.username} color={acc.color} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.text,fontWeight:600,fontSize:13}}>{acc.name}</div>
                    <div style={{color:C.muted,fontSize:11}}>@{acc.username}</div>
                    {acc.strategy?.goal && <div style={{color:acc.color,fontSize:10,marginTop:2}}>🎯 {acc.strategy.goal}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:acc.color,fontWeight:700}}>{profiles[acc.id]?.followers_count?.toLocaleString()||"--"}</div>
                    <div style={{color:C.muted,fontSize:10}}>粉丝</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();syncAccount(acc);}} style={{background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>同步</button>
                    <button onClick={e=>{e.stopPropagation();setStrategyModal(acc);}} style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>策略</button>
                  </div>
                </div>
              ))}
              <button onClick={()=>setAddModal(true)} style={{width:"100%",marginTop:12,background:"none",border:`1px dashed ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,fontSize:13,cursor:"pointer"}}>
                ✚ 添加新账号
              </button>
            </Panel>

            {/* AI Insight Summary */}
            {activeInsight && (
              <Panel style={{marginTop:16}}>
                <SL>🤖 最新 AI 分析</SL>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {activeInsight.best_post_type && <Pill text={`最佳类型：${activeInsight.best_post_type}`} color={C.blue}/>}
                  {activeInsight.best_time && <Pill text={`最佳时间：${activeInsight.best_time}`} color={C.amber}/>}
                  {activeInsight.best_hook && <Pill text={`最强Hook：${activeInsight.best_hook}`} color={C.purple}/>}
                </div>
                {activeInsight.tomorrow_idea && (
                  <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12}}>
                    <div style={{color:C.green,fontSize:11,marginBottom:4}}>💡 明天发什么</div>
                    <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{activeInsight.tomorrow_idea}</div>
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {/* POSTS / VIDEOS */}
        {nav==="posts" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <SL>视频列表 @{activeAcc.username}</SL>
              </div>
              <button onClick={()=>syncAccount(activeAcc)} disabled={syncing} style={{background:C.green,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",opacity:syncing?0.6:1}}>
                {syncing?"同步中...":"🔄 同步"}
              </button>
            </div>
            {activePosts.length===0 && <Panel><div style={{color:C.muted,textAlign:"center",padding:"30px 0"}}>请先同步数据</div></Panel>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sortedPosts.map((post,i)=>(
                <Panel key={post.ig_post_id||i}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    {post.thumbnail_url && (
                      <a href={post.permalink} target="_blank" rel="noreferrer">
                        <img src={post.thumbnail_url} style={{width:64,height:64,borderRadius:10,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>
                      </a>
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.text,fontSize:13,marginBottom:6,lineHeight:1.5}}>{post.caption?.substring(0,100)||"(无文案)"}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                        <Pill text={post.type||"POST"} color={C.cyan}/>
                        <Pill text={`❤️ ${post.likes||0}`} color={C.pink}/>
                        <Pill text={`💬 ${post.comments||0}`} color={C.blue}/>
                        <Pill text={`🔖 ${post.saves||0}`} color={C.purple}/>
                        <Pill text={`👁 ${post.reach||0}`} color={C.amber}/>
                      </div>
                      {/* Hook Analysis */}
                      {activeInsight?.video_analysis?.[i] && (
                        <div style={{background:C.bg,borderRadius:8,padding:10}}>
                          <div style={{color:C.muted,fontSize:10,marginBottom:6}}>AI 视频分析</div>
                          <div style={{marginBottom:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{color:C.muted,fontSize:11}}>Hook 强度</span>
                            </div>
                            <Score value={activeInsight.video_analysis[i].hook_score||0}/>
                            <div style={{color:C.amber,fontSize:11,marginTop:3}}>{activeInsight.video_analysis[i].hook_feedback}</div>
                          </div>
                          <div style={{marginBottom:6}}>
                            <div style={{color:C.muted,fontSize:11,marginBottom:3}}>CTA 强度</div>
                            <Score value={activeInsight.video_analysis[i].cta_score||0}/>
                            <div style={{color:C.cyan,fontSize:11,marginTop:3}}>{activeInsight.video_analysis[i].cta_feedback}</div>
                          </div>
                          {activeInsight.video_analysis[i].improvement && (
                            <div style={{background:C.green+"11",borderRadius:6,padding:8,marginTop:6}}>
                              <div style={{color:C.green,fontSize:11}}>💡 {activeInsight.video_analysis[i].improvement}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:parseFloat(post.engagement_rate)>5?C.green:C.amber,fontWeight:800,fontSize:18}}>{post.engagement_rate}%</div>
                      <div style={{color:C.muted,fontSize:10}}>互动率</div>
                      {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11,textDecoration:"none",display:"block",marginTop:4}}>▶ 查看</a>}
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {/* ANALYZE */}
        {nav==="analyze" && (
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>AI 内容分析引擎</SL>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <IGAvatar username={activeAcc.username} color={activeAcc.color} size={40}/>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontWeight:700}}>@{activeAcc.username}</div>
                  <div style={{color:C.muted,fontSize:12}}>{activePosts.length} 条内容 · {activeAcc.strategy?.positioning||"未设置策略档案"}</div>
                </div>
                {!activeAcc.strategy?.positioning && (
                  <button onClick={()=>setStrategyModal(activeAcc)} style={{background:C.amber+"22",color:C.amber,border:`1px solid ${C.amber}44`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>
                    ⚠️ 设置策略
                  </button>
                )}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>syncAccount(activeAcc)} disabled={syncing} style={{flex:1,background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  {syncing?"同步中...":"🔄 先同步数据"}
                </button>
                <button onClick={analyzeAccount} disabled={analyzing||activePosts.length===0} style={{flex:2,background:analyzing||activePosts.length===0?"#333":C.purple,color:"#fff",border:"none",borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:analyzing||activePosts.length===0?"not-allowed":"pointer"}}>
                  {analyzing?"🧠 分析中...":"🤖 开始 AI 分析"}
                </button>
              </div>
            </Panel>

            {activeInsight && (
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
                  {activeInsight.tomorrow_idea && (
                    <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12,marginBottom:12}}>
                      <div style={{color:C.green,fontWeight:700,marginBottom:6}}>💡 明天发什么</div>
                      <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{activeInsight.tomorrow_idea}</div>
                    </div>
                  )}
                  {(activeInsight.recommendations||[]).length>0 && (
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

                {/* Video by Video Analysis */}
                {(activeInsight.video_analysis||[]).length>0 && (
                  <Panel>
                    <SL>逐条视频分析</SL>
                    {activeInsight.video_analysis.map((v,i)=>(
                      <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.text,fontSize:12,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.caption}...</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                          <div>
                            <div style={{color:C.muted,fontSize:10,marginBottom:4}}>Hook 强度</div>
                            <Score value={v.hook_score||0}/>
                            <div style={{color:C.amber,fontSize:11,marginTop:3}}>{v.hook_feedback}</div>
                          </div>
                          <div>
                            <div style={{color:C.muted,fontSize:10,marginBottom:4}}>CTA 强度</div>
                            <Score value={v.cta_score||0}/>
                            <div style={{color:C.cyan,fontSize:11,marginTop:3}}>{v.cta_feedback}</div>
                          </div>
                        </div>
                        {v.improvement && (
                          <div style={{background:C.green+"11",borderRadius:8,padding:8}}>
                            <span style={{color:C.green,fontSize:12}}>💡 {v.improvement}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            )}
          </div>
        )}

        {/* SCRIPT GENERATOR */}
        {nav==="script" && (
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>跨平台脚本生成器</SL>
              {activeAcc.strategy?.positioning && (
                <div style={{background:C.blue+"11",border:`1px solid ${C.blue}33`,borderRadius:8,padding:10,marginBottom:14}}>
                  <div style={{color:C.muted,fontSize:10,marginBottom:2}}>当前策略档案</div>
                  <div style={{color:C.blue,fontSize:12}}>📌 {activeAcc.strategy.positioning}</div>
                  <div style={{color:C.muted,fontSize:11}}>🎯 {activeAcc.strategy.goal}</div>
                </div>
              )}
              {/* Format */}
              <div style={{marginBottom:12}}>
                <div style={{color:C.muted,fontSize:11,marginBottom:6}}>内容格式</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Reel","Carousel","Photo","Story","Live"].map(f=>(
                    <div key={f} onClick={()=>setFormat(f)} style={{background:format===f?C.blue+"22":C.bg,border:`1px solid ${format===f?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:format===f?C.blue:C.muted,fontSize:12}}>{f}</div>
                  ))}
                </div>
              </div>
              {/* Platforms */}
              <div style={{marginBottom:12}}>
                <div style={{color:C.muted,fontSize:11,marginBottom:6}}>目标平台（可多选）</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {PLATFORMS_ALL.map(p=>(
                    <div key={p} onClick={()=>setPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])}
                      style={{background:platforms.includes(p)?C.purple+"22":C.bg,border:`1px solid ${platforms.includes(p)?C.purple:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:platforms.includes(p)?C.purple:C.muted,fontSize:12}}>{p}</div>
                  ))}
                </div>
              </div>
              {/* Topic */}
              <div style={{display:"flex",gap:10}}>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：第一年创业亏了RM50K的真实故事）"
                  style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontSize:13,outline:"none"}}
                  onKeyDown={e=>e.key==="Enter"&&generateScript()}/>
                <button onClick={generateScript} disabled={scriptLoading||!topic} style={{background:scriptLoading||!topic?"#333":C.purple,color:"#fff",border:"none",borderRadius:8,padding:"11px 18px",fontSize:13,fontWeight:700,cursor:scriptLoading||!topic?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
                  {scriptLoading?"生成中...":"✨ 生成脚本"}
                </button>
              </div>
            </Panel>
            {scriptLoading && <Panel><div style={{color:C.muted,textAlign:"center",padding:"32px 0"}}>🧠 Claude 正在生成跨平台脚本...</div></Panel>}
            {script && (
              <Panel>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <SL>生成结果</SL>
                  <button onClick={()=>navigator.clipboard.writeText(script).then(()=>showToast("✅ 已复制！"))}
                    style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:6,padding:"4px 12px",fontSize:11,cursor:"pointer"}}>
                    📋 复制全部
                  </button>
                </div>
                <div style={{color:C.text,fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:16,borderLeft:`3px solid ${C.purple}`}}>{script}</div>
              </Panel>
            )}
          </div>
        )}

        {/* CALENDAR */}
        {nav==="calendar" && (
          <div>
            <SL>14天内容日历</SL>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {calendarDays.map((day,i)=>{
                const isToday = i===0;
                const dayName = ["周日","周一","周二","周三","周四","周五","周六"][day.getDay()];
                const isBestDay = day.getDay()===5||day.getDay()===6;
                return (
                  <Panel key={i} style={{borderColor:isToday?C.blue:isBestDay?C.green+44:C.border}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{textAlign:"center",minWidth:44}}>
                        <div style={{color:isToday?C.blue:C.muted,fontSize:10,fontWeight:600}}>{dayName}</div>
                        <div style={{color:isToday?C.blue:C.text,fontSize:20,fontWeight:800}}>{day.getDate()}</div>
                        {isBestDay && <div style={{color:C.green,fontSize:9}}>最佳</div>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {CONTENT_TYPES.filter((_,idx)=>idx===i%4||(isBestDay&&idx<2)).map(t=>(
                            <Pill key={t} text={t} color={isBestDay?C.green:C.blue}/>
                          ))}
                        </div>
                        <div style={{color:C.muted,fontSize:11,marginTop:4}}>
                          {isBestDay?"⚡ 高峰时段：9PM 发布":"推荐时段：8PM 发布"}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        {["IG","FB","TK"].map(p=>(
                          <div key={p} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 8px",fontSize:10,color:C.muted}}>{p}</div>
                        ))}
                      </div>
                    </div>
                  </Panel>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCOUNTS */}
        {nav==="accounts" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <SL>账号管理</SL>
              <button onClick={()=>setAddModal(true)} style={{background:`linear-gradient(135deg,${C.blue},${C.purple})`,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                ✚ 添加账号
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {accounts.map(acc=>(
                <Panel key={acc.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <IGAvatar username={acc.username} color={acc.color} size={48}/>
                    <div style={{flex:1}}>
                      <div style={{color:C.text,fontWeight:700,fontSize:14}}>{acc.name}</div>
                      <div style={{color:C.muted,fontSize:12}}>@{acc.username}</div>
                      {acc.strategy?.positioning && <div style={{color:acc.color,fontSize:11,marginTop:2}}>📌 {acc.strategy.positioning}</div>}
                      {acc.strategy?.goal && <div style={{color:C.muted,fontSize:11}}>🎯 {acc.strategy.goal}</div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0,flexDirection:"column"}}>
                      <button onClick={()=>setStrategyModal(acc)} style={{background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>
                        📌 策略档案
                      </button>
                      <button onClick={()=>syncAccount(acc)} style={{background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>
                        🔄 同步
                      </button>
                      {accounts.length>1 && (
                        <button onClick={()=>removeAccount(acc.id)} style={{background:C.red+"22",color:C.red,border:`1px solid ${C.red}44`,borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>
                          删除
                        </button>
                      )}
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
          <button key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,background:"none",border:"none",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:nav===n.id?`2px solid ${C.blue}`:"2px solid transparent"}}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span style={{color:nav===n.id?C.blue:C.muted,fontSize:9,fontWeight:nav===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {strategyModal && <StrategyModal account={strategyModal} onSave={saveStrategy} onClose={()=>setStrategyModal(null)}/>}
      {addModal && <AddAccountModal onSave={addAccount} onClose={()=>setAddModal(false)}/>}
    </div>
  );
}
