import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  try {
    const { data, error } = await sb().from("accounts").select("*").order("created_at");
    if (error) throw error;
    return NextResponse.json({ accounts: data || [] });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = await sb().from("accounts").upsert({
      username: body.username, name: body.name, color: body.color,
      token: body.token, strategy: body.strategy || {}, updated_at: new Date().toISOString(),
    }, { onConflict: "username" }).select().single();
    if (error) throw error;
    return NextResponse.json({ account: data });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req) {
  try {
    const { username } = await req.json();
    await sb().from("accounts").delete().eq("username", username);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
