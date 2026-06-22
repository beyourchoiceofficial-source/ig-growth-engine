"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#080b14", surface:"#0e1320", panel:"#131926", border:"#1e2a3a", borderHi:"#2a4060",
  blue:"#3b82f6", cyan:"#06b6d4", amber:"#f59e0b",
  green:"#22c55e", red:"#ef4444", purple:"#a855f7", pink:"#ec4899",
  text:"#e2e8f0", muted:"#64748b", dim:"#334155",
};

const DEFAULT_ACCOUNTS = [
  { id:1, handle:"eugene_mkting55",      name:"Eugene Marketing", color:C.purple, cat:"个人品牌",  followers:2847,  growth:234, er:4.2, viralScore:62 },
  { id:2, handle:"jes_watches_official", name:"JES Watches",      color:C.amber,  cat:"手表电商",  followers:8320,  growth:512, er:3.8, viralScore:71 },
  { id:3, handle:"jes_fashion_melaka",   name:"JES Fashion",      color:C.pink,   cat:"时装电商",  followers:5640,  growth:318, er:5.1, viralScore:78 },
  { id:4, handle:"igniva_media",         name:"Igniva Media",     color:C.cyan,   cat:"内容机构",  followers:3210,  growth:89,  er:6.3, viralScore:85 },
];

const CAT_OPTIONS = ["个人品牌","手表电商","时装电商","包袋电商","内容机构","餐饮","美妆","其他"];
const COLOR_OPTIONS = [C.purple, C.amber, C.pink, C.cyan, C.blue, C.green, "#f97316", "#e11d48"];

const VIRAL_FORMULAS = [
  { name:"情绪钩子", tip:"愤怒/好奇/共鸣开场，前3秒决定留存率" },
  { name:"信息密度", tip:"Carousel每页一个核心点，不稀释" },
  { name:"保存诱因", tip:"'截图留着用'的内容，算法最爱" },
  { name:"评论触发", tip:"结尾问让人忍不住回答的问题" },
  { name:"分享动机", tip:"让受众觉得分享给朋友是帮了他们" },
];

const GROWTH_HACKS = [
  { id:1, title:"Collab Reel 联名", impact:"🚀 爆炸级", effort:"中", desc:"找同量级但不同领域账号合拍，双方粉丝互相曝光" },
  { id:2, title:"评论区置顶钩子", impact:"🔥 高", effort:"低", desc:"发布后立即在评论区留一条能引发互动的问题/补充" },
  { id:3, title:"Reel 黄金6秒法则", impact:"🔥 高", effort:"中", desc:"前6秒必须出现最震撼画面+文字钩子，不能有前奏" },
  { id:4, title:"Story 投票互动", impact:"⚡ 中", effort:"极低", desc:"每天Story发一个投票，保持账号活跃度分高" },
  { id:5, title:"竞品评论区引流", impact:"🔥 高", effort:"低", desc:"在竞品热门帖评论区留有价值的补充，吸引粉丝过来" },
  { id:6, title:"Carousel 最后一页CTA", impact:"⚡ 中", effort:"低", desc:"最后一页放强力CTA：'保存这个你以后会用到'" },
  { id:7, title:"跨平台内容复用", impact:"🚀 爆炸级", effort:"高", desc:"同一内容改编成Reel+Carousel+Story+TikTok+小红书" },
  { id:8, title:"热点借势发帖", impact:"🔥 高", effort:"中", desc:"马来西亚热搜+你的领域结合，48小时内发出" },
];

const POSTING_TIMES = [
  { day:"周一", slots:[{t:"7:00",s:65},{t:"12:30",s:72},{t:"20:00",s:91}] },
  { day:"周二", slots:[{t:"7:30",s:68},{t:"13:00",s:70},{t:"21:00",s:88}] },
  { day:"周三", slots:[{t:"7:00",s:71},{t:"12:00",s:69},{t:"20:30",s:94}] },
  { day:"周四", slots:[{t:"8:00",s:64},{t:"13:30",s:67},{t:"20:00",s:89}] },
  { day:"周五", slots:[{t:"7:30",s:73},{t:"12:00",s:75},{t:"21:00",s:96}] },
  { day:"周六", slots:[{t:"10:00",s:88},{t:"15:00",s:82},{t:"21:30",s:90}] },
  { day:"周日", slots:[{t:"10:30",s:85},{t:"15:30",s:79},{t:"20:00",s:92}] },
];

