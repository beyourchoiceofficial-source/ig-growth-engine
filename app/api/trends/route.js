import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const { niche, language } = await req.json();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, system: "你是马来西亚华人社交媒体市场专家。只返回JSON。",
        messages: [{ role: "user", content: `分析「${niche}」在马来西亚华人市场的当前内容趋势。语言：${language||"中文"}
返回JSON：{"trending_topics":[{"topic":"话题","why_trending":"原因","virality_score":85,"platforms":["IG"],"sample_hook":"示例Hook"}],"avoid_topics":["不要碰的话题"],"weekly_insights":"本周洞察","action_items":["今天就能做的行动"]}` }] }),
    });
    const d = await res.json();
    let text = d.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g,"").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let trends;
    try { trends = JSON.parse(match?match[0]:text); } catch { trends = {trending_topics:[],weekly_insights:text,action_items:[]}; }
    return NextResponse.json({ success: true, trends });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
