import { AiPillar } from "@/components/AiPillar";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SectionViewTracker } from "@/components/SectionViewTracker";
import { ServicesGrid } from "@/components/ServicesGrid";
import { SituationSelector } from "@/components/SituationSelector";
import { Team } from "@/components/Team";
import { WhatsappFab } from "@/components/WhatsappFab";
import { formatPostDate, getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getPublishedPosts(3);
  const news = posts.map((post) => ({
    id: post.slug,
    date: formatPostDate(post.published_at ?? post.created_at),
    title: post.title,
    href: `/novedades/${post.slug}`,
  }));

  return (
    <div id="top" className="relative bg-page text-ink">
      <SectionViewTracker />
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <SituationSelector />
        <ServicesGrid />
        <AiPillar />
        <Team />
        <ContactSection news={news} />
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
