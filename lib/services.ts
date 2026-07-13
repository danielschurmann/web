export type ServiceSlug =
  | "impuestos"
  | "sueldos-y-cargas-sociales"
  | "auditorias"
  | "automatizacion-de-procesos";

export type Service = {
  slug: ServiceSlug;
  /** Nombre corto del servicio (eyebrow, en mayúsculas en la UI) */
  name: string;
  /** H1 de la página */
  title: string;
  /** Bajada corta */
  subtitle: string;
  /** Copy descriptivo completo, en párrafos */
  paragraphs: string[];
  /** Beneficios derivados del copy */
  bullets: string[];
  /** Descripción SEO (<160 caracteres) */
  metaDescription: string;
  /** Mensaje prellenado para WhatsApp específico del servicio */
  whatsappMessage: string;
  /** Destaca el ángulo de IA como diferenciador */
  aiHighlight: string;
};

export const services: Service[] = [
  {
    slug: "impuestos",
    name: "Impuestos",
    title: "Impuestos nacionales, provinciales y municipales",
    subtitle: "Nacionales, provinciales y municipales",
    paragraphs: [
      "Agenda tributaria personalizada que anticipa vencimientos e importes mensuales. Recibís alertas antes de cada obligación fiscal, sin sorpresas.",
      "Usamos tecnología para monitorear cambios normativos y actualizaciones impositivas; nuestro equipo revisa e interpreta cómo te impactan.",
    ],
    bullets: [
      "Agenda tributaria personalizada con vencimientos e importes por mes",
      "Alertas antes de cada obligación fiscal, sin sorpresas",
      "Tecnología que sigue los cambios normativos, con revisión de nuestro equipo",
    ],
    metaDescription:
      "Agenda tributaria personalizada que anticipa vencimientos e importes, con alertas antes de cada obligación fiscal y tecnología para seguir los cambios normativos.",
    whatsappMessage:
      "Hola, quiero asesoramiento en impuestos (nacionales, provinciales y municipales) con DS & Asociados.",
    aiHighlight:
      "Usamos tecnología para seguir los cambios normativos; la interpretación y la revisión final son de nuestro equipo.",
  },
  {
    slug: "sueldos-y-cargas-sociales",
    name: "Sueldos y cargas sociales",
    title: "Sueldos y cargas sociales",
    subtitle: "Liquidaciones y DDJJ",
    paragraphs: [
      "Control integrado de horas, extras y vacaciones. Cada liquidación de sueldos se integra a tu cash flow mensual y proyecciones de caja.",
      "Alertas sobre cambios normativos en cargas sociales antes de que impacten tu presupuesto. Usamos tecnología para detectar inconsistencias y prevenir errores; la liquidación final siempre la revisa nuestro equipo.",
    ],
    bullets: [
      "Control integrado de horas, extras y vacaciones",
      "Cada liquidación se incorpora a tu cash flow y proyecciones de caja",
      "Alertas sobre cambios normativos en cargas sociales antes de que impacten tu presupuesto",
      "Tecnología que detecta inconsistencias, con revisión final de nuestro equipo",
    ],
    metaDescription:
      "Liquidaciones y DDJJ con control integrado de horas, extras y vacaciones, integradas a tu cash flow. Tecnología que detecta inconsistencias, con revisión final de nuestro equipo.",
    whatsappMessage:
      "Hola, quiero asesoramiento en sueldos y cargas sociales (liquidaciones y DDJJ) con DS & Asociados.",
    aiHighlight:
      "La tecnología detecta inconsistencias; la revisión final de cada liquidación es de nuestro equipo.",
  },
  {
    slug: "auditorias",
    name: "Auditorías",
    title: "Auditorías contables y financieras",
    subtitle: "Contables y financieras",
    paragraphs: [
      "Análisis profundo de tus registros contables. Usamos tecnología para identificar inconsistencias, tendencias de riesgo y oportunidades; el análisis crítico y la revisión final son de nuestro equipo.",
      "No revisamos el pasado, lo interpretamos.",
    ],
    bullets: [
      "Análisis profundo de tus registros contables",
      "Tecnología que ayuda a detectar inconsistencias y tendencias de riesgo",
      "Detección de oportunidades de optimización, con lectura crítica de nuestro equipo",
      "No revisamos el pasado, lo interpretamos",
    ],
    metaDescription:
      "Auditorías contables y financieras: usamos tecnología para detectar inconsistencias, tendencias de riesgo y oportunidades, con el análisis crítico y la revisión final de nuestro equipo.",
    whatsappMessage:
      "Hola, quiero una auditoría contable y financiera con DS & Asociados.",
    aiHighlight:
      "La tecnología detecta inconsistencias y patrones de riesgo; la interpretación y la revisión final son de nuestro equipo.",
  },
  {
    slug: "automatizacion-de-procesos",
    name: "Automatización de procesos",
    title: "Automatización de procesos contables, económicos y financieros",
    subtitle: "Contable, económica y financiera",
    paragraphs: [
      "Reducimos tareas manuales repetitivas con tecnología integrada en tu operación, siempre con la supervisión de nuestro equipo.",
      "Menos tiempo en datos, más tiempo en decisiones estratégicas.",
    ],
    bullets: [
      "Reducimos tareas manuales repetitivas con tecnología",
      "Herramientas integradas en tu operación diaria",
      "Menos tiempo en datos, más tiempo en decisiones estratégicas",
    ],
    metaDescription:
      "Automatizamos procesos contables, económicos y financieros con tecnología integrada en tu operación y supervisión de nuestro equipo. Menos tiempo en datos, más en decisiones.",
    whatsappMessage:
      "Hola, quiero automatizar procesos contables, económicos y financieros con DS & Asociados.",
    aiHighlight:
      "Tecnología integrada que reduce tareas manuales repetitivas, con la supervisión de nuestro equipo.",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getOtherServices(slug: string): Service[] {
  return services.filter((service) => service.slug !== slug);
}
