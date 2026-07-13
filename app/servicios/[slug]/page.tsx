import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ServiceCta } from "@/components/ServiceCta";
import { WhatsappFab } from "@/components/WhatsappFab";
import {
  getOtherServices,
  getServiceBySlug,
  services,
} from "@/lib/services";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Servicio" };

  const canonical = `/servicios/${service.slug}`;
  const title = `${service.title} · Servicios`;

  return {
    title: `${service.name} · Servicios`,
    description: service.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: `${siteConfig.url.replace(/\/$/, "")}${canonical}`,
      siteName: siteConfig.name,
      title,
      description: service.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const others = getOtherServices(service.slug);
  const base = siteConfig.url.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.metaDescription,
    serviceType: service.name,
    url: `${base}/servicios/${service.slug}`,
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    provider: {
      "@type": "AccountingService",
      name: siteConfig.legalName,
      url: base,
    },
  };

  return (
    <div className="relative min-h-screen bg-page text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="section-pad px-5 pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="mx-auto max-w-[1200px]">
            <nav className="mb-6 text-sm text-faint">
              <Link href="/" className="hover:text-accent">
                Inicio
              </Link>
              <span className="mx-2">/</span>
              <Link href="/servicios" className="hover:text-accent">
                Servicios
              </Link>
              <span className="mx-2">/</span>
              <span className="text-muted">{service.name}</span>
            </nav>

            <div className="text-[13px] font-semibold tracking-[0.12em] text-accent uppercase">
              {service.name}
            </div>
            <h1 className="mt-3 max-w-[820px] font-display text-[clamp(30px,5vw,46px)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
              {service.title}
            </h1>
            <p className="mt-4 text-[17px] leading-[1.55] text-muted md:text-lg">
              {service.subtitle}
            </p>
          </div>
        </section>

        {/* Contenido: copy + beneficios */}
        <section className="section-pad bg-band px-5 py-14 md:py-16">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <div className="text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
                Cómo trabajamos
              </div>
              <div className="mt-4 flex flex-col gap-4">
                {service.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[17px] leading-[1.65] text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Ángulo IA destacado */}
              <div className="mt-8 rounded-xl border-[1.5px] border-accent bg-accent/5 p-6">
                <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-accent uppercase">
                  <span className="rounded-full bg-accent/12 px-2.5 py-0.5">
                    IA
                  </span>
                  Nuestro diferencial
                </div>
                <p className="mt-3 text-[16px] leading-[1.6] text-ink">
                  {service.aiHighlight}
                </p>
              </div>
            </div>

            {/* Beneficios */}
            <div className="rounded-2xl border border-border bg-white p-7 md:p-8">
              <div className="text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
                Qué obtenés
              </div>
              <ul className="mt-5 flex flex-col gap-4">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-[15.5px] leading-[1.5] text-ink">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad px-5 py-14 md:py-16">
          <div className="mx-auto max-w-[1200px] rounded-2xl border border-border bg-white p-8 md:p-12">
            <h2 className="max-w-[640px] font-display text-[clamp(24px,3.5vw,32px)] font-semibold tracking-[-0.02em] text-ink">
              ¿Querés avanzar con {service.name.toLowerCase()}?
            </h2>
            <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-muted">
              Hablemos de tu caso. Te respondemos rápido por WhatsApp o por
              email para entender qué necesitás.
            </p>
            <div className="mt-6">
              <ServiceCta
                slug={service.slug}
                whatsappMessage={service.whatsappMessage}
              />
            </div>
          </div>
        </section>

        {/* Otros servicios */}
        <section className="section-pad bg-band px-5 py-14 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-6 text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
              Otros servicios
            </div>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/servicios/${other.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-white p-6 transition-colors hover:border-accent"
                >
                  <div className="font-display text-lg font-semibold text-ink">
                    {other.name}
                  </div>
                  <div className="mt-1.5 text-sm leading-[1.5] text-muted">
                    {other.subtitle}
                  </div>
                  <span className="mt-4 text-sm font-semibold text-accent">
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
