import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

/** Served as /novedades/:slug.md via rewrite in next.config.ts */
export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const author = post.profiles?.full_name ?? "DS & Asociados";
  const published = post.published_at ?? post.created_at;
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `slug: ${post.slug}`,
    `author: ${JSON.stringify(author)}`,
    `published_at: ${published}`,
    `tags: ${JSON.stringify(post.tags ?? [])}`,
    post.source_url ? `source_url: ${JSON.stringify(post.source_url)}` : null,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const body = `${frontmatter}# ${post.title}\n\n${post.body_md.trim()}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
