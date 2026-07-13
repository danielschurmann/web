import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ApiActor = {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "admin" | "editor" | "client";
  slug: string | null;
  scopes: string[];
  via: "api_key" | "session";
  apiKeyId?: string;
  /** Raw bearer key, present only for api_key actors. Used to call the SECURITY DEFINER RPCs. */
  apiKey?: string;
};

/**
 * Client for the api-keys management routes only.
 * The agent notes/leads API no longer uses this — it goes through SECURITY
 * DEFINER RPCs (see lib/api-data.ts) so it does not depend on the service role.
 */
export async function getDbForActor(actor: ApiActor): Promise<SupabaseClient> {
  if (actor.via === "session") {
    const { createClient } = await import("@/lib/supabase/server");
    return createClient();
  }
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  return getSupabaseAdmin();
}

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey() {
  const raw = `dsa_${randomBytes(24).toString("base64url")}`;
  return {
    raw,
    prefix: raw.slice(0, 12),
    hash: hashApiKey(raw),
  };
}

export async function authenticateRequest(
  request: Request,
): Promise<ApiActor | null> {
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (bearer.startsWith("dsa_")) {
    // Lookup via security definer RPC so auth works even if service_role env is wrong.
    const { getSupabasePublic } = await import("@/lib/supabase-public");
    const supabase = getSupabasePublic();
    const hash = hashApiKey(bearer);
    const { data: rows } = await supabase.rpc("lookup_api_key_by_hash", {
      p_hash: hash,
    });
    const key = Array.isArray(rows) ? rows[0] : rows;

    if (!key || key.revoked_at) return null;

    void supabase.rpc("touch_api_key_last_used", { p_id: key.id });

    return {
      userId: key.profile_id,
      email: key.email,
      fullName: key.full_name,
      role: key.role,
      slug: key.slug,
      scopes: key.scopes ?? [],
      via: "api_key",
      apiKeyId: key.id,
      apiKey: bearer,
    };
  }

  // Session cookie auth for backoffice calling same API
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, slug")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const base = [
    "notes:write",
    "notes:publish",
    "notes:read",
    "leads:read",
    "keys:manage",
  ];
  const scopes =
    profile.role === "superadmin"
      ? [...base, "users:manage"]
      : profile.role === "admin"
        ? base
        : profile.role === "editor"
          ? ["notes:write", "notes:publish", "notes:read", "leads:read"]
          : ["notes:read"];

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    slug: profile.slug,
    scopes,
    via: "session",
  };
}

export function requireScope(actor: ApiActor, scope: string) {
  return (
    actor.scopes.includes(scope) ||
    actor.role === "admin" ||
    actor.role === "superadmin"
  );
}

export function isSuperadmin(actor: ApiActor) {
  return actor.role === "superadmin";
}

/** Puede operar en el backoffice (ver consultas, crear/editar notas). */
export function isStaff(actor: ApiActor) {
  return (
    actor.role === "superadmin" ||
    actor.role === "admin" ||
    actor.role === "editor"
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
