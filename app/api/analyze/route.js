import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { posts, strategy, username } = await req.json();
    if (!posts?.length) return NextResponse.json({ error: "No posts" }, { status: 400 });

    const strategyCtx = strategy?.positioning
      ? `账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n目标结果：${strategy.goal}\n内容风格：${strategy.style}`
      : "马来西亚华人电商账号";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2500,
        messages: [{ role: "user", content: `你是专业Instagram内容分析师。只返回JSON。

${strategyCtx}

帖子数据：${JSON.stringify(posts.map(p => ({ type: p.type, caption: p.caption?.substring(0, 120), likes: p.likes||0, comments: p.comments||0, saves: p.saves||0, reach: p.reach||0, video_views: p.video_views||0, er: p.engagement_rate||0, date: p.published_at })))}

返回JSON：
{
  "overall_score": 72,
  "best_post_type": "VIDEO",
  "best_time": "周五晚上9点",
  "best_hook": "用真实数字开场",
  "top_topics": ["话题1","话题2","话题3"],
  "tomorrow_idea": "具体内容题目",
  "growth_bottleneck": "最大增长瓶颈",
  "recommendations": ["建议1","建议2","建议3"],
  "style_dna": "这个账号的内容DNA特征",
  "video_analysis": [
    {
      "caption": "前20字",
      "hook_score": 75,
      "hook_type": "数字型",
      "hook_feedback": "Hook分析",
      "content_score": 70,
      "content_feedback": "内容结构分析",
      "cta_score": 60,
      "cta_feedback": "CTA分析",
      "virality_score": 68,
      "why_stopped": "推流中断原因",
      "rewrite_hook": "改进版Hook",
      "rewrite_script": "根据弱点生成的完整改进脚本"
    }
  ]
}` }],
      }),
    });

    const aiData = await res.json();
    if (aiData.error) return NextResponse.json({ error: aiData.error.message }, { status: 500 });

    let text = aiData.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let analysis;
    try { analysis = JSON.parse(match ? match[0] : text); }
    catch { analysis = { overall_score: 50, tomorrow_idea: text, recommendations: [], video_analysis: [] }; }

    // Save to Supabase
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      await supabase.from("ai_insights").upsert({
        username, overall_score: analysis.overall_score,
        best_post_type: analysis.best_post_type, best_time: analysis.best_time,
        best_hook: analysis.best_hook, top_topics: analysis.top_topics,
        recommendations: analysis.recommendations, video_analysis: analysis.video_analysis,
        tomorrow_idea: analysis.tomorrow_idea, growth_bottleneck: analysis.growth_bottleneck,
        style_dna: analysis.style_dna, analyzed_at: new Date().toISOString(),
      }, { onConflict: "username" });
    } catch {}

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
