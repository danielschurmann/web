"use client";

import { whatsappUrl } from "@/lib/site";
import { trackWhatsappClick } from "@/lib/analytics";
import { IconWhatsapp } from "./Icons";

export function WhatsappFab() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => trackWhatsappClick("fab")}
      className="group fixed right-5 bottom-5 z-40 flex h-14 max-w-14 items-center overflow-hidden rounded-full bg-whatsapp text-white shadow-[0_10px_26px_-8px_rgba(31,168,85,0.7)] transition-[max-width,padding] duration-300 ease-out hover:max-w-[280px] hover:pr-5 md:right-7 md:bottom-7"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">
        <IconWhatsapp size={26} className="text-white" />
      </span>
      <span className="whitespace-nowrap pr-1 text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        ¿Hablamos? Te respondemos ya
      </span>
    </a>
  );
}
