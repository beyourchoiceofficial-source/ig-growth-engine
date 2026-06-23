import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { hook, duration, cover, cta, caption, username, pastPosts, strategy } = await req.json();

    const strategyCtx = strategy?.positioning
      ? `账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n内容风格：${strategy.style}`
      : "马来西亚华人电商账号";

    const pastContext = pastPosts?.length
      ? `过去爆款视频数据（供参考）：\n${pastPosts.slice(0,5).map(p => `- ${p.caption?.substring(0,80)} | ER:${p.engagement_rate}% | 赞:${p.likes}`).join("\n")}`
      : "";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        system: "你是专业Instagram内容分析师，专门预测马来西亚华人账号的视频爆款概率。只返回JSON。",
        messages: [{ role: "user", content: `分析这个视频的爆款潜力：

${strategyCtx}
${pastContext}

视频信息：
封面文字：${cover || "未填写"}
开场Hook（0-3秒）：${hook || "未填写"}
视频时长：${duration || "未知"}秒
结尾CTA：${cta || "未填写"}
文案：${caption?.substring(0, 200) || "未填写"}

返回JSON：
{
  "viral_score": 75,
  "hook_score": 70,
  "content_score": 65,
  "cta_score": 60,
  "verdict": "有潜力但需要优化",
  "strengths": ["优点1","优点2"],
  "weaknesses": ["弱点1","弱点2"],
  "why_might_stop": "为什么可能推流中断",
  "improved_hook": "改进版Hook（0-3秒逐字稿）",
  "improved_cta": "改进版CTA",
  "improved_cover": "改进版封面文字",
  "full_script": "完整改进版脚本（封面/Hook/正文/CTA）",
  "predicted_er": "预测互动率范围",
  "best_time": "最佳发布时间"
}` }],
      }),
    });

    const aiData = await res.json();
    if (aiData.error) return NextResponse.json({ error: aiData.error.message }, { status: 500 });

    let text = aiData.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let result;
    try { result = JSON.parse(match ? match[0] : text); }
    catch { result = { viral_score: 50, verdict: text, strengths: [], weaknesses: [] }; }

    // Save to Supabase
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await supabase.from("video_scores").insert({
        username, hook_text: hook, duration: parseInt(duration) || 0,
        cover_text: cover, cta_text: cta, video_title: caption?.substring(0, 100),
        hook_score: result.hook_score, content_score: result.content_score,
        cta_score: result.cta_score, viral_score: result.viral_score,
        feedback: result, improved_script: result.full_script,
      });
    } catch {}

    return NextResponse.json({ success: true, result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
