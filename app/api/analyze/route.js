import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const posts = body.posts || [];

    if (!posts.length) {
      return NextResponse.json({ error: "No posts found" }, { status: 400 });
    }

    const postSummary = posts.map(p => ({
      type: p.type,
      caption: p.caption?.substring(0, 100),
      date: p.published_at,
      er: p.engagement_rate,
      likes: p.likes,
      saves: p.saves,
      reach: p.reach,
    }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: `你是专业的Instagram内容分析师，专门分析马来西亚华人电商账号。分析数据后用JSON格式回答，不要加任何其他文字。`,
        messages: [{
          role: "user",
          content: `分析这个Instagram账号的内容表现，返回JSON：
数据：${JSON.stringify(postSummary)}

返回格式（必须是合法JSON）：
{
  "best_post_type": "最佳内容类型",
  "best_time": "最佳发布时间",
  "best_hook": "最有效的开场方式",
  "top_topics": ["话题1","话题2","话题3"],
  "tomorrow_idea": "明天应该发什么内容（具体题目）",
  "recommendations": ["建议1","建议2","建议3","建议4","建议5"]
}`
        }],
      }),
    });

    const aiData = await res.json();
    const rawText = aiData.content?.[0]?.text || "{}";
    let analysis;
    try {
      analysis = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      analysis = { tomorrow_idea: rawText, recommendations: [] };
    }

    return NextResponse.json({ success: true, analysis, post_count: posts.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
