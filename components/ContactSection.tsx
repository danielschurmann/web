import { ContactForm } from "./ContactForm";

const news = [
  {
    date: "Junio 2026",
    title: "Guía: régimen simplificado de ganancias 2026",
    href: "#novedades",
  },
  {
    date: "Mayo 2026",
    title: "Cómo preparar tu empresa para una auditoría",
    href: "#novedades",
  },
  {
    date: "Abril 2026",
    title: "Sucesión de empresa familiar: por dónde empezar",
    href: "#novedades",
  },
];

export function ContactSection() {
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
            {news.map((item) => (
              <a key={item.title} href={item.href} className="block">
                <div className="text-xs text-fainter">{item.date}</div>
                <div className="text-[15px] leading-[1.4] font-semibold text-ink">
                  {item.title}
                </div>
              </a>
            ))}
          </div>
          <a
            href="#novedades"
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
