import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateRequest,
  generateApiKey,
  requireScope,
} from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "keys:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
    .eq("user_id", actor.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  scopes: z
    .array(z.string())
    .default(["notes:write", "notes:read"]),
});

export async function POST(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "keys:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const key = generateApiKey();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: actor.userId,
      name: parsed.data.name,
      key_prefix: key.prefix,
      key_hash: key.hash,
      scopes: parsed.data.scopes,
    })
    .select("id, name, key_prefix, scopes, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    {
      data,
      token: key.raw,
      warning: "Guardá este token ahora. No se vuelve a mostrar.",
    },
    { status: 201 },
  );
}
