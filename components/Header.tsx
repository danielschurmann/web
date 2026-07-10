"use client";

import { useState } from "react";
import { IconClose, IconMenu } from "./Icons";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#ai", label: "AI" },
  { href: "#novedades", label: "Novedades" },
  { href: "#equipo", label: "Estudio" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-[18px] md:px-10">
        <a
          href="#top"
          className="font-brand text-[22px] font-semibold tracking-[-0.01em] text-ink md:text-[23px]"
        >
          DS <span className="text-accent">&amp;</span> Asociados
        </a>

        <nav className="hidden items-center gap-[30px] md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] text-muted transition-opacity hover:opacity-80"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="rounded-[10px] bg-ink px-[18px] py-2.5 text-sm font-semibold text-white"
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
        <div className="border-t border-border bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-[15px] text-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="mt-2 rounded-[10px] bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Agendá una consulta
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
