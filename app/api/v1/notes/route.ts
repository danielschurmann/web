import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, requireScope } from "@/lib/api-auth";
import { ApiDataError, createNote, listNotes } from "@/lib/api-data";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  body_md: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  source_url: z.string().url().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  author_slug: z
    .enum(["daniel", "alejandra", "gabriel", "sebastian"])
    .optional(),
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

  const status = new URL(request.url).searchParams.get("status");
  try {
    const data = await listNotes(actor, status);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
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

  try {
    const data = await createNote(actor, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
