import { getSupabasePublic } from "@/lib/supabase-public";

export type PublishedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_md: string;
  source_url: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  profiles: { full_name: string; slug: string } | null;
};

function normalizeAuthor(
  profiles: PublishedPost["profiles"] | PublishedPost["profiles"][],
): PublishedPost["profiles"] {
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles ?? null;
}

export async function getPublishedPosts(limit = 50): Promise<PublishedPost[]> {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, body_md, source_url, tags, published_at, created_at, profiles!posts_author_id_fkey(full_name, slug)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedPosts", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    profiles: normalizeAuthor(
      row.profiles as PublishedPost["profiles"] | PublishedPost["profiles"][],
    ),
  })) as PublishedPost[];
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublishedPost | null> {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, body_md, source_url, tags, published_at, created_at, profiles!posts_author_id_fkey(full_name, slug)",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPublishedPostBySlug", error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    profiles: normalizeAuthor(
      data.profiles as PublishedPost["profiles"] | PublishedPost["profiles"][],
    ),
  } as PublishedPost;
}

export function formatPostDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    day: "numeric",
  }).format(new Date(iso));
}
