import { AiPillar } from "@/components/AiPillar";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { SituationSelector } from "@/components/SituationSelector";
import { Team } from "@/components/Team";
import { WhatsappFab } from "@/components/WhatsappFab";

export default function HomePage() {
  return (
    <div id="top" className="relative overflow-x-hidden bg-page text-ink">
      <Header />
      <main>
        <Hero />
        <SituationSelector />
        <ServicesGrid />
        <AiPillar />
        <Team />
        <ContactSection />
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
