import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsappFab } from "@/components/WhatsappFab";
import { formatPostDate, getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Novedades fiscales y contables para pymes, elaboradas por DS & Asociados.",
  alternates: { canonical: "/novedades" },
};

export default async function NovedadesPage() {
  const posts = await getPublishedPosts(50);

  return (
    <div className="relative min-h-screen bg-page text-ink">
      <Header />
      <main className="mx-auto max-w-[800px] overflow-x-clip px-5 py-14 md:px-10 md:py-20">
        <p className="text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
          Estudio
        </p>
        <h1 className="mt-2 font-display text-[clamp(36px,7vw,48px)] font-bold tracking-[-0.03em] text-ink">
          Novedades
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-[1.6] text-muted">
          Cambios normativos y vencimientos relevantes para pymes, con lectura
          práctica del equipo de DS &amp; Asociados.
        </p>

        <div className="mt-10 flex flex-col divide-y divide-border border-t border-border">
          {posts.length === 0 ? (
            <p className="py-8 text-[15px] text-muted">
              Todavía no hay novedades publicadas.
            </p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="py-7">
                <time
                  dateTime={post.published_at ?? post.created_at}
                  className="text-xs text-fainter capitalize"
                >
                  {formatPostDate(post.published_at ?? post.created_at)}
                </time>
                <h2 className="mt-1.5 font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
                  <Link
                    href={`/novedades/${post.slug}`}
                    className="hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="mt-2 text-[15px] leading-[1.6] text-muted">
                    {post.excerpt}
                  </p>
                ) : null}
                <Link
                  href={`/novedades/${post.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-accent"
                >
                  Leer más →
                </Link>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
