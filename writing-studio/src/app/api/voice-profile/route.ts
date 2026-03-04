import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("voice_profiles")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      generalStyle: "",
      tweetStyle: "",
      longFormStyle: "",
      exampleWriting: "",
      topics: [],
      personality: "",
    });
  }

  return NextResponse.json({
    id: data.id,
    generalStyle: data.general_style,
    tweetStyle: data.tweet_style,
    longFormStyle: data.long_form_style,
    exampleWriting: data.example_writing,
    topics: data.topics,
    personality: data.personality,
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const profile = await request.json();

  const { data: existing } = await supabase
    .from("voice_profiles")
    .select("id")
    .limit(1)
    .single();

  const row = {
    general_style: profile.generalStyle,
    tweet_style: profile.tweetStyle,
    long_form_style: profile.longFormStyle,
    example_writing: profile.exampleWriting,
    topics: profile.topics,
    personality: profile.personality,
  };

  if (existing) {
    const { error } = await supabase
      .from("voice_profiles")
      .update(row)
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("voice_profiles").insert(row);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
