import { NextResponse } from "next/server";
import { authenticateRequest, getDbForActor, requireScope } from "@/lib/api-auth";
import { mapSupabaseError } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const actor = await authenticateRequest(request);
    if (!actor || !requireScope(actor, "keys:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await getDbForActor(actor);
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", actor.userId);

    if (error) {
      return NextResponse.json(
        { error: mapSupabaseError(error.message) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno al revocar API key";
    return NextResponse.json(
      { error: mapSupabaseError(message) },
      { status: 500 },
    );
  }
}
