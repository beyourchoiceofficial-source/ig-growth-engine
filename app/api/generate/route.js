import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, topic, platforms, strategy, mode } = await req.json();

    const strategyCtx = strategy?.positioning ?
      `账号定位：${strategy.positioning}
目标受众：${strategy.audience}
想要结果：${strategy.goal}
内容风格：${strategy.style}
语言：${strategy.language||"中文为主，适当加马来西亚华人口语"}` :
      "马来西亚华人电商个人品牌";

    const platformList = platforms?.join("、") || "Instagram";

    const prompt = mode === "quick" ?
      `根据策略档案，为「${topic}」生成一条${type}的完整拍摄脚本：

${strategyCtx}
目标平台：${platformList}

【封面文字】（3-6字）
【Hook 0-3秒】对着镜头说什么：
【共鸣 3-8秒】建立连接：
【正文 8-45秒】分点说明：
【CTA 45-60秒】结尾行动指令：
【拍摄提示】镜头/场景/表情：
【字幕建议】重点字幕：
【Hashtag】15个：` :
      `根据策略档案，为「${topic}」生成完整跨平台内容套装：

${strategyCtx}
格式：${type}
平台：${platformList}

【完整视频脚本】
封面文字：
Hook（0-3秒）：
建立共鸣（3-8秒）：
正文（8-45秒）：
CTA（45-60秒）：
拍摄建议：

【各平台文案】
📱 IG/TikTok文案+Hashtag：
📘 Facebook文案：
📕 小红书文案：
🎵 抖音文案：

【发布策略】
最佳时间：
头3小时互动策略：`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 2000,
        system: "你是专业的马来西亚华人社交媒体内容策略师，擅长创作高互动率的视频脚本和跨平台内容。",
        messages: [{ role:"user", content: prompt }],
      }),
    });

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    return NextResponse.json({ success:true, content: data.content?.[0]?.text||"" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
