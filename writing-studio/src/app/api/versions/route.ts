import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const projectId = request.nextUrl.searchParams.get("projectId");

  let query = supabase.from("versions").select("*");

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const versions = (data ?? []).map(mapVersionFromDb);
  return NextResponse.json(versions);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const version = await request.json();

  const row = {
    id: version.id,
    project_id: version.projectId,
    content: version.content,
    name: version.name,
    created_at: version.createdAt,
  };

  const { data, error } = await supabase
    .from("versions")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapVersionFromDb(data));
}

function mapVersionFromDb(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    name: row.name,
    createdAt: row.created_at,
  };
}
