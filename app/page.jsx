"use client";
import { useState, useEffect, useRef } from "react";

/* ── Design System ─────────────────────────────────────────
   "Command Center" aesthetic — deep space navy, electric accents
   Signature: pulsing viral score ring + smooth trend sparklines
   ─────────────────────────────────────────────────────────── */
const T = {
  bg:       "#07090f",
  surface:  "#0c0f1a",
  card:     "#111827",
  border:   "#1c2537",
  borderHi: "#2d3f5e",
  blue:     "#4f8ef7",
  violet:   "#7c6af7",
  cyan:     "#22d3ee",
  emerald:  "#10b981",
  amber:    "#f59e0b",
  rose:     "#f43f5e",
  pink:     "#ec4899",
  text:     "#f0f4ff",
  muted:    "#64748b",
  dim:      "#1e2a3a",
};

const PLATFORM_COLORS = {
  Instagram: "#e1306c", Facebook: "#1877f2",
  TikTok: "#69c9d0", "小红书": "#ff2442", 抖音: "#161823",
};

/* ── Utilities ────────────────────────────────────────────── */
function cx(...args) { return args.filter(Boolean).join(" "); }

function useLocalStorage(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [v, key]);
  return [v, setV];
}

/* ── Supabase helpers ────────────────────────────────────── */
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function sbFetch(path) {
  if (!SB_URL || !SB_KEY) return null;
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  return r.ok ? r.json() : null;
}

async function sbUpsert(table, data) {
  if (!SB_URL || !SB_KEY) return;
  await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(data),
  });
}

/* ── Mini components ─────────────────────────────────────── */
function Badge({ children, color = T.blue }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}33`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: 20, ...style, cursor: onClick ? "pointer" : "default",
    }}>{children}</div>
  );
}

function Label({ children }) {
  return <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{children}</div>;
}

function Btn({ children, onClick, color = T.blue, disabled = false, full = false, ghost = false, style = {} }) {
  const bg = ghost ? "transparent" : disabled ? T.dim : color;
  const border = ghost ? `1px solid ${color}44` : "none";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color: ghost ? color : disabled ? T.muted : "#fff",
      border, borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: full ? "100%" : "auto", ...style,
    }}>{children}</button>
  );
}

/* ── Sparkline (trend curve) ─────────────────────────────── */
function Sparkline({ data, color = T.blue, width = 120, height = 36 }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 0.01);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(" ").pop()?.split(",")[0]} cy={pts.split(" ").pop()?.split(",")[1]} r="3" fill={color} />
    </svg>
  );
}

/* ── Radial score ring ───────────────────────────────────── */
function ScoreRing({ score, color, size = 72, label = "SCORE" }) {
  const r = size * 0.37, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75;
  const pulse = score >= 80;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={size * 0.075} strokeDasharray={`${circ * 0.75} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.075}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${pulse ? 8 : 4}px ${color}88)`, transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color, fontWeight: 800, fontSize: size * 0.2, lineHeight: 1 }}>{score}</div>
        <div style={{ color: T.muted, fontSize: size * 0.1, letterSpacing: 1 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── IG Avatar ───────────────────────────────────────────── */
function Avatar({ username, picUrl, color, size = 40 }) {
  const [ok, setOk] = useState(false);
  const initials = (username || "?").replace(/_/g, " ").split(" ").map(w => w[0]?.toUpperCase() || "").join("").slice(0, 2);
  useEffect(() => { setOk(false); }, [username]);
  const src = picUrl || `https://unavatar.io/instagram/${username}`;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, border: `2px solid ${color}`, overflow: "hidden", flexShrink: 0, background: color + "22", position: "relative" }}>
      <img src={src} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover", display: ok ? "block" : "none" }} onLoad={() => setOk(true)} onError={() => setOk(false)} />
      {!ok && <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.3, background: `linear-gradient(135deg,${color}18,${color}33)` }}>{initials}</div>}
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ msg, color }) {
  return (
    <div style={{
      position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)",
      background: color, color: "#fff", borderRadius: 10, padding: "10px 20px",
      fontSize: 13, fontWeight: 700, zIndex: 300, boxShadow: `0 4px 24px ${color}66`,
      whiteSpace: "nowrap", pointerEvents: "none",
    }}>{msg}</div>
  );
}

