import { AiDemo } from "./AiDemo";

const bullets = [
  "Conciliación bancaria automática",
  "Reportes de gestión en lenguaje natural",
  "Alertas de vencimientos impositivos",
];

export function AiPillar() {
  return (
    <section id="ai" className="section-pad bg-ai-bg px-5 py-16 md:py-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-[52px]">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.12em] text-accent-soft uppercase">
            Pilar AI
          </div>
          <h2 className="mt-3 mb-4 font-display text-[clamp(28px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            Agentes de AI para tu empresa
          </h2>
          <p className="mb-5 text-[17px] leading-[1.6] text-[#9fb0bf]">
            Diseñamos e implementamos agentes internos que automatizan flujos
            contables y financieros: conciliaciones, reportes y cobranzas.
          </p>
          <div className="mb-[26px] flex flex-col gap-2.5">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="flex items-center gap-2.5 text-[15px] text-[#d5dee6]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
                {bullet}
              </div>
            ))}
          </div>
          <a
            href="#contacto"
            className="inline-flex min-h-11 items-center rounded-[11px] bg-accent px-[22px] py-3.5 text-[15px] font-semibold text-white"
          >
            Conocé los casos de uso →
          </a>
        </div>
        <div className="h-[420px] md:h-[470px]">
          <AiDemo />
        </div>
      </div>
    </section>
  );
}
