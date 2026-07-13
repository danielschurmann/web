import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateRequest,
  generateApiKey,
  getDbForActor,
  requireScope,
} from "@/lib/api-auth";
import { mapSupabaseError } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const actor = await authenticateRequest(request);
    if (!actor || !requireScope(actor, "keys:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getDbForActor(actor);
    const { data, error } = await supabase
      .from("api_keys")
      .select(
        "id, name, key_prefix, scopes, last_used_at, revoked_at, created_at",
      )
      .eq("user_id", actor.userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: mapSupabaseError(error.message) },
        { status: 500 },
      );
    }
    return NextResponse.json({ data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno al listar API keys";
    return NextResponse.json(
      { error: mapSupabaseError(message) },
      { status: 500 },
    );
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  scopes: z.array(z.string()).default(["notes:write", "notes:read"]),
});

export async function POST(request: Request) {
  try {
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
    const supabase = await getDbForActor(actor);
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

    if (error) {
      return NextResponse.json(
        { error: mapSupabaseError(error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data,
        token: key.raw,
        warning: "Guardá este token ahora. No se vuelve a mostrar.",
      },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno al crear API key";
    return NextResponse.json(
      { error: mapSupabaseError(message) },
      { status: 500 },
    );
  }
}
