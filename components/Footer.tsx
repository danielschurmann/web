"use client";

import { trackFooterClick } from "@/lib/analytics";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 px-5 py-[26px] text-[13.5px] text-faint md:flex-row md:items-center md:px-10">
        <a
          href="/"
          onClick={() => trackFooterClick("logo_top")}
          className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[10px] font-bold text-white"
            aria-hidden
          >
            DS
          </span>
          DS <span className="text-accent">&amp;</span> Asociados
        </a>
        <div>© {new Date().getFullYear()} · Buenos Aires, Argentina</div>
      </div>
    </footer>
  );
}
