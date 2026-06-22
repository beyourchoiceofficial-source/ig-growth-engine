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
      likes: p.likes || 0,
      saves: p.saves || 0,
      reach: p.reach || 0,
      er: p.engagement_rate || 0,
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
        system: `你是专业的Instagram内容分析师，专门分析马来西亚华人电商账号。必须只返回合法的JSON，不要加任何其他文字、代码块标记或解释。`,
        messages: [{
          role: "user",
          content: `分析这个Instagram账号的 ${posts.length} 条内容数据：
${JSON.stringify(postSummary)}

只返回这个JSON格式，不要加任何其他内容：
{"best_post_type":"VIDEO或IMAGE","best_time":"周五晚上9点","best_hook":"开场方式建议","top_topics":["话题1","话题2","话题3"],"tomorrow_idea":"明天应该发什么的具体题目","recommendations":["建议1","建议2","建议3"]}`
        }],
      }),
    });

    const aiData = await res.json();
    let rawText = aiData.content?.[0]?.text || "";
    
    // Clean up the response
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from the text
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { analysis = JSON.parse(match[0]); } 
        catch { analysis = { tomorrow_idea: rawText, recommendations: ["请重新分析"], top_topics: [] }; }
      } else {
        analysis = { tomorrow_idea: rawText, recommendations: ["请重新分析"], top_topics: [] };
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
