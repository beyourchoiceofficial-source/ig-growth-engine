import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const posts = body.posts || [];
    
    if (!posts.length) {
      return NextResponse.json({ error: "No posts found" }, { status: 400 });
    }

    const summary = posts.map(p => ({
      type: p.type,
      caption: p.caption?.substring(0, 100) || "",
      likes: p.likes || 0,
      comments: p.comments || 0,
    }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `你是Instagram内容分析师。分析以下${posts.length}条帖子数据，用中文给出建议。

数据：${JSON.stringify(summary)}

请直接回答以下问题：
1. 最适合这个账号的内容类型是什么？
2. 建议什么时间发帖？
3. 最有效的开场Hook方式？
4. 明天应该发什么内容？
5. 3个具体可执行的建议？

用这个JSON格式回答（只返回JSON）：
{
  "best_post_type": "答案",
  "best_time": "答案",
  "best_hook": "答案",
  "top_topics": ["话题1", "话题2", "话题3"],
  "tomorrow_idea": "答案",
  "recommendations": ["建议1", "建议2", "建议3"]
}`
        }],
      }),
    });

    const aiData = await res.json();
    console.log("Claude response:", JSON.stringify(aiData));
    
    if (aiData.error) {
      return NextResponse.json({ error: aiData.error.message }, { status: 500 });
    }

    const rawText = aiData.content?.[0]?.text || "";
    console.log("Raw text:", rawText);

    // Try multiple JSON extraction methods
    let analysis = null;
    
    // Method 1: Direct parse
    try { analysis = JSON.parse(rawText); } catch {}
    
    // Method 2: Extract JSON block
    if (!analysis || !analysis.best_post_type) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { analysis = JSON.parse(match[0]); } catch {}
      }
    }

    // Method 3: Clean and parse
    if (!analysis || !analysis.best_post_type) {
      const cleaned = rawText.replace(/```json/g,"").replace(/```/g,"").trim();
      try { analysis = JSON.parse(cleaned); } catch {}
    }

    // Fallback
    if (!analysis || !analysis.best_post_type) {
      analysis = {
        best_post_type: "VIDEO",
        best_time: "周五晚上9点",
        best_hook: "用真实故事开场",
        top_topics: ["电商经验", "创业故事", "马来西亚"],
        tomorrow_idea: rawText.substring(0, 200) || "分享你的电商经验",
        recommendations: [
          "每周至少发3条 Reel",
          "用真实故事建立信任",
          "结尾加强CTA让人保存或分享"
        ]
      };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}