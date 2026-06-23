import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { niche, language } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        system: `你是马来西亚华人社交媒体市场专家，熟悉IG、TikTok、Facebook、小红书的内容趋势。`,
        messages: [{ role:"user", content:
          `分析「${niche}」行业在马来西亚华人市场的当前内容趋势。
语言偏好：${language||"中文为主"}

请返回JSON（只返回JSON）：
{
  "trending_topics": [
    {
      "topic": "话题名称",
      "why_trending": "为什么这个话题现在很火",
      "virality_score": 85,
      "platforms": ["IG","TikTok"],
      "sample_hook": "示例开场钩子"
    }
  ],
  "content_formats": [
    {
      "format": "内容格式",
      "description": "描述",
      "example": "具体例子"
    }
  ],
  "avoid_topics": ["现在不要碰的话题1","话题2"],
  "weekly_insights": "本周整体市场洞察",
  "action_items": ["今天就可以做的动作1","动作2","动作3"]
}` }],
      }),
    });

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });

    let text = data.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g,"").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let trends;
    try { trends = JSON.parse(match?match[0]:text); }
    catch { trends = { trending_topics:[], content_formats:[], avoid_topics:[], weekly_insights:text, action_items:[] }; }

    return NextResponse.json({ success:true, trends });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
