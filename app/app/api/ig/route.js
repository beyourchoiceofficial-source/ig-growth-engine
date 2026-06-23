import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get profile
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${token}`
    );
    const profile = await profileRes.json();
    if (profile.error) return NextResponse.json({ error: profile.error.message }, { status: 400 });

    // Get media
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    if (mediaData.error) return NextResponse.json({ error: mediaData.error.message }, { status: 400 });

    const posts = mediaData.data || [];
    const savedPosts = [];

    for (const post of posts) {
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

      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const total = likes + comments + saves;
      const er = reach > 0 ? parseFloat(((total / reach) * 100).toFixed(2)) : 0;

      const postData = {
        ig_post_id: post.id,
        username: profile.username,
        type: post.media_type,
        caption: post.caption || "",
        published_at: post.timestamp,
        likes, comments, saves, reach, impressions,
        engagement_rate: er,
        thumbnail_url: post.thumbnail_url || post.media_url || "",
        permalink: post.permalink || "",
      };

      await supabase.from("posts").upsert(postData, { onConflict: "ig_post_id" });
      savedPosts.push(postData);
    }

    // Save follower snapshot
    await supabase.from("follower_snapshots").upsert({
      username: profile.username,
      followers: profile.followers_count || 0,
      snapshot_date: new Date().toISOString().split("T")[0],
    }, { onConflict: "username,snapshot_date" });

    return NextResponse.json({ 
      success: true, 
      synced: posts.length, 
      profile,
      posts: savedPosts
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
