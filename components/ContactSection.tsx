"use client";

import { trackNewsClick } from "@/lib/analytics";
import { ContactForm } from "./ContactForm";

export type HomeNewsItem = {
  id: string;
  date: string;
  title: string;
  href: string;
};

export function ContactSection({ news }: { news: HomeNewsItem[] }) {
  return (
    <section
      id="contacto"
      className="section-pad border-t border-border bg-band px-5 py-[60px]"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr] lg:gap-10">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
            El estudio
          </div>
          <div className="mt-2 mb-1 font-display text-[clamp(40px,8vw,52px)] font-bold tracking-[-0.03em] text-ink">
            30 años
          </div>
          <p className="mb-4 text-[15px] leading-[1.6] text-muted">
            acompañando a pymes y familias argentinas.
          </p>
          <div className="flex flex-col gap-2 text-[14.5px] text-ink">
            <div>Equipo de 4 profesionales</div>
            <div>Matrícula CPCE activa</div>
            <div>Atención personalizada</div>
          </div>
        </div>

        <div id="novedades">
          <div className="mb-4 text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
            Novedades
          </div>
          <div className="flex flex-col gap-3.5">
            {news.length === 0 ? (
              <p className="text-[14.5px] text-muted">
                Pronto vamos a publicar novedades fiscales y contables.
              </p>
            ) : (
              news.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => trackNewsClick(item.id)}
                  className="block"
                >
                  <div className="text-xs text-fainter capitalize">{item.date}</div>
                  <div className="text-[15px] leading-[1.4] font-semibold text-ink">
                    {item.title}
                  </div>
                </a>
              ))
            )}
          </div>
          <a
            href="/novedades"
            onClick={() => trackNewsClick("ver_todas")}
            className="mt-4 inline-block min-h-11 text-sm font-semibold text-accent"
          >
            Ver todas →
          </a>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
