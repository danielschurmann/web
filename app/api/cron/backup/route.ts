import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { getSupabaseAdmin, mapSupabaseError } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Backup diario de la base a Vercel Blob (privado).
 *
 * Hace un dump lógico en JSON de las tablas de negocio usando la service_role
 * (evita RLS) y lo sube a `backups/db-<fecha>.json` en un store de Vercel Blob.
 * El archivo es privado porque contiene datos personales (leads, perfiles).
 *
 * Vercel manda `Authorization: Bearer <CRON_SECRET>` al disparar el cron; si la
 * variable está seteada, exigimos ese header.
 *
 * Requiere en el entorno:
 *  - SUPABASE_SERVICE_ROLE_KEY (+ SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL)
 *  - BLOB_READ_WRITE_TOKEN (lo inyecta Vercel al conectar un Blob store)
 */

// Tablas a respaldar. Ordenadas de forma estable para diffs legibles.
const TABLES = ["posts", "leads", "profiles", "api_keys"] as const;

// Cuántos días de backups conservar en Blob.
const RETENTION_DAYS = 30;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const generatedAt = new Date();
  const dateStr = generatedAt.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const supabase = getSupabaseAdmin();

    const data: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};

    for (const table of TABLES) {
      const { data: rows, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        throw new Error(`Tabla "${table}": ${error.message}`);
      }
      data[table] = rows ?? [];
      counts[table] = rows?.length ?? 0;
    }

    const payload = {
      generated_at: generatedAt.toISOString(),
      project_ref: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      tables: TABLES,
      counts,
      data,
    };

    // Privado: el backup contiene datos personales y no debe ser accesible
    // por URL. Se lee de vuelta con `get()` usando el token del store.
    const blob = await put(
      `backups/db-${dateStr}.json`,
      JSON.stringify(payload, null, 2),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json; charset=utf-8",
      },
    );

    const deleted = await pruneOldBackups(generatedAt);

    return NextResponse.json({
      ok: true,
      date: dateStr,
      path: blob.pathname,
      counts,
      pruned: deleted,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    console.error(`[cron/backup] fallo el backup ${dateStr}:`, raw);
    return NextResponse.json(
      { ok: false, date: dateStr, error: mapSupabaseError(raw) },
      { status: 500 },
    );
  }
}

/** Borra backups anteriores a la ventana de retención. Devuelve cuántos borró. */
async function pruneOldBackups(now: Date): Promise<number> {
  const cutoff = now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const { blobs } = await list({ prefix: "backups/" });
  const stale = blobs.filter((b) => b.uploadedAt.getTime() < cutoff);
  if (stale.length === 0) return 0;
  await del(stale.map((b) => b.url));
  return stale.length;
}
