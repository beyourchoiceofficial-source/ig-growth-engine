import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { type, topic, account, goal } = await req.json();
    const { data: insight } = await supabase
      .from("ai_insights").select("*")
      .order("created_at", { ascending: false }).limit(1).single();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 1500,
        system: `你是专业的Instagram内容策略师，专门为马来西亚华人电商账号创作爆款内容。`,
        messages: [{
          role: "user",
          content: `为 @${account} 写一条 Instagram ${type} 爆款文案。
主题：${topic}
目标：${goal}
账号最佳Hook方式：${insight?.best_hook || "用问题或数字开场"}
账号热门话题：${JSON.stringify(insight?.top_topics || [])}

输出：
【封面文字】（3-6字）
【开场钩子】（前15字，让人停止滑动）
【正文】（根据${type}格式展开）
【CTA】（根据目标"${goal}"定制）
【Hashtag】（15个，中英马来混合）
【发布建议】（时间+策略）`
        }],
      }),
    });

    const data = await res.json();
    const content = data.content?.[0]?.text || "";
    return NextResponse.json({ success: true, content });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
