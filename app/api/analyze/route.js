import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { posts, strategy } = await req.json();
    if (!posts?.length) return NextResponse.json({ error: "No posts" }, { status: 400 });

    const strategyCtx = strategy?.positioning
      ? `账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n目标结果：${strategy.goal}\n内容风格：${strategy.style}`
      : "马来西亚华人电商账号";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2500,
        messages: [{ role: "user", content: `你是专业Instagram内容分析师。分析以下数据并只返回JSON。

${strategyCtx}

帖子数据：${JSON.stringify(posts.map(p => ({ type: p.type, caption: p.caption?.substring(0, 120), likes: p.likes || 0, comments: p.comments || 0, saves: p.saves || 0, reach: p.reach || 0, video_views: p.video_views || 0, er: p.engagement_rate || 0, date: p.published_at })))}

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
      "why_stopped": "为什么推流中断的分析",
      "rewrite_hook": "改进版Hook",
      "overall": 71
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

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
