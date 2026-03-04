import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const projects = (data ?? []).map(mapProjectFromDb);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const project = await request.json();

  const row = {
    id: project.id,
    title: project.title,
    summary: project.summary,
    format: project.format,
    status: project.status,
    content: project.content,
    tags: project.tags,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };

  const { data, error } = await supabase
    .from("projects")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapProjectFromDb(data));
}

function mapProjectFromDb(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    format: row.format,
    status: row.status,
    content: row.content,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
