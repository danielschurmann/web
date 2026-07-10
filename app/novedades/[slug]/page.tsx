import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsappFab } from "@/components/WhatsappFab";
import {
  formatPostDate,
  getPublishedPostBySlug,
  renderPostMarkdown,
} from "@/lib/posts";

export const revalidate = 60;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Novedad" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/novedades/${post.slug}` },
  };
}

export default async function NovedadDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const author = post.profiles?.full_name ?? "DS & Asociados";
  const html = renderPostMarkdown(post.body_md);

  return (
    <div className="relative min-h-screen bg-page text-ink">
      <Header />
      <main className="mx-auto max-w-[720px] overflow-x-clip px-5 py-14 md:px-10 md:py-20">
        <Link
          href="/novedades"
          className="text-sm font-semibold text-accent hover:opacity-80"
        >
          ← Todas las novedades
        </Link>

        <p className="mt-8 text-xs text-fainter capitalize">
          <time dateTime={post.published_at ?? post.created_at}>
            {formatPostDate(post.published_at ?? post.created_at)}
          </time>
          {" · "}
          {author}
        </p>
        <h1 className="mt-2 font-display text-[clamp(32px,6vw,42px)] font-bold tracking-[-0.03em] text-ink">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-[17px] leading-[1.55] text-muted">
            {post.excerpt}
          </p>
        ) : null}

        <article
          className="prose-ds mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags?.length ? (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium tracking-wide text-faint uppercase"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
