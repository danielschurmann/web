export const siteConfig = {
  name: "DS & Asociados",
  legalName: "DS & Asociados",
  description:
    "Estudio contable con más de 30 años asesorando pymes. Contabilidad de confianza potenciada con inteligencia artificial.",
  locale: "es-AR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  contactEmail: process.env.CONTACT_NOTIFY_EMAIL ?? "",
  city: "Buenos Aires",
  country: "Argentina",
  years: 30,
  teamSize: 4,
} as const;

export function whatsappUrl(message?: string) {
  const number = siteConfig.whatsappNumber.replace(/\D/g, "");
  if (!number) return "#contacto";
  const text =
    message ??
    "Hola, quiero hacer una consulta con DS & Asociados.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
