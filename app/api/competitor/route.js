import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { competitors, strategy } = await req.json();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        system: "你是社交媒体竞品分析专家。只返回JSON。",
        messages: [{ role: "user", content: `分析对标账号：${competitors.join(", ")}
我的定位：${strategy?.positioning || "马来西亚华人电商"}

返回JSON：
{
  "competitor_insights": [{"account":"@账号","winning_formula":"爆款公式","best_content_types":["类型"],"hook_patterns":["Hook"],"what_works":"做得好的地方"}],
  "market_gaps": ["市场空缺"],
  "recreation_scripts": [{"original_concept":"原概念","your_version_title":"你的版本","your_hook":"你的Hook","your_structure":"内容结构","your_cta":"CTA","differentiation":"差异化"}],
  "weekly_plan": ["发布计划"]
}` }],
      }),
    });
    const d = await res.json();
    if (d.error) return NextResponse.json({ error: d.error.message }, { status: 500 });
    let text = d.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let result;
    try { result = JSON.parse(match ? match[0] : text); }
    catch { result = { competitor_insights: [], market_gaps: [], recreation_scripts: [], weekly_plan: [] }; }
    return NextResponse.json({ success: true, result });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
