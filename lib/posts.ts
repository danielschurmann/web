import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
  const supabase = getSupabaseAdmin();
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
  const supabase = getSupabaseAdmin();
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

/** Minimal markdown → HTML for public post bodies (headings, lists, links, paragraphs). */
export function renderPostMarkdown(md: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const inline = (s: string) =>
    escape(s)
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent font-semibold underline-offset-2 hover:underline">$1</a>',
      )
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inUl = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(
      `<p class="mb-4 text-[15.5px] leading-[1.7] text-muted">${inline(paragraph.join(" "))}</p>`,
    );
    paragraph = [];
  };

  const closeUl = () => {
    if (!inUl) return;
    html.push("</ul>");
    inUl = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      closeUl();
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushParagraph();
      closeUl();
      html.push(
        `<h2 class="mt-8 mb-3 font-display text-xl font-semibold text-ink">${inline(h2[1])}</h2>`,
      );
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushParagraph();
      closeUl();
      html.push(
        `<h3 class="mt-6 mb-2 font-display text-lg font-semibold text-ink">${inline(h3[1])}</h3>`,
      );
      continue;
    }

    const li = line.match(/^[-*]\s+(.+)$/);
    if (li) {
      flushParagraph();
      if (!inUl) {
        html.push('<ul class="mb-4 list-disc space-y-1.5 pl-5 text-[15.5px] leading-[1.7] text-muted">');
        inUl = true;
      }
      html.push(`<li>${inline(li[1])}</li>`);
      continue;
    }

    closeUl();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeUl();
  return html.join("\n");
}
