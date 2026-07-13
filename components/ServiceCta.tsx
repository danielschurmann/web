"use client";

import { trackCtaClick, trackWhatsappClick } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site";
import { IconWhatsapp } from "./Icons";

type Props = {
  /** Slug del servicio, usado para location de analytics: "servicio_{slug}" */
  slug: string;
  /** Mensaje prellenado del WhatsApp específico del servicio */
  whatsappMessage: string;
};

export function ServiceCta({ slug, whatsappMessage }: Props) {
  const location = `servicio_${slug}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        href={whatsappUrl(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsappClick(location)}
        className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] bg-whatsapp px-[22px] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <IconWhatsapp size={20} className="text-white" />
        Escribinos por WhatsApp
      </a>
      <a
        href="/#contacto"
        onClick={() => trackCtaClick("contacto", location)}
        className="inline-flex min-h-11 items-center justify-center rounded-[11px] border border-border-input bg-white px-[22px] py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
      >
        Contactanos
      </a>
    </div>
  );
}
