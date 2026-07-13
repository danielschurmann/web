import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsappFab } from "@/components/WhatsappFab";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

const description =
  "Impuestos, sueldos y cargas sociales, auditorías y automatización de procesos. Contabilidad de confianza potenciada con tecnología, con la revisión final de nuestro equipo.";

export const metadata: Metadata = {
  title: "Servicios",
  description,
  alternates: { canonical: "/servicios" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url.replace(/\/$/, "")}/servicios`,
    siteName: siteConfig.name,
    title: `Servicios · ${siteConfig.name}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `Servicios · ${siteConfig.name}`,
    description,
  },
};

export default function ServiciosIndexPage() {
  return (
    <div className="relative min-h-screen bg-page text-ink">
      <Header />
      <main className="overflow-x-clip">
        <section className="section-pad px-5 pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-[13px] font-semibold tracking-[0.12em] text-accent uppercase">
              Servicios
            </div>
            <h1 className="mt-3 max-w-[820px] font-display text-[clamp(30px,5vw,46px)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
              Gestión contable integral, potenciada con tecnología
            </h1>
            <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-muted md:text-lg">
              {description}
            </p>
          </div>
        </section>

        <section className="section-pad bg-band px-5 py-14 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/servicios/${service.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-colors hover:border-accent"
                >
                  <div className="font-display text-xl font-semibold text-ink">
                    {service.name}
                  </div>
                  <div className="mt-1.5 text-sm leading-[1.5] text-muted">
                    {service.subtitle}
                  </div>
                  <p className="mt-4 text-[15px] leading-[1.6] text-muted">
                    {service.paragraphs[0]}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-accent">
                    Ver servicio →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
