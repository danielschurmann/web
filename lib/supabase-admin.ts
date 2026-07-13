import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    const json = Buffer.from(padded, "base64url").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Server-only Supabase client. Requires the real service_role key (no anon fallback). */
export function getSupabaseAdmin(): SupabaseClient {
  const url = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const key = firstNonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_URL) en el entorno del servidor.",
    );
  }

  const payload = decodeJwtPayload(key);
  if (payload && payload.role && payload.role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY inválida: el JWT tiene role="${String(payload.role)}" (se espera service_role).`,
    );
  }

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

export function mapSupabaseError(message: string) {
  if (/invalid api key/i.test(message)) {
    return "Configuración de Supabase inválida: revisá SUPABASE_SERVICE_ROLE_KEY en Vercel (debe ser la service_role del proyecto).";
  }
  return message;
}
