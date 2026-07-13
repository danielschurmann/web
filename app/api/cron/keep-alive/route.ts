import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabase-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron diario que ejecuta una consulta liviana a Supabase para mantener
 * "caliente" el proyecto free-tier (Supabase pausa proyectos gratuitos tras
 * ~7 días de inactividad).
 *
 * Vercel envía automáticamente `Authorization: Bearer <CRON_SECRET>` cuando la
 * variable CRON_SECRET está configurada. Si está seteada, validamos el header.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const ts = new Date().toISOString();

  try {
    const supabase = getSupabasePublic();
    const { error } = await supabase.from("posts").select("id").limit(1);
    if (error) throw error;

    return NextResponse.json({ ok: true, ts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, ts, error: message }, { status: 500 });
  }
}