const GROWTH_SYSTEM = `你是专门为马来西亚华人账号打造百万流量的Instagram增长策略师。你深度了解Instagram算法、马来西亚华人消费心理、电商内容策略。回答要具体可执行，用中文，适当加入马来西亚华人口语。`;

async function askClaude(system, user) {
  const res = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ system, messages:[{role:"user",content:user}] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "分析失败，请重试";
}

// ── IGAvatar ──────────────────────────────────────────────────
function IGAvatar({ handle, color, size=40, style={} }) {
  const [status, setStatus] = useState("loading");
  const src = `https://unavatar.io/instagram/${handle}`;
  const initials = handle.replace(/_/g," ").split(" ").map(w=>w[0]?.toUpperCase()||"").join("").slice(0,2);
  return (
    <div style={{width:size,height:size,borderRadius:size*0.28,border:`2px solid ${color}`,
      overflow:"hidden",flexShrink:0,background:color+"22",...style}}>
      <img src={src} alt={handle}
        style={{width:"100%",height:"100%",objectFit:"cover",display:status==="ok"?"block":"none"}}
        onLoad={()=>setStatus("ok")} onError={()=>setStatus("err")}/>
      {status!=="ok" && (
        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
          color,fontWeight:800,fontSize:size*0.3,background:`linear-gradient(135deg,${color}22,${color}44)`}}>
          {initials}
        </div>
      )}
    </div>
  );
}

