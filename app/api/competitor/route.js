import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { competitors, strategy } = await req.json();
    if (!competitors?.length) return NextResponse.json({ error: "No competitors" }, { status: 400 });

    const strategyCtx = strategy?.positioning ?
      `我的账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n想要结果：${strategy.goal}` :
      "马来西亚华人电商账号";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        system: `你是社交媒体竞品分析专家，专门研究马来西亚华人市场的Instagram和TikTok内容策略。`,
        messages: [{ role:"user", content:
          `分析这些对标账号：${competitors.join(", ")}

${strategyCtx}

基于这些账号通常在马来西亚华人市场的内容策略，分析并返回JSON：
{
  "competitor_insights": [
    {
      "account": "@账号名",
      "content_style": "内容风格描述",
      "winning_formula": "他们的爆款公式",
      "best_content_types": ["内容类型1","类型2"],
      "hook_patterns": ["常用Hook1","Hook2"],
      "posting_frequency": "发帖频率",
      "what_works": "什么做得好"
    }
  ],
  "market_gaps": ["市场空缺1","空缺2","空缺3"],
  "recreation_scripts": [
    {
      "original_concept": "对标账号的内容概念",
      "your_version_title": "你的版本标题",
      "your_hook": "你的开场Hook（3秒）",
      "your_structure": "你的内容结构",
      "your_cta": "你的CTA",
      "differentiation": "你跟他们的差异化"
    }
  ],
  "weekly_plan": ["周一发什么","周三发什么","周五发什么"]
}` }],
      }),
    });

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });

    let text = data.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g,"").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let result;
    try { result = JSON.parse(match?match[0]:text); }
    catch { result = { competitor_insights:[], market_gaps:[], recreation_scripts:[], weekly_plan:[] }; }

    return NextResponse.json({ success:true, result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
