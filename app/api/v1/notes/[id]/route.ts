import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, requireScope } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(full_name, slug, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  body_md: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const body = parsed.data;
  if (body.status === "published" && !requireScope(actor, "notes:publish")) {
    return NextResponse.json(
      { error: "Missing notes:publish scope" },
      { status: 403 },
    );
  }

  const updates: Record<string, unknown> = {
    ...body,
    updated_at: new Date().toISOString(),
  };
  if (body.status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: Params) {
  const actor = await authenticateRequest(request);
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
