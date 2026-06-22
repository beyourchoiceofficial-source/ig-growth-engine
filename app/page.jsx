"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#080b14", surface:"#0e1320", panel:"#131926", border:"#1e2a3a",
  blue:"#3b82f6", cyan:"#06b6d4", amber:"#f59e0b",
  green:"#22c55e", red:"#ef4444", purple:"#a855f7", pink:"#ec4899",
  text:"#e2e8f0", muted:"#64748b", dim:"#334155",
};

function Pill({text,color=C.blue}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function Panel({children,style={},onClick}) {
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}} onClick={onClick}>{children}</div>;
}
function SL({children}) {
  return <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}
function Btn({children,onClick,color=C.blue,disabled=false,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"#333":color,color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,...style}}>{children}</button>;
}

function ViralMeter({score,color,size=80}) {
  const r=size*0.38,cx=size/2,cy=size/2,circ=2*Math.PI*r,dash=(score/100)*circ*0.75;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(135deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={size*0.07} strokeDasharray={`${circ*0.75} ${circ}`} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.07} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color})`}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{color,fontWeight:800,fontSize:size*0.22,lineHeight:1}}>{score}</div>
        <div style={{color:C.muted,fontSize:size*0.11,letterSpacing:1}}>VIRAL</div>
      </div>
    </div>
  );
}

function Dashboard({posts,insight,profile,onSync,syncing}) {
  const avgER = posts.length ? (posts.reduce((s,p)=>s+parseFloat(p.engagement_rate||0),0)/posts.length).toFixed(1) : 0;
  const topPost = [...posts].sort((a,b)=>b.engagement_rate-a.engagement_rate)[0];
  const viralScore = Math.min(100, Math.round(parseFloat(avgER)*10));

  return (
    <div>
      <div style={{background:`linear-gradient(135deg,${C.blue}15,${C.purple}10)`,border:`1px solid ${C.blue}30`,borderRadius:16,padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            {profile ? (
              <>
                <div style={{color:C.muted,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>已连接账号</div>
                <div style={{color:C.text,fontSize:28,fontWeight:800}}>@{profile.username}</div>
                <div style={{color:C.green,fontSize:13,marginTop:4}}>
                  {profile.followers_count?.toLocaleString()||"--"} 粉丝 · {posts.length} 条帖子已同步
                </div>
              </>
            ) : (
              <>
                <div style={{color:C.muted,fontSize:13}}>还没有同步数据</div>
                <div style={{color:C.text,fontSize:22,fontWeight:800,marginTop:4}}>点击同步开始</div>
              </>
            )}
          </div>
          <ViralMeter score={viralScore} color={C.blue} size={90}/>
          <Btn onClick={onSync} disabled={syncing} color={C.green} style={{padding:"12px 24px"}}>
            {syncing?"⏳ 同步中...":"🔄 同步 IG 数据"}
          </Btn>
        </div>
      </div>

      {posts.length > 0 && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
            {[
              {l:"平均互动率",v:`${avgER}%`,c:C.blue},
              {l:"帖子总数",v:posts.length,c:C.purple},
              {l:"最高互动率",v:`${topPost?.engagement_rate||0}%`,c:C.green},
              {l:"总保存数",v:posts.reduce((s,p)=>s+(p.saves||0),0).toLocaleString(),c:C.amber},
            ].map(s=>(
              <Panel key={s.l}>
                <div style={{color:C.muted,fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</div>
                <div style={{color:s.c,fontSize:24,fontWeight:800,marginTop:4}}>{s.v}</div>
              </Panel>
            ))}
          </div>

          <Panel>
            <SL>帖子表现排行（真实数据）</SL>
            {[...posts].sort((a,b)=>b.engagement_rate-a.engagement_rate).slice(0,5).map((post,i)=>(
              <div key={post.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:8,background:i===0?C.amber+"22":C.dim,display:"flex",alignItems:"center",justifyContent:"center",color:i===0?C.amber:C.muted,fontWeight:800,fontSize:12,flexShrink:0}}>#{i+1}</div>
                {post.thumbnail_url && <img src={post.thumbnail_url} style={{width:48,height:48,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.text,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.caption?.substring(0,60)||"(无文案)"}</div>
                  <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                    <Pill text={post.type} color={C.cyan}/>
                    <Pill text={`❤️ ${post.likes||0}`} color={C.pink}/>
                    <Pill text={`🔖 ${post.saves||0}`} color={C.purple}/>
                    <Pill text={`👁 ${post.reach||0}`} color={C.blue}/>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:post.engagement_rate>5?C.green:post.engagement_rate>3?C.amber:C.muted,fontWeight:800,fontSize:18}}>{post.engagement_rate}%</div>
                  <div style={{color:C.muted,fontSize:11}}>互动率</div>
                  {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11}}>查看 ↗</a>}
                </div>
              </div>
            ))}
          </Panel>
        </>
      )}

      {insight && (
        <Panel style={{marginTop:16}}>
          <SL>🤖 最新 AI 分析</SL>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            {insight.best_post_type && <Pill text={`最佳类型：${insight.best_post_type}`} color={C.blue}/>}
            {insight.best_time && <Pill text={`最佳时间：${insight.best_time}`} color={C.amber}/>}
          </div>
          {insight.tomorrow_idea && (
            <div style={{background:C.blue+"11",border:`1px solid ${C.blue}33`,borderRadius:10,padding:12}}>
              <div style={{color:C.muted,fontSize:11,marginBottom:4}}>💡 明天发什么</div>
              <div style={{color:C.text,fontSize:13}}>{insight.tomorrow_idea}</div>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function AnalyzeView({posts,onAnalyze,analyzing,insight}) {
  return (
    <div>
      <Panel style={{marginBottom:16}}>
        <SL>AI 内容分析引擎</SL>
        <div style={{color:C.muted,fontSize:13,marginBottom:16,lineHeight:1.7}}>
          基于你 {posts.length} 条真实帖子数据，Claude 分析最爆内容、最佳时间、最强 Hook
        </div>
        <Btn onClick={onAnalyze} disabled={analyzing||posts.length===0} color={C.purple}>
          {analyzing?"🧠 分析中...":"🤖 开始 AI 分析"}
        </Btn>
        {posts.length===0 && <div style={{color:C.red,fontSize:12,marginTop:8}}>请先同步 IG 数据</div>}
      </Panel>
      {insight && (
        <Panel>
          <SL>分析结果</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {l:"最佳内容类型",v:insight.best_post_type,c:C.blue},
              {l:"最佳发布时间",v:insight.best_time,c:C.amber},
              {l:"最强 Hook",v:insight.best_hook,c:C.purple},
              {l:"热门话题",v:(insight.top_topics||[]).join("、"),c:C.green},
            ].filter(s=>s.v).map(s=>(
              <div key={s.l} style={{background:s.c+"11",border:`1px solid ${s.c}33`,borderRadius:10,padding:12}}>
                <div style={{color:C.muted,fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                <div style={{color:s.c,fontWeight:700,fontSize:13}}>{s.v}</div>
              </div>
            ))}
          </div>
          {insight.tomorrow_idea && (
            <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{color:C.green,fontWeight:700,marginBottom:6}}>💡 明天发什么</div>
              <div style={{color:C.text,fontSize:14,lineHeight:1.7}}>{insight.tomorrow_idea}</div>
            </div>
          )}
          {insight.recommendations && (
            <div>
              <SL>可执行建议</SL>
              {(Array.isArray(insight.recommendations)?insight.recommendations:[]).map((r,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{color:C.green,fontWeight:700,flexShrink:0}}>✓</div>
                  <div style={{color:C.text,fontSize:13,lineHeight:1.6}}>{r}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function PostsView({posts}) {
  const [filter,setFilter]=useState("ALL");
  const types=["ALL",...new Set(posts.map(p=>p.type).filter(Boolean))];
  const filtered=filter==="ALL"?posts:posts.filter(p=>p.type===filter);
  return (
    <div>
      <Panel style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {types.map(t=>(
            <div key={t} onClick={()=>setFilter(t)} style={{background:filter===t?C.blue+"22":C.bg,border:`1px solid ${filter===t?C.blue:C.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",color:filter===t?C.blue:C.muted,fontSize:12,fontWeight:filter===t?700:400}}>{t}</div>
          ))}
        </div>
      </Panel>
      {filtered.length===0 && <div style={{color:C.muted,textAlign:"center",padding:"40px 0"}}>还没有数据，请先同步 IG</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...filtered].sort((a,b)=>b.engagement_rate-a.engagement_rate).map(post=>(
          <Panel key={post.id} style={{display:"flex",gap:12,alignItems:"center"}}>
            {post.thumbnail_url && <img src={post.thumbnail_url} style={{width:56,height:56,borderRadius:10,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:C.text,fontSize:13,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.caption?.substring(0,80)||"(无文案)"}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Pill text={post.type||"POST"} color={C.cyan}/>
                <Pill text={`❤️ ${post.likes||0}`} color={C.pink}/>
                <Pill text={`💬 ${post.comments||0}`} color={C.blue}/>
                <Pill text={`🔖 ${post.saves||0}`} color={C.purple}/>
                <Pill text={`👁 ${post.reach||0}`} color={C.amber}/>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{color:parseFloat(post.engagement_rate)>5?C.green:parseFloat(post.engagement_rate)>3?C.amber:C.muted,fontWeight:800,fontSize:18}}>{post.engagement_rate}%</div>
              <div style={{color:C.muted,fontSize:11}}>互动率</div>
              {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11}}>查看 ↗</a>}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function CaptionView() {
  const [result,setResult]=useState(""); const [loading,setLoading]=useState(false);
  const [topic,setTopic]=useState(""); const [format,setFormat]=useState("Reel");
  const [goal,setGoal]=useState("涨粉"); const [account,setAccount]=useState("eugene_mkting55");
  async function generate() {
    if(!topic)return; setLoading(true); setResult("");
    const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({type:format,topic,account,goal})});
    const data = await res.json();
    setResult(data.content||data.error||"生成失败"); setLoading(false);
  }
  return (
    <div>
      <Panel style={{marginBottom:16}}>
        <SL>爆款文案生成器</SL>
        <div style={{marginBottom:12}}>
          <div style={{color:C.muted,fontSize:11,marginBottom:5}}>账号</div>
          <input value={account} onChange={e=>setAccount(e.target.value)}
            style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <div>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>格式</div>
            <div style={{display:"flex",gap:6}}>
              {["Reel","Carousel","Photo","Story"].map(f=>(
                <div key={f} onClick={()=>setFormat(f)} style={{background:format===f?C.blue+"22":C.bg,border:`1px solid ${format===f?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:format===f?C.blue:C.muted,fontSize:12}}>{f}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{color:C.muted,fontSize:11,marginBottom:5}}>目标</div>
            <div style={{display:"flex",gap:6}}>
              {["涨粉","卖货","建信任","破圈"].map(g=>(
                <div key={g} onClick={()=>setGoal(g)} style={{background:goal===g?C.purple+"22":C.bg,border:`1px solid ${goal===g?C.purple:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:goal===g?C.purple:C.muted,fontSize:12}}>{g}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：7年电商经验总结）"
            style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&generate()}/>
          <Btn onClick={generate} disabled={loading||!topic} color={C.purple}>{loading?"生成中...":"✨ 生成"}</Btn>
        </div>
      </Panel>
      {loading && <Panel><div style={{color:C.muted,textAlign:"center",padding:"32px 0"}}>🧠 Claude 正在创作...</div></Panel>}
      {result && <Panel><SL>生成结果</SL><div style={{color:C.text,fontSize:14,lineHeight:1.9,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:16,borderLeft:`3px solid ${C.purple}`}}>{result}</div></Panel>}
    </div>
  );
}

const NAVS=[{id:"home",label:"总部",icon:"⚡"},{id:"posts",label:"帖子",icon:"📊"},{id:"analyze",label:"分析",icon:"🧬"},{id:"caption",label:"文案",icon:"✍️"}];

export default function App() {
  const [nav,setNav]=useState("home");
  const [posts,setPosts]=useState([]);
  const [insight,setInsight]=useState(null);
  const [profile,setProfile]=useState(null);
  const [syncing,setSyncing]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [toast,setToast]=useState(null);

  const showToast=(msg,color=C.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),3500);};

  useEffect(()=>{ loadFromSupabase(); },[]);

  async function loadFromSupabase() {
    try {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if(!sbUrl||!sbKey) return;

      // Load posts
      const postsRes = await fetch(`${sbUrl}/rest/v1/posts?order=published_at.desc&limit=50`, {
        headers: { "apikey": sbKey, "Authorization": `Bearer ${sbKey}` }
      });
      if(postsRes.ok) {
        const p = await postsRes.json();
        if(p && p.length) setPosts(p);
      }

      // Load latest insight
      const insightRes = await fetch(`${sbUrl}/rest/v1/ai_insights?order=created_at.desc&limit=1`, {
        headers: { "apikey": sbKey, "Authorization": `Bearer ${sbKey}` }
      });
      if(insightRes.ok) {
        const i = await insightRes.json();
        if(i && i.length) {
          const ins = i[0];
          setInsight({
            ...ins,
            top_topics: typeof ins.top_topics === "string" ? JSON.parse(ins.top_topics) : ins.top_topics,
            recommendations: typeof ins.recommendations === "string" ? JSON.parse(ins.recommendations) : ins.recommendations,
          });
        }
      }
    } catch(e) { console.error("Load error:", e); }
  }

  async function syncIG() {
    setSyncing(true);
    try {
      const res = await fetch("/api/ig");
      const data = await res.json();
      if(data.error) { showToast("同步失败: "+data.error, C.red); }
      else {
        setProfile(data.profile);
        showToast(`✅ 同步成功！${data.synced} 条帖子`);
        await loadFromSupabase();
      }
    } catch(e) { showToast("同步失败: "+e.message, C.red); }
    setSyncing(false);
  }

  async function analyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze",{method:"POST"});
      const data = await res.json();
      if(data.error) { showToast("分析失败: "+data.error, C.red); }
      else {
        setInsight(data.analysis);
        showToast("✅ AI 分析完成！");
      }
    } catch(e) { showToast("分析失败: "+e.message, C.red); }
    setAnalyzing(false);
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:`0 0 16px ${C.blue}44`}}>⚡</div>
        <div>
          <div style={{color:C.text,fontWeight:800,fontSize:15}}>IG Growth Engine</div>
          <div style={{color:C.muted,fontSize:10,letterSpacing:1}}>真实数据版 · JES GROUP</div>
        </div>
        {profile && (
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <img src={`https://unavatar.io/instagram/${profile.username}`} style={{width:28,height:28,borderRadius:8,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
            <span style={{color:C.green,fontSize:12,fontWeight:600}}>@{profile.username}</span>
          </div>
        )}
      </div>

      {toast && (
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,zIndex:100,boxShadow:"0 4px 20px #0006",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      <div style={{flex:1,padding:"20px 16px",maxWidth:760,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        {nav==="home" && <Dashboard posts={posts} insight={insight} profile={profile} onSync={syncIG} syncing={syncing}/>}
        {nav==="posts" && <PostsView posts={posts}/>}
        {nav==="analyze" && <AnalyzeView posts={posts} onAnalyze={analyze} analyzing={analyzing} insight={insight}/>}
        {nav==="caption" && <CaptionView/>}
      </div>

      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,background:"none",border:"none",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:nav===n.id?`2px solid ${C.blue}`:"2px solid transparent"}}>
            <span style={{fontSize:17}}>{n.icon}</span>
            <span style={{color:nav===n.id?C.blue:C.muted,fontSize:10,fontWeight:nav===n.id?700:400}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
