import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublic } from "@/lib/supabase-public";
import { slugify, type ApiActor } from "@/lib/api-auth";

/**
 * Data-access layer for the agent API.
 *
 * - api_key actors go through SECURITY DEFINER RPCs using the ANON client, so
 *   the agent API does NOT depend on SUPABASE_SERVICE_ROLE_KEY. The RPCs
 *   authorize internally via the API key hash.
 * - session actors (backoffice) keep using the user session client (RLS).
 */

export class ApiDataError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiDataError";
  }
}

type RpcError = { message?: string; code?: string } | null;

/** Maps a raised Postgres exception (via PostgREST) to an HTTP status + message. */
function rpcError(error: RpcError): ApiDataError {
  const msg = error?.message ?? "";
  if (/API_UNAUTHORIZED/.test(msg)) {
    return new ApiDataError(401, "Unauthorized: invalid or revoked API key");
  }
  if (/API_FORBIDDEN_PUBLISH/.test(msg)) {
    return new ApiDataError(403, "Missing notes:publish scope");
  }
  if (/API_FORBIDDEN/.test(msg)) {
    return new ApiDataError(403, "Forbidden: missing required scope");
  }
  if (/API_NOT_FOUND/.test(msg)) {
    return new ApiDataError(404, "Not found");
  }
  const author = msg.match(/API_AUTHOR_NOT_FOUND:(\S+)/);
  if (author) {
    return new ApiDataError(400, `Author slug not found: ${author[1]}`);
  }
  if (/invalid api key/i.test(msg)) {
    return new ApiDataError(
      500,
      "Configuración de Supabase inválida: revisá NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return new ApiDataError(500, msg || "Server error");
}

async function sessionClient(): Promise<SupabaseClient> {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

function keyOf(actor: ApiActor): string {
  if (!actor.apiKey) {
    throw new ApiDataError(401, "Unauthorized: missing API key");
  }
  return actor.apiKey;
}

export type CreateNoteInput = {
  title: string;
  body_md: string;
  excerpt?: string | null;
  source_url?: string | null;
  status: "draft" | "published";
  author_slug?: string | null;
  tags?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  slug?: string | null;
};

export type UpdateNotePatch = {
  title?: string;
  body_md?: string;
  excerpt?: string;
  status?: "draft" | "published" | "archived";
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
};

const LIST_SELECT =
  "id, title, slug, excerpt, status, source_url, created_via, tags, published_at, created_at, updated_at, author_id, profiles!posts_author_id_fkey(full_name, slug)";

export async function listNotes(actor: ApiActor, status: string | null) {
  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase.rpc("api_list_notes", {
      p_key: keyOf(actor),
      p_status: status,
    });
    if (error) throw rpcError(error);
    return data;
  }

  const supabase = await sessionClient();
  let query = supabase
    .from("posts")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new ApiDataError(500, error.message);
  return data;
}

export async function getNote(actor: ApiActor, id: string) {
  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase.rpc("api_get_note", {
      p_key: keyOf(actor),
      p_id: id,
    });
    if (error) throw rpcError(error);
    if (!data) throw new ApiDataError(404, "Not found");
    return data;
  }

  const supabase = await sessionClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(full_name, slug, email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiDataError(500, error.message);
  if (!data) throw new ApiDataError(404, "Not found");
  return data;
}

export async function createNote(actor: ApiActor, input: CreateNoteInput) {
  const baseSlug = slugify(input.slug || input.title);

  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase.rpc("api_create_note", {
      p_key: keyOf(actor),
      p_title: input.title,
      p_body_md: input.body_md,
      p_slug: baseSlug,
      p_excerpt: input.excerpt ?? null,
      p_status: input.status,
      p_author_slug: input.author_slug ?? null,
      p_source_url: input.source_url ?? null,
      p_tags: input.tags ?? [],
      p_seo_title: input.seo_title ?? null,
      p_seo_description: input.seo_description ?? null,
    });
    if (error) throw rpcError(error);
    return data;
  }

  const supabase = await sessionClient();
  let authorId = actor.userId;
  if (input.author_slug) {
    const { data: author } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", input.author_slug)
      .maybeSingle();
    if (!author) {
      throw new ApiDataError(400, `Author slug not found: ${input.author_slug}`);
    }
    authorId = author.id;
  }

  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      body_md: input.body_md,
      source_url: input.source_url ?? null,
      status: input.status,
      created_via: "backoffice",
      seo_title: input.seo_title ?? input.title,
      seo_description: input.seo_description ?? input.excerpt ?? null,
      tags: input.tags ?? [],
      published_at:
        input.status === "published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) throw new ApiDataError(500, error.message);
  return data;
}

export async function updateNote(
  actor: ApiActor,
  id: string,
  patch: UpdateNotePatch,
) {
  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase.rpc("api_update_note", {
      p_key: keyOf(actor),
      p_id: id,
      p_patch: patch,
    });
    if (error) throw rpcError(error);
    return data;
  }

  const supabase = await sessionClient();
  const updates: Record<string, unknown> = {
    ...patch,
    updated_at: new Date().toISOString(),
  };
  if (patch.status === "published") {
    updates.published_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new ApiDataError(500, error.message);
  return data;
}

export async function deleteNote(actor: ApiActor, id: string) {
  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { error } = await supabase.rpc("api_delete_note", {
      p_key: keyOf(actor),
      p_id: id,
    });
    if (error) throw rpcError(error);
    return;
  }

  const supabase = await sessionClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new ApiDataError(500, error.message);
}

export async function listLeads(actor: ApiActor) {
  if (actor.via === "api_key") {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase.rpc("api_list_leads", {
      p_key: keyOf(actor),
    });
    if (error) throw rpcError(error);
    return data;
  }

  const supabase = await sessionClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, nombre, contacto, mensaje, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new ApiDataError(500, error.message);
  return data;
}
