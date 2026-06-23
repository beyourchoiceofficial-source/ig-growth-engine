import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, topic, platforms, strategy, mode, styleDna, weaknesses } = await req.json();

    const strategyCtx = strategy?.positioning
      ? `账号定位：${strategy.positioning}\n目标受众：${strategy.audience}\n目标结果：${strategy.goal}\n内容风格：${strategy.style}\n语言：${strategy.language || "中文为主"}`
      : "马来西亚华人电商个人品牌";

    const dnaCtx = styleDna ? `\n账号内容DNA：${styleDna}` : "";
    const weakCtx = weaknesses?.length ? `\n需要改进的弱点：${weaknesses.join("、")}` : "";

    const prompt = mode === "fix"
      ? `根据这个账号的视频分析弱点，生成一个改进版完整脚本：\n\n${strategyCtx}${dnaCtx}${weakCtx}\n\n主题：${topic}\n格式：${type}\n\n【封面文字】（3-6字，解决弱点）\n【Hook 0-3秒】（修复原来太弱的Hook）\n【建立共鸣 3-8秒】\n【正文 8-45秒】（清晰结构）\n【CTA 45-60秒】（强力行动指令）\n【拍摄提示】\n【发布时间建议】`
      : mode === "quick"
      ? `根据策略，为「${topic}」生成${type}完整拍摄脚本：\n\n${strategyCtx}${dnaCtx}\n\n【封面文字】\n【Hook 0-3秒】逐字稿：\n【共鸣 3-8秒】：\n【正文 8-45秒】分点：\n【CTA 45-60秒】：\n【拍摄提示】：\n【发布时间】：`
      : `根据策略，为「${topic}」生成${type}完整跨平台内容：\n\n${strategyCtx}${dnaCtx}\n平台：${platforms?.join("、")}\n\n【视频脚本】封面/Hook/正文/CTA/拍摄提示\n\n【Instagram/TikTok文案+15个Hashtag】\n\n【Facebook文案】\n\n【小红书文案】\n\n【抖音文案】\n\n【发布策略】`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, system: "你是专业马来西亚华人社交媒体内容策略师。", messages: [{ role: "user", content: prompt }] }),
    });
    const d = await res.json();
    if (d.error) return NextResponse.json({ error: d.error.message }, { status: 500 });
    return NextResponse.json({ success: true, content: d.content?.[0]?.text || "" });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