function ViralMeter({ score, color, size=80 }) {
  const r=size*0.38,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  const dash=(score/100)*circ*0.75;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(135deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={size*0.07} strokeDasharray={`${circ*0.75} ${circ}`} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.07} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 ${score>=80?8:3}px ${color})`,transition:"stroke-dasharray 0.8s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{color,fontWeight:800,fontSize:size*0.22,lineHeight:1}}>{score}</div>
        <div style={{color:C.muted,fontSize:size*0.11,letterSpacing:1}}>VIRAL</div>
      </div>
    </div>
  );
}

function Pill({text,color=C.blue,size="sm"}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,
    padding:size==="sm"?"2px 10px":"4px 14px",fontSize:size==="sm"?11:13,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function Panel({children,style={},onClick,onMouseEnter,onMouseLeave}) {
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}}
    onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</div>;
}
function SL({children}) {
  return <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}
function AIBox({loading,result,placeholder}) {
  if(loading) return <div style={{textAlign:"center",padding:"32px 0",color:C.muted}}>
    <div style={{fontSize:28,marginBottom:8}}>⚙️</div><div style={{fontSize:13}}>Claude 分析中...</div></div>;
  if(result) return <div style={{background:C.bg,borderRadius:10,padding:16,color:"#cbd5e1",
    fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",borderLeft:`3px solid ${C.blue}`}}>{result}</div>;
  return <div style={{color:C.dim,fontSize:13,textAlign:"center",padding:"24px 0"}}>{placeholder||"点击按钮获取分析"}</div>;
}

// ── Account Modal ─────────────────────────────────────────────
function AccountModal({ onClose, onSave, editing }) {
  const [form, setForm] = useState(editing||{handle:"",name:"",cat:"个人品牌",color:C.purple,followers:0,growth:0,er:0,viralScore:50});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const valid=form.handle.trim()&&form.name.trim();
  return (
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:24,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontWeight:800,fontSize:17}}>{editing?"编辑账号":"添加新账号"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,background:C.panel,borderRadius:12,padding:14}}>
          <IGAvatar handle={form.handle||"instagram"} color={form.color} size={52}/>
          <div>
            <div style={{color:C.text,fontWeight:700}}>{form.name||"账号名称"}</div>
            <div style={{color:C.muted,fontSize:12}}>@{form.handle||"username"}</div>
            <div style={{marginTop:4}}><Pill text={form.cat} color={form.color}/></div>
          </div>
        </div>
        {[{l:"Instagram 用户名（不含@）",k:"handle",p:"eugene_mkting55",t:"text"},
          {l:"显示名称",k:"name",p:"Eugene Marketing",t:"text"},
          {l:"粉丝数",k:"followers",p:"0",t:"number"},
          {l:"本月增长",k:"growth",p:"0",t:"number"},
          {l:"平均互动率 (%)",k:"er",p:"3.5",t:"number"},
          {l:"病毒力评分 (0-100)",k:"viralScore",p:"50",t:"number"},
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{f.l}</div>
            <input type={f.t} value={form[f.k]} onChange={e=>set(f.k,f.t==="number"?parseFloat(e.target.value)||0:e.target.value)} placeholder={f.p}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:5}}>账号类别</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {CAT_OPTIONS.map(c=><div key={c} onClick={()=>set("cat",c)} style={{background:form.cat===c?form.color+"22":C.bg,border:`1px solid ${form.cat===c?form.color:C.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",color:form.cat===c?form.color:C.muted,fontSize:12,fontWeight:form.cat===c?700:400}}>{c}</div>)}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:5}}>主题颜色</div>
          <div style={{display:"flex",gap:8}}>
            {COLOR_OPTIONS.map(col=><div key={col} onClick={()=>set("color",col)} style={{width:28,height:28,borderRadius:8,background:col,cursor:"pointer",border:`2px solid ${form.color===col?"#fff":"transparent"}`,boxShadow:form.color===col?`0 0 8px ${col}`:"none",transition:"all 0.2s"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px",color:C.muted,fontSize:14,cursor:"pointer"}}>取消</button>
          <button onClick={()=>valid&&onSave({...form,id:editing?.id||Date.now()})} disabled={!valid}
            style={{flex:2,background:valid?form.color:"#333",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:700,cursor:valid?"pointer":"not-allowed",boxShadow:valid?`0 0 16px ${form.color}55`:"none"}}>
            {editing?"保存修改":"✚ 添加账号"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ account, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onCancel}>
      <div style={{background:C.surface,border:`1px solid ${C.red}44`,borderRadius:16,padding:24,maxWidth:320,width:"100%",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
        <div style={{color:C.text,fontWeight:700,fontSize:16,marginBottom:8}}>确认删除账号？</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
          <IGAvatar handle={account.handle} color={account.color} size={36}/>
          <div style={{textAlign:"left"}}>
            <div style={{color:account.color,fontWeight:700}}>{account.name}</div>
            <div style={{color:C.muted,fontSize:12}}>@{account.handle}</div>
          </div>
        </div>
        <div style={{color:C.muted,fontSize:13,marginBottom:20}}>这个操作无法撤销</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",color:C.muted,fontSize:14,cursor:"pointer"}}>取消</button>
          <button onClick={onConfirm} style={{flex:1,background:C.red,border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>删除</button>
        </div>
      </div>
    </div>
  );
}

// ── Views ─────────────────────────────────────────────────────
function CommandCenter({ accounts, onNav, onManage }) {
  const total=accounts.reduce((s,a)=>s+a.followers,0);
  const growth=accounts.reduce((s,a)=>s+a.growth,0);
  const top=[...accounts].sort((a,b)=>b.viralScore-a.viralScore)[0];
  return (
    <div>
      <div style={{background:`linear-gradient(135deg,${C.blue}15,${C.purple}10)`,border:`1px solid ${C.blue}30`,borderRadius:16,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{color:C.muted,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>总粉丝数</div>
          <div style={{color:C.text,fontSize:36,fontWeight:800,letterSpacing:-1}}>{total.toLocaleString()}</div>
          <div style={{color:C.green,fontSize:13,marginTop:2}}>▲ +{growth} 本月 · 距百万还差 {Math.max(0,1000000-total).toLocaleString()}</div>
        </div>
        {top && <div style={{textAlign:"center"}}>
          <div style={{color:C.muted,fontSize:10,marginBottom:6}}>最强病毒力</div>
          <ViralMeter score={top.viralScore} color={top.color} size={86}/>
          <div style={{color:top.color,fontSize:11,marginTop:6}}>@{top.handle}</div>
        </div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <SL>账号病毒力排行</SL>
        <button onClick={onManage} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 14px",color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>⚙ 管理账号</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[...accounts].sort((a,b)=>b.viralScore-a.viralScore).map((acc,i)=>(
          <Panel key={acc.id} style={{cursor:"pointer",transition:"border-color 0.2s"}}
            onClick={()=>onNav("viral",acc)}
            onMouseEnter={e=>e.currentTarget.style.borderColor=acc.color}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <IGAvatar handle={acc.handle} color={acc.color} size={40}/>
                <div>
                  <div style={{color:C.muted,fontSize:10}}>#{i+1}</div>
                  <div style={{color:C.text,fontWeight:700,fontSize:13}}>{acc.name}</div>
                  <div style={{color:C.muted,fontSize:11}}>{acc.followers.toLocaleString()} 粉</div>
                </div>
              </div>
              <ViralMeter score={acc.viralScore} color={acc.color} size={50}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Pill text={`ER ${acc.er}%`} color={acc.er>5?C.green:C.amber}/>
              <Pill text={`+${acc.growth}`} color={C.green}/>
            </div>
          </Panel>
        ))}
      </div>
      <SL>快速行动</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{icon:"🧬",label:"病毒力诊断",nav:"viral",color:C.blue},{icon:"⏰",label:"最佳发布时间",nav:"timing",color:C.amber},
          {icon:"🚀",label:"增长黑客技巧",nav:"hacks",color:C.green},{icon:"✍️",label:"爆款文案生成",nav:"caption",color:C.purple}].map(a=>(
          <div key={a.nav} onClick={()=>onNav(a.nav)} style={{background:a.color+"0d",border:`1px solid ${a.color}30`,borderRadius:12,padding:16,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:12}}
            onMouseEnter={e=>{e.currentTarget.style.background=a.color+"20";e.currentTarget.style.borderColor=a.color+"60";}}
            onMouseLeave={e=>{e.currentTarget.style.background=a.color+"0d";e.currentTarget.style.borderColor=a.color+"30";}}>
            <div style={{fontSize:22}}>{a.icon}</div>
            <div style={{color:a.color,fontWeight:600,fontSize:13}}>{a.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViralAnalyzer({ accounts, initAccount }) {
  const [active,setActive]=useState(initAccount||accounts[0]);
  const [aiResult,setAiResult]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{if(initAccount)setActive(initAccount);},[initAccount?.id]);
  async function analyze() {
    if(!active)return; setLoading(true); setAiResult("");
    const r=await askClaude(GROWTH_SYSTEM,`深度分析 @${active.handle}（${active.cat}，${active.followers}粉，互动率${active.er}%，病毒分${active.viralScore}/100）：
1.现在最大的增长瓶颈？ 2.把病毒分提升到90+的接下来3个动作？ 3.马来西亚华人市场最容易爆的内容方向？ 4.一个"本周就能做"的爆款内容题目`);
    setAiResult(r); setLoading(false);
  }
  if(!active)return <div style={{color:C.muted,textAlign:"center",padding:40}}>请先添加账号</div>;
  return (
    <div>
      <SL>选择账号诊断</SL>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {accounts.map(a=>(
          <div key={a.id} onClick={()=>setActive(a)} style={{background:active?.id===a.id?a.color+"22":C.panel,border:`1px solid ${active?.id===a.id?a.color:C.border}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <IGAvatar handle={a.handle} color={a.color} size={24}/>
            <span style={{color:active?.id===a.id?a.color:C.muted,fontSize:12,fontWeight:active?.id===a.id?700:400}}>@{a.handle}</span>
          </div>
        ))}
      </div>
      <Panel style={{marginBottom:16}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:20}}>
          <IGAvatar handle={active.handle} color={active.color} size={72}/>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontWeight:800,fontSize:18}}>{active.name}</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:6}}>@{active.handle} · {active.cat}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Pill text={`${active.followers.toLocaleString()} 粉丝`} color={active.color} size="md"/>
              <Pill text={`ER ${active.er}%`} color={active.er>5?C.green:C.amber} size="md"/>
            </div>
          </div>
          <ViralMeter score={active.viralScore} color={active.color} size={90}/>
        </div>
        <SL>病毒公式维度分析</SL>
        {VIRAL_FORMULAS.map((f,i)=>{
          const s=Math.min(100,Math.round(active.viralScore*(0.75+i*0.08)));
          return (
            <div key={f.name} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:C.text,fontSize:13}}>{f.name}</span>
                <span style={{color:s>70?C.green:s>50?C.amber:C.red,fontSize:12,fontWeight:700}}>{s}%</span>
              </div>
              <div style={{background:C.bg,borderRadius:4,height:6}}>
                <div style={{background:s>70?C.green:s>50?C.amber:C.red,width:`${s}%`,height:"100%",borderRadius:4,transition:"width 1s"}}/>
              </div>
              <div style={{color:C.muted,fontSize:11,marginTop:3}}>{f.tip}</div>
            </div>
          );
        })}
      </Panel>
      <Panel>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SL>🤖 AI 增长突破建议</SL>
          <button onClick={analyze} disabled={loading} style={{background:active.color,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",opacity:loading?0.6:1}}>{loading?"分析中...":"诊断账号"}</button>
        </div>
        <AIBox loading={loading} result={aiResult} placeholder="点击「诊断账号」获取个人化增长建议"/>
      </Panel>
    </div>
  );
}

function BestTiming() {
  const sc=s=>s>=90?C.green:s>=80?C.blue:s>=70?C.amber:C.muted;
  return (
    <div>
      <SL>最佳发布时间（马来西亚华人受众）</SL>
      <Panel style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[["最佳单日","周五 21:00","96",C.green],["周末黄金","周六 10:00","88",C.blue],["每日午间","12:00-13:00","~70",C.amber]].map(([l,v,s,c])=>(
            <div key={l} style={{background:c+"22",border:`1px solid ${c}44`,borderRadius:8,padding:"8px 14px",flex:1,minWidth:90}}>
              <div style={{color:C.muted,fontSize:10}}>{l}</div>
              <div style={{color:c,fontSize:15,fontWeight:700}}>{v}</div>
              <div style={{color:c,fontSize:12}}>评分 {s}</div>
            </div>
          ))}
        </div>
        {POSTING_TIMES.map(day=>(
          <div key={day.day} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:12,fontWeight:600,minWidth:28}}>{day.day}</div>
            <div style={{flex:1,display:"flex",gap:6}}>
              {day.slots.map(slot=>(
                <div key={slot.t} style={{background:sc(slot.s)+"18",border:`1px solid ${sc(slot.s)}44`,borderRadius:8,padding:"5px 8px",textAlign:"center",flex:1}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:600}}>{slot.t}</div>
                  <div style={{color:sc(slot.s),fontSize:11,fontWeight:700}}>{slot.s}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function GrowthHacks() {
  const [aiResult,setAiResult]=useState(""); const [loading,setLoading]=useState(false); const [selected,setSelected]=useState(null);
  async function deepDive(hack) {
    setSelected(hack); setLoading(true); setAiResult("");
    const r=await askClaude(GROWTH_SYSTEM,`详细讲解「${hack.title}」这个Instagram增长技巧，给马来西亚华人电商账号的实际操作步骤、注意事项、预计效果、针对手表/时装电商的具体应用`);
    setAiResult(r); setLoading(false);
  }
  return (
    <div>
      <SL>增长黑客技巧库</SL>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        {GROWTH_HACKS.map(hack=>(
          <Panel key={hack.id} style={{cursor:"pointer",borderColor:selected?.id===hack.id?C.green:C.border,transition:"all 0.2s"}} onClick={()=>deepDive(hack)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:30,height:30,borderRadius:8,background:C.green+"22",display:"flex",alignItems:"center",justifyContent:"center",color:C.green,fontWeight:800,fontSize:12,flexShrink:0}}>#{hack.id}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:14}}>{hack.title}</span>
                  <Pill text={hack.impact} color={hack.impact.includes("爆炸")?C.green:C.blue}/>
                  <Pill text={`难度：${hack.effort}`} color={hack.effort==="低"||hack.effort==="极低"?C.green:C.amber}/>
                </div>
                <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{hack.desc}</div>
              </div>
              <div style={{color:selected?.id===hack.id?C.green:C.dim,fontSize:18}}>{selected?.id===hack.id?"▼":"›"}</div>
            </div>
          </Panel>
        ))}
      </div>
      {(selected||loading)&&<Panel><SL>🤖 {selected?.title} — 详细操作指南</SL><AIBox loading={loading} result={aiResult}/></Panel>}
    </div>
  );
}

function CaptionGen({ accounts }) {
  const [aiResult,setAiResult]=useState(""); const [loading,setLoading]=useState(false);
  const [topic,setTopic]=useState(""); const [accId,setAccId]=useState(accounts[0]?.id);
  const [format,setFormat]=useState("Reel"); const [goal,setGoal]=useState("涨粉");
  const acc=accounts.find(a=>a.id===accId)||accounts[0];
  async function generate() {
    if(!topic||!acc)return; setLoading(true); setAiResult("");
    const r=await askClaude(GROWTH_SYSTEM,`为 @${acc.handle}（${acc.cat}）写一条 Instagram ${format} 爆款文案。主题：${topic}，目标：${goal}。输出：【封面文字】【开场钩子】【正文】【最强CTA】【Hashtag×15】【发布建议】`);
    setAiResult(r); setLoading(false);
  }
  return (
    <div>
      <SL>爆款文案生成器</SL>
      <Panel style={{marginBottom:16}}>
        <div style={{marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:6}}>选择账号</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {accounts.map(a=>(
              <div key={a.id} onClick={()=>setAccId(a.id)} style={{background:accId===a.id?a.color+"22":C.bg,border:`1px solid ${accId===a.id?a.color:C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <IGAvatar handle={a.handle} color={a.color} size={22}/>
                <span style={{color:accId===a.id?a.color:C.muted,fontSize:12,fontWeight:accId===a.id?700:400}}>@{a.handle}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <div><div style={{color:C.muted,fontSize:11,marginBottom:5}}>格式</div>
            <div style={{display:"flex",gap:6}}>{["Reel","Carousel","Photo","Story"].map(f=><div key={f} onClick={()=>setFormat(f)} style={{background:format===f?C.blue+"22":C.bg,border:`1px solid ${format===f?C.blue:C.border}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",color:format===f?C.blue:C.muted,fontSize:12}}>{f}</div>)}</div></div>
          <div><div style={{color:C.muted,fontSize:11,marginBottom:5}}>目标</div>
            <div style={{display:"flex",gap:6}}>{["涨粉","卖货","建信任","破圈"].map(g=><div key={g} onClick={()=>setGoal(g)} style={{background:goal===g?C.purple+"22":C.bg,border:`1px solid ${goal===g?C.purple:C.border}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",color:goal===g?C.purple:C.muted,fontSize:12}}>{g}</div>)}</div></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：第一年创业亏了RM50K的真实经历）"
            style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontSize:13,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&generate()}/>
          <button onClick={generate} disabled={loading||!topic} style={{background:`linear-gradient(135deg,${C.blue},${C.purple})`,color:"#fff",border:"none",borderRadius:8,padding:"11px 18px",fontSize:13,fontWeight:700,cursor:"pointer",opacity:(loading||!topic)?0.5:1,whiteSpace:"nowrap"}}>{loading?"生成中...":"✨ 生成文案"}</button>
        </div>
      </Panel>
      <Panel><SL>生成结果</SL><AIBox loading={loading} result={aiResult} placeholder="填写上方信息，点击生成完整爆款文案"/></Panel>
    </div>
  );
}

function ManageView({ accounts, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{color:C.text,fontWeight:800,fontSize:18}}>账号管理</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>共 {accounts.length} 个账号</div></div>
        <button onClick={onAdd} style={{background:`linear-gradient(135deg,${C.blue},${C.purple})`,color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>✚ 添加账号</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {accounts.map(acc=>(
          <Panel key={acc.id} style={{display:"flex",alignItems:"center",gap:14}}>
            <IGAvatar handle={acc.handle} color={acc.color} size={48}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14}}>{acc.name}</div>
              <div style={{color:C.muted,fontSize:12}}>@{acc.handle}</div>
              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                <Pill text={acc.cat} color={acc.color}/>
                <Pill text={`${acc.followers.toLocaleString()} 粉`} color={C.blue}/>
                <Pill text={`ER ${acc.er}%`} color={acc.er>5?C.green:C.amber}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>onEdit(acc)} style={{background:C.blue+"22",border:`1px solid ${C.blue}44`,borderRadius:8,padding:"7px 14px",color:C.blue,fontSize:12,fontWeight:600,cursor:"pointer"}}>编辑</button>
              <button onClick={()=>onDelete(acc)} style={{background:C.red+"22",border:`1px solid ${C.red}44`,borderRadius:8,padding:"7px 14px",color:C.red,fontSize:12,fontWeight:600,cursor:"pointer"}}>删除</button>
            </div>
          </Panel>
        ))}
      </div>
      {accounts.length===0&&<div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}><div style={{fontSize:40,marginBottom:12}}>📭</div><div>还没有账号，点击「添加账号」开始</div></div>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
const NAVS=[{id:"home",label:"总部",icon:"⚡"},{id:"viral",label:"诊断",icon:"🧬"},{id:"timing",label:"时机",icon:"⏰"},{id:"hacks",label:"黑客",icon:"🚀"},{id:"caption",label:"文案",icon:"✍️"},{id:"manage",label:"账号",icon:"⚙️"}];

export default function App() {
  const [nav,setNav]=useState("home"); const [navCtx,setNavCtx]=useState(null);
  const [accounts,setAccounts]=useState(()=>{try{const s=localStorage.getItem("ig_accounts");return s?JSON.parse(s):DEFAULT_ACCOUNTS;}catch{return DEFAULT_ACCOUNTS;}});
  const [modal,setModal]=useState(null); const [delConfirm,setDelConfirm]=useState(null);

  useEffect(()=>{try{localStorage.setItem("ig_accounts",JSON.stringify(accounts));}catch{}},[accounts]);

  function handleNav(id,ctx=null){setNav(id);setNavCtx(ctx);}
  function saveAccount(acc){setAccounts(prev=>{const e=prev.find(a=>a.id===acc.id);return e?prev.map(a=>a.id===acc.id?acc:a):[...prev,acc]});setModal(null);}
  function deleteAccount(acc){setAccounts(prev=>prev.filter(a=>a.id!==acc.id));setDelConfirm(null);}

  const renderView=()=>{
    switch(nav){
      case "home": return <CommandCenter accounts={accounts} onNav={handleNav} onManage={()=>setNav("manage")}/>;
      case "viral": return <ViralAnalyzer accounts={accounts} initAccount={navCtx}/>;
      case "timing": return <BestTiming/>;
      case "hacks": return <GrowthHacks/>;
      case "caption": return <CaptionGen accounts={accounts}/>;
      case "manage": return <ManageView accounts={accounts} onAdd={()=>setModal("add")} onEdit={acc=>setModal(acc)} onDelete={acc=>setDelConfirm(acc)}/>;
      default: return null;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:`0 0 16px ${C.blue}66`}}>⚡</div>
        <div>
          <div style={{color:C.text,fontWeight:800,fontSize:15,letterSpacing:-0.3}}>IG Growth Engine</div>
          <div style={{color:C.muted,fontSize:10,letterSpacing:1}}>POWERED BY CLAUDE · JES GROUP</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          {accounts.slice(0,5).map(a=>(
            <div key={a.id} onClick={()=>handleNav("viral",a)} title={`@${a.handle}`} style={{cursor:"pointer"}}>
              <IGAvatar handle={a.handle} color={a.color} size={28} style={{borderRadius:8}}/>
            </div>
          ))}
          {accounts.length>5&&<div style={{width:28,height:28,borderRadius:8,background:C.panel,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:10,fontWeight:700}}>+{accounts.length-5}</div>}
        </div>
      </div>
      <div style={{flex:1,padding:"20px 16px",maxWidth:760,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>{renderView()}</div>
      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>handleNav(n.id)} style={{flex:1,background:"none",border:"none",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:nav===n.id?`2px solid ${C.blue}`:"2px solid transparent"}}>
            <span style={{fontSize:17}}>{n.icon}</span>
            <span style={{color:nav===n.id?C.blue:C.muted,fontSize:10,fontWeight:nav===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>
      {modal&&<AccountModal editing={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={saveAccount}/>}
      {delConfirm&&<DeleteConfirm account={delConfirm} onConfirm={()=>deleteAccount(delConfirm)} onCancel={()=>setDelConfirm(null)}/>}
    </div>
  );
}
