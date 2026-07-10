"use client";

import { useEffect, useState } from "react";
import { trackCtaClick, trackNavClick } from "@/lib/analytics";
import { IconClose, IconMenu } from "./Icons";

const links = [
  { href: "/#servicios", label: "Servicios", section: "servicios" },
  { href: "/#ai", label: "AI", section: "ai" },
  { href: "/novedades", label: "Novedades", section: "novedades" },
  { href: "/#equipo", label: "Estudio", section: "equipo" },
];

/** Altura del header (desktop). Usada por el spacer para que el contenido no quede debajo. */
export const HEADER_HEIGHT_PX = 68;

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-accent font-display font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      DS
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/*
        fixed (no sticky): los wrappers con overflow-x-hidden rompen position:sticky.
        El spacer mantiene el flujo del documento.
      */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-border/80 bg-white/90 shadow-[0_8px_30px_-12px_rgba(15,27,36,0.22)] backdrop-blur-xl"
            : "border-b border-transparent bg-page/80 backdrop-blur-[8px]",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-[14px] md:px-10 md:py-[16px]">
          <a
            href="/"
            className="flex items-center gap-2.5 text-ink transition-opacity hover:opacity-90"
          >
            <LogoMark />
            <span className="font-display text-[17px] font-semibold tracking-[-0.02em] md:text-[18px]">
              DS <span className="text-accent">&amp;</span> Asociados
            </span>
          </a>

          <nav className="hidden items-center gap-[30px] md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => trackNavClick(link.section, "header")}
                className="text-[15px] text-muted transition-opacity hover:opacity-80"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#contacto"
              onClick={() => trackCtaClick("agendar_consulta", "header")}
              className="rounded-[10px] bg-accent px-[18px] py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Agendá una consulta
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] border border-border text-ink md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-border bg-white/95 px-5 py-4 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-[15px] text-muted"
                  onClick={() => {
                    trackNavClick(link.section, "header_mobile");
                    setOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/#contacto"
                className="mt-2 rounded-[10px] bg-accent px-4 py-3 text-center text-sm font-semibold text-white"
                onClick={() => {
                  trackCtaClick("agendar_consulta", "header_mobile");
                  setOpen(false);
                }}
              >
                Agendá una consulta
              </a>
            </nav>
          </div>
        ) : null}
      </header>
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: HEADER_HEIGHT_PX }}
      />
    </>
  );
}
