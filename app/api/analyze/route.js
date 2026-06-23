import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const posts = body.posts || [];
    const strategy = body.strategy || {};
    if (!posts.length) return NextResponse.json({ error: "No posts found" }, { status: 400 });

    const summary = posts.map(p => ({
      type: p.type, caption: p.caption?.substring(0, 120) || "",
      likes: p.likes||0, comments: p.comments||0, saves: p.saves||0,
      reach: p.reach||0, video_views: p.video_views||0, er: p.engagement_rate||0,
      date: p.published_at,
    }));

    const strategyCtx = strategy.positioning ?
      `账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n想要结果：${strategy.goal}\n内容风格：${strategy.style}` :
      "马来西亚华人电商账号";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        messages: [{ role:"user", content:
          `你是专业Instagram内容分析师，服务马来西亚华人账号。

${strategyCtx}

分析这${posts.length}条内容数据：
${JSON.stringify(summary)}

返回JSON（只返回JSON不要其他文字）：
{
  "best_post_type": "最佳内容类型",
  "best_time": "最佳发布时间",
  "best_hook": "最有效Hook方式",
  "top_topics": ["话题1","话题2","话题3"],
  "tomorrow_idea": "明天应该发什么具体题目",
  "recommendations": ["建议1","建议2","建议3"],
  "video_analysis": [
    {
      "caption": "帖子前20字",
      "hook_score": 75,
      "hook_feedback": "Hook分析",
      "cta_score": 60,
      "cta_feedback": "CTA分析",
      "structure_score": 70,
      "improvement": "具体改进建议"
    }
  ]
}` }],
      }),
    });

    const aiData = await res.json();
    if (aiData.error) return NextResponse.json({ error: aiData.error.message }, { status: 500 });

    let text = aiData.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g,"").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let analysis;
    try { analysis = JSON.parse(match?match[0]:text); }
    catch { analysis = { best_post_type:"VIDEO", best_time:"周五9PM", best_hook:"用真实故事开场", top_topics:["电商","创业","马来西亚"], tomorrow_idea:"分享你最近学到的一个电商教训", recommendations:["多发Reel","用真实故事","加强CTA"], video_analysis:[] }; }

    return NextResponse.json({ success:true, analysis });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
