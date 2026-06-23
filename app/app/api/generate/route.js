import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, topic, platforms, strategy } = await req.json();

    const strategyContext = strategy?.positioning ?
      `账号定位：${strategy.positioning}
目标受众：${strategy.audience}  
想要结果：${strategy.goal}
内容风格：${strategy.style}
语言风格：${strategy.language || "中文为主，适当加入马来西亚华人口语"}` :
      "马来西亚华人电商个人品牌账号，用中文+马来西亚口语";

    const platformList = platforms?.join("、") || "Instagram";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: `你是专业的跨平台内容策略师，专门服务马来西亚华人账号。你熟悉IG、TikTok、Facebook、小红书、抖音各平台的内容风格差异。`,
        messages: [{
          role: "user",
          content: `根据以下策略档案，为这个主题生成完整的跨平台内容脚本：

${strategyContext}

内容主题：${topic}
内容格式：${type}
目标平台：${platformList}

请生成：

【完整视频脚本】
封面文字：（3-6字，抓眼球）
开场Hook（0-3秒）：
建立共鸣（3-8秒）：
正文内容（8-45秒）：
CTA结尾（45-60秒）：
拍摄建议：
字幕建议：

【各平台文案】
📱 Instagram/TikTok 文案：
（文案+Hashtag×15）

📘 Facebook 文案：
（较长，适合Facebook风格）

📕 小红书文案：
（种草风格，emoji多）

🎵 抖音文案：
（简短有力，适合大陆用户）

【发布策略】
最佳发布时间：
首3小时互动策略：`
        }],
      }),
    });

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    
    const content = data.content?.[0]?.text || "";
    return NextResponse.json({ success: true, content });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
