"use client";

import { trackSituationClick } from "@/lib/analytics";
import {
  IconBuilding,
  IconDocument,
  IconRobot,
  IconTarget,
} from "./Icons";

const situations = [
  {
    href: "#servicios",
    title: "Soy monotributista o tengo una pyme",
    subtitle: "Facturación, impuestos y sueldos",
    icon: IconDocument,
    featured: false,
    id: "monotributista_pyme",
  },
  {
    href: "#servicios",
    title: "Mi empresa atraviesa un momento crítico",
    subtitle: "Crisis y sucesiones familiares",
    icon: IconTarget,
    featured: false,
    id: "momento_critico",
  },
  {
    href: "#servicios",
    title: "Compro o vendo un inmueble en el exterior o en Argentina",
    subtitle: "Argentinos en el exterior y extranjeros en el país",
    icon: IconBuilding,
    featured: false,
    id: "inmueble",
  },
  {
    href: "#ai",
    title: "Quiero automatizar mi área contable",
    subtitle: "Agentes de AI a medida",
    icon: IconRobot,
    featured: true,
    id: "automatizar_ai",
  },
];

export function SituationSelector() {
  return (
    <section className="section-pad px-5 pb-16 pt-2 md:pb-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 text-center">
          <div className="text-[13px] font-semibold tracking-[0.12em] text-accent uppercase">
            Elegí tu situación
          </div>
          <h2 className="mt-2.5 font-display text-[clamp(26px,4vw,34px)] font-semibold tracking-[-0.02em] text-ink">
            ¿Qué necesitás resolver?
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {situations.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                onClick={() =>
                  trackSituationClick(item.id, item.href.replace("#", ""))
                }
                className={
                  item.featured
                    ? "relative flex min-h-11 flex-col gap-3 rounded-[14px] border-[1.5px] border-accent bg-accent/5 p-[26px]"
                    : "flex min-h-11 flex-col gap-3 rounded-[14px] border border-border bg-white p-[26px]"
                }
              >
                {item.featured ? (
                  <span className="absolute top-4 right-4 rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] text-accent">
                    IA
                  </span>
                ) : null}
                <span className="text-accent">
                  <Icon />
                </span>
                <div className="text-[17px] leading-[1.25] font-bold text-ink">
                  {item.title}
                </div>
                <div className="text-sm leading-[1.5] text-muted">
                  {item.subtitle}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
