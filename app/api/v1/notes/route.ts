import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateRequest,
  requireScope,
  slugify,
} from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  body_md: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  source_url: z.string().url().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  author_slug: z.enum(["daniel", "alejandra", "gabriel"]).optional(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  slug: z.string().optional(),
});

export async function GET(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, status, source_url, created_via, tags, published_at, created_at, updated_at, author_id, profiles!posts_author_id_fkey(full_name, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  if (body.status === "published" && !requireScope(actor, "notes:publish")) {
    return NextResponse.json(
      { error: "Missing notes:publish scope" },
      { status: 403 },
    );
  }

  const supabase = getSupabaseAdmin();
  let authorId = actor.userId;

  if (body.author_slug) {
    const { data: author } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", body.author_slug)
      .maybeSingle();
    if (!author) {
      return NextResponse.json(
        { error: `Author slug not found: ${body.author_slug}` },
        { status: 400 },
      );
    }
    authorId = author.id;
  }

  const baseSlug = slugify(body.slug || body.title);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      title: body.title,
      slug,
      excerpt: body.excerpt ?? null,
      body_md: body.body_md,
      source_url: body.source_url ?? null,
      status: body.status,
      created_via: actor.via === "api_key" ? "agent" : "backoffice",
      seo_title: body.seo_title ?? body.title,
      seo_description: body.seo_description ?? body.excerpt ?? null,
      tags: body.tags ?? [],
      published_at:
        body.status === "published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
