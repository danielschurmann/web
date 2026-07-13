"use client";

import { whatsappUrl } from "@/lib/site";
import { trackCtaClick, trackWhatsappClick } from "@/lib/analytics";
import { IconWhatsapp } from "./Icons";

export function Hero() {
  return (
    <section className="section-pad px-5 pb-14 pt-[72px] text-center md:pb-[60px] md:pt-[88px]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-[13px] font-semibold text-accent">
          Contabilidad + Inteligencia artificial
        </div>
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
          Contabilidad de confianza potenciada con{" "}
          <span className="text-accent">inteligencia artificial</span>
        </h1>
        <p className="mx-auto mt-[22px] max-w-[600px] text-[17px] leading-[1.6] text-muted md:text-[19px]">
          Más de 30 años asesorando pymes. Hoy sumamos tecnología para detectar
          inconsistencias y agilizar tu contabilidad; la revisión final siempre
          es nuestra.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsappClick("hero")}
            className="inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-whatsapp px-6 py-3.5 text-[15px] font-semibold !text-white shadow-[0_8px_22px_-10px_rgba(31,168,85,0.7)] hover:opacity-95"
          >
            <IconWhatsapp className="text-white" />
            Escribinos por WhatsApp
          </a>
          <a
            href="#contacto"
            onClick={() => trackCtaClick("contacto", "hero")}
            className="inline-flex min-h-11 items-center rounded-xl border border-border-input bg-white px-6 py-3.5 text-[15px] font-semibold text-ink"
          >
            Contactanos
          </a>
        </div>
      </div>
    </section>
  );
}
