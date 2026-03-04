import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const projectId = request.nextUrl.searchParams.get("projectId");

  let query = supabase.from("chat_threads").select("*");

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const threads = (data ?? []).map(mapThreadFromDb);
  return NextResponse.json(threads);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const thread = await request.json();

  const row = {
    id: thread.id,
    project_id: thread.projectId,
    name: thread.name,
    messages: thread.messages,
    created_at: thread.createdAt,
  };

  const { data, error } = await supabase
    .from("chat_threads")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapThreadFromDb(data));
}

function mapThreadFromDb(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    messages: row.messages,
    createdAt: row.created_at,
  };
}
