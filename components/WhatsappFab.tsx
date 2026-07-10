import { whatsappUrl } from "@/lib/site";
import { IconWhatsapp } from "./Icons";

export function WhatsappFab() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp shadow-[0_10px_26px_-8px_rgba(31,168,85,0.7)] md:right-7 md:bottom-7"
    >
      <IconWhatsapp size={26} className="text-white" />
    </a>
  );
}
