import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, requireScope } from "@/lib/api-auth";
import { ApiDataError, deleteNote, getNote, updateNote } from "@/lib/api-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const data = await getNote(actor, id);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
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

  try {
    const data = await updateNote(actor, id, body);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const actor = await authenticateRequest(request);
  if (!actor || (actor.role !== "admin" && actor.role !== "superadmin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteNote(actor, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