/* ── Strategy Modal ──────────────────────────────────────── */
function StrategyModal({ account, onSave, onClose }) {
  const [f, setF] = useState(account.strategy || { positioning: "", audience: "", goal: "", style: "", language: "中文为主，适当加马来西亚华人口语" });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const fields = [
    { l: "账号定位 *", k: "positioning", p: "例：马来西亚华人电商教育 / 手表销售" },
    { l: "目标受众 *", k: "audience", p: "例：25-40岁想做电商的马来西亚华人" },
    { l: "想要的结果 *", k: "goal", p: "例：涨粉10万 + 每月卖出50个产品" },
    { l: "内容风格", k: "style", p: "例：真实故事 + 干货教育" },
    { l: "语言风格", k: "language", p: "例：中文为主，适当加马来西亚口语" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.blue}55`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 18 }}>策略档案</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>@{account.username}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {fields.map(fi => (
          <div key={fi.k} style={{ marginBottom: 16 }}>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 6, letterSpacing: 0.5 }}>{fi.l}</div>
            <textarea value={f[fi.k]} onChange={e => s(fi.k, e.target.value)} placeholder={fi.p} rows={2}
              style={{ width: "100%", background: T.bg, border: `1px solid ${f[fi.k] ? T.blue : T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, boxSizing: "border-box", outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn onClick={onClose} ghost color={T.muted} style={{ flex: 1 }}>取消</Btn>
          <Btn onClick={() => onSave(f)} color={T.blue} style={{ flex: 2 }}>💾 保存策略</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Account Modal ───────────────────────────────────────── */
function AccountModal({ editing, onSave, onClose }) {
  const COLORS = [T.violet, T.amber, T.pink, T.cyan, T.blue, T.emerald, "#f97316", "#e11d48"];
  const [f, setF] = useState(editing || { username: "", name: "", token: "", color: T.violet });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.blue}55`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 18 }}>{editing?.username ? "编辑账号" : "添加账号"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {/* Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <Avatar username={f.username || "instagram"} color={f.color} size={54} />
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{f.name || "账号名称"}</div>
            <div style={{ color: T.muted, fontSize: 12 }}>@{f.username || "username"}</div>
          </div>
        </div>
        {[
          { l: "IG 用户名（不含@）*", k: "username", p: "eugene_mkting55", t: "text" },
          { l: "显示名称", k: "name", p: "Eugene Marketing", t: "text" },
          { l: "Access Token *", k: "token", p: "粘贴你的 IG Access Token", t: "password" },
        ].map(fi => (
          <div key={fi.k} style={{ marginBottom: 14 }}>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 5 }}>{fi.l}</div>
            <input type={fi.t} value={f[fi.k]} onChange={e => s(fi.k, e.target.value)} placeholder={fi.p}
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, boxSizing: "border-box", outline: "none" }} />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>主题颜色</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map(c => <div key={c} onClick={() => s("color", c)} style={{ width: 30, height: 30, borderRadius: 8, background: c, cursor: "pointer", border: `2px solid ${f.color === c ? "#fff" : "transparent"}`, boxShadow: f.color === c ? `0 0 10px ${c}` : "none", transition: "all 0.2s" }} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onClose} ghost color={T.muted} style={{ flex: 1 }}>取消</Btn>
          <Btn onClick={() => f.username && f.token && onSave({ ...f, id: editing?.id || Date.now(), strategy: editing?.strategy || {} })} disabled={!f.username || !f.token} color={T.blue} style={{ flex: 2 }}>
            {editing?.username ? "保存修改" : "✚ 添加账号"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
const NAVS = [
  { id: "home", label: "总部", icon: "⚡" },
  { id: "videos", label: "视频", icon: "🎬" },
  { id: "analyze", label: "分析", icon: "🧬" },
  { id: "script", label: "脚本", icon: "✍️" },
  { id: "trends", label: "爆款", icon: "🔥" },
  { id: "roadmap", label: "规划", icon: "🗺️" },
  { id: "accounts", label: "账号", icon: "⚙️" },
];

const FORMATS = ["Reel", "Carousel", "Photo", "Story", "Live"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "小红书", "抖音"];

export default function IGPro() {
  const [nav, setNav] = useState("home");
  const [accounts, setAccounts] = useLocalStorage("igpro_v5_accounts", [
    { id: 1, username: "eugene_mkting55", name: "Eugene Marketing", color: T.violet, token: "", strategy: {} },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [posts, setPosts] = useState({});
  const [profiles, setProfiles] = useState({});
  const [insights, setInsights] = useState({});
  const [roadmaps, setRoadmaps] = useState({});
  const [trends, setTrends] = useState(null);
  const [competitor, setCompetitor] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingComp, setLoadingComp] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [toast, setToast] = useState(null);
  const [strategyModal, setStrategyModal] = useState(null);
  const [accountModal, setAccountModal] = useState(null);
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Reel");
  const [selPlatforms, setSelPlatforms] = useState(["Instagram", "TikTok"]);
  const [scriptMode, setScriptMode] = useState("quick");
  const [script, setScript] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [trendsNiche, setTrendsNiche] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [expandedPost, setExpandedPost] = useState(null);

  const acc = accounts.find(a => a.id === activeId) || accounts[0];
  const accPosts = posts[activeId] || [];
  const accProfile = profiles[activeId];
  const accInsight = insights[activeId];
  const accRoadmap = roadmaps[activeId];
  const sortedPosts = [...accPosts].sort((a, b) => b.engagement_rate - a.engagement_rate);
  const avgER = accPosts.length ? (accPosts.reduce((s, p) => s + parseFloat(p.engagement_rate || 0), 0) / accPosts.length).toFixed(1) : 0;
  const erHistory = sortedPosts.slice(0, 8).reverse().map(p => parseFloat(p.engagement_rate || 0));

  const showToast = (msg, color = T.emerald) => { setToast({ msg, color }); setTimeout(() => setToast(null), 4000); };

  // Load from Supabase on mount
  useEffect(() => {
    if (!SB_URL || !SB_KEY) return;
    sbFetch(`posts?order=published_at.desc&limit=50`).then(data => {
      if (data?.length) {
        const grouped = {};
        data.forEach(p => {
          const acc = accounts.find(a => a.username === p.username);
          if (acc) { grouped[acc.id] = grouped[acc.id] || []; grouped[acc.id].push(p); }
        });
        setPosts(prev => ({ ...prev, ...grouped }));
      }
    });
    sbFetch(`ai_insights?order=created_at.desc&limit=10`).then(data => {
      if (data?.length) {
        const ins = {};
        data.forEach(i => {
          const acc = accounts.find(a => a.username === i.username);
          if (acc) ins[acc.id] = { ...i, top_topics: typeof i.top_topics === "string" ? JSON.parse(i.top_topics || "[]") : i.top_topics, recommendations: typeof i.recommendations === "string" ? JSON.parse(i.recommendations || "[]") : i.recommendations, video_analysis: typeof i.video_analysis === "string" ? JSON.parse(i.video_analysis || "[]") : i.video_analysis };
        });
        setInsights(prev => ({ ...prev, ...ins }));
      }
    });
  }, []);

  async function syncAccount(a) {
    if (!a?.token) { showToast("⚠️ 请先设置 Access Token", T.amber); setAccountModal(a); return; }
    setSyncing(true);
    try {
      const res = await fetch(`/api/ig?token=${encodeURIComponent(a.token)}`);
      const data = await res.json();
      if (data.error) showToast("❌ " + data.error, T.rose);
      else {
        setPosts(p => ({ ...p, [a.id]: data.posts || [] }));
        setProfiles(p => ({ ...p, [a.id]: data.profile }));
        showToast(`✅ 同步成功！${data.synced} 条内容`);
      }
    } catch (e) { showToast("❌ " + e.message, T.rose); }
    setSyncing(false);
  }

  async function analyze() {
    if (!accPosts.length) { showToast("请先同步数据", T.amber); return; }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts: accPosts, strategy: acc?.strategy || {} }) });
      const data = await res.json();
      if (data.error) showToast("❌ " + data.error, T.rose);
      else {
        setInsights(i => ({ ...i, [activeId]: data.analysis }));
        await sbUpsert("ai_insights", { username: acc?.username, ...data.analysis, top_topics: JSON.stringify(data.analysis.top_topics || []), recommendations: JSON.stringify(data.analysis.recommendations || []), video_analysis: JSON.stringify(data.analysis.video_analysis || []), analyzed_at: new Date().toISOString() });
        showToast("✅ AI 分析完成！");
      }
    } catch (e) { showToast("❌ " + e.message, T.rose); }
    setAnalyzing(false);
  }

  async function generateRoadmap() {
    setLoadingRoadmap(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ strategy: acc?.strategy || {}, currentFollowers: accProfile?.followers_count || 0, platform: "Instagram" }) });
      const data = await res.json();
      if (data.error) showToast("❌ " + data.error, T.rose);
      else { setRoadmaps(r => ({ ...r, [activeId]: data.roadmap })); showToast("✅ 路线图生成完成！"); }
    } catch (e) { showToast("❌ " + e.message, T.rose); }
    setLoadingRoadmap(false);
  }

  async function fetchTrends() {
    if (!trendsNiche) return;
    setLoadingTrends(true);
    try {
      const res = await fetch("/api/trends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche: trendsNiche, language: acc?.strategy?.language }) });
      const data = await res.json();
      if (data.error) showToast("❌ " + data.error, T.rose);
      else { setTrends(data.trends); showToast("✅ 爆款趋势分析完成！"); }
    } catch (e) { showToast("❌ " + e.message, T.rose); }
    setLoadingTrends(false);
  }

  async function analyzeCompetitors() {
    const list = competitors.split(/[,，\n]/).map(s => s.trim().replace("@", "")).filter(Boolean);
    if (!list.length) return;
    setLoadingComp(true);
    try {
      const res = await fetch("/api/competitor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ competitors: list, strategy: acc?.strategy }) });
      const data = await res.json();
      if (data.error) showToast("❌ " + data.error, T.rose);
      else { setCompetitor(data.result); showToast("✅ 竞品分析完成！"); }
    } catch (e) { showToast("❌ " + e.message, T.rose); }
    setLoadingComp(false);
  }

  async function genScript() {
    if (!topic) return;
    setScriptLoading(true); setScript("");
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: format, topic, platforms: selPlatforms, strategy: acc?.strategy, mode: scriptMode }) });
      const data = await res.json();
      setScript(data.content || data.error || "生成失败");
    } catch (e) { setScript("❌ " + e.message); }
    setScriptLoading(false);
  }

  function saveStrategy(strategy) {
    setAccounts(prev => prev.map(a => a.id === strategyModal.id ? { ...a, strategy } : a));
    setStrategyModal(null); showToast("✅ 策略档案已保存！");
  }

  function saveAccount(a) {
    setAccounts(prev => { const e = prev.find(x => x.id === a.id); return e ? prev.map(x => x.id === a.id ? a : x) : [...prev, a]; });
    setAccountModal(null); showToast("✅ 账号已保存！");
  }

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "10px 18px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.blue}, ${T.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 0 16px ${T.blue}44` }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>IG Pro</div>
          <div style={{ color: T.muted, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>Content Intelligence · JES Group</div>
        </div>
        {/* Account switcher */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {accounts.slice(0, 6).map(a => (
            <div key={a.id} onClick={() => setActiveId(a.id)} title={`@${a.username}`}
              style={{ cursor: "pointer", borderRadius: 11, border: `2px solid ${activeId === a.id ? a.color : "transparent"}`, transition: "all 0.2s", opacity: activeId === a.id ? 1 : 0.45, boxShadow: activeId === a.id ? `0 0 12px ${a.color}55` : "none" }}>
              <Avatar username={a.username} picUrl={profiles[a.id]?.profile_picture_url} color={a.color} size={30} />
            </div>
          ))}
          <div onClick={() => setAccountModal({ id: Date.now(), username: "", name: "", token: "", color: T.violet, strategy: {} })}
            style={{ width: 30, height: 30, borderRadius: 8, background: T.card, border: `1px dashed ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted, fontSize: 18 }}>+</div>
        </div>
      </header>

      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "20px 18px", maxWidth: 820, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* ══ HOME ══ */}
        {nav === "home" && (
          <div>
            {/* Hero card */}
            <div style={{ background: `linear-gradient(135deg, ${acc?.color || T.blue}18 0%, ${T.violet}08 100%)`, border: `1px solid ${acc?.color || T.blue}35`, borderRadius: 20, padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color || T.blue} size={72} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>@{acc?.username}</div>
                  <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{acc?.name}</div>
                  {acc?.strategy?.positioning && <div style={{ color: acc.color, fontSize: 11, marginTop: 6 }}>📌 {acc.strategy.positioning}</div>}
                  {acc?.strategy?.goal && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>🎯 {acc.strategy.goal}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: acc?.color || T.blue, fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                    {accProfile?.followers_count != null ? accProfile.followers_count.toLocaleString() : "—"}
                  </div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>粉丝</div>
                  {accProfile?.media_count && <div style={{ color: T.muted, fontSize: 10 }}>{accProfile.media_count} 条内容</div>}
                </div>
              </div>
              {/* Stats row */}
              {accPosts.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {[
                    { l: "平均互动率", v: `${avgER}%`, c: T.blue },
                    { l: "帖子总数", v: accPosts.length, c: T.violet },
                    { l: "总赞数", v: accPosts.reduce((s, p) => s + (p.likes || 0), 0).toLocaleString(), c: T.pink },
                    { l: "总播放", v: accPosts.reduce((s, p) => s + (p.video_views || 0), 0).toLocaleString(), c: T.cyan },
                  ].map(st => (
                    <div key={st.l} style={{ flex: 1, background: T.bg + "88", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ color: T.muted, fontSize: 9, letterSpacing: 1 }}>{st.l}</div>
                      <div style={{ color: st.c, fontSize: 18, fontWeight: 800, marginTop: 3 }}>{st.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Trend sparkline */}
              {erHistory.length > 1 && (
                <div style={{ marginBottom: 16, background: T.bg + "66", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ color: T.muted, fontSize: 11 }}>互动率趋势</div>
                  <Sparkline data={erHistory} color={acc?.color || T.blue} width={160} height={32} />
                  <div style={{ color: acc?.color || T.blue, fontWeight: 700, fontSize: 13, marginLeft: "auto" }}>{avgER}% avg</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={() => syncAccount(acc)} disabled={syncing} color={T.emerald} style={{ flex: 1 }}>{syncing ? "⏳ 同步中..." : "🔄 同步数据"}</Btn>
                <Btn onClick={() => setStrategyModal(acc)} ghost color={T.blue} style={{ flex: 1 }}>📌 策略档案</Btn>
                <Btn onClick={() => setAccountModal(acc)} ghost color={T.muted} style={{ padding: "10px 14px" }}>✏️</Btn>
              </div>
            </div>

            {/* All accounts */}
            <Card style={{ marginBottom: 16 }}>
              <Label>所有账号</Label>
              {accounts.map(a => (
                <div key={a.id} onClick={() => setActiveId(a.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <Avatar username={a.username} picUrl={profiles[a.id]?.profile_picture_url} color={a.color} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: activeId === a.id ? a.color : T.text, fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>@{a.username}</div>
                    {a.strategy?.positioning && <div style={{ color: a.color, fontSize: 10, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📌 {a.strategy.positioning}</div>}
                  </div>
                  {/* Mini sparkline per account */}
                  {(posts[a.id]?.length > 1) && <Sparkline data={[...posts[a.id]].sort((x, y) => new Date(x.published_at) - new Date(y.published_at)).slice(-6).map(p => parseFloat(p.engagement_rate || 0))} color={a.color} width={60} height={24} />}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: a.color, fontWeight: 700, fontSize: 16 }}>{profiles[a.id]?.followers_count?.toLocaleString() || "—"}</div>
                    <div style={{ color: T.muted, fontSize: 10 }}>粉丝</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setAccountModal({ id: Date.now(), username: "", name: "", token: "", color: T.violet, strategy: {} })}
                style={{ width: "100%", marginTop: 14, background: "none", border: `1px dashed ${T.border}`, borderRadius: 10, padding: "10px", color: T.muted, fontSize: 13, cursor: "pointer" }}>
                ✚ 添加新账号
              </button>
            </Card>

            {/* Quick AI insight */}
            {accInsight && (
              <Card>
                <Label>🤖 最新 AI 洞察</Label>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <ScoreRing score={accInsight.overall_score || 0} color={acc?.color || T.blue} size={64} label="总分" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {accInsight.best_post_type && <Badge color={T.blue}>最佳类型：{accInsight.best_post_type}</Badge>}
                      {accInsight.best_time && <Badge color={T.amber}>最佳时间：{accInsight.best_time}</Badge>}
                    </div>
                    {accInsight.tomorrow_idea && (
                      <div style={{ background: T.emerald + "11", border: `1px solid ${T.emerald}33`, borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ color: T.emerald, fontSize: 10, marginBottom: 4 }}>💡 明天发什么</div>
                        <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>{accInsight.tomorrow_idea}</div>
                      </div>
                    )}
                  </div>
                </div>
                {accInsight.growth_bottleneck && (
                  <div style={{ background: T.rose + "11", border: `1px solid ${T.rose}33`, borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ color: T.rose, fontSize: 10, marginBottom: 4 }}>⚠️ 增长瓶颈</div>
                    <div style={{ color: T.text, fontSize: 13 }}>{accInsight.growth_bottleneck}</div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ══ VIDEOS ══ */}
        {nav === "videos" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color || T.blue} size={38} />
                <div>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>@{acc?.username}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{accPosts.length} 条内容</div>
                </div>
              </div>
              <Btn onClick={() => syncAccount(acc)} disabled={syncing} color={T.emerald} style={{ fontSize: 12, padding: "8px 14px" }}>{syncing ? "同步中..." : "🔄 同步"}</Btn>
            </div>
            {accPosts.length === 0 && <Card><div style={{ color: T.muted, textAlign: "center", padding: "40px 0" }}>还没有数据，请先同步</div></Card>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedPosts.map((post, i) => {
                const va = accInsight?.video_analysis?.[sortedPosts.findIndex(p => p.ig_post_id === post.ig_post_id)] || accInsight?.video_analysis?.[i];
                const isOpen = expandedPost === post.ig_post_id;
                return (
                  <Card key={post.ig_post_id || i} style={{ cursor: "pointer" }} onClick={() => setExpandedPost(isOpen ? null : post.ig_post_id)}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {post.thumbnail_url && (
                        <a href={post.permalink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                          <img src={post.thumbnail_url} style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                        </a>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{post.caption?.substring(0, 100) || "(无文案)"}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <Badge color={T.cyan}>{post.type || "POST"}</Badge>
                          <Badge color={T.pink}>❤️ {post.likes || 0}</Badge>
                          <Badge color={T.blue}>💬 {post.comments || 0}</Badge>
                          <Badge color={T.violet}>🔖 {post.saves || 0}</Badge>
                          {post.video_views > 0 && <Badge color={T.amber}>▶️ {post.video_views}</Badge>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ color: parseFloat(post.engagement_rate) > 5 ? T.emerald : parseFloat(post.engagement_rate) > 3 ? T.amber : T.muted, fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{post.engagement_rate}%</div>
                        <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>互动率</div>
                        <div style={{ color: isOpen ? T.blue : T.dim, fontSize: 16, marginTop: 6 }}>{isOpen ? "▲" : "▼"}</div>
                      </div>
                    </div>
                    {/* Expanded analysis */}
                    {isOpen && (
                      <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                        {va ? (
                          <div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                              {[
                                { l: "Hook 强度", v: va.hook_score || 0, note: va.hook_feedback },
                                { l: "内容结构", v: va.content_score || 0, note: va.content_feedback },
                                { l: "CTA 强度", v: va.cta_score || 0, note: va.cta_feedback },
                              ].map(m => (
                                <div key={m.l} style={{ background: T.bg, borderRadius: 10, padding: 12 }}>
                                  <div style={{ color: T.muted, fontSize: 10, marginBottom: 6 }}>{m.l}</div>
                                  <ScoreRing score={m.v} color={m.v >= 80 ? T.emerald : m.v >= 60 ? T.amber : T.rose} size={52} label="" />
                                  <div style={{ color: T.muted, fontSize: 10, marginTop: 6, lineHeight: 1.4 }}>{m.note}</div>
                                </div>
                              ))}
                            </div>
                            {va.why_stopped && (
                              <div style={{ background: T.rose + "11", border: `1px solid ${T.rose}33`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                                <div style={{ color: T.rose, fontSize: 10, marginBottom: 4 }}>⚠️ 推流中断原因</div>
                                <div style={{ color: T.text, fontSize: 13 }}>{va.why_stopped}</div>
                              </div>
                            )}
                            {va.rewrite_hook && (
                              <div style={{ background: T.emerald + "11", border: `1px solid ${T.emerald}33`, borderRadius: 10, padding: 12 }}>
                                <div style={{ color: T.emerald, fontSize: 10, marginBottom: 4 }}>💡 改进版 Hook</div>
                                <div style={{ color: T.text, fontSize: 13 }}>"{va.rewrite_hook}"</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: T.muted, textAlign: "center", padding: "20px 0", fontSize: 13 }}>
                            先去「分析」页面运行 AI 分析，即可看到这条视频的详细诊断
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ANALYZE ══ */}
        {nav === "analyze" && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Label>AI 内容分析引擎</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color || T.blue} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontWeight: 700 }}>@{acc?.username}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{accPosts.length} 条内容 · {acc?.strategy?.positioning || "⚠️ 请设置策略档案"}</div>
                </div>
                {!acc?.strategy?.positioning && <Btn onClick={() => setStrategyModal(acc)} color={T.amber} style={{ fontSize: 12, padding: "7px 14px" }}>设置策略</Btn>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={() => syncAccount(acc)} disabled={syncing} ghost color={T.emerald} style={{ flex: 1 }}>{syncing ? "同步中..." : "🔄 先同步"}</Btn>
                <Btn onClick={analyze} disabled={analyzing || accPosts.length === 0} color={T.violet} style={{ flex: 2 }}>{analyzing ? "🧠 分析中..." : "🤖 开始 AI 分析"}</Btn>
              </div>
            </Card>

            {accInsight && (
              <div>
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                    <ScoreRing score={accInsight.overall_score || 0} color={acc?.color || T.blue} size={90} label="总分" />
                    <div style={{ flex: 1 }}>
                      <Label>分析结果</Label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        {[
                          { l: "最佳类型", v: accInsight.best_post_type, c: T.blue },
                          { l: "最佳时间", v: accInsight.best_time, c: T.amber },
                          { l: "最强Hook", v: accInsight.best_hook, c: T.violet },
                        ].filter(s => s.v).map(s => <Badge key={s.l} color={s.c}>{s.l}：{s.v}</Badge>)}
                      </div>
                      {accInsight.top_topics?.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {accInsight.top_topics.map(t => <Badge key={t} color={T.cyan}>#{t}</Badge>)}
                        </div>
                      )}
                    </div>
                  </div>
                  {accInsight.tomorrow_idea && (
                    <div style={{ background: T.emerald + "11", border: `1px solid ${T.emerald}33`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ color: T.emerald, fontWeight: 700, marginBottom: 6 }}>💡 明天发什么</div>
                      <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>{accInsight.tomorrow_idea}</div>
                    </div>
                  )}
                  {accInsight.growth_bottleneck && (
                    <div style={{ background: T.rose + "11", border: `1px solid ${T.rose}33`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ color: T.rose, fontWeight: 700, marginBottom: 6 }}>⚠️ 增长瓶颈</div>
                      <div style={{ color: T.text, fontSize: 13 }}>{accInsight.growth_bottleneck}</div>
                    </div>
                  )}
                  {accInsight.recommendations?.length > 0 && (
                    <div>
                      <Label>可执行建议</Label>
                      {accInsight.recommendations.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ color: T.emerald, fontWeight: 700, flexShrink: 0 }}>✓</div>
                          <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>{r}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                {accInsight.video_analysis?.length > 0 && (
                  <Card>
                    <Label>逐条视频诊断</Label>
                    {accInsight.video_analysis.map((v, i) => (
                      <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ color: T.text, fontSize: 12, marginBottom: 10 }}>{v.caption}...</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                          {[{ l: "Hook", v: v.hook_score || 0, n: v.hook_feedback }, { l: "内容", v: v.content_score || 0, n: v.content_feedback }, { l: "CTA", v: v.cta_score || 0, n: v.cta_feedback }].map(m => (
                            <div key={m.l} style={{ background: T.bg, borderRadius: 8, padding: 10, textAlign: "center" }}>
                              <ScoreRing score={m.v} color={m.v >= 80 ? T.emerald : m.v >= 60 ? T.amber : T.rose} size={48} label={m.l} />
                              <div style={{ color: T.muted, fontSize: 10, marginTop: 6 }}>{m.n}</div>
                            </div>
                          ))}
                        </div>
                        {v.why_stopped && <div style={{ background: T.rose + "11", border: `1px solid ${T.rose}22`, borderRadius: 8, padding: 10, marginBottom: 8 }}><span style={{ color: T.rose, fontSize: 11 }}>⚠️ 推流中断：{v.why_stopped}</span></div>}
                        {v.rewrite_hook && <div style={{ background: T.emerald + "11", border: `1px solid ${T.emerald}22`, borderRadius: 8, padding: 10 }}><span style={{ color: T.emerald, fontSize: 11 }}>💡 改进Hook："{v.rewrite_hook}"</span></div>}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ SCRIPT ══ */}
        {nav === "script" && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Label>跨平台脚本生成器</Label>
              {acc?.strategy?.positioning && (
                <div style={{ background: T.blue + "11", border: `1px solid ${T.blue}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ color: T.muted, fontSize: 10, marginBottom: 2 }}>当前策略</div>
                  <div style={{ color: T.blue, fontSize: 12 }}>📌 {acc.strategy.positioning} · 🎯 {acc.strategy.goal}</div>
                </div>
              )}
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[{ id: "quick", label: "⚡ 快速脚本", desc: "对着拍用" }, { id: "full", label: "📦 完整套装", desc: "跨5平台" }].map(m => (
                  <div key={m.id} onClick={() => setScriptMode(m.id)} style={{ flex: 1, background: scriptMode === m.id ? T.violet + "22" : T.bg, border: `1px solid ${scriptMode === m.id ? T.violet : T.border}`, borderRadius: 12, padding: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                    <div style={{ color: scriptMode === m.id ? T.violet : T.text, fontWeight: 700, fontSize: 13 }}>{m.label}</div>
                    <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
              {/* Format */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>内容格式</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {FORMATS.map(f => <div key={f} onClick={() => setFormat(f)} style={{ background: format === f ? T.blue + "22" : T.bg, border: `1px solid ${format === f ? T.blue : T.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: format === f ? T.blue : T.muted, fontSize: 12, fontWeight: format === f ? 700 : 400, transition: "all 0.15s" }}>{f}</div>)}
                </div>
              </div>
              {/* Platforms (full mode only) */}
              {scriptMode === "full" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>目标平台（可多选）</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PLATFORMS.map(p => <div key={p} onClick={() => setSelPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{ background: selPlatforms.includes(p) ? (PLATFORM_COLORS[p] || T.violet) + "22" : T.bg, border: `1px solid ${selPlatforms.includes(p) ? PLATFORM_COLORS[p] || T.violet : T.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: selPlatforms.includes(p) ? PLATFORM_COLORS[p] || T.violet : T.muted, fontSize: 12, fontWeight: selPlatforms.includes(p) ? 700 : 400, transition: "all 0.15s" }}>{p}</div>)}
                  </div>
                </div>
              )}
              {/* Topic input */}
              <div style={{ display: "flex", gap: 10 }}>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="内容主题（如：第一年创业亏了RM50K的真实故事）"
                  style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 13, outline: "none" }}
                  onKeyDown={e => e.key === "Enter" && genScript()} />
                <Btn onClick={genScript} disabled={scriptLoading || !topic} color={T.violet}>{scriptLoading ? "生成中..." : "✨ 生成"}</Btn>
              </div>
            </Card>
            {scriptLoading && <Card><div style={{ color: T.muted, textAlign: "center", padding: "36px 0" }}>🧠 Claude 正在为你生成专属脚本...</div></Card>}
            {script && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Label>生成结果</Label>
                  <button onClick={() => navigator.clipboard.writeText(script).then(() => showToast("✅ 已复制！"))} style={{ background: T.blue + "22", color: T.blue, border: `1px solid ${T.blue}33`, borderRadius: 7, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>📋 复制全部</button>
                </div>
                <div style={{ color: T.text, fontSize: 13.5, lineHeight: 1.9, whiteSpace: "pre-wrap", background: T.bg, borderRadius: 12, padding: 18, borderLeft: `3px solid ${T.violet}` }}>{script}</div>
              </Card>
            )}
          </div>
        )}

        {/* ══ TRENDS ══ */}
        {nav === "trends" && (
          <div>
            {/* Market trends */}
            <Card style={{ marginBottom: 16 }}>
              <Label>🔥 市场爆款分析</Label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={trendsNiche} onChange={e => setTrendsNiche(e.target.value)} placeholder="输入行业（如：电商、手表、健身）"
                  style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, outline: "none" }}
                  onKeyDown={e => e.key === "Enter" && fetchTrends()} />
                <Btn onClick={fetchTrends} disabled={loadingTrends || !trendsNiche} color={T.amber}>{loadingTrends ? "分析中..." : "🔥 分析"}</Btn>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["电商", "手表", "时装", "健身", "美食", "个人品牌"].map(n => (
                  <div key={n} onClick={() => setTrendsNiche(n)} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", color: T.muted, fontSize: 11, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.borderColor = T.amber; e.target.style.color = T.amber; }}
                    onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.muted; }}>{n}</div>
                ))}
              </div>
            </Card>
            {loadingTrends && <Card><div style={{ color: T.muted, textAlign: "center", padding: "36px 0" }}>🔥 AI 正在分析市场趋势...</div></Card>}
            {trends && (
              <div>
                {trends.weekly_insights && <Card style={{ marginBottom: 12 }}><Label>本周洞察</Label><div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>{trends.weekly_insights}</div></Card>}
                {trends.trending_topics?.length > 0 && (
                  <Card style={{ marginBottom: 12 }}>
                    <Label>🔥 爆款话题</Label>
                    {trends.trending_topics.map((t, i) => (
                      <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{t.topic}</div>
                          <div style={{ display: "flex", gap: 5 }}>
                            {t.platforms?.map(p => <Badge key={p} color={PLATFORM_COLORS[p] || T.blue}>{p}</Badge>)}
                          </div>
                        </div>
                        <div style={{ color: T.muted, fontSize: 12, marginBottom: 8 }}>{t.why_trending}</div>
                        {t.sample_hook && <div style={{ background: T.violet + "11", border: `1px solid ${T.violet}22`, borderRadius: 8, padding: "8px 12px" }}><span style={{ color: T.violet, fontSize: 12 }}>Hook："{t.sample_hook}"</span></div>}
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, background: T.border, borderRadius: 4, height: 6 }}>
                            <div style={{ background: T.amber, width: `${t.virality_score || 0}%`, height: "100%", borderRadius: 4, transition: "width 1s", boxShadow: `0 0 6px ${T.amber}66` }} />
                          </div>
                          <span style={{ color: T.amber, fontWeight: 700, fontSize: 12 }}>{t.virality_score}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
                {trends.action_items?.length > 0 && (
                  <Card style={{ marginBottom: 12 }}>
                    <Label>今天就可以做</Label>
                    {trends.action_items.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ color: T.emerald, fontWeight: 700 }}>✓</div>
                        <div style={{ color: T.text, fontSize: 13 }}>{a}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* Competitor analysis */}
            <Card style={{ marginTop: 16 }}>
              <Label>🎯 对标账号 + 二次创作</Label>
              <textarea value={competitors} onChange={e => setCompetitors(e.target.value)}
                placeholder={"输入对标账号（每行一个）\n@creator1\n@creator2"}
                rows={3} style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, boxSizing: "border-box", outline: "none", resize: "vertical", fontFamily: "inherit", marginBottom: 10 }} />
              <Btn onClick={analyzeCompetitors} disabled={loadingComp || !competitors} color={T.violet} full>{loadingComp ? "分析中..." : "🎯 分析 + 生成二次创作脚本"}</Btn>
            </Card>
            {loadingComp && <Card style={{ marginTop: 12 }}><div style={{ color: T.muted, textAlign: "center", padding: "36px 0" }}>🧠 AI 正在分析对标账号...</div></Card>}
            {competitor && (
              <div style={{ marginTop: 12 }}>
                {competitor.recreation_scripts?.length > 0 && (
                  <Card style={{ marginBottom: 12 }}>
                    <Label>✨ 二次创作脚本</Label>
                    {competitor.recreation_scripts.map((s, i) => (
                      <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>原概念：{s.original_concept}</div>
                        <div style={{ color: T.text, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>你的版本：{s.your_version_title}</div>
                        <div style={{ background: T.bg, borderRadius: 10, padding: 12 }}>
                          {[["Hook（0-3秒）", s.your_hook, T.amber], ["内容结构", s.your_structure, T.blue], ["CTA", s.your_cta, T.emerald], ["差异化", s.differentiation, T.violet]].filter(x => x[1]).map(([l, v, c]) => (
                            <div key={l} style={{ marginBottom: 8 }}>
                              <span style={{ color: c, fontSize: 10 }}>{l}</span>
                              <div style={{ color: T.text, fontSize: 13, marginTop: 2 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
                {competitor.market_gaps?.length > 0 && (
                  <Card>
                    <Label>💎 市场空缺</Label>
                    {competitor.market_gaps.map((g, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ color: T.amber }}>💎</div>
                        <div style={{ color: T.text, fontSize: 13 }}>{g}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ ROADMAP ══ */}
        {nav === "roadmap" && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Label>🗺️ 成长路线图</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <Avatar username={acc?.username} picUrl={accProfile?.profile_picture_url} color={acc?.color || T.blue} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontWeight: 700 }}>@{acc?.username}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>现有 {accProfile?.followers_count?.toLocaleString() || 0} 粉丝 · {acc?.strategy?.goal || "请设置目标"}</div>
                </div>
              </div>
              {!acc?.strategy?.positioning && (
                <div style={{ background: T.amber + "11", border: `1px solid ${T.amber}33`, borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <div style={{ color: T.amber, fontSize: 12 }}>⚠️ 请先设置策略档案，路线图会更精准</div>
                </div>
              )}
              <Btn onClick={generateRoadmap} disabled={loadingRoadmap} color={T.blue} full>{loadingRoadmap ? "🧠 生成中..." : "🗺️ 生成我的专属路线图"}</Btn>
            </Card>

            {loadingRoadmap && <Card><div style={{ color: T.muted, textAlign: "center", padding: "36px 0" }}>🧠 AI 正在为你规划从0到变现的路线图...</div></Card>}

            {accRoadmap && (
              <div>
                {accRoadmap.phases?.map((phase, i) => (
                  <Card key={i} style={{ marginBottom: 12, borderLeft: `3px solid ${[T.blue, T.violet, T.emerald, T.amber][i % 4]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ color: [T.blue, T.violet, T.emerald, T.amber][i % 4], fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{phase.phase}</div>
                        <div style={{ color: T.text, fontWeight: 800, fontSize: 16, marginTop: 2 }}>{phase.name}</div>
                        <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{phase.duration}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Badge color={[T.blue, T.violet, T.emerald, T.amber][i % 4]}>{phase.follower_target}</Badge>
                        {phase.monetization && phase.monetization !== "暂未变现" && (
                          <div style={{ marginTop: 6 }}><Badge color={T.emerald}>{phase.monetization}</Badge></div>
                        )}
                      </div>
                    </div>
                    <div style={{ background: T.bg, borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      <div style={{ color: T.muted, fontSize: 10, marginBottom: 8 }}>每天行动</div>
                      {phase.daily_actions?.map((a, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: j < phase.daily_actions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                          <div style={{ color: T.emerald, fontWeight: 700, flexShrink: 0 }}>✓</div>
                          <div style={{ color: T.text, fontSize: 12 }}>{a}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {phase.content_focus && <Badge color={T.cyan}>内容：{phase.content_focus}</Badge>}
                      {phase.posting_frequency && <Badge color={T.violet}>频率：{phase.posting_frequency}</Badge>}
                      {phase.key_metric && <Badge color={T.amber}>关键指标：{phase.key_metric}</Badge>}
                    </div>
                  </Card>
                ))}
                {accRoadmap.monetization_strategy && (
                  <Card style={{ marginBottom: 12, borderLeft: `3px solid ${T.emerald}` }}>
                    <Label>💰 变现策略</Label>
                    <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>{accRoadmap.monetization_strategy}</div>
                  </Card>
                )}
                {accRoadmap.key_milestones?.length > 0 && (
                  <Card>
                    <Label>🏆 关键里程碑</Label>
                    {accRoadmap.key_milestones.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ color: T.amber, fontWeight: 700 }}>🏆</div>
                        <div style={{ color: T.text, fontSize: 13 }}>{m}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ ACCOUNTS ══ */}
        {nav === "accounts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Label>账号管理</Label>
              <Btn onClick={() => setAccountModal({ id: Date.now(), username: "", name: "", token: "", color: T.violet, strategy: {} })} color={T.blue} style={{ fontSize: 12, padding: "8px 16px" }}>✚ 添加账号</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accounts.map(a => (
                <Card key={a.id} style={{ borderLeft: `3px solid ${a.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar username={a.username} picUrl={profiles[a.id]?.profile_picture_url} color={a.color} size={56} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                      <div style={{ color: T.muted, fontSize: 12 }}>@{a.username}</div>
                      {a.strategy?.positioning && <div style={{ color: a.color, fontSize: 11, marginTop: 3 }}>📌 {a.strategy.positioning}</div>}
                      {a.strategy?.goal && <div style={{ color: T.muted, fontSize: 11 }}>🎯 {a.strategy.goal}</div>}
                      <div style={{ color: a.token ? T.emerald : T.rose, fontSize: 10, marginTop: 3 }}>{a.token ? "✅ Token 已设置" : "⚠️ 需要设置 Token"}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setAccountModal(a)} style={{ background: T.blue + "22", color: T.blue, border: `1px solid ${T.blue}33`, borderRadius: 7, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>✏️ 编辑</button>
                      <button onClick={() => setStrategyModal(a)} style={{ background: T.amber + "22", color: T.amber, border: `1px solid ${T.amber}33`, borderRadius: 7, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>📌 策略</button>
                      <button onClick={() => syncAccount(a)} style={{ background: T.emerald + "22", color: T.emerald, border: `1px solid ${T.emerald}33`, borderRadius: 7, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>🔄 同步</button>
                      {accounts.length > 1 && <button onClick={() => { if (confirm("确定删除？")) setAccounts(p => p.filter(x => x.id !== a.id)); }} style={{ background: T.rose + "22", color: T.rose, border: `1px solid ${T.rose}33`, borderRadius: 7, padding: "5px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>删除</button>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom nav ── */}
      <nav style={{ background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", position: "sticky", bottom: 0, zIndex: 50 }}>
        {NAVS.map(n => (
          <button key={n.id} onClick={() => setNav(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "9px 2px 7px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderTop: nav === n.id ? `2px solid ${T.blue}` : "2px solid transparent", transition: "border-color 0.15s" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span style={{ color: nav === n.id ? T.blue : T.muted, fontSize: 9, fontWeight: nav === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Modals ── */}
      {strategyModal && <StrategyModal account={strategyModal} onSave={saveStrategy} onClose={() => setStrategyModal(null)} />}
      {accountModal && <AccountModal editing={accountModal?.username ? accountModal : null} onSave={saveAccount} onClose={() => setAccountModal(null)} />}
    </div>
  );
}
