import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: "No Instagram token" }, { status: 400 });

    // Get user profile
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) return NextResponse.json({ error: profile.error.message }, { status: 400 });

    // Get media list
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${token}`
    );
    const mediaData = await mediaRes.json();

    if (mediaData.error) return NextResponse.json({ error: mediaData.error.message }, { status: 400 });

    const posts = mediaData.data || [];
    let synced = 0;

    for (const post of posts) {
      // Get insights for each post
      let likes = post.like_count || 0;
      let comments = post.comments_count || 0;
      let saves = 0, reach = 0, impressions = 0;

      try {
        const insightRes = await fetch(
          `https://graph.instagram.com/${post.id}/insights?metric=reach,impressions,saved&access_token=${token}`
        );
        const insightData = await insightRes.json();
        if (insightData.data) {
          insightData.data.forEach(m => {
            if (m.name === "reach") reach = m.values?.[0]?.value || 0;
            if (m.name === "impressions") impressions = m.values?.[0]?.value || 0;
            if (m.name === "saved") saves = m.values?.[0]?.value || 0;
          });
        }
      } catch {}

      const total = likes + comments + saves;
      const er = reach > 0 ? ((total / reach) * 100).toFixed(2) : 0;

      await supabase.from("posts").upsert({
        ig_post_id: post.id,
        type: post.media_type,
        caption: post.caption || "",
        published_at: post.timestamp,
        likes, comments, saves, reach, impressions,
        engagement_rate: parseFloat(er),
        thumbnail_url: post.thumbnail_url || post.media_url,
        permalink: post.permalink,
      }, { onConflict: "ig_post_id" });

      synced++;
    }

    return NextResponse.json({ success: true, synced, profile });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
