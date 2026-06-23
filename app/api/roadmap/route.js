import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const { strategy, currentFollowers, platform } = await req.json();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, system: "你是专业马来西亚华人社交媒体增长顾问。只返回JSON。",
        messages: [{ role: "user", content: `为这个账号制定从0到变现的完整路线图：\n账号定位：${strategy?.positioning||"马来西亚华人电商"}\n目标受众：${strategy?.audience||"华人创业者"}\n想要结果：${strategy?.goal||"涨粉变现"}\n现有粉丝：${currentFollowers||0}\n主要平台：${platform||"Instagram"}
返回JSON：{"phases":[{"phase":"第一阶段","name":"建立基础","duration":"第1-30天","follower_target":"0-500粉","daily_actions":["每天做什么1","每天做什么2"],"content_focus":"主要发什么","posting_frequency":"每天几条","key_metric":"关键指标","monetization":"暂未变现"}],"monetization_strategy":"变现策略","key_milestones":["里程碑1","里程碑2"],"total_timeline":"预计时间"}` }] }),
    });
    const d = await res.json();
    let text = d.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g,"").trim();
    const match = text.match(/\{[\s\S]*\}/);
    let roadmap;
    try { roadmap = JSON.parse(match?match[0]:text); } catch { roadmap = {phases:[],key_milestones:[],total_timeline:text}; }
    return NextResponse.json({ success: true, roadmap });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
