import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsappFab } from "@/components/WhatsappFab";
import { formatPostDate, getPublishedPostBySlug } from "@/lib/posts";
import { absoluteUrl, siteConfig } from "@/lib/site";

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
  if (!post) return { title: "Novedad", robots: { index: false, follow: false } };

  const description =
    post.excerpt ??
    `Novedad fiscal y contable de ${siteConfig.name} para pymes.`;
  const url = absoluteUrl(`/novedades/${post.slug}`);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/novedades/${post.slug}` },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: post.title,
      description,
      publishedTime: post.published_at ?? post.created_at,
      authors: post.profiles?.full_name
        ? [post.profiles.full_name]
        : [siteConfig.name],
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [siteConfig.socialImage],
    },
  };
}

export default async function NovedadDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const author = post.profiles?.full_name ?? siteConfig.name;
  const published = post.published_at ?? post.created_at;
  const description =
    post.excerpt ??
    `Novedad fiscal y contable de ${siteConfig.name} para pymes.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    datePublished: published,
    dateModified: published,
    mainEntityOfPage: absoluteUrl(`/novedades/${post.slug}`),
    image: [siteConfig.socialImage],
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
      logo: {
        "@type": "ImageObject",
        url: siteConfig.logo,
      },
    },
    inLanguage: siteConfig.language,
  };

  return (
    <div className="relative min-h-screen bg-page text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="mx-auto max-w-[720px] overflow-x-clip px-5 py-14 md:px-10 md:py-20">
        <Link
          href="/novedades"
          className="text-sm font-semibold text-accent hover:opacity-80"
        >
          ← Todas las novedades
        </Link>

        <p className="mt-8 text-xs text-fainter capitalize">
          <time dateTime={published}>{formatPostDate(published)}</time>
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

        <article className="prose prose-ds mt-10 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
                const isExternal = /^https?:\/\//.test(href ?? "");
                return (
                  <a
                    href={href}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    {...props}
                  />
                );
              },
            }}
          >
            {post.body_md}
          </ReactMarkdown>
        </article>

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
