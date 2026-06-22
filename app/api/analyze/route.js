cat > app/api/analyze/route.js << 'EOF'
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const posts = body.posts || [];
    if (!posts.length) return NextResponse.json({ error: "No posts found" }, { status: 400 });

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
        system: "你是Instagram内容分析师。只返回JSON，不要加任何其他文字。",
        messages: [{
          role: "user",
          content: `分析这${posts.length}条IG帖子数据：${JSON.stringify(posts.map(p=>({type:p.type,caption:p.caption?.substring(0,80),likes:p.likes||0})))}
只返回这个JSON：{"best_post_type":"类型","best_time":"时间","best_hook":"Hook方式","top_topics":["话题1","话题2"],"tomorrow_idea":"明天发什么","recommendations":["建议1","建议2","建议3"]}`
        }],
      }),
    });

    const aiData = await res.json();
    let text = aiData.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let analysis;
    try { analysis = JSON.parse(match ? match[0] : text); }
    catch { analysis = { tomorrow_idea: text, recommendations: [], top_topics: [] }; }

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
EOF