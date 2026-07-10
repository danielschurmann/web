const services = [
  {
    title: "Impuestos",
    description: "Nacionales, provinciales y municipales",
    href: "#contacto",
  },
  {
    title: "Sueldos y cargas sociales",
    description: "Liquidaciones y DDJJ",
    href: "#contacto",
  },
  {
    title: "Auditorías",
    description: "Contables y financieras",
    href: "#contacto",
  },
  {
    title: "Automatización de procesos",
    description: "Contable, económica y financiera",
    href: "#ai",
  },
];

export function ServicesGrid() {
  return (
    <section id="servicios" className="section-pad bg-band px-5 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
          Gestión contable integral
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-xl border border-border bg-white p-[26px]"
            >
              <div className="mb-1.5 font-display text-lg font-semibold text-ink">
                {service.title}
              </div>
              <div className="text-sm leading-[1.5] text-muted">
                {service.description}
              </div>
              <a
                href={service.href}
                className="mt-4 inline-block min-h-11 text-sm font-semibold text-accent"
              >
                Ver servicio →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
