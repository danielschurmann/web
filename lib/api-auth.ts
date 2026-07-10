import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ApiActor = {
  userId: string;
  email: string;
  fullName: string;
  role: "admin" | "editor" | "client";
  slug: string | null;
  scopes: string[];
  via: "api_key" | "session";
  apiKeyId?: string;
};

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
    const supabase = getSupabaseAdmin();
    const hash = hashApiKey(bearer);
    const { data: key } = await supabase
      .from("api_keys")
      .select("id, user_id, scopes, revoked_at, profiles(id, email, full_name, role, slug)")
      .eq("key_hash", hash)
      .maybeSingle();

    if (!key || key.revoked_at) return null;

    const profile = Array.isArray(key.profiles) ? key.profiles[0] : key.profiles;
    if (!profile) return null;

    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", key.id);

    return {
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      slug: profile.slug,
      scopes: key.scopes ?? [],
      via: "api_key",
      apiKeyId: key.id,
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

  const scopes =
    profile.role === "admin"
      ? ["notes:write", "notes:publish", "notes:read", "leads:read", "keys:manage"]
      : profile.role === "editor"
        ? ["notes:write", "notes:read"]
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
  return actor.scopes.includes(scope) || actor.role === "admin";
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
