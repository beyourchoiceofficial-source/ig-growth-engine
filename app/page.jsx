"use client";
import { useState } from "react";

const C = {
  bg:"#080b14", surface:"#0e1320", panel:"#131926", border:"#1e2a3a",
  blue:"#3b82f6", cyan:"#06b6d4", amber:"#f59e0b",
  green:"#22c55e", red:"#ef4444", purple:"#a855f7", pink:"#ec4899",
  text:"#e2e8f0", muted:"#64748b", dim:"#334155",
};

function Pill({text,color=C.blue}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{text}</span>;
}
function Panel({children,style={}}) {
  return <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:14,padding:20,...style}}>{children}</div>;
}
function SL({children}) {
  return <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{children}</div>;
}

export default function App() {
  const [nav, setNav] = useState("home");
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [insight, setInsight] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState(null);
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Reel");
  const [goal, setGoal] = useState("涨粉");
  const [caption, setCaption] = useState("");
  const [captionLoading, setCaptionLoading] = useState(false);

  const showToast = (msg, color=C.green) => {
    setToast({msg,color});
    setTimeout(()=>setToast(null),4000);
  };

  async function syncIG() {
    setSyncing(true);
    try {
      const res = await fetch("/api/ig");
      const data = await res.json();
      if(data.error) {
        showToast("❌ "+data.error, C.red);
      } else {
        setProfile(data.profile);
        setPosts(data.posts || []);
        showToast(`✅ 同步成功！${data.synced} 条帖子`);
      }
    } catch(e) { showToast("❌ "+e.message, C.red); }
    setSyncing(false);
  }

  async function analyze() {
    if(posts.length===0) { showToast("请先同步 IG 数据", C.red); return; }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body: JSON.stringify({posts})
});
      const data = await res.json();
      if(data.error) showToast("❌ "+data.error, C.red);
      else { setInsight(data.analysis); showToast("✅ AI 分析完成！"); }
    } catch(e) { showToast("❌ "+e.message, C.red); }
    setAnalyzing(false);
  }

  async function generateCaption() {
    if(!topic) return;
    setCaptionLoading(true); setCaption("");
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({type:format, topic, account: profile?.username||"eugene_mkting55", goal})
      });
      const data = await res.json();
      setCaption(data.content || data.error || "生成失败");
    } catch(e) { setCaption("生成失败: "+e.message); }
    setCaptionLoading(false);
  }

  const avgER = posts.length ? (posts.reduce((s,p)=>s+parseFloat(p.engagement_rate||0),0)/posts.length).toFixed(1) : 0;
  const sortedPosts = [...posts].sort((a,b)=>b.engagement_rate-a.engagement_rate);

  const NAVS = [
    {id:"home",label:"总部",icon:"⚡"},
    {id:"posts",label:"帖子",icon:"📊"},
    {id:"analyze",label:"分析",icon:"🧬"},
    {id:"caption",label:"文案",icon:"✍️"}
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>⚡</div>
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

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,zIndex:200,boxShadow:"0 4px 20px #0008",whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {/* Content */}
      <div style={{flex:1,padding:"20px 16px",maxWidth:760,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* HOME */}
        {nav==="home" && (
          <div>
            <div style={{background:`linear-gradient(135deg,${C.blue}15,${C.purple}10)`,border:`1px solid ${C.blue}30`,borderRadius:16,padding:"24px",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{color:C.muted,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>已连接账号</div>
                  <div style={{color:C.text,fontSize:26,fontWeight:800}}>@{profile?.username||"eugene_mkting55"}</div>
                  <div style={{color:C.green,fontSize:13,marginTop:4}}>{posts.length} 条帖子已同步</div>
                </div>
                <button onClick={syncIG} disabled={syncing} style={{background:syncing?"#333":C.green,color:"#fff",border:"none",borderRadius:10,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:syncing?"not-allowed":"pointer"}}>
                  {syncing?"⏳ 同步中...":"🔄 同步 IG 数据"}
                </button>
              </div>
            </div>

            {posts.length > 0 && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                  {[
                    {l:"平均互动率",v:`${avgER}%`,c:C.blue},
                    {l:"帖子总数",v:posts.length,c:C.purple},
                    {l:"最高互动",v:`${sortedPosts[0]?.engagement_rate||0}%`,c:C.green},
                    {l:"总保存数",v:posts.reduce((s,p)=>s+(p.saves||0),0),c:C.amber},
                  ].map(s=>(
                    <Panel key={s.l}>
                      <div style={{color:C.muted,fontSize:10,letterSpacing:1}}>{s.l}</div>
                      <div style={{color:s.c,fontSize:24,fontWeight:800,marginTop:4}}>{s.v}</div>
                    </Panel>
                  ))}
                </div>

                <Panel>
                  <SL>帖子排行（真实数据）</SL>
                  {sortedPosts.slice(0,5).map((post,i)=>(
                    <div key={post.ig_post_id||i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
                      <div style={{width:26,height:26,borderRadius:6,background:i===0?C.amber+"22":C.dim,display:"flex",alignItems:"center",justifyContent:"center",color:i===0?C.amber:C.muted,fontWeight:800,fontSize:11,flexShrink:0}}>#{i+1}</div>
                      {post.thumbnail_url && <img src={post.thumbnail_url} style={{width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:C.text,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{post.caption?.substring(0,60)||"(无文案)"}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          <Pill text={post.type||"POST"} color={C.cyan}/>
                          <Pill text={`❤️${post.likes||0}`} color={C.pink}/>
                          <Pill text={`🔖${post.saves||0}`} color={C.purple}/>
                          <Pill text={`👁${post.reach||0}`} color={C.blue}/>
                        </div>
                      </div>
                      <div style={{color:parseFloat(post.engagement_rate)>5?C.green:C.amber,fontWeight:800,fontSize:16,flexShrink:0}}>{post.engagement_rate}%</div>
                    </div>
                  ))}
                </Panel>
              </>
            )}

            {posts.length===0 && (
              <Panel>
                <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                  <div style={{fontSize:40,marginBottom:12}}>📱</div>
                  <div style={{fontSize:15,marginBottom:8}}>还没有数据</div>
                  <div style={{fontSize:13}}>点击上方「同步 IG 数据」开始</div>
                </div>
              </Panel>
            )}

            {insight && (
              <Panel style={{marginTop:16}}>
                <SL>🤖 AI 分析结果</SL>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {insight.best_post_type && <Pill text={`最佳类型：${insight.best_post_type}`} color={C.blue}/>}
                  {insight.best_time && <Pill text={`最佳时间：${insight.best_time}`} color={C.amber}/>}
                </div>
                {insight.tomorrow_idea && (
                  <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12}}>
                    <div style={{color:C.green,fontSize:12,marginBottom:4}}>💡 明天发什么</div>
                    <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{insight.tomorrow_idea}</div>
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {/* POSTS */}
        {nav==="posts" && (
          <div>
            <SL>所有帖子 ({posts.length})</SL>
            {posts.length===0 && (
              <Panel>
                <div style={{color:C.muted,textAlign:"center",padding:"30px 0"}}>还没有数据，请先在总部同步 IG</div>
              </Panel>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sortedPosts.map((post,i)=>(
                <Panel key={post.ig_post_id||i} style={{display:"flex",gap:12,alignItems:"center"}}>
                  {post.thumbnail_url && <img src={post.thumbnail_url} style={{width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:C.text,fontSize:12,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.caption?.substring(0,70)||"(无文案)"}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <Pill text={post.type||"POST"} color={C.cyan}/>
                      <Pill text={`❤️ ${post.likes||0}`} color={C.pink}/>
                      <Pill text={`💬 ${post.comments||0}`} color={C.blue}/>
                      <Pill text={`🔖 ${post.saves||0}`} color={C.purple}/>
                      <Pill text={`👁 ${post.reach||0}`} color={C.amber}/>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{color:parseFloat(post.engagement_rate)>5?C.green:C.amber,fontWeight:800,fontSize:16}}>{post.engagement_rate}%</div>
                    {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11}}>查看↗</a>}
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {/* ANALYZE */}
        {useEffect(()=>{ if(nav==="analyze" && posts.length===0) syncIG(); },[nav]);
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>AI 内容分析引擎</SL>
              <div style={{color:C.muted,fontSize:13,marginBottom:16,lineHeight:1.7}}>
                基于你 {posts.length} 条真实帖子，Claude 分析最爆内容、最佳时间、最强 Hook
              </div>
              {posts.length===0 && (
  <button onClick={syncIG} disabled={syncing} style={{background:C.green,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12}}>
    {syncing?"⏳ 同步中...":"🔄 先同步 IG 数据"}
  </button>
)}
                {analyzing?"🧠 分析中...":"🤖 开始 AI 分析"}
              </button>
            </Panel>
            {insight && (
              <Panel>
                <SL>分析结果</SL>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                  {[
                    {l:"最佳内容类型",v:insight.best_post_type,c:C.blue},
                    {l:"最佳发布时间",v:insight.best_time,c:C.amber},
                    {l:"最强 Hook",v:insight.best_hook,c:C.purple},
                    {l:"热门话题",v:(insight.top_topics||[]).slice(0,3).join("、"),c:C.green},
                  ].filter(s=>s.v).map(s=>(
                    <div key={s.l} style={{background:s.c+"11",border:`1px solid ${s.c}33`,borderRadius:10,padding:12}}>
                      <div style={{color:C.muted,fontSize:10,marginBottom:4}}>{s.l}</div>
                      <div style={{color:s.c,fontWeight:700,fontSize:13}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                {insight.tomorrow_idea && (
                  <div style={{background:C.green+"11",border:`1px solid ${C.green}33`,borderRadius:10,padding:12,marginBottom:12}}>
                    <div style={{color:C.green,fontWeight:700,marginBottom:6}}>💡 明天发什么</div>
                    <div style={{color:C.text,fontSize:13,lineHeight:1.7}}>{insight.tomorrow_idea}</div>
                  </div>
                )}
                {(insight.recommendations||[]).length>0 && (
                  <div>
                    <SL>可执行建议</SL>
                    {insight.recommendations.map((r,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div style={{color:C.green,fontWeight:700}}>✓</div>
                        <div style={{color:C.text,fontSize:13,lineHeight:1.6}}>{r}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {/* CAPTION */}
        {nav==="caption" && (
          <div>
            <Panel style={{marginBottom:16}}>
              <SL>爆款文案生成器</SL>
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                {["Reel","Carousel","Photo","Story"].map(f=>(
                  <div key={f} onClick={()=>setFormat(f)} style={{background:format===f?C.blue+"22":C.bg,border:`1px solid ${format===f?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:format===f?C.blue:C.muted,fontSize:12}}>{f}</div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                {["涨粉","卖货","建信任","破圈"].map(g=>(
                  <div key={g} onClick={()=>setGoal(g)} style={{background:goal===g?C.purple+"22":C.bg,border:`1px solid ${goal===g?C.purple:C.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:goal===g?C.purple:C.muted,fontSize:12}}>{g}</div>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="内容主题（如：7年电商经验总结）"
                  style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,outline:"none"}}
                  onKeyDown={e=>e.key==="Enter"&&generateCaption()}/>
                <button onClick={generateCaption} disabled={captionLoading||!topic} style={{background:captionLoading||!topic?"#333":C.purple,color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:captionLoading||!topic?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
                  {captionLoading?"生成中...":"✨ 生成"}
                </button>
              </div>
            </Panel>
            {captionLoading && <Panel><div style={{color:C.muted,textAlign:"center",padding:"24px 0"}}>🧠 Claude 正在创作...</div></Panel>}
            {caption && <Panel><SL>生成结果</SL><div style={{color:C.text,fontSize:14,lineHeight:1.9,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:16,borderLeft:`3px solid ${C.purple}`}}>{caption}</div></Panel>}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
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
